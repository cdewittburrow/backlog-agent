# Just Pick Already

Tinder-style group voting app. An organizer creates a room with a list of options, shares a link, and everyone swipes. The winner is obvious.

Supports restaurants, movies, activities, or any custom list.

**Live:** https://brunch-rouge.vercel.app

## Stack

- React + Vite, Tailwind CSS
- `react-tinder-card` + `@react-spring/web` for swipe mechanics
- Google Places API — real photos, star ratings, review snippets (currently offline — see Roadmap)
- Supabase — auth, database, RLS
- Vercel — deployment via GitHub integration

## How it works

**Organizers** sign in via magic link, create a room (title, activity type, options), then share the room link. Options can be added manually, searched via Google Places (restaurants), or loaded from a template.

**Participants** visit the share link — no sign-in required. Each browser gets a UUID session stored in localStorage. Swipe right to like, left to pass. Results are visible once the organizer closes voting or shares the results link.

## Routes

| Path | Purpose |
|---|---|
| `/` | Organizer dashboard — sign in, list rooms, create new room |
| `/room/:slug` | Participant voting view |
| `/room/:slug/results` | Results view (shareable) |
| `/manage/:slug` | Organizer room management — share link, toggle voting, view results |

## Local dev

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev
```

## Environment variables

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console — needs **Maps JavaScript API** + **Places API** enabled |

For Vercel deployment, env vars are set via `vercel env add` or the Vercel dashboard. All three environments (Production, Preview, Development) need values.

## Database schema

```sql
rooms (
  id             uuid  primary key,
  slug           text  unique,
  title          text,
  description    text,
  activity_type  text,           -- 'restaurant' | 'movie' | 'activity' | 'custom'
  status         text,           -- 'open' | 'closed'
  organizer_id   uuid,           -- references auth.users
  created_at     timestamptz
)

room_options (
  id          uuid  primary key,
  room_id     uuid  references rooms,
  place_id    text,              -- Google Place ID (nullable for non-restaurant types)
  name        text,
  label       text,              -- subtitle/descriptor
  emoji       text,              -- fallback display
  gradient    text,              -- fallback card background
  image_url   text,              -- Google Places photo (nullable)
  sort_order  int
)

room_swipes (
  id          uuid  primary key,
  room_id     uuid  references rooms,
  option_id   uuid  references room_options,
  session_id  text,              -- random UUID per browser (localStorage)
  direction   text,              -- 'left' | 'right'
  created_at  timestamptz
)

template_lists (
  id             uuid  primary key,
  activity_type  text,
  name           text,
  sort_order     int
)

template_options (
  id          uuid  primary key,
  list_id     uuid  references template_lists,
  place_id    text,
  name        text,
  label       text,
  emoji       text,
  gradient    text,
  sort_order  int
)
```

The `clear_all_swipes()` RPC function runs `TRUNCATE room_swipes` with `SECURITY DEFINER` so the anon key can call it per-room. Direct `DELETE` without a `WHERE` clause is blocked by Supabase's RLS.

## Roadmap

**Restore Google Places integration** *(S)*
The Google Maps API key was deleted during unrelated troubleshooting. Create a new key in Google Cloud Console with **Maps JavaScript API** and **Places API** enabled, restrict it to `brunch-rouge.vercel.app/*`, update `VITE_GOOGLE_MAPS_API_KEY` in Vercel env vars, and redeploy. Until then, restaurant photo/rating enrichment is broken but the core voting flow still works.

## Deliberate decisions

**Google API key is visible in the JS bundle — that's fine**
`VITE_*` env vars get compiled into the client bundle, so the key is readable by anyone who opens DevTools. This is unavoidable for a purely static/client-side app. The correct mitigation is restricting the key in Google Cloud Console to only accept requests from `brunch-rouge.vercel.app/*`, not hiding it in code.

**Using the legacy `PlacesService` API despite the deprecation warning**
Google deprecated `google.maps.places.PlacesService` for new customers as of March 2025 in favor of `google.maps.places.Place`. We attempted the migration but the new API broke photo/rating loading. Since Google has committed to at least 12 months notice before removal, we reverted to the working legacy approach and will migrate when forced.

**Card flip instead of a tappable pin for Google Maps**
The original 📍 pin used `stopPropagation` on click to avoid triggering a swipe. On mobile this didn't work because `react-tinder-card` captures `touchstart` events, which fire before `click`. Rather than fighting the event model with `onTouchStart` stopPropagation (which broke the link itself), we replaced the pattern with a card flip. Tapping the pin flips the card to a detail view with a proper Maps link button — no touch conflict, and a better UX anyway.

**Votes cleared via Supabase RPC, not direct DELETE**
Supabase blocks `DELETE FROM table` without a `WHERE` clause as a safety measure, and the anon key doesn't have row-level delete permissions anyway. Solution: a `SECURITY DEFINER` stored function (`clear_all_swipes`) that runs `TRUNCATE` with elevated privileges. The anon key has `EXECUTE` permission on the function but no raw table access.

**Any interactive element inside a TinderCard needs `onTouchStart={e => e.stopPropagation()}`**
`react-tinder-card` captures `touchstart` at the card level, which swallows taps on any child elements before they can fire a `click`. Adding `onTouchStart={e => e.stopPropagation()}` to buttons and links inside the card prevents the swipe handler from intercepting the touch. This applies to both the front and back faces. `onClick` stopPropagation alone is not enough on mobile.

**No anti-abuse / multi-vote protection beyond localStorage**
A user can vote multiple times by clearing localStorage or using a private window. This is intentional — the app is shared with a specific small group, adding real auth would be overkill, and the social context makes gaming it pointless.

**Crawlers blocked at multiple layers**
`robots.txt` + `<meta name="robots">` in `index.html` (including Googlebot/Bingbot variants). This is a private voting tool, not a public directory listing — no reason for it to be indexed.

**RLS organizer enforcement is partly client-side**
`RoomManager.jsx` checks `room.organizer_id === user.id` before rendering the management UI, but this is a UI guard only. The actual security relies on Supabase RLS policies at the database level — verify those are in place on the `rooms` table.
