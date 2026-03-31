# MC Tier (Cracked)

## Current State
- Admin panel at `/admin` exists, secured by Internet Identity admin role
- Has PENDING, APPROVED, USERS, TAGS tabs
- APPROVED section only shows players with delete; no rank editing or banning
- No frontend password gate (only backend role check)
- No ban system

## Requested Changes (Diff)

### Add
- Frontend password gate on `/admin` (username + password form before admin panel is shown)
- Ban user functionality: admin can ban a player by principal, banned players hidden from leaderboard
- Edit player ranks functionality in the APPROVED tab
- Show submitter's tag in PENDING applications (highlight tier tester submissions)
- `listAllApplicationsWithPrincipals` backend query (returns principal + application for each player)
- `banUser`, `unbanUser`, `getBannedUsers` backend functions
- New BANNED tab in admin panel to view/unban users

### Modify
- `getLeaderboard`, `listAllApprovedPlayers`, `getByGamemode`, `getByTier` to exclude banned users
- AdminPage APPROVED section to include rank edit form per player
- AdminPage PENDING section to show submitter's tag badge if they have tier-tester tag

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add bannedUsers map, banUser/unbanUser/getBannedUsers, listAllApplicationsWithPrincipals, filter banned from leaderboard queries
2. Update `backend.d.ts` with new types/interfaces
3. Update `useQueries.ts`: add useEditPlayer, useBanUser, useUnbanUser, useBannedUsers, useAllApplicationsWithPrincipals hooks
4. Update `AdminPage.tsx`: add password gate, edit rank UI in APPROVED, ban UI, BANNED tab, tag highlight in PENDING
