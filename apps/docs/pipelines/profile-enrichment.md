---
type: spec
title: Profile Enrichment Pipeline
status: implemented
updated: 2026-01-31
context_for_agents: >
  Multi-source profile data unification. LinkedIn scraping via trigger.dev
  + BrightData is fully implemented. CV parsing and manual entry also
  supported. All sources merge into the canonical profile tables
  (profiles, user_skills, user_experiences, user_educations). Raw source
  data preserved in user_profile_snapshots for audit.
tags: [pipelines, profile, implemented]
---

# Profile Enrichment Pipeline

Unifies freelancer profile data from multiple sources into a canonical representation.

## Sources

### LinkedIn (Implemented)
**Trigger:** User provides LinkedIn URL during onboarding
**Method:** trigger.dev task -> BrightData dataset scrape
**Extracts:** Name, headline, about, location, skills, experiences, education, certifications, experience level inference

**Flow:**
```
LinkedIn URL
  -> trigger.dev (linkedin-profile-scraper)
    -> BrightData API (dataset gd_l1viktl72bvl7bjuj0)
      -> Poll for completion (max 5min)
        -> Parse raw profile
          -> Infer experience level from titles + tenure
            -> Return DistilledProfile
```

**Output stored in:**
- `user_profile_snapshots` (raw + parsed JSON, source: "linkedin")
- `profiles` (name, headline, about, location, avatar)
- `user_skills` (extracted skills, default level 3)
- `user_experiences` (work history with highlights)
- `user_educations` (degrees)

### CV Upload (Partial)
**Trigger:** User uploads a PDF/DOCX during onboarding
**Method:** Supabase Storage upload -> AI extraction (planned)
**Status:** Upload and storage path tracking implemented. AI extraction not yet built.

### Manual Entry (Implemented)
**Trigger:** User provides data via onboarding chatbot conversation
**Method:** AI agent extracts structured data from free-form responses, calls `update_collected_data` tool

## Merge Strategy

When multiple sources provide conflicting data:

| Field | Priority |
|-------|----------|
| Name | Manual > LinkedIn > CV |
| Skills | Union of all sources (highest level wins for duplicates) |
| Experiences | Union, deduplicate by (company + title + dates) |
| Education | Union, deduplicate by (school + degree) |
| Rates | Manual only (never inferred from external sources) |
| Headline | LinkedIn > Manual (LinkedIn is usually more polished) |

## Completeness Scoring

After any enrichment, `profile_completeness_score` is recomputed:

```typescript
// Computed in lib/profile-completeness.server.ts
const weights = {
  email: 0.10,
  timezone: 0.05,
  cvFiles: 0.10,
  skills: 0.25,       // At least 3 skills
  experiences: 0.25,   // At least 1 experience
  educations: 0.10,
  preferences: 0.15    // Rates + platforms set
}
// Each category scores 0 or 1 (binary), weighted sum = completeness
```

**Threshold:** 80% completeness required to access `/overview` and enable job matching.

## Future Enhancements

- **CV AI extraction:** Parse uploaded PDFs/DOCX with GPT-4o vision for structured data
- **Portfolio analysis:** Scrape portfolio URLs for project descriptions and tech stack
- **Upwork profile import:** Scrape Upwork profile for reviews, job success score, portfolio
- **Periodic refresh:** Re-scrape LinkedIn quarterly to keep data current
- **Skill inference:** Analyze project descriptions to surface implicit skills not explicitly listed
