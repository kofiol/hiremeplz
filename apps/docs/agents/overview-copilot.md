---
type: spec
title: Overview Copilot
status: in-progress
updated: 2026-01-31
context_for_agents: >
  The overview copilot is the main dashboard intelligence layer. It
  synthesizes data from all other agents and the user's pipeline to
  produce daily briefings, action items, and proactive nudges. Currently
  in active development. Route: /overview. Agent type: dashboard_copilot.
  This is the highest-priority agent in development.
tags: [agents, overview, in-progress, priority]
---

# Overview Copilot

The brain of the `/overview` dashboard. Synthesizes data from all agents and the user's pipeline into actionable intelligence.

## Purpose

When the freelancer opens hireMePlz, they should immediately see:
1. **What happened** since their last visit (new matches, application updates, agent activity)
2. **What to do now** (prioritized action list)
3. **What's coming** (follow-up reminders, expiring opportunities)

This replaces the typical "dashboard of charts" with an **agent-driven briefing**.

## Daily Briefing

Generated proactively (before the user opens the app) and refined on-demand:

```typescript
interface DailyBriefing {
  greeting: string                    // Time-aware, personalized
  pipelineSnapshot: {
    activeApplications: number
    newMatchesToday: number
    pendingFollowUps: number
    interviewsScheduled: number
  }
  topActions: Array<{
    priority: "urgent" | "high" | "medium" | "low"
    type: "apply" | "follow_up" | "review_match" | "update_profile" | "practice"
    title: string
    description: string
    actionUrl: string
    deadline?: Date
  }>
  insights: Array<{
    type: "trend" | "tip" | "warning" | "milestone"
    content: string
  }>
  agentActivity: Array<{
    agentType: string
    summary: string
    timestamp: Date
  }>
}
```

## Action Types

### Apply
New high-score matches that should be acted on quickly. Includes draft proposal link.

### Follow Up
Applications in `in_conversation` or `interviewing` status with no activity for N days. The copilot nudges the user to check in.

### Review Match
New jobs scored above threshold but not yet shortlisted. The copilot summarizes why they matched.

### Update Profile
Profile improvements the copilot identifies:
- "You haven't added any education - clients in your niche value degrees"
- "Your rate range is below market for your experience level"
- "Adding [specific skill] would match 30% more jobs in your feed"

### Practice
Suggest interview practice when:
- A high-value interview is upcoming
- The user hasn't practiced in N days
- A specific interview type (e.g., rate negotiation) scores low historically

## Proactive Nudges

The copilot doesn't wait for the user to ask. It observes and acts:

| Trigger | Nudge |
|---------|-------|
| New job scores > 80 | "Strong match found: [title]. Want to see the draft?" |
| Application stale > 5 days | "No response on [project] yet. Follow up?" |
| Win streak (3+ accepted) | "You're on a roll. Consider raising your rate by 10%." |
| Dry spell (no new matches in 48h) | "Try broadening your search: lower tightness or add skills." |
| Profile incomplete | "Adding [X] would improve your match rate by ~Y%." |
| Interview session available | "You have a call for [project] tomorrow. Practice?" |

## Context Injection

The copilot receives the richest context of any agent:

```typescript
{
  ...baseAgentContext,
  recentAgentRuns: AgentRun[],        // Last 24h of agent activity
  pipelineState: {
    applications: Application[],       // All active applications
    topMatches: JobRanking[],          // Top 10 unacted matches
    recentJobs: Job[],                 // Jobs ingested in last 24h
  },
  interviewHistory: InterviewSession[], // Recent practice sessions
  earnings: EarningsSummary,           // If available
  lastLogin: Date,
  notificationHistory: Notification[]
}
```

## Implementation Plan

### Phase 1 (Current)
- Static dashboard cards with placeholder data
- Profile completeness gate (redirect to onboarding if < 80%)

### Phase 2 (Next)
- Daily briefing generation from real pipeline data
- Action item list with deep links
- Agent activity feed

### Phase 3
- Proactive nudges via notifications
- Trend analysis (earnings over time, match rate trends)
- Natural language interaction ("Show me matches for React projects this week")

### Phase 4
- Cross-agent orchestration from the copilot
- "Auto-pilot" mode: copilot chains agents without user input for low-risk actions
- Weekly/monthly reports with PDF export

## UI Structure

```
/overview
  ├── Greeting + briefing summary
  ├── Action cards (prioritized, clickable)
  ├── Pipeline snapshot (counts + mini charts)
  ├── Recent agent activity feed
  ├── [Future] Conversational interface
  └── [Future] Insights panel
```
