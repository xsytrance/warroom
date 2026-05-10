# THE WAR ROOM

A private, mobile-first Progressive Web App for xsytrance and Juan to coordinate their AI empire.

**Private command hub. Tactical cyberpunk aesthetic. Built for mobile.**

---

## Latest Integration Docs

- Ambient Radio integration: `AMBIENT_RADIO_INTEGRATION.md`

---

## What is The War Room?

The War Room is a private social command hub — not Slack, not Discord, not a generic chat app. It is a secure, tactical collaboration space where xsytrance and Juan can:

- Post updates (Broadcasts) to the Intel Feed
- Share images, links, and media
- Comment and react (Salute, Fire, Laugh, Mind Blown, Approved)
- Organize conversations into Rooms (General, AI Starter Kit, Agent Actions, Art Studio, IoT Lab, Research, Random)
- View agent status and prepare for future Hermes agent integration
- Run entirely on private infrastructure behind Tailscale

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | SQLite (via better-sqlite3) |
| ORM | Prisma 7 |
| Auth | JWT (jose) + bcryptjs + httpOnly cookies |
| UI Icons | Lucide React |

---

## Quick Start

### 1. Install Dependencies

```bash
cd war-room
npm install
```

### 2. Set Environment Variables

Create `.env` (or edit existing):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NODE_ENV="development"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates SQLite database)
npx prisma migrate dev --name init

# Seed with demo users, rooms, agents, and posts
npx prisma db seed
# OR: npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

**Demo Login Credentials:**
- **xsytrance** / `warroom2024`
- **juan** / `warroom2024`

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## Phase 2 Testing

### How to Test the Broadcast Composer

1. **Login** at `/login` with `xsytrance` / `warroom2024`
2. **Tap BROADCAST** in the bottom nav (red button with plus icon)
3. **Select a room** from the 7 room buttons (color-coded)
4. **Optionally change signal type** — tap "Change" next to "Broadcast"
5. **Type your message** in the text area (max 2000 chars)
6. **Paste a URL** to see link detection in action
7. **Tap BROADCAST SIGNAL** (bottom) or **SEND** (top-right)
8. **Watch the pulse animation** → auto-redirect to feed
9. **See your post at the top** with correct room badge and timestamp

### API Tests (curl)

```bash
# 1. Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"xsytrance","password":"warroom2024"}'

# 2. Create a broadcast
curl -b cookies.txt -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"body":"Test broadcast","roomId":"ROOM_ID_HERE","type":"human_broadcast"}'

# 3. Empty body should fail
curl -b cookies.txt -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"body":"","roomId":"ROOM_ID_HERE"}'
# → {"error":"Message body is required"}

# 4. Invalid room should fail
curl -b cookies.txt -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"body":"test","roomId":"invalid"}'
# → {"error":"Invalid room — room not found"}

# 5. Unauthenticated should fail
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"body":"test","roomId":"x"}'
# → {"error":"Unauthorized"}
```

---

## Project Structure

```
war-room/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Room, Post, Comment, Reaction, Agent)
│   ├── seed.ts             # Demo data seed script
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Login, Logout, Me
│   │   │   ├── posts/        # Posts CRUD (GET list, POST create)
│   │   │   ├── comments/     # Comments CRUD
│   │   │   ├── reactions/    # Reactions toggle
│   │   │   ├── rooms/        # Rooms list
│   │   │   └── agents/       # Agents list
│   │   ├── broadcast/        # **Broadcast Composer (Phase 2)**
│   │   ├── feed/             # Intel Feed page
│   │   ├── rooms/            # Rooms directory page
│   │   ├── agents/           # Agents page
│   │   ├── profile/          # User profile page
│   │   ├── settings/         # App settings page
│   │   ├── login/            # Login page
│   │   ├── page.tsx          # Home (redirects)
│   │   ├── layout.tsx        # Root layout with PWA metadata
│   │   └── globals.css       # Tactical theme + animations
│   ├── components/
│   │   ├── BottomNav.tsx     # Bottom nav with BROADCAST button
│   │   ├── motion/           # VFX components
│   │   │   ├── ParticleField.tsx
│   │   │   ├── TacticalGrid.tsx
│   │   │   ├── RadarSweep.tsx
│   │   │   ├── SignalPulse.tsx      # Broadcast success animation
│   │   │   ├── Scanlines.tsx
│   │   │   ├── GlitchText.tsx
│   │   │   ├── useReducedMotion.ts  # Motion preference hook
│   │   │   └── index.ts
│   │   └── ...               # Feed cards, reaction bars, etc.
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── auth.ts           # Session utilities
│   │   └── utils.ts          # cn() helper
│   └── proxy.ts              # Route protection (auth middleware)
├── public/
│   ├── icons/                # PWA icons (72x72 to 512x512)
│   ├── manifest.json         # PWA manifest
│   └── avatars/              # Placeholder avatar images
├── .env                      # Environment variables
├── next.config.ts            # Next.js config (standalone output)
├── package.json
└── tsconfig.json
```

---

## Current Features (Phase 0 + 1 + 2)

### Authentication
- [x] Username/password login with bcrypt
- [x] JWT session cookies (httpOnly, secure)
- [x] Route protection via proxy middleware
- [x] Auto-redirect unauthenticated users to login
- [x] Logout with session destruction

### Mobile Shell
- [x] Mobile-first layout with safe-area support
- [x] Bottom navigation (Feed, Rooms, Agents, Profile) + prominent **BROADCAST** button
- [x] PWA manifest and install support
- [x] Dark tactical theme (near-black, red, cyan, green accents)

### Intel Feed
- [x] Broadcast cards with author, room badge, timestamp
- [x] Text posts with full CRUD API
- [x] **URL auto-linking** — URLs in post body render as clickable cyan links
- [x] Room filtering with pill selector
- [x] Real-time feed refresh after posting (auto-redirect to feed)
- [x] Demo posts seeded (8 posts)

### Broadcast Composer (Phase 2 — NEW)
- [x] **Dedicated /broadcast page** with full-screen mobile composer
- [x] **Room selector** — all 7 rooms with color-coded buttons
- [x] **Signal type selector** — Broadcast, Agent Report, Art Drop, Build Log, Research, IoT Event
- [x] **Text area** with 2000 character limit, real-time counter
- [x] **Link detection** — auto-detects URLs in message body, shows preview
- [x] **Submit validation** — disabled when empty, loading state while transmitting
- [x] **Error handling** — clear inline errors for invalid room, empty body, network issues
- [x] **Success animation** — SignalPulse overlay with "SIGNAL SENT" confirmation
- [x] **Auto-redirect** to feed after successful broadcast
- [x] **Cancel with discard confirmation** if text entered
- [x] Reduced-motion support throughout

### Reactions & Comments
- [x] 5 reaction types: Salute, Fire, Laugh, Mind Blown, Approved
- [x] Reaction toggle API
- [x] Comments with author
- [x] Comment count on posts

### Rooms
- [x] 7 rooms: General, AI Starter Kit, Agent Actions, Art Studio, IoT Lab, Research, Random
- [x] Room directory page with color coding
- [x] Filter feed by room

### Agents (Foundation)
- [x] 4 seeded agents: VG God, Picasso, Ultron, Juan's Deployment Agent
- [x] Agents page with status cards
- [x] Agent model ready for future API integration

### Visual Effects
- [x] Animated particle background
- [x] Tactical grid overlay
- [x] Radar sweep component
- [x] Signal pulse animation (used in broadcast success)
- [x] Scanline overlay
- [x] Glitch text effect
- [x] Reduced motion support throughout

### Settings
- [x] Sound effects toggle (placeholder)
- [x] Reduced motion toggle
- [x] Logout button

---

## Deployment Notes

### Running on PRIME / VPS

```bash
# Build
npm run build

# Start production server
npm run start
# or
PORT=3000 node .next/standalone/server.js
```

### Tailscale Access

1. Install Tailscale on the server
2. Run the app on a local port (e.g., 3000)
3. Access via the server's Tailscale IP: `http://100.x.x.x:3000`
4. No public internet exposure required

### Systemd Service (Example)

Create `/etc/systemd/system/war-room.service`:

```ini
[Unit]
Description=The War Room
After=network.target

[Service]
Type=simple
User=xsytrance
WorkingDirectory=/home/xsytrance/war-room
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=NEXTAUTH_SECRET=your-production-secret

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable war-room
sudo systemctl start war-room
```

### Environment Variables for Production

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="long-random-string-min-32-chars"
NODE_ENV="production"
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, sets session cookie |
| POST | `/api/auth/logout` | Logout, clears cookie |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/posts?roomId=` | List posts (optionally filtered) |
| POST | `/api/posts` | **Create a broadcast** |
| GET | `/api/comments?postId=` | List comments for post |
| POST | `/api/comments` | Create a comment |
| POST | `/api/reactions` | Toggle reaction |
| DELETE | `/api/reactions` | Remove reaction |
| GET | `/api/rooms` | List all rooms |
| GET | `/api/agents` | List all agents |

### POST /api/posts Payload

```json
{
  "roomId": "room-uuid",
  "body": "Your broadcast message",
  "type": "human_broadcast",
  "mediaUrl": null,
  "mediaType": null,
  "linkUrl": null
}
```

Validation:
- `body` is required and must be non-empty (max 2000 chars)
- `roomId` is required and must be a valid room
- `type` defaults to `human_broadcast`
- Returns 201 with created post on success
- Returns 400 with specific error message on validation failure
- Returns 401 if unauthenticated

### Future Agent API (Phase 6+)

```
POST /api/agent/broadcast
Authorization: Bearer <agent-token>
Body: {
  "agent": "picasso",
  "room": "art-studio",
  "type": "art_drop",
  "title": "New image generated",
  "body": "...",
  "mediaUrl": "/uploads/example.png",
  "priority": "normal",
  "metadata": { "model": "Flux", "prompt": "...", "seed": "12345" }
}
```

---

## Database Schema

```prisma
model User {
  id, username, displayName, passwordHash, avatarUrl, roleTitle, status
  posts, comments, reactions
}

model Room {
  id, name, slug, description, icon, color
  posts
}

model Post {
  id, authorId, roomId, type, title, body
  mediaUrl, mediaType, linkUrl, metadataJson, priority
  author, room, comments, reactions
}

model Comment {
  id, postId, authorId, body
  post, author
}

model Reaction {
  id, postId, userId, emoji, label
  post, user
}

model Agent {
  id, name, slug, roleTitle, avatarUrl, status, apiTokenHash
}
```

---

## Post Types

| Type | Purpose |
|------|---------|
| `human_broadcast` | Regular user post |
| `agent_report` | Agent status/mission update |
| `art_drop` | Generated artwork |
| `music_drop` | Generated music |
| `research_find` | Research discovery |
| `build_log` | Build/deployment update |
| `iot_event` | IoT device event |
| `alert` | Urgent notification |
| `mission_update` | Mission status change |
| `file_drop` | Shared file/document |

---

## Phase Roadmap

| Phase | Status | Goal |
|-------|--------|------|
| 0 | Complete | Project scaffold, Prisma schema, seed data, PWA config |
| 1 | Complete | Auth, mobile shell, tactical theme, visual effects |
| 2 | **Complete** | **Broadcast composer, create post API, link detection, feed refresh** |
| 2.5 | **Complete** | **Visual identity lock-in, mobile UX polish, shared design system** |
| 3 | **Complete** | **Media uploads (image + lightbox), image posting, feed rendering** |
| 3A | **Complete** | **Replies polish — reply drawer, thread view, inline composer** |
| 4 | Planned | PWA polish + service worker + install flow |
| 5 | Planned | Agent posting API + agent auth tokens |
| 6 | Planned | Docker + systemd + Tailscale deployment docs |

---

## Known Limitations (Phase 2)

- Media upload is stubbed (images display via URL only, no file upload yet)
- Real-time updates require manual refresh or navigation (WebSockets planned)
- Push notifications require service worker (planned)
- Agent API is documented but not fully implemented (Phase 5+)
- No image upload or drag-and-drop (Phase 3+)
- No threaded comment replies (Phase 3+)

---

## Security Notes

- App requires login for all routes except `/login` and auth APIs
- Passwords hashed with bcrypt (10 rounds)
- JWT sessions in httpOnly cookies
- No public registration (invite-only future)
- SQLite file should be backed up regularly
- Run behind Tailscale or VPN for private access
- Change `NEXTAUTH_SECRET` for production
- Empty posts rejected server-side
- Invalid room IDs rejected server-side
- All API routes validate authentication

---

## Credits

Built for **xsytrance** and **Juan** by the Kimi AI Swarm.

**Phase 2: Broadcast Composer is LIVE.**

Tactical design. Mobile-first. Private by default.


---

## Phase 3A — Replies Polish

### What Was Built

Phase 3A polishes the comment/reply system so users can discuss broadcasts in a mobile-friendly thread view.

### Reply API

**GET `/api/comments?postId=<id>`**
- Returns all replies for a broadcast, newest first
- Each reply includes author (name, role, avatar)
- Validates that the broadcast exists (404 if not)

**POST `/api/comments`**
- Creates a new reply
- Requires authentication (401 otherwise)
- Validates:
  - `postId` must be provided and valid
  - `body` must be non-empty
  - `body` max 1000 characters
- Returns the created reply with author data

### Reply Drawer Component

**File:** `src/components/replies/ReplyDrawer.tsx`

A mobile-first bottom-sheet reply interface:

**Header:**
- Drag handle bar at top
- "THREAD" title with MessageSquare icon
- Reply count badge
- X close button

**Original Broadcast Summary:**
- Compact preview of the original post at top of drawer
- Author avatar, name, role badge
- Post body (line-clamped)
- Image thumbnail if post has media
- Room badge and timestamp

**Reply List:**
- Each reply shows author avatar, name, role badge
- Reply body with link rendering
- Relative timestamp
- Staggered entrance animation
- Empty state: "No replies yet. Start the thread."
- Loading state with spinner

**Reply Composer (bottom):**
- Auto-expanding textarea (1-3 rows)
- 1000 character counter
- Cyan Send button (disabled when empty)
- **Shift+Enter** for new line, **Enter** to send
- Error banner for validation/network errors
- Sticky at bottom with safe-area padding

**Interaction:**
- Tap overlay outside drawer = close
- Escape key = close (desktop)
- Drag handle = close
- Background scroll locked while open
- Smooth spring animation (reduced-motion = instant)

### Feed Integration

**Broadcast cards updated with:**
- Tappable **Reply** button with reply count
- Shows "Reply" when 0 comments, "N replies" when > 0
- Styled with cyan hover accent
- Bottom section now shows reactions (left) + reply button (right)

**Reply button opens drawer:**
- Loads all replies for that broadcast
- User can read existing replies
- User can add a new reply
- After sending, reply appears in list immediately
- Comment count updates in feed after posting

### How to Test Replies

```bash
# 1. Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"xsytrance","password":"warroom2024"}'

# 2. Get a post ID
curl -s -b cookies.txt http://localhost:3000/api/posts | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['posts'][0]['id'])"

# 3. Get comments for that post
curl -s -b cookies.txt "http://localhost:3000/api/comments?postId=POST_ID"

# 4. Post a reply
curl -s -b cookies.txt -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":"POST_ID","body":"Great broadcast! Looking forward to the next update."}'
```

### Mobile UX Notes

- Reply drawer takes up to 85% of screen height
- Handle bar at top for easy drag-to-close
- Keyboard does not cover composer (composer stays visible)
- Touch targets: reply button 36px, send button 48px, close 40px
- Safe-area padding on composer
- No horizontal scrolling anywhere
- Textarea auto-expands up to 3 rows
- Single Enter sends reply; Shift+Enter adds newline

---

## Known Limitations (Phase 3A)

- **Replies are LIVE** — create, read, thread drawer
- Real-time reply updates: manual refresh only (WebSockets — future)
- No nested/threaded reply trees (single-level replies)
- No reply editing or deletion (future)
- No reply reactions separate from post reactions
- No reply notifications (Phase 4+)
- Video upload: not yet implemented
- Audio upload: not yet implemented
- Agent API: Phase 5

---

**Phase 3A: Replies Polish COMPLETE.**

Users can now open reply threads, read replies, and respond to broadcasts from mobile. The War Room feels like a real private social command hub.

Tactical design. Mobile-first. Private by default.


---

## Phase 4 — PWA Polish

### What Was Built

Phase 4 makes The War Room installable and app-like on Android and iOS devices.

### PWA Manifest

**File:** `public/manifest.json`

| Property | Value |
|----------|-------|
| Name | THE WAR ROOM |
| Short Name | War Room |
| Description | Private command hub for the AI empire |
| Display | Standalone |
| Orientation | Portrait |
| Start URL | /feed |
| Theme Color | #0a0a0f |
| Background Color | #0a0a0f |

**Icons:** 8 sizes from 72x72 to 512x512, plus a maskable icon for adaptive Android shapes.

**Apple Touch Icon:** 180x180 for iOS home screen.

### Service Worker

**File:** `public/service-worker.js`

- Caches the app shell (login, feed, offline page, icons, manifest)
- **Does NOT cache API responses** — private feed data stays server-side only
- **Does NOT cache uploaded images** — private media stays server-side only
- Offline fallback: serves `/offline.html` when navigation fails
- Auto-retry: `offline.html` auto-redirects to `/feed` when connection is restored
- Cache cleanup: old caches are deleted on activation

### Offline Banner

**File:** `src/components/OfflineBanner.tsx`

- Detects `navigator.onLine` status
- Shows "Signal Lost" banner (red) when connection drops
- Shows "Signal Restored" banner (green) when connection returns
- Auto-dismisses after 3 seconds when coming back online
- Dismiss button for manual close
- Reduced-motion friendly (instant fade when motion is disabled)
- Appears on all pages via WarRoomShell

### Install Guidance

**Location:** Settings page (`/settings`)

Added an "Install App" panel with step-by-step instructions:

**Android (Chrome):**
1. Open The War Room in Chrome
2. Tap browser menu (⋯)
3. Tap "Install app" or "Add to Home screen"
4. Launch from home screen

**iPhone (Safari):**
1. Open The War Room in Safari
2. Tap Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top-right
5. Launch from home screen

**BeforeInstallPrompt:** Captured on Android for potential future "Install" button.

### Network Status in Settings

Added a live network status indicator in Settings:
- Shows "Uplink Active" (green) when online
- Shows "Signal Lost" (red) when offline
- Updates automatically as connection changes

### Backup Script

**File:** `scripts/backup-war-room.sh`

Usage:
```bash
chmod +x scripts/backup-war-room.sh
./scripts/backup-war-room.sh              # Back up to ./backups/
./scripts/backup-war-room.sh /mnt/backup  # Back up to custom directory
```

What it backs up:
- `dev.db` — SQLite database
- `public/uploads/images/` — All uploaded images

Output: `war-room-backup-YYYYMMDD_HHMMSS.tar.gz`

Includes a README.txt with restore instructions.

### Offline Fallback Page

**File:** `public/offline.html`

A standalone offline page that:
- Uses War Room styling (dark, tactical, red accents)
- Shows "Signal Lost" with shield icon
- Displays "Retry Connection" button
- Auto-redirects to `/feed` when network is restored
- Works even without JavaScript bundler (pure HTML/CSS)
- Safe-area padding for iOS notch and home indicator

### Layout Meta Tags

Updated `src/app/layout.tsx` with:
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-title: WAR ROOM`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `mobile-web-app-capable: yes`
- Proper icon links for all sizes
- Theme color matching War Room dark palette

### Safe-Area Support

All pages already had `safe-top` and `safe-bottom` CSS classes. Phase 4 verified:
- Sticky headers use `env(safe-area-inset-top)`
- Bottom nav uses `env(safe-area-inset-bottom)`
- Offline page has status bar and bottom safe areas
- Reply drawer composer has bottom safe-area padding

---

## Known Limitations (Phase 4)

- **PWA install is LIVE** — manifest, icons, service worker, offline page
- **Offline shell works** — cached app shell, API calls fail gracefully
- **No push notifications** — requires HTTPS + public endpoint (future)
- **No background sync** — queued posts are not saved offline (future)
- **iOS standalone behavior** — may vary by Safari version; some features limited
- **Service worker scope** — only caches shell, not private data
- **WebSocket real-time updates** — still future
- **Agent posting API** — Phase 5
- **Video/audio upload** — not yet implemented

---



---

## Phase 5 — Agent Posting API

### What Was Built

Phase 5 enables Hermes agents to post into The War Room via token-protected API calls. Each agent now has a unique API token for Bearer authentication.

### Architecture

**Zero schema migration** — the existing schema already had everything needed:
- `Agent.apiTokenHash` stores hashed bearer tokens
- `Post.type` supports agent post types (`sitrep`, `art_drop`, `build_log`, etc.)
- `Post.metadataJson` stores agent-specific metadata

**Shadow user pattern** — each Agent has a corresponding `User` record (username: `agent-{slug}`). Agent posts use the shadow user's `authorId`, so the feed renders them naturally without UI changes.

### Agent Post Types

| Type | Purpose | Badge Color |
|------|---------|-------------|
| `sitrep` | Status report / mission update | Cyan |
| `art_drop` | Generated artwork | Violet |
| `build_log` | Build/deployment update | Green |
| `research_find` | Research discovery | Blue |
| `music_drop` | Generated music | Pink |
| `iot_event` | IoT device event | Amber |
| `alert` | Urgent notification | Red |
| `mission_complete` | Mission finished | Green |
| `error_report` | Error/bug report | Red |
| `file_report` | Shared file/document | Cyan |

### API Endpoints

#### `GET /api/agent/broadcast`
Health check for the agent endpoint.
```
Authorization: Bearer <agent-token>
```
**Response 200:** `{ status: "online", agent: { id, name, slug, role } }`

#### `POST /api/agent/broadcast`
Create an agent broadcast.
```
Authorization: Bearer <agent-token>
Content-Type: application/json
```

**Body:**
```json
{
  "room": "art-studio",
  "type": "art_drop",
  "title": "Neon Genesis",
  "body": "Generated with Flux. Prompt: cyberpunk cathedral...",
  "mediaUrl": "/uploads/genesis.png",
  "linkUrl": null,
  "priority": "normal",
  "metadata": { "model": "Flux", "prompt": "...", "seed": 12345 }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `room` | Yes | Room slug (e.g. `art-studio`, `general`) |
| `type` | Yes | Agent post type (see table above) |
| `body` | Yes | Message body (max 2000 chars) |
| `title` | No | Optional title (max 200 chars) |
| `mediaUrl` | No | URL to attached media |
| `linkUrl` | No | External link URL |
| `priority` | No | `low`, `normal` (default), `high`, `urgent` |
| `metadata` | No | Arbitrary JSON object (enriched with agentId/slug/name) |

**Response 201:** `{ post: { ... }, agent: { id, name, slug } }`

#### `GET /api/agent/me`
Returns the authenticated agent's identity and recent posting history.
```
Authorization: Bearer <agent-token>
```

### Token Management

**Generate a token for an agent (safe — no data loss):**

```bash
npm run agent:token -- <agent-slug>
# Example:
npm run agent:token -- picasso
```

The plain token prints **once**. Copy it immediately. The hash is stored in the database.

**Alternative: Get tokens during seed (destroys data):**

```bash
npm run db:reset   # WARNING: resets all data
# Tokens print to console during seed
```

> **Production warning:** Never run `db:reset` on a production database with real data. Use `npm run agent:token` instead.

### How to Test

```bash
# 1. Generate a token for an agent
npm run agent:token -- picasso
# Copy the printed token

# 2. Test agent health check
curl -s -H "Authorization: Bearer YOUR_AGENT_TOKEN"   http://localhost:3000/api/agent/broadcast

# 3. Post an agent broadcast
curl -s -X POST http://localhost:3000/api/agent/broadcast   -H "Authorization: Bearer YOUR_AGENT_TOKEN"   -H "Content-Type: application/json"   -d '{
    "room": "art-studio",
    "type": "art_drop",
    "body": "Test art drop from agent",
    "priority": "normal"
  }'

# 4. Post media-only (body can be empty if mediaUrl exists)
curl -s -X POST http://localhost:3000/api/agent/broadcast   -H "Authorization: Bearer YOUR_AGENT_TOKEN"   -H "Content-Type: application/json"   -d '{
    "room": "art-studio",
    "type": "art_drop",
    "body": "",
    "mediaUrl": "/uploads/genesis.png",
    "priority": "normal"
  }'

# 5. Check agent info
curl -s -H "Authorization: Bearer YOUR_AGENT_TOKEN"   http://localhost:3000/api/agent/me
```

### Feed Visuals

Agent posts are visually distinguished in the feed:
- **Bot icon** avatar instead of user initials
- **"Agent" badge** next to the name
- **Post type badge** (e.g. "art drop", "sitrep") with color coding
- All existing room badges and timestamps remain

### Security

- Tokens are 48-character hex strings (24 bytes entropy)
- Stored as bcrypt hashes (10 rounds) in `Agent.apiTokenHash`
- Plain tokens shown **once** when generated via `npm run agent:token`
- Agent endpoints bypass cookie session auth (`proxy.ts` allows `/api/agent/`)
- Agent endpoints enforce their own Bearer token auth via `authenticateAgent()`
- No public token list endpoint — tokens are write-only after generation
- Shadow user pattern: each Agent has a `User` record (`agent-{slug}`) for post authorship

### Known Limitations (Phase 5)

- No token rotation UI (must reset DB or manually update `apiTokenHash`)
- No rate limiting on agent endpoints (add nginx/Cloudflare rules in production)
- No webhook or push notification on agent posts (manual refresh only)
- No agent-to-agent messaging (all posts go to rooms)

---

**Phase 5: Agent Posting API is LIVE.**

Hermes agents can now broadcast into The War Room. The feed renders agent posts with bot badges and type labels. Token auth is secure with bcrypt-hashed bearer tokens.

Tactical design. Mobile-first. Private by default.

