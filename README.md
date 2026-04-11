# Backlog

A personal product development pipeline. Ideas captured in Notion flow through research, PRD, design, and tech spec stages via Claude agents. Human approval gates each transition. Cost: $0 beyond Claude Pro.

---

## What it does

You drop raw ideas into a Notion database. The system classifies them, researches the ones worth exploring, and progressively builds out artifacts (research brief → PRD → design doc → tech spec) — one stage at a time, with your approval between each step.

You only ever change two things in Notion: the **Status** of an item, and the **Notes** field when you have feedback.

---

## Architecture

```
Notion (human interface)
    ↕ GitHub Actions (hourly poll + push trigger)
GitHub repo (canonical data store)
    ↓ Claude Code scheduled task (daily, 7AM UTC)
Claude agent (reads repo, writes artifacts, pushes back)
    ↓ GitHub Actions (push trigger)
Notion (artifacts appear as sub-pages)
```

**Why GitHub as the data store, not Notion directly:**
The Notion MCP connector works in interactive Claude sessions but has known bugs in scheduled/automated tasks ([#35899](https://github.com/anthropics/claude-code/issues/35899), [#43397](https://github.com/anthropics/claude-code/issues/43397)). GitHub is reliable, version-controlled, and free. Notion stays as the human-facing UI via a bidirectional sync layer.

**Sync layer (GitHub Actions):**
- `notion-to-repo.yml` — polls Notion hourly, writes/updates idea files. Only syncs Chase-owned fields (name, status, notes) to avoid overwriting agent work.
- `repo-to-notion.yml` — triggers on push to `ideas/**`, syncs properties and artifact sub-pages back to Notion. Skips commits tagged `[notion-sync]` to prevent loops.

**Agent runtime:**
Claude Code cloud scheduled task pulls the repo, runs `prompts/daily.md`, commits any new files, and pushes. The repo-to-notion workflow fires on that push and surfaces the results in Notion within minutes.

---

## Idea file format

```yaml
---
notion_id: <uuid>          # Notion page ID — stable across renames
name: <idea title>
type: New Product | Feature Request | Bug Report
app: Plot Tracker | Just Pick Already | First Read | Backlog | Other | null
stage: Intake | Research | PRD | Design | Tech Spec
status: Pending Review | Needs Revision | Approved | Below the Line | Archived
notes: <text>              # Chase writes here; agent appends classification notes
created: <timestamp>
---
```

Artifact files live alongside idea files: `ideas/{notion_id}-{research-brief|prd|design|tech-spec}.md`

---

## Pipeline stages

| Stage | Trigger | Agent action | Sets |
|---|---|---|---|
| **Intake** | `stage=Intake, status=Pending Review` | Classify type/app, advance stage | `stage`, `type`, `app` |
| **Research** | `stage=Research, status=Pending Review` | Web search, write research brief | nothing (brief is new file) |
| **PRD** | `stage=PRD, status=Pending Review` (no PRD yet) | Write PRD | `stage=PRD, status=Pending Review` |
| **PRD** | `stage=Research, status=Approved` | Write PRD from research brief | `stage=PRD, status=Pending Review` |
| **Design** | `stage=PRD, status=Approved` | Write design doc | `stage=Design, status=Pending Review` |
| **Tech Spec** | `stage=Design, status=Approved` | Write tech spec | `stage=Tech Spec, status=Pending Review` |

**Feedback loop:** Set status → `Needs Revision` and update Notes. The next run rewrites that stage's artifact using your feedback and resets status to `Pending Review`.

**Routing by type:**
- `New Product` → Research (needs market validation before PRD)
- `Feature Request` → PRD directly (scope is known)
- `Bug Report` → Tech Spec directly (no product work needed)

---

## Human controls

You only ever touch **Status** and **Notes** in Notion.

| Your action | What happens next |
|---|---|
| Status → `Approved` | Agent advances to next stage on next run |
| Status → `Needs Revision` + update Notes | Agent rewrites current artifact with your feedback |
| Status → `Below the Line` | Idea is deprioritized (stays visible, nothing runs) |
| Status → `Archived` | Idea is removed from active views |

The agent owns `stage`, `type`, and `app`. Never change these manually — the sync will overwrite Notion with whatever the repo says.

---

## Repository layout

```
.github/workflows/
  notion-to-repo.yml     # Hourly: Notion → repo sync
  repo-to-notion.yml     # On push: repo → Notion sync
ideas/
  {uuid}.md              # One file per idea (YAML frontmatter + optional body)
  {uuid}-research-brief.md
  {uuid}-prd.md
  {uuid}-design.md
  {uuid}-tech-spec.md
prompts/
  daily.md               # Combined pipeline prompt (all 5 stages, runs on schedule)
  intake.md              # Individual stage prompts (available for manual runs)
  research.md
  prd.md
  design.md
  tech-spec.md
scripts/
  notion-to-repo.js      # Notion API → markdown files
  repo-to-notion.js      # Markdown files → Notion properties + sub-pages
  package.json
```

---

## Decision log

**$0 cost target beyond Claude Pro ($20/month)**
The entire runtime runs on the Claude Pro cloud scheduled task feature. No separate API key, no compute costs. GitHub Actions free tier handles all sync.

**One daily scheduled task, not per-stage tasks**
Claude Pro allows 1 daily cloud scheduled session. All 5 pipeline stages run sequentially in a single prompt (`prompts/daily.md`) with a cap of 2 items per stage per run. Individual stage prompts exist in `prompts/` for manual interactive runs.

**Stage owned by agent, status owned by human**
Early designs required the human to advance both status and stage to move an idea forward. This was confusing. The current design: the agent advances `stage` automatically after writing each artifact; the human only sets `status`. The human never needs to know what stage an idea is in to operate the system.

**Artifact files over Notion sub-pages as source of truth**
Artifacts (PRDs, design docs, etc.) live in the repo as markdown files. Notion sub-pages are a read-only view generated by `repo-to-notion.js`. This means the agent always has file-based context without any API calls, and the full artifact history is in git.

**Notes field is append-only from the agent side**
The agent appends classification notes at Intake but never overwrites the notes field after that. This preserves the human's feedback and raw thinking. The agent reads notes for context when revising artifacts under `Needs Revision`.

---

## Roadmap

**Near term**
- [ ] Tech Spec stage has never run — need first approved Design doc
- [ ] Validate the `Needs Revision` feedback loop end-to-end
- [ ] First Read features currently in Design stage: RSS schema normalization, story dismiss, image support

**Medium term**
- [ ] Migrate to Claude API for faster, event-driven runs (no daily cap, trigger on Notion change)
- [ ] Per-stage independent agents instead of one combined prompt
- [ ] Research agent: add confidence score to recommendation (Pursue / Uncertain / Pass)

**Longer term**
- [ ] Auto-approve Research stage for obvious Feature Requests (skip the gate)
- [ ] Slack/iMessage notification when items land in Review Queue
- [ ] Multi-user support (other people can submit ideas via a form)

