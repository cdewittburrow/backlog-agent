# First Read

**What it is:** Personal daily news briefing app. Two editions per day — morning (midnight–3pm) and evening (3pm–midnight). Each edition is generated once, cached in localStorage, and locked until the next window. No engagement mechanics — read it, close it.

**Live:** https://pressbox.vercel.app (repo: `pressbox`)

## Stack
- Vanilla HTML + JS modules, no build step
- Vercel (hosting + serverless functions)
- Perigon API — AP News and Reuters only (150 req/month free tier, ~60 used)
- RSS feeds — 26 sources fetched in parallel server-side (no API key, no cost)
- Google Gemini (`gemini-2.5-flash`) — editor's note only, 1 call per edition

## What's built (v1)
- Morning/evening edition model with localStorage caching
- 26 RSS sources + AP/Reuters via Perigon
- Editor's note (Gemini) — 2–3 sentences orienting the reader + 3–4 flagged stories
- Flat story list: headline, lede, source pill, timestamp
- 3-depth story model: depth 1 = headline/lede, depth 2 = inline expand with full RSS body, depth 3 = open at publisher
- Client-side corroboration detection (word-set overlap, no API call)
- Edition caps: morning 50 national / 10 local; evening 10 national / 40 local
- 18 national sources (16 RSS + AP + Reuters), 12 Utah local sources
- Gemini failure is non-fatal — edition renders without editor's note

## Key constraints
- Gemini is the only AI call; it's non-fatal if it fails
- Client state is localStorage only — no database, no user accounts
- No multi-user, no auth
- Perigon free tier: 150 req/month (2 editions/day = ~60/month — tight on multiple devices)
- Gemini free tier: 20 RPD — can exhaust quickly across multiple devices

## Roadmap highlights
- PWA manifest (installable to home screen)
- Skeleton loading states
- Edition archive (needs Supabase)
- Story threading (evening edition tracks morning story developments)
- Source editability UI
- Daily digest email via Vercel cron + Resend
