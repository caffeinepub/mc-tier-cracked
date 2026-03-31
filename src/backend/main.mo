import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Gamemode = {
    #axePvp;
    #swordPvp;
    #crystalPvp;
    #uhc;
    #nethpot;
    #smpPvp;
    #macePvp;
    #cartPvp;
    #all;
  };

  type Tier = {
    #ht1;
    #ht2;
    #ht3;
    #ht4;
    #ht5;
    #mt1;
    #mt2;
    #mt3;
    #mt4;
    #mt5;
    #lt1;
    #lt2;
    #lt3;
    #lt4;
    #lt5;
    #none; // Default tier
  };

  type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Player = {
    username : Text;
    discord : ?Text;
    axePvpTier : Tier;
    swordPvpTier : Tier;
    crystalPvpTier : Tier;
    uhcTier : Tier;
    nethpotTier : Tier;
    smpPvpTier : Tier;
    macePvpTier : Tier;
    cartPvpTier : Tier;
    overallTier : Tier;
  };

  type Application = {
    player : Player;
    status : ApplicationStatus;
    reviewer : ?Principal.Principal;
  };

  public type UserProfile = {
    name : Text;
    role : Text; // "Admin", "Tester", or "User"
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let applications = Map.empty<Principal.Principal, Application>();
  let playerUsernames = Map.empty<Text, Principal.Principal>(); // Maps usernames to principals
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();
  let testerRoles = Map.empty<Principal.Principal, Bool>(); // Track tester role separately

  // Helper function to check if user is a tester
  func isTester(caller : Principal.Principal) : Bool {
    switch (testerRoles.get(caller)) {
      case (?isTester) { isTester };
      case (null) { false };
    };
  };

  // Helper function to check if user has tester or admin role
  func isTesterOrAdmin(caller : Principal.Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isTester(caller);
  };

  // Admin function to assign tester role
  public shared ({ caller }) func assignTesterRole(user : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign tester roles");
    };
    testerRoles.add(user, true);
  };

  // Admin function to revoke tester role
  public shared ({ caller }) func revokeTesterRole(user : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can revoke tester roles");
    };
    testerRoles.remove(user);
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal.Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Testers and Admins can submit player applications
  public shared ({ caller }) func submitApplication(username : Text, discord : ?Text, axePvp : Tier, swordPvp : Tier, crystalPvp : Tier, uhc : Tier, nethpot : Tier, smpPvp : Tier, macePvp : Tier, cartPvp : Tier, overall : Tier) : async () {
    if (not isTesterOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only testers and admins can submit applications");
    };
    
    if (playerUsernames.containsKey(username)) {
      Runtime.trap("Username already taken");
    };
    
    let newPlayer : Player = {
      username;
      discord;
      axePvpTier = axePvp;
      swordPvpTier = swordPvp;
      crystalPvpTier = crystalPvp;
      uhcTier = uhc;
      nethpotTier = nethpot;
      smpPvpTier = smpPvp;
      macePvpTier = macePvp;
      cartPvpTier = cartPvp;
      overallTier = overall;
    };
    
    let newApplication : Application = {
      player = newPlayer;
      status = #pending;
      reviewer = null;
    };
    
    applications.add(caller, newApplication);
    playerUsernames.add(username, caller);
  };

  // Only admins can review applications
  public shared ({ caller }) func reviewApplication(userToReview : Principal.Principal, approve : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can review applications");
    };
    
    switch (applications.get(userToReview)) {
      case (?application) {
        if (application.status != #pending) {
          Runtime.trap("Application is already reviewed");
        };
        let updatedApplication : Application = {
          player = application.player;
          status = if (approve) { #approved } else { #rejected };
          reviewer = ?caller;
        };
        applications.add(userToReview, updatedApplication);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  // Admins can view any application, testers can only view their own
  public query ({ caller }) func getApplication(userToReview : Principal.Principal) : async Application {
    if (not isTesterOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only testers and admins can view applications");
    };
    
    switch (applications.get(userToReview)) {
      case (?application) {
        // Testers can only view their own applications
        if (not AccessControl.isAdmin(accessControlState, caller) and not Principal.equal(caller, userToReview)) {
          Runtime.trap("Unauthorized: Testers can only view their own applications");
        };
        application;
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  // Public - anyone can view the leaderboard (approved players only)
  public query ({ caller }) func getLeaderboard() : async [Player] {
    let approvedPlayers = List.empty<Player>();
    for (application in applications.values()) {
      if (application.status == #approved) {
        approvedPlayers.add(application.player);
      };
    };
    approvedPlayers.toArray();
  };

  // Only admins can edit players
  public shared ({ caller }) func editPlayer(targetPlayer : Principal.Principal, playerData : Player) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can edit players");
    };
    
    switch (applications.get(targetPlayer)) {
      case (?application) {
        // Remove old username mapping
        playerUsernames.remove(application.player.username);
        
        let updatedApplication : Application = {
          player = playerData;
          status = #approved; // Editing always keeps it approved
          reviewer = ?caller;
        };
        applications.add(targetPlayer, updatedApplication);
        playerUsernames.add(playerData.username, targetPlayer);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  // Only admins can delete players
  public shared ({ caller }) func deletePlayer(targetPlayer : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete players");
    };
    
    switch (applications.get(targetPlayer)) {
      case (?application) {
        playerUsernames.remove(application.player.username);
        applications.remove(targetPlayer);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  // Public - anyone can filter by gamemode
  public query ({ caller }) func getByGamemode(gamemode : Gamemode) : async [Player] {
    let filteredPlayers = List.empty<Player>();

    for (application in applications.values()) {
      if (application.status == #approved) {
        let matches = switch (gamemode) {
          case (#axePvp) { application.player.axePvpTier != #none };
          case (#swordPvp) { application.player.swordPvpTier != #none };
          case (#crystalPvp) { application.player.crystalPvpTier != #none };
          case (#uhc) { application.player.uhcTier != #none };
          case (#nethpot) { application.player.nethpotTier != #none };
          case (#smpPvp) { application.player.smpPvpTier != #none };
          case (#macePvp) { application.player.macePvpTier != #none };
          case (#cartPvp) { application.player.cartPvpTier != #none };
          case (#all) { true };
        };
        if (matches) {
          filteredPlayers.add(application.player);
        };
      };
    };
    filteredPlayers.toArray();
  };

  // Public - anyone can filter by tier
  public query ({ caller }) func getByTier(tier : Tier) : async [Player] {
    let filteredPlayers = List.empty<Player>();
    for (application in applications.values()) {
      if (application.status == #approved and application.player.overallTier == tier) {
        filteredPlayers.add(application.player);
      };
    };
    filteredPlayers.toArray();
  };

  // Testers and admins can view their own applications
  public query ({ caller }) func getOwnedApplications() : async [Application] {
    if (not isTesterOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only testers and admins can view applications");
    };
    
    let ownedApps = List.empty<Application>();
    for (entry in applications.entries()) {
      if (Principal.equal(entry.0, caller)) {
        ownedApps.add(entry.1);
      };
    };
    ownedApps.toArray();
  };

  // Public - anyone can search by username (approved players only)
  public query ({ caller }) func getPlayerByUsername(username : Text) : async Player {
    switch (playerUsernames.get(username)) {
      case (?user) {
        switch (applications.get(user)) {
          case (?application) {
            if (application.status == #approved) {
              application.player;
            } else {
              Runtime.trap("Player not found");
            };
          };
          case (null) { Runtime.trap("Player not found") };
        };
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  // Public - anyone can list all usernames (approved players only)
  public query ({ caller }) func listAllUsernames() : async [Text] {
    let approvedUsernames = List.empty<Text>();
    for (entry in playerUsernames.entries()) {
      switch (applications.get(entry.1)) {
        case (?application) {
          if (application.status == #approved) {
            approvedUsernames.add(entry.0);
          };
        };
        case (null) {};
      };
    };
    approvedUsernames.toArray();
  };

  // Public - anyone can list all approved players
  public query ({ caller }) func listAllApprovedPlayers() : async [Player] {
    let approvedPlayers = List.empty<Player>();
    for (application in applications.values()) {
      if (application.status == #approved) {
        approvedPlayers.add(application.player);
      };
    };
    approvedPlayers.toArray();
  };

  // Admin-only - list pending applications
  public query ({ caller }) func listAllPendingApplications() : async [Application] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view pending applications");
    };
    
    let pendingApps = List.empty<Application>();
    for (application in applications.values()) {
      if (application.status == #pending) {
        pendingApps.add(application);
      };
    };
    pendingApps.toArray();
  };
};
