# Backlog

A personal product development pipeline. Ideas captured in Notion flow through research, PRD, design, and tech spec stages via Claude agents. Human approval gates each transition. Cost: ~$2–5/month in Claude API usage.

---

## What it does

You drop raw ideas into a Notion database. The system classifies them, researches the ones worth exploring, and progressively builds out artifacts (research brief → PRD → design doc → tech spec) — one stage at a time, with your approval between each step.

You only ever change two things in Notion: the **Status** of an item, and the **Notes** field when you have feedback.

---

## Architecture

```
Notion (human interface)
    ↕ GitHub Actions (hourly poll)
GitHub repo (canonical data store)
    ↓ GitHub Actions (push trigger → Claude API)
Claude agent (reads repo, writes artifacts, pushes back)
    ↓ GitHub Actions (push trigger)
Notion (artifacts appear as sub-pages)
```

**Why GitHub as the data store, not Notion directly:**
The Notion MCP connector works in interactive Claude sessions but has known bugs in scheduled/automated tasks ([#35899](https://github.com/anthropics/claude-code/issues/35899), [#43397](https://github.com/anthropics/claude-code/issues/43397)). GitHub is reliable, version-controlled, and free. Notion stays as the human-facing UI via a bidirectional sync layer.

**Sync layer (GitHub Actions):**
- `notion-to-repo.yml` — polls Notion hourly, writes/updates idea files. Only syncs Chase-owned fields (name, status, notes) to avoid overwriting agent work. Commits tagged `[notion-sync]`.
- `repo-to-notion.yml` — triggers on push to `ideas/**`, syncs properties and artifact sub-pages back to Notion. Skips `[notion-sync]` commits to prevent loops. Supports `workflow_dispatch` for full re-sync of all files.
- `pipeline.yml` — triggers on push to `ideas/**` (skips `[pipeline]` commits to prevent loops) and hourly at :17 as a fallback. Installs Claude Code CLI, runs `prompts/daily.md`, commits results tagged `[pipeline]`.

**Agent runtime:**
GitHub Actions installs the Claude Code CLI and runs `prompts/daily.md` against the repo on every Notion sync push. The pipeline commits trigger `repo-to-notion.yml`, which surfaces results in Notion within minutes. Worst-case lag from status change to Notion update: ~1 hour.

**Required secrets:**
- `ANTHROPIC_API_KEY` — Claude API key for the pipeline
- `NOTION_TOKEN` — Notion integration token
- `NOTION_DATABASE_ID` — Notion database ID
- `GH_PAT` — Personal access token with `repo` scope; required so pipeline commits trigger downstream workflows (GitHub Actions blocks workflow-to-workflow triggers on the default `GITHUB_TOKEN`)

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

**Throughput:** No per-stage cap. All eligible items across all stages are processed in a single run.

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
  repo-to-notion.yml     # On push: repo → Notion sync (+ manual full-sync mode)
  pipeline.yml           # On push to ideas/**: run Claude pipeline via API
ideas/
  {uuid}.md              # One file per idea (YAML frontmatter + optional body)
  {uuid}-research-brief.md
  {uuid}-prd.md
  {uuid}-design.md
  {uuid}-tech-spec.md
prompts/
  daily.md               # Combined pipeline prompt (all 5 stages)
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

**Migrated from Claude Pro scheduled task to Claude API via GitHub Actions**
The once-daily scheduled task cap made the pipeline feel slow and wasted the slot on a low-cost workload. GitHub Actions triggers the pipeline on every Notion sync push (hourly cadence), uses the Claude API directly via the `claude` CLI, and frees the scheduled task slot for a higher-value use case. Cost is ~$2–5/month at typical usage.

**GH_PAT required for push-triggered downstream workflows**
GitHub Actions deliberately blocks workflows triggered by the default `GITHUB_TOKEN` from firing other workflows — a loop-prevention measure. The pipeline uses a PAT for its push so that `repo-to-notion.yml` fires correctly on pipeline commits.

**No per-stage item cap**
An early cap of 2 items per stage per run was added to control cost during initial development. Removed once the system was stable — most items are Feature Requests that skip the expensive Research stage, so runs are cheap regardless of queue depth.

**repo-to-notion.yml supports manual full-sync via workflow_dispatch**
Added after the initial migration left artifacts in the repo that Notion had never seen (the PAT wasn't in place when those commits landed). Running the workflow manually with `workflow_dispatch` syncs all idea files rather than just the latest diff.

**Stage owned by agent, status owned by human**
Early designs required the human to advance both status and stage to move an idea forward. This was confusing. The current design: the agent advances `stage` automatically after writing each artifact; the human only sets `status`. The human never needs to know what stage an idea is in to operate the system.

**Artifact files over Notion sub-pages as source of truth**
Artifacts (PRDs, design docs, etc.) live in the repo as markdown files. Notion sub-pages are a read-only view generated by `repo-to-notion.js`. This means the agent always has file-based context without any API calls, and the full artifact history is in git.

**Notes field is append-only from the agent side**
The agent appends classification notes at Intake but never overwrites the notes field after that. This preserves the human's feedback and raw thinking. The agent reads notes for context when revising artifacts under `Needs Revision`.

---

## Roadmap

**Near term**
- [ ] Validate the `Needs Revision` feedback loop end-to-end
- [ ] Add app READMEs to `context/` folder so the agent has current implementation details when writing PRDs for Feature Requests

**Medium term**
- [ ] Acceptance criteria agent — translates approved PRDs into "this works when..." statements; sits between Tech Spec and development as a coding checklist
- [ ] Test plan agent — generates a human-readable manual QA checklist from acceptance criteria; run through it before shipping each feature
- [ ] Security review agent — flags auth, data handling, input validation, and third-party risks in the tech spec before build starts
- [ ] Research agent: add confidence score to recommendation (Pursue / Uncertain / Pass)

**Longer term**
- [ ] Release notes agent — turns git commits + PRD goal into user-facing changelog copy
- [ ] Retro agent — post-ship review of whether the feature solved the problem stated in the PRD
- [ ] Auto-approve Research stage for obvious Feature Requests (skip the gate)
- [ ] Slack/iMessage notification when items land in Review Queue
- [ ] Multi-user support (other people can submit ideas via a form)
