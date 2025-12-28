# 🖥️ Frontend — Information Architecture (IA) & Routes

## ✅ Framework decisions
- Next.js App Router
- TypeScript everywhere
- Tailwind CSS for UI
- Supabase browser client for:
  - auth session
  - Realtime subscriptions

## 🧭 Route map (App Router)
**Public**
- `/` — landing
- `/login` — magic link
- `/waitlist` — optional

**App (authenticated, route group `/(app)`)**
- `/overview` — pipeline summary
- `/onboarding` — multi-step profile completion
- `/jobs` — shortlist + filters
- `/jobs/[jobId]` — job details + generate cover letter
- `/applications` — pipeline board/table
- `/cover-letters` — generated library
- `/messages` — inbox (email + DM)
- `/feedback` — extracted feedback + statuses
- `/earnings` — earnings + timeline
- `/analytics` — KPIs and trends
- `/team` — members, invites (leader)
- `/settings` — agent settings + integrations
- `/interview-prep` — beta

## 🧩 Shared UI patterns
- Global search: job title/company/keywords
- Saved views: “Top matches”, “High budget”, “Fast response likelihood”
- Bulk actions:
  - generate cover letters for selected jobs
  - archive jobs

## 🔄 Data fetching pattern
- UI reads canonical data from `/api/v1/*` endpoints.
- UI does not call Supabase tables directly for canonical reads (keeps business rules centralized).
- Realtime is used for:
  - agent run progress
  - new jobs inserted
  - new messages/feedback ingested
