import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// All gamemodes and tiers

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
    #none;
  };

  type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // Tags that admin can assign to players
  type PlayerTag = {
    #player;
    #tierTester;
    #experienced;
    #new_;
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

  type UserProfile = {
    name : Text;
    role : Text; // "Admin", "Tester", or "User"
  };

  // Profile with principal for leaderboard display
  type ProfileEntry = {
    principal : Principal.Principal;
    name : Text;
    tags : [PlayerTag];
  };

  // Application entry with principal for admin view
  type ApplicationEntry = {
    principal : Principal.Principal;
    application : Application;
    submitterTags : [PlayerTag];
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let applications = Map.empty<Principal.Principal, Application>();
  let playerUsernames = Map.empty<Text, Principal.Principal>();
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();
  let profileUsernameIndex = Map.empty<Text, Principal.Principal>();
  let testerRoles = Map.empty<Principal.Principal, Bool>();
  let playerTags = Map.empty<Principal.Principal, [PlayerTag]>();
  let bannedUsers = Map.empty<Principal.Principal, Bool>();

  // Helper functions
  func isTester(caller : Principal.Principal) : Bool {
    switch (testerRoles.get(caller)) {
      case (?isTester) { isTester };
      case (null) { false };
    };
  };

  func isTesterOrAdmin(caller : Principal.Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isTester(caller);
  };

  func isBanned(user : Principal.Principal) : Bool {
    switch (bannedUsers.get(user)) {
      case (?b) { b };
      case (null) { false };
    };
  };

  func hasPlayerAccess(caller : Principal.Principal) : Bool {
    isTesterOrAdmin(caller);
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

  // Admin bans a user (prevents leaderboard appearance)
  public shared ({ caller }) func banUser(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    bannedUsers.add(target, true);
  };

  // Admin unbans a user
  public shared ({ caller }) func unbanUser(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bannedUsers.remove(target);
  };

  // Admin views all banned users
  public query ({ caller }) func getBannedUsers() : async [Principal.Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view banned users");
    };
    let list = List.empty<Principal.Principal>();
    for (entry in bannedUsers.entries()) {
      if (entry.1) {
        list.add(entry.0);
      };
    };
    list.toArray();
  };

  // Admin assigns tags to a player by principal
  public shared ({ caller }) func assignPlayerTags(target : Principal.Principal, tags : [PlayerTag]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign tags");
    };
    playerTags.add(target, tags);
  };

  // Public - get tags for a player
  public query func getPlayerTags(target : Principal.Principal) : async [PlayerTag] {
    switch (playerTags.get(target)) {
      case (?tags) { tags };
      case (null) { [] };
    };
  };

  // Public - get all user profiles with their tags (for leaderboard)
  public query func getAllProfiles() : async [ProfileEntry] {
    let entries = List.empty<ProfileEntry>();

    for (entry in userProfiles.entries()) {
      let tags = switch (playerTags.get(entry.0)) {
        case (?t) { t };
        case (null) { [] };
      };
      entries.add({
        principal = entry.0;
        name = entry.1.name;
        tags;
      });
    };
    entries.toArray();
  };

  // Get profile entry for a specific principal
  public query func getProfileEntry(target : Principal.Principal) : async ?ProfileEntry {
    switch (userProfiles.get(target)) {
      case (?profile) {
        let tags = switch (playerTags.get(target)) {
          case (?t) { t };
          case (null) { [] };
        };
        ?{ principal = target; name = profile.name; tags };
      };
      case (null) { null };
    };
  };

  // Admin: list all applications with their principals and submitter tags
  public query ({ caller }) func listAllApplicationsWithPrincipals() : async [ApplicationEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    let entries = List.empty<ApplicationEntry>();
    for (entry in applications.entries()) {
      let submitterTags = switch (playerTags.get(entry.0)) {
        case (?t) { t };
        case (null) { [] };
      };
      entries.add({
        principal = entry.0;
        application = entry.1;
        submitterTags;
      });
    };
    entries.toArray();
  };

  // User profile management
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

  // Save profile with username uniqueness enforcement
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Validate username format
    let name = profile.name;
    if (name.size() < 3 or name.size() > 20) {
      Runtime.trap("Username must be 3-20 characters");
    };
    // Check uniqueness in profile username index
    switch (profileUsernameIndex.get(name)) {
      case (?existingPrincipal) {
        if (not Principal.equal(existingPrincipal, caller)) {
          Runtime.trap("Username already taken");
        };
      };
      case (null) {};
    };
    // Remove old username index if user had a previous profile with different name
    switch (userProfiles.get(caller)) {
      case (?oldProfile) {
        if (oldProfile.name != name) {
          profileUsernameIndex.remove(oldProfile.name);
        };
      };
      case (null) {};
    };
    profileUsernameIndex.add(name, caller);
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

  public query ({ caller }) func getApplication(userToReview : Principal.Principal) : async Application {
    if (not isTesterOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only testers and admins can view applications");
    };

    switch (applications.get(userToReview)) {
      case (?application) {
        // Testers can only view their own applications, admins can view all
        if (not AccessControl.isAdmin(accessControlState, caller) and not Principal.equal(caller, userToReview)) {
          Runtime.trap("Unauthorized: Testers can only view their own applications");
        };
        application;
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public query func getLeaderboard() : async [Player] {
    let approvedPlayers = List.empty<Player>();
    for (entry in applications.entries()) {
      if (entry.1.status == #approved and not isBanned(entry.0)) {
        approvedPlayers.add(entry.1.player);
      };
    };
    approvedPlayers.toArray();
  };

  public shared ({ caller }) func editPlayer(targetPlayer : Principal.Principal, playerData : Player) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can edit players");
    };

    switch (applications.get(targetPlayer)) {
      case (?application) {
        // Check username uniqueness if username is being changed
        if (application.player.username != playerData.username) {
          switch (playerUsernames.get(playerData.username)) {
            case (?existingPrincipal) {
              if (not Principal.equal(existingPrincipal, targetPlayer)) {
                Runtime.trap("Username already taken");
              };
            };
            case (null) {};
          };
          // Remove old username mapping
          playerUsernames.remove(application.player.username);
          // Add new username mapping
          playerUsernames.add(playerData.username, targetPlayer);
        };

        let updatedApplication : Application = {
          player = playerData;
          status = #approved;
          reviewer = ?caller;
        };
        applications.add(targetPlayer, updatedApplication);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

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

  public query func getByGamemode(gamemode : Gamemode) : async [Player] {
    let filteredPlayers = List.empty<Player>();

    for (entry in applications.entries()) {
      if (entry.1.status == #approved and not isBanned(entry.0)) {
        let matches = switch (gamemode) {
          case (#axePvp) { entry.1.player.axePvpTier != #none };
          case (#swordPvp) { entry.1.player.swordPvpTier != #none };
          case (#crystalPvp) { entry.1.player.crystalPvpTier != #none };
          case (#uhc) { entry.1.player.uhcTier != #none };
          case (#nethpot) { entry.1.player.nethpotTier != #none };
          case (#smpPvp) { entry.1.player.smpPvpTier != #none };
          case (#macePvp) { entry.1.player.macePvpTier != #none };
          case (#cartPvp) { entry.1.player.cartPvpTier != #none };
          case (#all) { true };
        };
        if (matches) {
          filteredPlayers.add(entry.1.player);
        };
      };
    };
    filteredPlayers.toArray();
  };

  public query func getByTier(tier : Tier) : async [Player] {
    let filteredPlayers = List.empty<Player>();
    for (entry in applications.entries()) {
      if (entry.1.status == #approved and not isBanned(entry.0) and entry.1.player.overallTier == tier) {
        filteredPlayers.add(entry.1.player);
      };
    };
    filteredPlayers.toArray();
  };

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

  public query func getPlayerByUsername(username : Text) : async Player {
    switch (playerUsernames.get(username)) {
      case (?user) {
        if (isBanned(user)) { Runtime.trap("Player not found") };
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

  public query func listAllUsernames() : async [Text] {
    let approvedUsernames = List.empty<Text>();
    for (entry in playerUsernames.entries()) {
      switch (applications.get(entry.1)) {
        case (?application) {
          if (application.status == #approved and not isBanned(entry.1)) {
            approvedUsernames.add(entry.0);
          };
        };
        case (null) {};
      };
    };
    approvedUsernames.toArray();
  };

  public query func listAllApprovedPlayers() : async [Player] {
    let approvedPlayers = List.empty<Player>();
    for (entry in applications.entries()) {
      if (entry.1.status == #approved and not isBanned(entry.0)) {
        approvedPlayers.add(entry.1.player);
      };
    };
    approvedPlayers.toArray();
  };

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
  // Admin creates a pending application for any registered user
  public shared ({ caller }) func adminCreatePendingApplication(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can do this");
    };
    switch (applications.get(target)) {
      case (?_) { Runtime.trap("Application already exists for this user") };
      case (null) {
        switch (userProfiles.get(target)) {
          case (null) { Runtime.trap("User has no profile") };
          case (?profile) {
            if (playerUsernames.containsKey(profile.name)) {
              // username mapping might already exist if previously deleted, skip adding
              ignore ();
            } else {
              playerUsernames.add(profile.name, target);
            };
            let newApp : Application = {
              player = {
                username = profile.name;
                discord = null;
                axePvpTier = #none;
                swordPvpTier = #none;
                crystalPvpTier = #none;
                uhcTier = #none;
                nethpotTier = #none;
                smpPvpTier = #none;
                macePvpTier = #none;
                cartPvpTier = #none;
                overallTier = #none;
              };
              status = #pending;
              reviewer = null;
            };
            applications.add(target, newApp);
          };
        };
      };
    };
  };

  // Admin updates ranks on a pending application without approving
  public shared ({ caller }) func adminUpdatePendingRanks(target : Principal.Principal, playerData : Player) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can do this");
    };
    switch (applications.get(target)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updated : Application = {
          player = playerData;
          status = application.status;
          reviewer = application.reviewer;
        };
        applications.add(target, updated);
      };
    };
  };


  // Allow admin to claim role using the admin password directly (bypasses token system)
  public shared ({ caller }) func claimAdminRoleWithPassword(password : Text) : async () {
    let ADMIN_SECRET = "mctier@admin2024";
    if (password != ADMIN_SECRET) {
      Runtime.trap("Invalid admin password");
    };
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in with Internet Identity");
    };
    // Force-assign admin role (overrides any existing role)
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  // Tier tester submits a registered user as a player for admin approval
  public shared ({ caller }) func testerSubmitForOtherPlayer(target : Principal.Principal, playerData : Player) : async () {
    let hasTierTesterTag = switch (playerTags.get(caller)) {
      case (null) { false };
      case (?tags) {
        var i = 0;
        var found = false;
        while (i < tags.size() and not found) {
          if (tags[i] == #tierTester) { found := true };
          i += 1;
        };
        found
      };
    };
    if (not hasTierTesterTag and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only tier testers can submit players for approval");
    };
    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("Target user has no profile") };
      case (?_profile) {
        switch (applications.get(target)) {
          case (?existing) {
            if (existing.status == #approved) {
              Runtime.trap("Player is already approved on the leaderboard");
            };
            let updated : Application = {
              player = playerData;
              status = #pending;
              reviewer = null;
            };
            applications.add(target, updated);
          };
          case (null) {
            if (not playerUsernames.containsKey(playerData.username)) {
              playerUsernames.add(playerData.username, target);
            };
            let newApp : Application = {
              player = playerData;
              status = #pending;
              reviewer = null;
            };
            applications.add(target, newApp);
          };
        };
      };
    };
  };


};