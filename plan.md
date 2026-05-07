# The War Room — Build Plan

## Mission
Build a private, mobile-first Progressive Web App for xsytrance and Juan to coordinate their AI empire. Tactical cyberpunk visual identity. Next.js + TypeScript + Tailwind + Framer Motion + Prisma + SQLite.

## Skill Loading
- **Phase 0-1**: `vibecoding-webapp-swarm` — for Next.js mobile-first PWA scaffold, auth shell, and tactical UI
- **Phase 2-7**: Continue with `vibecoding-webapp-swarm` for feed, composer, reactions, media, PWA polish, agents, deployment

## Phase Breakdown

### Phase 0 — Planning and Scaffold
- Create Next.js 15 TypeScript app with App Router
- Add Tailwind CSS, Framer Motion, Prisma, SQLite
- Configure dark tactical theme, PWA manifest placeholders
- Define Prisma schema (User, Room, Post, Comment, Reaction, Agent)
- Seed users (xsytrance, Juan) and rooms
- Add README with setup instructions
- **Success Criteria**: App runs locally, mobile layout works, README explains setup

### Phase 1 — Auth and Mobile Shell
- Landing/login screen with tactical animated background
- Username/password auth with bcrypt
- Session handling (JWT or cookie-based)
- Route protection middleware
- Bottom navigation (Feed, Rooms, Broadcast, Profile)
- Mobile-first layout with safe-area support
- Dark cyberpunk theme (near-black base, tactical red, electric cyan, radar green)
- Animated particle background + subtle grid overlay
- Seed demo users and rooms
- **Success Criteria**: xsytrance and Juan can log in, unauthenticated users blocked, app looks good on mobile viewport

### Phase 2 — Intel Feed and Broadcasts
- Post model + CRUD API routes
- Feed page with broadcast cards
- Broadcast composer (full-screen mobile sheet)
- Room selection, feed filtering
- Signal pulse animation on post creation
- **Success Criteria**: Users create text broadcasts, appear in feed, filter by room

### Phase 3 — Reactions and Replies
- Comments/replies model + UI
- Emoji reactions (Salute, Fire, Laugh, Mind Blown, Approved)
- Reaction tap animations
- **Success Criteria**: Users can reply and react, UI stays clean on mobile

### Phase 4 — Media Drops
- Local image upload API
- Image preview in feed
- Image lightbox / fullscreen preview
- GIF URL support, video URL support
- **Success Criteria**: Images attach and display, lightbox works, video links render as cards

### Phase 5 — PWA Polish and War Room Feel
- PWA manifest + icons
- Service worker placeholder
- Radar sweep effect, scanline shimmer
- Broadcast signal animation
- Sound toggle + reduced motion toggle
- Improved loading states
- **Success Criteria**: Installable on mobile, animations smooth, settings work

### Phase 6 — Agent Foundations
- Agent model seeded
- Agents tab/screen
- Draft API design for agent posts
- Token-protected endpoint stub
- **Success Criteria**: Agents appear as future operatives, API documented

### Phase 7 — Deployment Notes
- Production build instructions
- Environment variable docs
- Tailscale deployment notes
- systemd service example
- **Success Criteria**: xsytrance can run it on PRIME or VPS

## File Propagation
- Phase 0 outputs: project scaffold, Prisma schema, seed script, README
- Phase 1 receives: scaffold, adds auth + shell + theme + navigation
- Phase 2 receives: auth + shell, adds feed + composer
- Phase 3 receives: feed, adds reactions + comments
- Phase 4 receives: feed + composer, adds media
- Phase 5 receives: all above, adds PWA polish
- Phase 6 receives: all above, adds agent foundations
- Phase 7: deployment documentation

## Build Order (per user request: Phase 0 + 1 first)
Execute Phase 0 and Phase 1 now. Wait for user approval before Phase 2+.
