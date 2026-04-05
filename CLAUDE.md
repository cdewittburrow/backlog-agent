# Backlog Agent

This repo is used exclusively for Claude Code cloud scheduled tasks.

## Session bootstrap (MANDATORY — run before anything else)

The Notion MCP server connects asynchronously and its tools may not appear in the deferred list immediately. You MUST retry.

Follow this exact sequence:

1. Run `bash -c "sleep 5"` to give the MCP server time to connect
2. Run ToolSearch: `select:mcp__Notion__notion-search,mcp__Notion__notion-fetch,mcp__Notion__notion-update-page,mcp__Notion__notion-create-comment`
3. If that returns nothing, wait again: `bash -c "sleep 5"` then retry ToolSearch
4. Repeat up to 3 times total before concluding unavailable
5. If after 3 attempts you still have nothing, run a broader ToolSearch for `"notion"` as a final fallback

Once you have the tool schemas, proceed with the task immediately. Do not ask for confirmation.

## Context

- Target database: Backlog POC — https://www.notion.so/bc4cbb322c704dc78a37959f65fc163a
- Notion is already authenticated via the MCP connector — if the tools load, you have access
- Do not suggest setup steps. Do not ask for user input. Do not stall.

