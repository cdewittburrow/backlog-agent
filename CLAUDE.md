# Backlog Agent

This repo is used exclusively for Claude Code cloud scheduled tasks.

## Session bootstrap (run at the start of every session, before anything else)

1. Run ToolSearch for Notion tools to load their schemas:
   - Search for `mcp__claude_ai_Notion__notion-search`
   - Search for `mcp__claude_ai_Notion__notion-fetch`
   - Search for `mcp__claude_ai_Notion__notion-update-page`
   - Search for `mcp__claude_ai_Notion__notion-create-comment`
   These are deferred tools — they will not be available until you explicitly fetch their schemas via ToolSearch.

2. Do not ask for confirmation. Do not wait for user input. Proceed immediately with the task.

## Context

- Target database: Backlog POC — https://www.notion.so/bc4cbb322c704dc78a37959f65fc163a
- Notion access is provided via the Notion MCP connector (already authenticated)
- If ToolSearch returns schemas for the above tools, you have Notion access — use it

