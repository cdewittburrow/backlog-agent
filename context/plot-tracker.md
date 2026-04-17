# Plot Tracker

**What it is:** Personal garden management web app. Tracks a 12-bed raised bed garden (west/center/east columns, zone 7a, drip-irrigated). Manages crops, season logs, recurring care tasks, harvest yields, and AI-generated daily briefings.

**Live:** https://new-garden-tracker.vercel.app (repo: `New-Garden-Tracker`)

## Stack
- Next.js (App Router), Tailwind CSS
- Supabase (Postgres + Auth)
- Vercel hosting
- Rachio API — smart irrigation controller integration
- Google Gemini — daily garden briefing (currently being replaced with Claude)

## What's built
- 12-bed grid tracking (W1–W4, C1–C4, E1–E4)
- Crop/planting management with season notes and expected harvest dates
- Task system with due dates and completion tracking
- Harvest yield logging
- Watering log (via Rachio integration)
- Daily AI briefing — fetches planting/task/harvest/watering data from Supabase, weather from NWS API, generates narrative recommendations
- Briefing stored as `briefing.json` in the repo and served to the frontend

## Key constraints
- Garden is physically specific: 12 beds, West Valley City UT, zone 7a, drip irrigation via Rachio
- Rachio integration exists for watering data; moisture sensor integration is not yet built
- AI briefing currently uses Gemini free tier (being migrated to Claude scheduled task)
- Supabase is the primary data store with publishable anon key

## Roadmap highlights
- Replace Gemini briefing with Claude (in progress via scheduled task)
- Remote moisture sensor integration → auto-trigger Rachio watering
- Better push notifications for task due dates
