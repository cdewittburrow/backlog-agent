# Backlog

**What it is:** Personal product development pipeline. Ideas captured in Notion flow through research, PRD, design, and tech spec stages via Claude agents. Human approval gates each transition.

**Repo:** `backlog-agent` (this repo)

## Architecture
- Notion — human interface (status + notes only)
- GitHub repo — canonical data store (markdown files with YAML frontmatter)
- GitHub Actions — hourly Notion→repo sync, event-driven repo→Notion sync
- Claude API (via `claude` CLI) — pipeline agent, triggers on every ideas/** push

## What's built
- 5-stage pipeline: Intake → Research → PRD → Design → Tech Spec
- Routing by type: New Product → Research, Feature Request → PRD, Bug Report → Tech Spec
- Needs Revision feedback loop
- Bidirectional Notion sync (properties + artifact sub-pages)
- App context files in `context/` for PRD writing

## Key constraints
- One Claude API call per pipeline run (all 5 stages in one prompt)
- Pipeline runs on push to `ideas/**` (primary) + daily 8AM MT cron (fallback)
- Cost: ~$0.10–0.50/run depending on how many research-stage items are active
- No per-stage cap (removed after initial backlog clear)
