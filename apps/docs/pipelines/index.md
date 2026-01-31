---
type: spec
title: Data Pipelines
status: in-progress
updated: 2026-01-31
context_for_agents: >
  Three core pipelines: job-ingestion (source -> normalize -> dedupe -> store),
  profile-enrichment (LinkedIn/CV/manual -> unified profile), and
  application-lifecycle (shortlist -> apply -> track -> close). Pipelines
  run as trigger.dev tasks or inline in API routes. All pipeline executions
  are tracked in agent_runs.
tags: [pipelines, data, core]
---

# Data Pipelines

Pipelines are the data backbone connecting agents, external sources, and the database. Each pipeline is a directed flow with well-defined inputs, transformations, and outputs.

## Design Principles

1. **Idempotent** - Running a pipeline twice with the same input produces the same result. Dedup via canonical hashes, upserts over inserts.
2. **Observable** - Every pipeline run creates an `agent_runs` record. Steps are tracked in `agent_run_steps`.
3. **Resumable** - Long-running pipelines (scraping) can be interrupted and resumed. State is checkpointed.
4. **Batched** - Prefer batch operations (upsert_jobs_and_rankings) over row-by-row writes.

## Pipeline Overview

```
External Sources          Pipelines              Agents              User
─────────────────     ─────────────────     ──────────────     ──────────────
Upwork API        -->  Job Ingestion    -->  Ranking Agent -->  /overview
LinkedIn API      -->                                          (action cards)
                                                                    |
LinkedIn Profile  -->  Profile          -->  Onboarding    -->  Profile
CV Upload         -->  Enrichment           Agent               completeness
Manual Entry      -->                                               |
                                                                    v
                       Application      <-- Cover Letter   <--  User reviews
                       Lifecycle            Agent               & approves
                            |
                            v
                       Pipeline tracking (shortlisted -> won/lost)
```

## Pipelines

- [[job-ingestion]] - Source monitoring, normalization, deduplication
- [[profile-enrichment]] - Multi-source profile data unification
- [[application-lifecycle]] - CRM-style application tracking
