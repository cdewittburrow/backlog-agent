# Just Pick Already

**What it is:** Tinder-style group voting app. Organizer creates a room with options, shares a link, everyone swipes. Winner is obvious. No sign-in required for participants.

**Live:** https://brunch-rouge.vercel.app (repo: `brunch`)

## Stack
- React + Vite, Tailwind CSS
- `react-tinder-card` + `@react-spring/web` for swipe mechanics
- Supabase (Postgres + Auth with magic link)
- Google Places API — restaurant photos/ratings (currently broken — API key deleted)
- Vercel deployment

## What's built
- Organizer flow: sign in via magic link, create room, add options, share link
- Participant flow: visit share link (no sign-in), swipe right to like / left to pass
- Results view (shareable link)
- Organizer management: toggle voting open/closed, view live results
- Activity types: restaurants, movies, activities, custom lists
- Template lists for common option sets
- Card flip for Google Maps detail view (touch-safe pattern)
- Session-based voting (localStorage UUID, no auth required for participants)

## Key constraints
- Google Places integration is currently broken (API key was deleted — needs new key created + restricted to the Vercel domain)
- No anti-abuse beyond localStorage (intentional for small-group use)
- Votes are anonymous per-session; no multi-vote protection beyond social context
- `VITE_*` env vars are compiled into the client bundle — Google API key is visible in DevTools (mitigated by domain restriction in Google Cloud Console)

## Database schema highlights
- `rooms` — title, activity_type, status (open/closed), organizer_id
- `room_options` — name, label, emoji, gradient, image_url, place_id
- `room_swipes` — option_id, session_id, direction
- `template_lists` / `template_options` — preset option sets

## Roadmap highlights
- Restore Google Places integration (create new key, restrict to domain)
- Tie-breaking logic (coin flip when votes are equal)
- Guest idea submission (participants can suggest options, not just swipe)
