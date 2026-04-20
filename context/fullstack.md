# Full Stack
**From newcomer to Full Stack Builder — one concept at a time.**

A vocabulary and concept trainer for product team members — TPMs, PMs, operators, designers — building cross-functional fluency. Every question answered, every tier unlocked is a step along a single arc from first day on the job to someone who belongs in any room.

**Decision test:** Does this move someone meaningfully along the path from Newcomer to Full Stack Builder, or is it just noise?

---

## Stack

| | |
|---|---|
| Frontend | Next.js (App Router), Tailwind, shadcn/ui |
| Backend / DB | Supabase (Postgres + Auth) |
| Deploy | Vercel, mobile-first |

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin queue at `/admin/questions`.

---

## What's Built

### Done
- **Auth** — Supabase Auth, signup/login, protected routes via proxy
- **DB schema** — all tables live: questions, answers, categories, tiers, user_progress, user_question_history, daily_five, user_daily_five
- **Content pipeline** — admin UI at `/admin/questions` for reviewing and approving questions
- **Question bank** — 213 approved questions across 10 categories, all tiers
- **Answer Experience** — shared QuestionCard component with reveal, XP award, and level-up detection; used by all modes
- **Level Set** — 15-question placement quiz (5 each from Product, Engineering Basics & Git, Program Management), global scoring, tier assignment on completion
- **Daily Five** — global daily question set (on-demand generation, 30-day exclusion window), per-user streak tracking, Wordle-style result squares and share text
- **Freeplay** — category browser with tier/XP status bar, per-category unanswered question stream, shuffled and filtered server-side

### Not Started
- XP tier promotion screen (level-up moment, axolotl mascot)
- User profile / progress display
- Streak display beyond the status bar

---

## Implementation Plan

### Phase 2 — The Game (V1)

**Level Set** *(build first — must be the front door)*
- [x] Select ~25 questions spanning all categories and tiers
- [x] Build placement UI — one question at a time, no back button, progress bar
- [x] Scoring logic — global score maps to starting tier (0–3 Newcomer → 15 Full Stack Builder)
- [x] On completion: write `user_progress` row with assigned `current_tier_id`, redirect to home

**Answer Experience** *(shared component used by all modes)*
- [x] Question card — prompt, 4 answer options (A/B/C/D)
- [x] On answer: reveal correct/incorrect, show explanation
- [x] XP award on correct — `mc = difficulty × 10`, `acronym/reverse = (difficulty × 10) + 5`
- [x] Update `user_question_history` on every answer

**Daily Five**
- [x] Daily Five generation — on-demand RPC: pick 5 questions, exclude last 30 days, idempotent
- [x] Daily Five UI — locked set, Wordle-style live squares, no skipping
- [x] Completion state — summary screen, copy-to-clipboard share text, streak display

**Freeplay**
- [x] Category browser — grid of all active categories with tier/XP status bar
- [x] Question stream — pull unanswered questions from selected category, server-shuffled
- [x] No timer, no end state — "All caught up" when category is exhausted

**Progression**
- [x] XP accumulation — `user_progress.total_xp` updated on every correct answer
- [x] Tier promotion — checked after each XP award, promotes if threshold crossed
- [ ] Level-up screen — axolotl mascot moment, new tier name displayed
- [ ] Profile view — current tier, XP, streak, category coverage

**V1 Definition of Done:** Used daily for 2 weeks without feeling thin.

---

### Phase 3 — Smarter Reps (V1.5)
- Streak Mode — keep going until you get one wrong
- Deep Dive — choose a category, go deep for 10+ minutes
- Spaced repetition — wrong answers return at intervals (SM-2, data model already captures what's needed)
- Fill in the blank + drag and drop question formats
- 300+ questions

### Phase 4 — Bring Your Friends (V2)
- Daily Challenge with leaderboard
- Badge system — depth in a specific category on top of tier progression
- Shareable progress cards
- Team dashboard — read-only view for leads: tier/XP per member, category heatmap, cohort view
- Proper onboarding flow

---

## Progression System

| Tier | What It Means |
|---|---|
| Newcomer | Day one. The vocabulary is foreign. |
| Scoping | Terms are clicking. You understand the shape of the work. |
| In Sprint | Actively doing the reps. The pace is picking up. |
| In Review | Knowledge is getting validated in real situations. |
| Unblocked | Nothing stops you. You can hold your own in any room. |
| Full Stack Builder | The destination. Breadth across all disciplines. |

Tiers are stored in the `tiers` table — not hardcoded. XP thresholds: 0 / 200 / 500 / 1000 / 2000 / 3500.

---

## Content

### Categories (V1)
| Category | Slug |
|---|---|
| Product | `product` |
| Engineering Basics & Git | `engineering-git` |
| Dev Tooling | `dev-tooling` |
| Program Management | `program-management` |
| Product Design | `product-design` |
| Go to Market | `go-to-market` |
| SaaS & HRIS | `saas-hris` |
| Communication & Process | `communication` |
| QA & Testing | `qa-testing` |
| Data & Analytics | `data-analytics` |
| Security & Compliance | `security` *(stub only in v1)* |

### Question Formats
| Format | Description |
|---|---|
| `mc` | Multiple choice — four options, one correct |
| `acronym` | Show acronym, pick correct expansion |
| `reverse` | Show full term, pick correct acronym |

### Generating New Questions

Use this prompt in Claude with any category:

> You are generating quiz questions for Full Stack, a vocabulary and concept trainer for product team members. The audience includes TPMs, PMs, operators, and designers.
>
> Category: [INSERT CATEGORY]
> Source material (optional): [PASTE INTERNAL DOCS OR LEAVE BLANK]
>
> Generate 20 questions as a CSV with columns: `category, tier, format, difficulty, prompt, answer_0, answer_1, answer_2, answer_3, correct, explanation`
>
> Mix `mc`, `acronym`, and `reverse` formats. Vary difficulty (1–3). Every question must include a plain-English explanation written for a non-technical reader. No trick questions. Only include what you are confident is accurate.

After generating: review in `/admin/questions`, approve, then import via Supabase dashboard.

---

## Design

**Aesthetic:** Pixel art-inspired, retro but polished. The game metaphor is structural — leveling up, earning XP, unlocking tiers. Not a quiz app with stickers on it.

**Characters:** Six pixel art RPG characters representing each tier. Tiers 1–2 are fully rendered (skin, clothes, armor details); tiers 3–6 are silhouettes in progressively lighter teal. All share the same skin tone and front-facing stance — progression reads through armor mass, accessories, and width, never face or gender. Tier 6 (Full Stack Builder) has a crown, legendary staff, and animated aura particles. Used in the intro screen arc row; full-size sprites available for level-up screens and other milestone moments.

**Colors:**
| Role | Value |
|---|---|
| Primary dark / headings | `#134E4A` |
| Accent / interactive | `#0D9488` |
| Surface tints | `#F0FDFA` |
| Borders | `#CCFBF1` |

---

## Open Questions
- Final tier names — arc and meaning locked, exact wording still TBD

---

## Decision Log

Key decisions made during build, with reasoning. Not exhaustive — only decisions where the alternative was real.

**Level Set uses a global score, not per-category placement**
Per-category would be more precise but the UI explanation is too complex and the scoring logic is much harder to build cleanly. A single starting tier is honest enough and easier to rebalance.

**Level Set is 15 questions across 3 core categories (Product, Engineering Basics & Git, Program Management)**
30 questions was too long in practice. Narrowing to the 3 most relevant categories for the target audience (TPMs, PMs, operators) gives enough signal without exhausting the user at the front door.

**XP formula: `mc = difficulty × 10`, `acronym/reverse = (difficulty × 10) + 5`**
A small format bonus rewards the harder cognitive lift of acronym and reverse questions without making the formula complicated. Keeps XP meaningful across formats.

**XP thresholds set conservatively (200 / 500 / 1000 / 2000 / 3500)**
Easier to make progression harder later than to deflate progress that's already happened. At ~100 XP/day from Daily Five alone, Full Stack Builder takes ~72 days of consistent play — achievable but not trivial.

**Daily Five generation is on-demand, not a scheduled cron**
Manual curation breaks by day 4. A cron adds infrastructure complexity for no user-facing benefit in v1. On-demand generation (first visitor each day triggers it) is simpler and reliable enough at current scale.

**`xp_value` not stored on the questions table**
The formula is two lines of app logic. Adding a column means backfilling 213 rows before building anything. Per-question XP tuning is a Phase 3 concern — add the column then if needed.

**Authored wrong answers kept for now, especially for `acronym` and `reverse` formats**
Random distractors pulled from other questions could work reasonably well for `mc`, but `acronym` and `reverse` questions depend entirely on plausible distractors to create meaningful difficulty. The tradeoff (smaller CSVs vs. question quality) isn't worth reworking while the question bank is still being built.

---

## Roadmap

Ideas and improvements for after the Phase 2 implementation plan is complete. Not prioritized.

**Polish & navigation**
- Logout button — server action exists, just needs a button somewhere in the UI
- Profile page — current tier, XP, progress to next threshold, streak history, category coverage heatmap
- Level-up screen — axolotl mascot moment when tier promotion occurs

**Visual identity**
- Logo — needed everywhere: auth screens, browser tab, share cards
- Tier characters — full-size sprites designed (6 tiers, 24–32px wide logical grid); integrate into level-up screen, Level Set completion, and empty states
- General whimsy pass — the pixel aesthetic is present but subtle; needs more personality

**Content & question engine**
- Dynamic distractor generation — for `mc` format, pull 3 random wrong answers from the same category at query time instead of authoring them; reduces CSV size 4x but sacrifices some distractor quality
- 300+ questions (Phase 3 target)
- Security & Compliance category fully populated (currently stub)

**Gameplay modes (Phase 3)**
- Streak Mode — keep answering until you get one wrong
- Deep Dive — choose a category, go deep for 10+ minutes
- Spaced repetition — wrong answers return at SM-2 intervals (data model already supports this)
- New question formats — fill in the blank, drag and drop

**Social & teams (Phase 4)**
- Daily Challenge leaderboard
- Badge system — depth badges per category on top of tier progression
- Shareable progress cards
- Team dashboard — read-only view for leads: tier/XP per member, category heatmap, cohort view
- Proper onboarding flow
