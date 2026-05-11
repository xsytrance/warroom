# vAIb → War Room Station Integration Plan

Date: 2026-05-11

## Objective
Integrate music stations used by vAIb into War Room’s station pipeline without breaking Android playback reliability or existing agent radio behavior.

## Recon Summary

### War Room (current integration points)
- `src/components/audio/stations.ts`
- `src/app/api/audio/stations/route.ts`
- `src/components/audio/AudioProvider.tsx`
- `src/components/audio/StationSelector.tsx`

### vAIb Web Repo findings
- `src/agent/StationDiscovery.js`: agent presence/mood composition.
- `src/audio/SignalEngine.js`: procedural generated signal/audio behavior.
- No single static station catalog suitable for direct import.

### vAIb Android APK findings (stream URLs recovered)
- `https://ice1.somafm.com/dronezone-128-mp3`
- `https://ice1.somafm.com/cliqhop-128-mp3`
- `https://ice1.somafm.com/groovesalad-128-mp3`
- `https://ice1.somafm.com/sf1033-128-mp3`
- `https://ice1.somafm.com/u80s-128-mp3`

Conclusion: treat APK-discovered streams as the vAIb station payload and integrate through War Room’s existing API/UI/audio pipeline.

---

## Phase 1 — Canonical vAIb station registry (source of truth)
1. Create `src/lib/audio/vaibStations.ts`.
2. Define station schema with fields:
   - `id`, `name`, `sourceUrl`, `provider`, `genre`, `mood`, `attribution`, `isAgentStation=false`, `origin="vaib"`.
3. Seed with recovered streams listed above.
4. Add optional future-proof fields:
   - `priority`, `region`, `mobileSafe`, `codecHint`.

Outcome: typed, versioned canonical vAIb station list in repo.

## Phase 2 — API merge strategy (no regressions)
1. Update `src/app/api/audio/stations/route.ts` to return merged payload:
   - dynamic agent stations (existing),
   - vAIb stations (new),
   - ambient/local stations (existing).
2. Merge order:
   - active agent station first,
   - vAIb stations second,
   - ambient stations third.
3. Deduplicate by normalized `sourceUrl` + `name`.

Outcome: one stable station API contract for all clients.

## Phase 3 — UX grouping/operator control
1. Extend `StationSelector.tsx` groups:
   - Agent Stations,
   - vAIb Stations,
   - Ambient Stations.
2. Add source markers in labels:
   - `📡`, `vAIb`, `local`, `(fallback)`.
3. Keep and verify existing “Tune Active” shortcut behavior.

Outcome: clear station provenance and operator ergonomics.

## Phase 4 — Android-first reliability hardening
1. In `AudioProvider.tsx`, add runtime failover for network stations:
   - on `error`/stall timeout, auto-switch to next reachable fallback station.
2. Add lightweight health cache (e.g., 5-minute TTL) to avoid hammering dead sources.
3. Preserve existing autoplay/audio-context unlock gesture flow.

Outcome: imported stations don’t degrade Android usability.

## Phase 5 — Telemetry tagging
1. Extend analytics events with:
   - `stationOrigin`: `agent | vaib | ambient`
   - `provider`: `somafm | local | agent`
2. Capture failures:
   - `network_error`, `codec_unsupported`, `autoplay_blocked`, `fallback_activated`.
3. Add downstream analytics filtering by station origin.

Outcome: measurable adoption and reliability metrics for vAIb imports.

## Phase 6 — Validation matrix
1. Desktop validation: playback, station switching, login state.
2. Android validation over canonical tailnet endpoint:
   - `https://prime.tail5a1fa3.ts.net` (443)
   - play/start, switch, background/foreground, fallback activation.
3. Regression checks for `/audio/*` public accessibility and no auth redirect regressions.

Outcome: deployment-ready confidence before wider use.

---

## Risks and Controls
- Risk: APK extraction may not include full labeled station catalog.
  - Control: optional deeper decompile pass to recover names/metadata.
- Risk: some streams fail on mobile codec/network constraints.
  - Control: runtime fallback chain + health cache + failure telemetry.
- Risk: drift between vAIb and War Room station sets.
  - Control: maintain canonical `vaibStations.ts` with explicit versioning.

## Initial execution sequence
1. Phase 1 (registry)
2. Phase 2 (API merge)
3. Deploy + Android validation
4. Phase 3 UX polish
5. Phase 4/5 hardening + telemetry
