---
type: spec
title: Roadmap
status: living-document
updated: 2026-01-31
context_for_agents: >
  Phased delivery plan. Phase 0 (foundation) is complete. Phase 1
  (overview copilot + job engine restart) is in progress. Phase 2
  (full pipeline + proposals) and Phase 3 (autonomy + learning) are
  planned. Do not build features from later phases unless explicitly
  requested.
tags: [roadmap, planning]
---

# Roadmap

Phased delivery plan. Each phase builds on the previous one. Phases are not time-boxed - they're scope-boxed.

## Phase 0: Foundation (Complete)

Everything needed to onboard a freelancer and understand their profile.

- [x] Supabase database schema (all tables, RLS, stored procedures)
- [x] Authentication (JWT via Supabase Auth)
- [x] Team/profile bootstrap flow
- [x] Onboarding chatbot (conversational AI profile collection)
- [x] LinkedIn profile scraping (trigger.dev + BrightData)
- [x] Profile completeness scoring
- [x] Profile analysis with extended reasoning
- [x] Interview prep (real-time voice practice, 4 types, post-session analysis)
- [x] Landing page with value proposition
- [x] UI component library (shadcn/ui, glass morphism, dark mode)
- [x] Redux state management for onboarding
- [x] Settings and preferences UI

**Outcome:** A freelancer can sign up, build a rich profile in 15 minutes, understand their competitive positioning, and practice interviews.

## Phase 1: Intelligence Layer (In Progress)

The overview copilot and job engine form the core product loop.

### 1a. Overview Copilot
- [ ] Daily briefing generation from real data
- [ ] Action item list with deep links
- [ ] Agent activity feed
- [ ] Profile improvement suggestions
- [ ] Context injection architecture (reusable across agents)

### 1b. Job Engine Restart
- [ ] Upwork fetcher (BrightData dataset integration)
- [ ] LinkedIn fetcher
- [ ] Job normalizer + deduplication
- [ ] Batch ingestion pipeline (trigger.dev scheduled)
- [ ] Ranking agent (score jobs against profile)
- [ ] Job feed UI in overview

### 1c. Infrastructure
- [ ] Agent orchestration (event-driven chaining)
- [ ] Usage tracking + rate limiting per plan tier
- [ ] Notification system (in-app + email)

**Outcome:** The freelancer opens `/overview` and sees prioritized, scored job matches with clear next actions. The system runs autonomously in the background.

## Phase 2: Full Pipeline

End-to-end from discovery to application.

### 2a. Proposals
- [ ] Cover letter agent (style presets, voice learning)
- [ ] Proposal review UI
- [ ] Apply session flow (token-gated submission)
- [ ] Platform-specific formatting (Upwork character limits, LinkedIn norms)

### 2b. Pipeline Tracking
- [ ] Application pipeline UI (kanban or list view)
- [ ] Status transitions with validation
- [ ] Follow-up automation (overview copilot nudges)
- [ ] Message tracking (manual entry, future: email integration)

### 2c. Enrichment
- [ ] CV parsing with GPT-4o vision
- [ ] Portfolio URL scraping
- [ ] Upwork profile import
- [ ] Periodic LinkedIn refresh

**Outcome:** The freelancer has a complete workflow: discover -> evaluate -> apply -> track. The system drafts proposals and manages follow-ups.

## Phase 3: Autonomy + Learning

The system gets smarter and more autonomous over time.

### 3a. Learning Loop
- [ ] Track user actions on ranked jobs (shortlist, skip, apply, win, lose)
- [ ] Adjust ranking weights per user based on outcomes
- [ ] Voice learning from accepted proposals
- [ ] Skill inference from project descriptions

### 3b. Expanded Sources
- [ ] RSS feed monitoring
- [ ] Email ingestion (forwarded job alerts)
- [ ] Slack/Discord channel monitoring
- [ ] Direct referral tracking

### 3c. Advanced Autonomy
- [ ] Auto-pilot mode: low-risk actions without approval
- [ ] Cross-agent orchestration with priority queue
- [ ] Agent memory via embeddings (cross-run context)
- [ ] Weekly/monthly reports with PDF export

### 3d. Team Features
- [ ] Multi-seat accounts
- [ ] Team pipeline (shared applications, assignments)
- [ ] Team analytics (aggregate performance)
- [ ] Role-based access (leader vs. member permissions)

**Outcome:** The system operates as a true AI business development partner - learning from every interaction, acting autonomously where safe, and continuously improving match quality.

## Phase 4: Platform (Speculative)

Beyond individual freelancers.

- [ ] Marketplace (clients post directly, matched to freelancers)
- [ ] Reputation system (verified wins, client reviews)
- [ ] Financial tools (invoicing, tax prep, earnings forecasting)
- [ ] Community features (freelancer network, referrals, subcontracting)
- [ ] API for third-party integrations

**Outcome:** hireMePlz becomes the operating system for freelance careers.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01 | Suspend job scraping to focus on onboarding | Onboarding quality determines retention. Job engine is useless without good profiles. |
| 2026-01 | Single-user architecture first | Simpler to build, test, and iterate. Team features can layer on top. |
| 2026-01 | OpenAI Agents SDK over LangChain | Better structured outputs, native tool calling, less abstraction overhead. |
| 2026-01 | trigger.dev over custom queue | Managed infrastructure, retry logic, observability out of the box. |
| 2026-01 | Supabase over raw Postgres | Auth, RLS, real-time, storage in one platform. Reduces ops burden. |
