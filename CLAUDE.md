# Backlog Agent

This repo is used exclusively for Claude Code cloud scheduled tasks.

## Session bootstrap (MANDATORY — run before anything else)

The Notion MCP tools are deferred and must be explicitly loaded. Do this first:

1. Run ToolSearch with `select:mcp__Notion__notion-search,mcp__Notion__notion-fetch,mcp__Notion__notion-update-page,mcp__Notion__notion-create-comment`
2. If that returns nothing, run a broader fallback: ToolSearch for `"notion"` to enumerate whatever Notion tools are available under any namespace
3. Once schemas are loaded, proceed with the task immediately — no confirmation needed

Note: The Notion MCP connector is already authenticated. If ToolSearch returns schemas, you have access — use them.

## Context

- Target database: Backlog POC — https://www.notion.so/bc4cbb322c704dc78a37959f65fc163a
- Do not ask for user input. Do not stall. Do not suggest setup steps.

