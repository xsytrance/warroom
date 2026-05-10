# Ambient Radio Integration (War Room)

## Status

- Feature branch: `feature/ambient-radio-warroom`
- Checkpoint commit: `e0214e3`
- Feature commit: `c783e2e`
- Scope: **frontend-only**, isolated mini-player, no DB/auth/backend rewrites

---

## Mission Summary

Implemented a lightweight "command-room ambient radio" for War Room.

### Included

- Persistent global mini-player
- Play / pause
- Mute / unmute
- Volume control
- Station switching
- Local preference persistence (station, volume, mute)
- Mobile-safe compact panel
- Graceful failure behavior for missing/broken audio URLs

### Explicitly Excluded

- No queue system
- No uploads
- No social music features
- No recommendations
- No AI DJ
- No WebSocket sync
- No Juan/xsy playback synchronization
- No database schema changes
- No auth model changes

---

## Safety + Git Workflow Performed

### 1) Repo verification

Executed:

- `pwd`
- `git status`
- `git branch --show-current`
- `git remote -v`

Result:

- Repo path: `/home/xsyprime/android-division/apps/warroom`
- Branch at start: `main`
- Remote: `https://github.com/xsytrance/warroom.git`

### 2) Checkpoint commit

Created pre-integration safety commit:

- `e0214e3 chore: checkpoint before ambient radio integration`

### 3) Branch isolation

Created and switched to:

- `feature/ambient-radio-warroom`

---

## Architecture Notes

- App uses **Next.js App Router** (`src/app/layout.tsx` global root).
- Global mounting point selected: root layout body.
- Ambient subsystem is isolated under:
  - `src/components/audio/`
  - `src/lib/audio/`
- Provider and player are mounted once globally to persist across route navigation.

---

## Files Added / Changed

### Added

- `src/components/audio/stations.ts`
- `src/lib/audio/audioStorage.ts`
- `src/components/audio/AudioProvider.tsx`
- `src/components/audio/StationSelector.tsx`
- `src/components/audio/AmbientRadioMiniPlayer.tsx`
- `src/components/audio/AmbientRadioMount.tsx`

### Changed

- `src/app/layout.tsx`
  - Added `AmbientRadioMount`
  - Mounted once at root body (after page children)

---

## Station Model and Config

`AmbientStation` shape:

- `id: string`
- `name: string`
- `description: string`
- `mood: string`
- `sourceUrl: string`
- `attribution?: string`

Configured stations:

1. Night Channel
   - Mood: cyber ambient / night operations
   - URL: `/audio/stations/night-channel.mp3`

2. Pulse Drift
   - Mood: melodic techno / focus
   - URL: `/audio/stations/pulse-drift.mp3`

3. Ghost Relay
   - Mood: progressive breaks / tactical movement
   - URL: `/audio/stations/ghost-relay.mp3`

4. Circuit Bloom
   - Mood: uplifting trance / optimistic command energy
   - URL: `/audio/stations/circuit-bloom.mp3`

---

## Player Behavior (Implemented)

- **No autoplay on page load**
- User interaction required for play
- Persists across navigation (global mount)
- Selected station persisted in `localStorage`
- Volume persisted in `localStorage`
- Muted state persisted in `localStorage`
- Default volume: `0.35` (35%)
- Station switch while playing:
  - source switches + resumes playback
- Station switch while paused:
  - source switches + stays paused
- Playback-blocked handling:
  - shows user-safe status message
- Missing/broken source handling:
  - status set to `Station unavailable`
  - no app crash

---

## Local Storage Keys

- `warroom:ambient:station-id`
- `warroom:ambient:volume`
- `warroom:ambient:muted`

---

## UI/UX Notes

- Tactical dark card styling
- Cyan accent highlights
- Compact footprint
- Accessibility considerations:
  - button `aria-label`s
  - range input label
  - status text with `aria-live="polite"`
- Placement:
  - Desktop: bottom-right
  - Mobile: raised above bottom-nav zone

---

## Validation and Test Results

## Build/Test commands run

- `npm run lint` → **fails** due pre-existing repository lint debt not introduced by this feature
- `npm run build` → **passes**
- `npm run typecheck` → no script present

### Runtime checks

- Rebuilt and prepared standalone assets
- Restarted `war-room.service`
- Health probe passed:
  - `GET /api/health` returned `200` and `{ "status": "ok", "app": "war-room" }`

---

## Known Limitations

- Station file URLs are placeholders.
- If files are absent in `public/audio/stations/`, playback fails gracefully and player remains stable.

---

## Suggested Next Tiny Step

Add non-copyrighted sample audio files to:

- `public/audio/stations/night-channel.mp3`
- `public/audio/stations/pulse-drift.mp3`
- `public/audio/stations/ghost-relay.mp3`
- `public/audio/stations/circuit-bloom.mp3`

This will make all four stations play out-of-the-box.

---

## Rollback Procedure

If needed, revert to checkpoint baseline:

1. `git checkout main`
2. `git reset --hard e0214e3`

Or discard feature branch entirely while keeping checkpoint intact.

---

## Operator Notes

Production endpoint remains:

- `https://prime.tail5a1fa3.ts.net:11369`

Ambient radio is intentionally minimal and operational, not a full music platform.
