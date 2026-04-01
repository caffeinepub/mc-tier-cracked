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

  type TierV1 = {
    #ht1; #ht2; #ht3; #ht4; #ht5;
    #mt1; #mt2; #mt3; #mt4; #mt5;
    #lt1; #lt2; #lt3; #lt4; #lt5;
    #none;
  };

  type Tier = {
    #ht1; #ht1low;
    #lt1; #mt1;
    #ht2; #ht2low;
    #lt2; #mt2;
    #ht3; #ht3low;
    #lt3; #mt3;
    #ht4; #ht4low;
    #lt4; #mt4;
    #ht5; #ht5low;
    #lt5; #mt5;
    #none;
  };

  type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type PlayerTag = {
    #player;
    #tierTester;
    #experienced;
    #new_;
  };

  type PlayerV1 = {
    username : Text;
    discord : ?Text;
    axePvpTier : TierV1;
    swordPvpTier : TierV1;
    crystalPvpTier : TierV1;
    uhcTier : TierV1;
    nethpotTier : TierV1;
    smpPvpTier : TierV1;
    macePvpTier : TierV1;
    cartPvpTier : TierV1;
    overallTier : TierV1;
  };

  type ApplicationV1 = {
    player : PlayerV1;
    status : ApplicationStatus;
    reviewer : ?Principal.Principal;
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
    role : Text;
  };

  type ProfileEntry = {
    principal : Principal.Principal;
    name : Text;
    tags : [PlayerTag];
  };

  type ApplicationEntry = {
    principal : Principal.Principal;
    application : Application;
    submitterTags : [PlayerTag];
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Stable storage buffers (survive upgrades) ---
  stable var stableUserProfiles : [(Principal.Principal, UserProfile)] = [];
  stable var stableProfileUsernameIndex : [(Text, Principal.Principal)] = [];
  stable var stableApplicationsV2 : [(Principal.Principal, Application)] = [];
  stable var stableApplicationsV1 : [(Principal.Principal, ApplicationV1)] = [];
  stable var stablePlayerUsernames : [(Text, Principal.Principal)] = [];
  stable var stableTesterRoles : [(Principal.Principal, Bool)] = [];
  stable var stablePlayerTags : [(Principal.Principal, [PlayerTag])] = [];
  stable var stableBannedUsers : [(Principal.Principal, Bool)] = [];

  // --- Live working maps ---
  let applications = Map.empty<Principal.Principal, ApplicationV1>();
  let applicationsV2 = Map.empty<Principal.Principal, Application>();
  let playerUsernames = Map.empty<Text, Principal.Principal>();
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();
  let profileUsernameIndex = Map.empty<Text, Principal.Principal>();
  let testerRoles = Map.empty<Principal.Principal, Bool>();
  let playerTags = Map.empty<Principal.Principal, [PlayerTag]>();
  let bannedUsers = Map.empty<Principal.Principal, Bool>();

  // --- Restore from stable arrays on first load after upgrade ---
  private func restoreFromStable() {
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.add(k, v) };
    for ((k, v) in stableProfileUsernameIndex.vals()) { profileUsernameIndex.add(k, v) };
    for ((k, v) in stableApplicationsV2.vals()) { applicationsV2.add(k, v) };
    for ((k, v) in stableApplicationsV1.vals()) { applications.add(k, v) };
    for ((k, v) in stablePlayerUsernames.vals()) { playerUsernames.add(k, v) };
    for ((k, v) in stableTesterRoles.vals()) { testerRoles.add(k, v) };
    for ((k, v) in stablePlayerTags.vals()) { playerTags.add(k, v) };
    for ((k, v) in stableBannedUsers.vals()) { bannedUsers.add(k, v) };
  };

  restoreFromStable();

  func migrateTier(t : TierV1) : Tier {
    switch t {
      case (#ht1) { #ht1 };
      case (#ht2) { #ht2 };
      case (#ht3) { #ht3 };
      case (#ht4) { #ht4 };
      case (#ht5) { #ht5 };
      case (#mt1) { #mt1 };
      case (#mt2) { #mt2 };
      case (#mt3) { #mt3 };
      case (#mt4) { #mt4 };
      case (#mt5) { #mt5 };
      case (#lt1) { #lt1 };
      case (#lt2) { #lt2 };
      case (#lt3) { #lt3 };
      case (#lt4) { #lt4 };
      case (#lt5) { #lt5 };
      case (#none) { #none };
    };
  };

  func migratePlayerV1(p : PlayerV1) : Player {
    {
      username = p.username;
      discord = p.discord;
      axePvpTier = migrateTier(p.axePvpTier);
      swordPvpTier = migrateTier(p.swordPvpTier);
      crystalPvpTier = migrateTier(p.crystalPvpTier);
      uhcTier = migrateTier(p.uhcTier);
      nethpotTier = migrateTier(p.nethpotTier);
      smpPvpTier = migrateTier(p.smpPvpTier);
      macePvpTier = migrateTier(p.macePvpTier);
      cartPvpTier = migrateTier(p.cartPvpTier);
      overallTier = migrateTier(p.overallTier);
    };
  };

  // Serialize live maps -> stable arrays before upgrade
  system func preupgrade() {
    let upProfiles = List.empty<(Principal.Principal, UserProfile)>();
    for (entry in userProfiles.entries()) { upProfiles.add(entry) };
    stableUserProfiles := upProfiles.toArray();

    let upUsernameIndex = List.empty<(Text, Principal.Principal)>();
    for (entry in profileUsernameIndex.entries()) { upUsernameIndex.add(entry) };
    stableProfileUsernameIndex := upUsernameIndex.toArray();

    let upAppsV2 = List.empty<(Principal.Principal, Application)>();
    for (entry in applicationsV2.entries()) { upAppsV2.add(entry) };
    stableApplicationsV2 := upAppsV2.toArray();

    let upAppsV1 = List.empty<(Principal.Principal, ApplicationV1)>();
    for (entry in applications.entries()) { upAppsV1.add(entry) };
    stableApplicationsV1 := upAppsV1.toArray();

    let upPlayerUsernames = List.empty<(Text, Principal.Principal)>();
    for (entry in playerUsernames.entries()) { upPlayerUsernames.add(entry) };
    stablePlayerUsernames := upPlayerUsernames.toArray();

    let upTesterRoles = List.empty<(Principal.Principal, Bool)>();
    for (entry in testerRoles.entries()) { upTesterRoles.add(entry) };
    stableTesterRoles := upTesterRoles.toArray();

    let upPlayerTags = List.empty<(Principal.Principal, [PlayerTag])>();
    for (entry in playerTags.entries()) { upPlayerTags.add(entry) };
    stablePlayerTags := upPlayerTags.toArray();

    let upBanned = List.empty<(Principal.Principal, Bool)>();
    for (entry in bannedUsers.entries()) { upBanned.add(entry) };
    stableBannedUsers := upBanned.toArray();
  };

  // After upgrade: restore from stable arrays + migrate V1 applications
  system func postupgrade() {
    // Migrate any V1 applications not yet in V2
    for ((principal, appV1) in applications.entries()) {
      if (not applicationsV2.containsKey(principal)) {
        let migrated : Application = {
          player = migratePlayerV1(appV1.player);
          status = appV1.status;
          reviewer = appV1.reviewer;
        };
        applicationsV2.add(principal, migrated);
      };
    };
  };

  // ---- helper functions ----
  func isTester(caller : Principal.Principal) : Bool {
    switch (testerRoles.get(caller)) {
      case (?t) { t };
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

  public shared ({ caller }) func assignTesterRole(user : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign tester roles");
    };
    testerRoles.add(user, true);
  };

  public shared ({ caller }) func revokeTesterRole(user : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can revoke tester roles");
    };
    testerRoles.remove(user);
  };

  public shared ({ caller }) func banUser(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    bannedUsers.add(target, true);
  };

  public shared ({ caller }) func unbanUser(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bannedUsers.remove(target);
  };

  public query ({ caller }) func getBannedUsers() : async [Principal.Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view banned users");
    };
    let list = List.empty<Principal.Principal>();
    for (entry in bannedUsers.entries()) {
      if (entry.1) { list.add(entry.0) };
    };
    list.toArray();
  };

  public shared ({ caller }) func assignPlayerTags(target : Principal.Principal, tags : [PlayerTag]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign tags");
    };
    playerTags.add(target, tags);
  };

  public query func getPlayerTags(target : Principal.Principal) : async [PlayerTag] {
    switch (playerTags.get(target)) {
      case (?tags) { tags };
      case (null) { [] };
    };
  };

  public query func getAllProfiles() : async [ProfileEntry] {
    let entries = List.empty<ProfileEntry>();
    for (entry in userProfiles.entries()) {
      let tags = switch (playerTags.get(entry.0)) {
        case (?t) { t };
        case (null) { [] };
      };
      entries.add({ principal = entry.0; name = entry.1.name; tags });
    };
    entries.toArray();
  };

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

  public query ({ caller }) func listAllApplicationsWithPrincipals() : async [ApplicationEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    let entries = List.empty<ApplicationEntry>();
    for (entry in applicationsV2.entries()) {
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
    let name = profile.name;
    if (name.size() < 3 or name.size() > 20) {
      Runtime.trap("Username must be 3-20 characters");
    };
    switch (profileUsernameIndex.get(name)) {
      case (?existingPrincipal) {
        if (not Principal.equal(existingPrincipal, caller)) {
          Runtime.trap("Username already taken");
        };
      };
      case (null) {};
    };
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
    applicationsV2.add(caller, newApplication);
    playerUsernames.add(username, caller);
  };

  public shared ({ caller }) func reviewApplication(userToReview : Principal.Principal, approve : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can review applications");
    };
    switch (applicationsV2.get(userToReview)) {
      case (?application) {
        if (application.status != #pending) {
          Runtime.trap("Application is already reviewed");
        };
        let updatedApplication : Application = {
          player = application.player;
          status = if (approve) { #approved } else { #rejected };
          reviewer = ?caller;
        };
        applicationsV2.add(userToReview, updatedApplication);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public query ({ caller }) func getApplication(userToReview : Principal.Principal) : async Application {
    if (not isTesterOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only testers and admins can view applications");
    };
    switch (applicationsV2.get(userToReview)) {
      case (?application) {
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
    for (entry in applicationsV2.entries()) {
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
    switch (applicationsV2.get(targetPlayer)) {
      case (?application) {
        if (application.player.username != playerData.username) {
          switch (playerUsernames.get(playerData.username)) {
            case (?existingPrincipal) {
              if (not Principal.equal(existingPrincipal, targetPlayer)) {
                Runtime.trap("Username already taken");
              };
            };
            case (null) {};
          };
          playerUsernames.remove(application.player.username);
          playerUsernames.add(playerData.username, targetPlayer);
        };
        let updatedApplication : Application = {
          player = playerData;
          status = #approved;
          reviewer = ?caller;
        };
        applicationsV2.add(targetPlayer, updatedApplication);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public shared ({ caller }) func deletePlayer(targetPlayer : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete players");
    };
    switch (applicationsV2.get(targetPlayer)) {
      case (?application) {
        playerUsernames.remove(application.player.username);
        applicationsV2.remove(targetPlayer);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public query func getByGamemode(gamemode : Gamemode) : async [Player] {
    let filteredPlayers = List.empty<Player>();
    for (entry in applicationsV2.entries()) {
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
        if (matches) { filteredPlayers.add(entry.1.player) };
      };
    };
    filteredPlayers.toArray();
  };

  public query func getByTier(tier : Tier) : async [Player] {
    let filteredPlayers = List.empty<Player>();
    for (entry in applicationsV2.entries()) {
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
    for (entry in applicationsV2.entries()) {
      if (Principal.equal(entry.0, caller)) { ownedApps.add(entry.1) };
    };
    ownedApps.toArray();
  };

  public query func getPlayerByUsername(username : Text) : async Player {
    switch (playerUsernames.get(username)) {
      case (?user) {
        if (isBanned(user)) { Runtime.trap("Player not found") };
        switch (applicationsV2.get(user)) {
          case (?application) {
            if (application.status == #approved) { application.player }
            else { Runtime.trap("Player not found") };
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
      switch (applicationsV2.get(entry.1)) {
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
    for (entry in applicationsV2.entries()) {
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
    for (application in applicationsV2.values()) {
      if (application.status == #pending) { pendingApps.add(application) };
    };
    pendingApps.toArray();
  };

  public shared ({ caller }) func adminCreatePendingApplication(target : Principal.Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can do this");
    };
    switch (applicationsV2.get(target)) {
      case (?_) { Runtime.trap("Application already exists for this user") };
      case (null) {
        switch (userProfiles.get(target)) {
          case (null) { Runtime.trap("User has no profile") };
          case (?profile) {
            if (not playerUsernames.containsKey(profile.name)) {
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
            applicationsV2.add(target, newApp);
          };
        };
      };
    };
  };

  public shared ({ caller }) func adminUpdatePendingRanks(target : Principal.Principal, playerData : Player) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can do this");
    };
    switch (applicationsV2.get(target)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updated : Application = {
          player = playerData;
          status = application.status;
          reviewer = application.reviewer;
        };
        applicationsV2.add(target, updated);
      };
    };
  };

  public shared ({ caller }) func claimAdminRoleWithPassword(password : Text) : async () {
    let ADMIN_SECRET = "mctier@admin2024";
    if (password != ADMIN_SECRET) {
      Runtime.trap("Invalid admin password");
    };
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in with Internet Identity");
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

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
        switch (applicationsV2.get(target)) {
          case (?existing) {
            if (existing.status == #approved) {
              Runtime.trap("Player is already approved on the leaderboard");
            };
            applicationsV2.add(target, {
              player = playerData;
              status = #pending;
              reviewer = null;
            });
          };
          case (null) {
            if (not playerUsernames.containsKey(playerData.username)) {
              playerUsernames.add(playerData.username, target);
            };
            applicationsV2.add(target, {
              player = playerData;
              status = #pending;
              reviewer = null;
            });
          };
        };
      };
    };
  };

};
