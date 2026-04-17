# Recipe App

**What it is:** Personal recipe library. Your archive is the product — optimized for one person standing at a stove, not for discovery or social features.

**Live:** https://recipe-book.vercel.app (repo: `recipe-book`)

## Stack
- Single-file HTML, vanilla JS — no build step, no framework
- Supabase (Postgres) — anon key currently hardcoded in `index.html` (v2 will proxy via Vercel function)
- Vercel hosting (auto-deploys on push to `main`)
- Mobile-first PWA

## What's built (v1)
- Recipe library — search, filter by tag, sort by date/alpha/recently cooked
- Recipe detail view — ingredients, steps, tags, metadata
- Manual entry form — add and edit recipes with structured ingredient/step editors
- Cook mode — fullscreen, dark UI, live serving scaling, Wake Lock (screen stays on)
- Annotations — timestamped personal notes layered on top of any recipe, persisted separately
- Shopping list — tap-to-check ingredient list from any recipe, copy to clipboard
- Export — print/PDF (with annotations), JSON, plain text
- ~30 recipes imported via one-time script from Google Drive

## Key constraints
- No multi-user, no auth, no social features (by design)
- Supabase anon key is in client HTML — known, deferred to v2
- Vanilla JS / single-file — no build step (intentional simplicity)
- No AI in the app at runtime in v1

## Data model
- `recipes` — title, description, source_url, base_servings, tags[], cook_time_minutes, last_cooked_at
- `ingredients` — recipe_id, sort_order, quantity, unit, name, prep_note
- `steps` — recipe_id, sort_order, content
- `annotations` — recipe_id, content, created_at
- `import_log` — recipe_id, source_type, imported_at

## Roadmap highlights
- Supabase key proxy via Vercel function (v2)
- AI-driven recipe import (paste URL or text → Claude parses into schema)
- Multi-recipe shopping list aggregation
- Make-again / cook history ratings
- Meal planning / calendar (v3)
