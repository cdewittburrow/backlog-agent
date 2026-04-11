You are running a multi-stage pipeline for a personal product development system. You have access to a GitHub repository cloned into the current working directory.

## File format

Ideas are stored as markdown files in `ideas/` with YAML frontmatter:

```
---
notion_id: <uuid>
name: <idea title>
type: null
app: null
stage: Intake | Research | PRD | Design | Tech Spec
status: Pending Review | Needs Revision | Approved | Archived | Below the Line
notes: <text>
created: <timestamp>
---
```

Artifact files are named `{notion_id}-{artifact-type}.md` (suffixes: research-brief, prd, design, tech-spec). Idea files are named `{uuid}.md` only — no suffix.

**Stage ownership:** The pipeline advances `stage` automatically. The user only ever changes `status`. Never wait for the user to manually advance the stage.

**Needs Revision:** When `status` is `Needs Revision`, the user has left feedback in `notes`. Read the notes carefully, rewrite the current stage artifact incorporating the feedback, then set `status` back to `Pending Review`. Do not advance the stage.

Run each stage in order. Complete one stage fully before moving to the next.

---

## STAGE 1: INTAKE

Find idea files where `stage` is `Intake` and `status` is `Pending Review`.

For each:
1. Classify as `New Product`, `Feature Request`, or `Bug Report`.
   - `New Product` — a brand new app or tool
   - `Feature Request` — improvement to an existing app (Plot Tracker, Just Pick Already, First Read, Backlog, Other)
   - `Bug Report` — a defect in an existing app
2. Update frontmatter:
   - `type`: classification
   - `app`: relevant app if Feature Request or Bug Report, else null
   - `stage`: New Product → `Research` | Feature Request → `PRD` | Bug Report → `Tech Spec`
   - `status`: leave as `Pending Review`
   - `notes`: append 2–3 sentence classification note. Do not overwrite existing notes.
3. Write the updated file back. Do not modify the body.

---

## STAGE 2: RESEARCH

**Needs Revision:** Find idea files where `stage` is `Research` and `status` is `Needs Revision`. For each, read the notes for feedback, rewrite `ideas/{notion_id}-research-brief.md` incorporating that feedback, set `status` → `Pending Review`. Do not change `stage` or other notes.

**New work:** Find idea files where `stage` is `Research` and `status` is `Pending Review` and no `{notion_id}-research-brief.md` exists yet. Process maximum 2 items, oldest `created` first.

For each new item:
1. Research using web search: problem, competitors, market landscape, technical constraints, reasons not to pursue.
2. Write `ideas/{notion_id}-research-brief.md`:

```
## Problem summary
## Market landscape
## Prior art + competitors
## Open questions
## Recommendation
```

3. Do not modify the parent idea file.

---

## STAGE 3: PRD

**Needs Revision:** Find idea files where `stage` is `PRD` and `status` is `Needs Revision`. For each, read the notes for feedback, rewrite `ideas/{notion_id}-prd.md` incorporating that feedback, set `status` → `Pending Review`. Do not change `stage` or other notes.

**New work** (process maximum 2 items total across both cases):

*Case A — Feature Request needs PRD written:* Find idea files where `stage` is `PRD`, `status` is `Pending Review`, and no `{notion_id}-prd.md` exists yet.

*Case B — Research has been approved:* Find idea files where `stage` is `Research` and `status` is `Approved`.

For each new item:
1. Read idea file, and `ideas/{notion_id}-research-brief.md` if it exists.
2. Write `ideas/{notion_id}-prd.md`:

```
## Problem
## Goal
## Users
## Requirements
**Must have** / **Should have** / **Nice to have**
## Out of scope
## Open questions
## Decision log
```

3. Update frontmatter: `stage` → `PRD`, `status` → `Pending Review`. Do not change `notes`.

---

## STAGE 4: DESIGN

**Needs Revision:** Find idea files where `stage` is `Design` and `status` is `Needs Revision`. For each, read the notes for feedback, rewrite `ideas/{notion_id}-design.md` incorporating that feedback, set `status` → `Pending Review`. Do not change `stage` or other notes.

**New work:** Find idea files where `stage` is `PRD` and `status` is `Approved`. Process maximum 2 items.

For each:
1. Read idea file, research brief, and PRD if they exist.
2. Write `ideas/{notion_id}-design.md`:

```
## Overview
## User flows
## Information architecture
## Interaction patterns
## Edge cases + empty states
## Open questions
```

3. Update frontmatter: `stage` → `Design`, `status` → `Pending Review`. Do not change `notes`.

---

## STAGE 5: TECH SPEC

**Needs Revision:** Find idea files where `stage` is `Tech Spec` and `status` is `Needs Revision`. For each, read the notes for feedback, rewrite `ideas/{notion_id}-tech-spec.md` incorporating that feedback, set `status` → `Pending Review`. Do not change `stage` or other notes.

**New work:** Find idea files where `stage` is `Design` and `status` is `Approved`. Process maximum 2 items.

For each:
1. Read all available context: idea file, research brief, PRD, design doc.
2. Write `ideas/{notion_id}-tech-spec.md`:

```
## Overview
## Architecture
## Stack + dependencies
## Data model
## Key implementation decisions
## Risks + unknowns
## Effort estimate
## Open questions
```

3. Update frontmatter: `stage` → `Tech Spec`, `status` → `Pending Review`. Do not change `notes`.

---

## COMPLETION

Print a summary of everything processed across all stages, and flag anything skipped or uncertain.
