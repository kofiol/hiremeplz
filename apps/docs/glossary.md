---
type: reference
title: Glossary
status: living-document
updated: 2026-01-31
context_for_agents: >
  Key terminology used across the hireMePlz system. Reference this
  when interpreting user requests or generating agent outputs.
tags: [reference, glossary]
---

# Glossary

Terms used across the hireMePlz system. Alphabetical.

| Term | Definition |
|------|-----------|
| **Agent run** | A single execution of an AI agent. Tracked in `agent_runs` with status, inputs, outputs, and timing. |
| **Agent type** | One of: `job_search`, `cover_letter`, `dashboard_copilot`, `upwork_profile_optimizer`, `interview_prep`, `profile_parser`, `email_ingest`. |
| **Apply session** | A token-gated flow for submitting a proposal. Links a job, cover letter, and user. Expires after N hours. |
| **Canonical hash** | SHA256(platform + platform_job_id + team_id). Unique identifier for deduplicating jobs per team. |
| **Completeness score** | 0-1 numeric measuring how much profile data the user has provided. Computed server-side. 80% threshold gates access to `/overview`. |
| **Context injection** | The practice of loading relevant user data (profile, preferences, history) into an agent's prompt at invocation time. |
| **Cover letter** | A generated proposal for a specific job. Stored with style preset, temperature, and vocabulary level. |
| **Distilled profile** | The structured output of LinkedIn scraping. Contains identity, skills, experiences, education, and inferred experience level. |
| **Extended reasoning** | OpenAI's chain-of-thought streaming feature. Used in profile analysis and complex scoring. Visible to users in a collapsible panel. |
| **Human-in-the-loop** | Design pattern where agents draft but humans approve irreversible actions (sending proposals, accepting contracts). |
| **Job ranking** | AI-generated score (0-100) with per-dimension breakdown for how well a job matches a user's profile. |
| **Normalized job** | A job posting mapped from platform-specific format to the unified `jobs` table schema. |
| **Pipeline** | A directed data flow: job-ingestion, profile-enrichment, or application-lifecycle. |
| **Platform** | A job source. Currently: `upwork`, `linkedin`. Future: RSS, email, custom. |
| **Quick replies** | Context-aware suggestion chips in the onboarding chatbot that speed up common responses. |
| **Run status** | `queued` -> `running` -> `succeeded` \| `failed` \| `canceled`. |
| **Structured output** | Agent responses conforming to Zod schemas. Ensures type safety and reliable downstream processing. |
| **Team** | The top-level data tenant. Currently 1:1 with users. All records are team-scoped with RLS. |
| **Tightness** | 1-5 integer controlling filter strictness. 1 = broad (show everything), 5 = strict (near-perfect matches only). Affects query construction and score thresholds. |
| **trigger.dev** | Background job framework. Used for long-running tasks (scraping, batch scoring) that can't run in API request lifecycles. |
