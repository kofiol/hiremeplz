---
type: spec
title: Interview Prep Agent
status: implemented
updated: 2026-01-31
context_for_agents: >
  Real-time voice interview practice using OpenAI Realtime API. Four
  interview types: client_discovery, technical, rate_negotiation,
  behavioral. AI interviewer adapts to user profile. Post-session
  analysis scores communication, confidence, content quality, and
  responsiveness. Results stored in interview_sessions table.
tags: [agents, interview, implemented]
---

# Interview Prep Agent

Real-time voice-based mock interview practice. The AI plays the role of a potential client or interviewer, adapts questions to the freelancer's profile, and provides detailed post-session analysis.

## Purpose

Help freelancers practice high-stakes conversations:
- Client discovery calls (understanding project requirements)
- Technical interviews (demonstrating expertise)
- Rate negotiations (defending pricing)
- Behavioral interviews (soft skills, cultural fit)

## Architecture

```
Browser (WebRTC)
  |
  v
OpenAI Realtime API (voice-to-voice)
  |
  v
Interview Agent (system prompt + profile context)
  |
  v
[Session ends]
  |
  v
Analysis Agent (gpt-4o, extended reasoning)
  |
  v
interview_sessions table (transcript, metrics, analysis)
```

## Interview Types

### client_discovery
**Scenario:** A potential client is evaluating freelancers for a project.
**Focus:** Asking the right questions, understanding scope, identifying red flags.
**AI role:** A startup founder or project manager describing a vague project.

### technical
**Scenario:** A technical lead is assessing the freelancer's skills.
**Focus:** Technical accuracy, problem-solving approach, communication of complex ideas.
**AI role:** Senior engineer or CTO asking about the freelancer's tech stack.

### rate_negotiation
**Scenario:** A client pushes back on the freelancer's proposed rate.
**Focus:** Confidence, value articulation, negotiation tactics.
**AI role:** Budget-conscious client trying to negotiate down.

### behavioral
**Scenario:** Cultural fit assessment for a long-term engagement.
**Focus:** Communication style, reliability, conflict resolution, work ethic.
**AI role:** Hiring manager asking behavioral questions.

## Post-Session Analysis

After the interview ends, the Analysis Agent evaluates the transcript:

```typescript
{
  overallScore: number        // 0-100
  metrics: {
    communication: number     // Clarity, articulation, active listening
    confidence: number        // Assertiveness, composure under pressure
    contentQuality: number    // Relevance, depth, accuracy of responses
    responsiveness: number    // Speed, engagement, follow-up questions
  }
  strengths: string[]         // What went well
  improvements: string[]      // What to work on
  keyMoments: Array<{
    timestamp: string
    quote: string
    feedback: string
  }>
  overallFeedback: string     // Detailed markdown analysis
}
```

## Data Model

Stored in `interview_sessions`:
- `interview_type`: One of the four types
- `status`: `pending` -> `active` -> `completed` | `abandoned`
- `transcript`: JSON array of conversation turns
- `metrics`: JSON object with dimension scores
- `analysis`: JSON object with full analysis
- `overall_score`: Numeric 0-100

## UI

Located at `/interview-practice`. Features:
- Interview type selection cards
- Real-time voice interaction with visual feedback
- Post-session analysis dashboard with score gauges
- Historical session list with trend tracking
