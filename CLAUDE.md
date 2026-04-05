# Backlog Agent

This repo is used exclusively for Claude Code cloud scheduled tasks.

## Session bootstrap (MANDATORY — run before anything else)

The Notion MCP server connects asynchronously. Its tools are deferred and will NOT appear in the system-reminder immediately — they load in the background after session start. You must wait and retry.

Follow this exact sequence at session start:

1. `bash -c "sleep 10"` — wait for MCP server to connect
2. ToolSearch: `select:mcp__Notion__notion-search,mcp__Notion__notion-fetch,mcp__Notion__notion-update-page,mcp__Notion__notion-create-comment`
3. If nothing returned: `bash -c "sleep 10"` then retry ToolSearch
4. Repeat up to 5 times total (50 seconds max wait)
5. Final fallback: ToolSearch for `"notion"` to catch any namespace variation

Critical: do NOT conclude the tools are unavailable until all 5 retries are exhausted. The tools will appear — the server just needs time. If you report failure and then receive any follow-up message, immediately retry ToolSearch at the top of your response before doing anything else.

Once you have the tool schemas, proceed immediately. No confirmation needed.

## Context

- Target database: Backlog POC — https://www.notion.so/bc4cbb322c704dc78a37959f65fc163a
- Notion is authenticated via MCP connector — if tools load, you have full access
- Do not suggest setup steps. Do not ask for user input. Do not stall.

