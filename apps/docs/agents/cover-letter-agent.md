---
type: spec
title: Cover Letter Agent
status: planned
updated: 2026-01-31
context_for_agents: >
  Planned agent that generates tailored cover letters / proposals for
  freelance job applications. Reads job description + user profile to
  produce platform-appropriate proposals. Supports style presets,
  temperature control, and vocabulary level. Output stored in
  cover_letters table. Human-in-the-loop: user reviews before sending.
tags: [agents, cover-letter, planned]
---

# Cover Letter Agent

Generates tailored proposals for freelance job applications. The goal is a draft that requires minimal editing - matching the freelancer's voice and addressing the specific job requirements.

## Purpose

For a given (job, profile) pair, produce:
1. A **cover letter/proposal** tailored to the platform and job
2. Highlight **relevant experience** from the user's profile
3. Address **specific requirements** mentioned in the job description
4. Match the freelancer's **communication style** and **vocabulary level**

## Input Context

```typescript
{
  job: NormalizedJob           // Full job posting
  ranking: JobRanking          // Match breakdown (what to emphasize)
  profile: AgentContext        // User profile + skills + experience
  settings: {
    stylePreset: string        // "professional" | "conversational" | "technical"
    temperature: number        // 0.3-1.0 (creativity level)
    vocabularyLevel: number    // 1-5 (1=simple, 5=academic)
    platformRules: object      // Upwork character limits, LinkedIn norms, etc.
  }
  previousLetters?: string[]   // Past proposals for voice consistency
}
```

## Output Schema

```typescript
{
  content: string             // The proposal text
  model: string               // Model used
  tokensUsed: number          // For billing
  highlights: {
    skillsReferenced: string[]
    experiencesCited: string[]
    clientPainPoints: string[]  // Specific issues from the job desc addressed
  }
  platformMetadata: {
    characterCount: number
    withinLimits: boolean
    suggestedAttachments: string[]  // e.g., "Include your React portfolio"
  }
}
```

## Platform Adaptations

### Upwork Proposals
- Character limit awareness (5000 chars for free connects)
- Opening hook addressing the specific project
- Relevant portfolio/experience references
- Clear value proposition tied to the budget
- Call to action (availability, next steps)
- Questions that show understanding of the project

### LinkedIn Messages
- Shorter, more conversational
- Reference mutual connections or shared context if available
- Less formal than Upwork proposals

### Email (Future)
- Subject line optimization
- Full email formatting with signature

## Style Presets

| Preset | Tone | Best for |
|--------|------|----------|
| professional | Formal, structured, confident | Enterprise clients, high-budget projects |
| conversational | Friendly, approachable, concise | Startup clients, creative projects |
| technical | Detail-oriented, specification-focused | Technical roles, engineering leads |

## Voice Learning (Future)

After 5+ accepted proposals, the agent can learn the freelancer's voice:
1. Analyze accepted proposals for tone, sentence structure, common phrases
2. Build a voice profile stored in `user_agent_settings`
3. Use voice profile as few-shot examples in generation
4. User can rate drafts to refine the voice model

## Workflow Integration

```
User views ranked job -> clicks "Draft Proposal"
  |
  v
Cover Letter Agent generates draft
  |
  v
User reviews/edits in UI
  |
  v
User approves -> application status: ready_to_apply
  |
  v
[Future] Auto-submit via platform API or guided manual apply
```

## Database

Stored in `cover_letters` table:
- `job_id`, `user_id`, `team_id`
- `style_preset`, `temperature`, `vocabulary_level`
- `content` (the generated text)
- `model`, `tokens_used`

Linked to `apply_sessions` for the actual submission flow.
