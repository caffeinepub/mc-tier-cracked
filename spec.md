# MC Tier (Cracked)

## Current State
All backend data maps (`userProfiles`, `applicationsV2`, `playerTags`, `testerRoles`, `bannedUsers`, `playerUsernames`, `profileUsernameIndex`) are declared as regular (non-stable) `let` variables. This means every canister upgrade (deployment) wipes all stored data including usernames and player records.

## Requested Changes (Diff)

### Add
- `stable var` arrays for each data map as serialization buffers
- `system func preupgrade()` to serialize all maps into stable arrays before upgrade
- Enhanced `postupgrade()` to restore maps from stable arrays after upgrade (in addition to existing V1→V2 migration)

### Modify
- All data maps now persist across deployments via stable var + pre/postupgrade hooks

### Remove
- Nothing removed

## Implementation Plan
1. Add stable var arrays for each map: userProfiles, profileUsernameIndex, applicationsV2, playerUsernames, testerRoles, playerTags, bannedUsers
2. Add preupgrade to serialize maps → stable arrays
3. Update postupgrade to restore from stable arrays + do V1 migration
