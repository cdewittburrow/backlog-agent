# Fullstack

**What it is:** Vocabulary and concept trainer for product team members — TPMs, PMs, operators, designers. Every question answered, every tier unlocked moves the user from Newcomer to Full Stack Builder.

**Live:** (repo: `full-stack`)

## Stack
- Next.js (App Router), Tailwind, shadcn/ui
- Supabase (Postgres + Auth)
- Vercel deployment
- No external AI API at runtime

## What's built
- **Auth** — Supabase magic link, protected routes
- **Level Set** — 15-question placement quiz (Product, Engineering Basics & Git, Program Management), assigns starting tier
- **Daily Five** — global daily question set, per-user streak tracking, Wordle-style share text
- **Freeplay** — category browser, per-category unanswered question stream
- **Question bank** — 213 approved questions across 10 categories, 3 formats (mc, acronym, reverse)
- **Admin UI** — `/admin/questions` for reviewing and approving questions
- **XP system** — `mc = difficulty × 10`, `acronym/reverse = (difficulty × 10) + 5`
- **Tier progression** — 6 tiers (Newcomer → Full Stack Builder), XP thresholds: 0/200/500/1000/2000/3500

## Not yet built
- Level-up screen (axolotl mascot moment)
- User profile / progress display
- Logout button in UI

## Key constraints
- Pixel art aesthetic, retro but polished — game metaphor is structural, not decorative
- Mascot is an axolotl (teal/jewel-green, pixel art) — appears on level-up, Level Set completion, empty states
- Questions are authored with distractors (not dynamically generated) — especially important for acronym/reverse formats
- Confirmation email links currently go to localhost (known bug — needs fix for non-local use)

## Roadmap highlights
- Level-up screen with axolotl
- Profile page (tier, XP, streak, category coverage)
- Streak Mode, Deep Dive, spaced repetition (Phase 3)
- Team dashboard (Phase 4)
- 300+ questions target
