---
type: spec
title: Ranking Agent
status: planned
updated: 2026-01-31
context_for_agents: >
  Planned agent that scores jobs against a freelancer's profile. Produces
  a 0-100 score with per-dimension breakdown stored in job_rankings.
  Tightness (1-5) controls the score threshold for surfacing jobs.
  Will use structured outputs with Zod schema. Designed to run in batch
  after job ingestion and on-demand when profile changes.
tags: [agents, ranking, planned]
---

# Ranking Agent

Scores ingested jobs against the freelancer's profile to produce a prioritized feed. The core matching intelligence of the system.

## Purpose

Given a set of unranked jobs and a freelancer profile, produce:
1. A **match score** (0-100) for each job
2. A **breakdown** explaining why (per-dimension scores)
3. A **filtered set** based on the user's tightness preference

## Scoring Dimensions

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Skill match | 30% | Overlap between job requirements and user skills (weighted by proficiency) |
| Budget fit | 25% | How job budget aligns with user's rate expectations |
| Client quality | 15% | Client rating, hire history, payment verification |
| Scope fit | 15% | Project type/duration vs. user preferences |
| Win probability | 15% | Competition level, posting age, client responsiveness signals |

### Skill Match (0-100)

```
For each required skill in job:
  If user has skill:
    score += (user_proficiency / 5) * (1 / total_required_skills) * 100
  If user has related skill (semantic similarity > 0.8):
    score += 0.5 * (user_proficiency / 5) * (1 / total_required_skills) * 100
```

**Future enhancement:** Use embeddings from [[data-model#embeddings]] for semantic skill matching (e.g., "React" matches "React.js", "Frontend Development").

### Budget Fit (0-100)

```
If job is hourly:
  If job_max >= user_hourly_min: score = 100
  If job_max >= user_hourly_min * 0.8: score = 70 (slightly below target)
  If job_max < user_hourly_min * 0.6: score = 0 (too low)

If job is fixed:
  implied_hourly = fixed_budget / estimated_hours
  Score same as hourly against implied rate
```

### Client Quality (0-100)

```
rating_score = (client_rating / 5) * 40
hire_score = min(client_hires / 20, 1) * 30
payment_score = client_payment_verified ? 30 : 0
total = rating_score + hire_score + payment_score
```

### Win Probability (0-100)

Heuristic based on:
- **Posting age:** Jobs < 2h old score highest (less competition)
- **Proposal count:** If available, fewer proposals = higher score
- **Client response rate:** If available from platform data
- **Specificity:** Highly specific requirements that match user's niche = higher win rate

## Tightness Thresholds

| Tightness | Min score to surface | Behavior |
|-----------|---------------------|----------|
| 1 | 20 | Show almost everything, let user browse |
| 2 | 35 | Filter obvious mismatches |
| 3 | 50 | Balanced (default) - show likely fits |
| 4 | 65 | Only show strong matches |
| 5 | 80 | Only near-perfect matches |

## Execution Modes

### Batch (post-ingestion)
Triggered by [[job-search-agent]] after new jobs are ingested. Scores all unranked jobs in a single batch.

```typescript
{
  agent_type: "job_search",  // Reuses job_search agent_type for now
  trigger: "job_ingestion_complete",
  inputs: {
    job_ids: string[],
    profile_snapshot: AgentContext
  },
  outputs: {
    ranked: number,
    above_threshold: number,
    avg_score: number
  }
}
```

### On-demand (profile change)
When the user updates their profile (new skills, rate change), re-rank existing jobs.

### Real-time (single job)
When viewing a specific job, compute a detailed breakdown on demand.

## Output Schema

```typescript
interface JobRanking {
  jobId: string
  score: number  // 0-100
  breakdown: {
    skillMatch: { score: number; matched: string[]; missing: string[] }
    budgetFit: { score: number; assessment: string }
    clientQuality: { score: number; flags: string[] }
    scopeFit: { score: number; assessment: string }
    winProbability: { score: number; factors: string[] }
  }
  recommendation: "strong_match" | "good_match" | "possible" | "skip"
  reasoning: string  // One-sentence explanation
}
```

## Learning Loop (Future)

Track user actions on ranked jobs to improve scoring over time:

| Signal | Meaning | Impact |
|--------|---------|--------|
| User shortlists | Positive | Boost similar job profiles |
| User applies | Strong positive | Reinforce all dimensions |
| User wins | Strongest signal | Weight this profile heavily |
| User skips | Weak negative | Slight penalty to similar jobs |
| User archives | Moderate negative | Reduce similar job scores |

Implementation: Store outcome signals in `applications.status`, correlate with `job_rankings.breakdown`, adjust dimension weights per user.
