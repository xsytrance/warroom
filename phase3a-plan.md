# Phase 3A — Replies Polish Plan

## Goal
Polish replies/comments so users can tap a broadcast, view replies in a mobile drawer, add a reply, and see it appear cleanly.

## Files to Create
1. `src/components/replies/ReplyDrawer.tsx` — Bottom-sheet reply drawer
2. `src/components/replies/ReplyComposer.tsx` — Inline reply composer

## Files to Modify
1. `src/app/api/comments/route.ts` — Polish validation (max length, check post exists)
2. `src/app/feed/page.tsx` — Integrate ReplyDrawer, make comment count tappable

## Design
- Mobile-first bottom sheet (slides up from bottom)
- Dark tactical overlay behind drawer
- Original broadcast summary at top of drawer
- Reply list with author avatars, names, timestamps
- Reply composer at bottom (sticky)
- Glass card styling for replies
- Red/cyan accent colors
- Smooth animations with reduced-motion fallback
