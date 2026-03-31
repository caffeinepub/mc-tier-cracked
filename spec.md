# MC Tier (Cracked)

## Current State
- UI-only prototype with dummy data (PLAYERS array in dummyData.ts)
- No backend, no auth, no database
- Leaderboard shows all dummy players
- Navbar has a non-functional LOGIN button
- 5 pages: Home, Gamemodes, Gamemode detail, Leaderboard, Player Profile

## Requested Changes (Diff)

### Add
- Email + password authentication via `authorization` component
- Role system: Admin, Tester, User
- Backend: Players table (username, discord optional, ranks per gamemode)
- Backend: Submissions table (username, ranks, submitted_by, status: pending/approved/rejected)
- Tester dashboard: form to submit a player application (username + gamemode ranks)
- Admin panel (hidden route `/admin`): approve/reject submissions, edit/delete approved players, manage gamemodes
- Login page/modal wired to actual auth
- Navbar LOGIN button opens login modal

### Modify
- Leaderboard: fetch from backend instead of dummy data; show only approved players
- Player Profile: fetch from backend
- Navbar: show logged-in user, role badge, logout button when authenticated

### Remove
- Dummy data usage from Leaderboard and Player Profile (keep dummyData.ts for types/constants)

## Implementation Plan
1. Select `authorization` component
2. Generate Motoko backend with:
   - Player type: {id, username, discord, ranks, addedBy, approvedBy}
   - Submission type: {id, username, discord, ranks, submittedBy, status, createdAt}
   - CRUD for players (admin only for direct add/edit/delete)
   - Submit application (tester only)
   - Approve/reject submission (admin only)
   - Get approved players (public)
   - Get all submissions (admin/tester)
   - Role management via authorization component
3. Wire frontend:
   - Login modal in Navbar
   - Leaderboard reads from backend (approved players only)
   - Tester page: submission form
   - Admin page: submissions list with approve/reject, players list with edit/delete
