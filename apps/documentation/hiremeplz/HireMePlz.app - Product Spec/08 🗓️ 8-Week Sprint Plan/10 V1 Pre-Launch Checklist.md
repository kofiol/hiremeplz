# V1 Pre-Launch Checklist

Checkboxes reflect current state based on the Week 1–2 sprint notes and onboarding v2 spec. 
- [x] = already delivered per notes. 
- [ ] = not done yet or unknown.

This checklist assumes Trigger.dev is used as the workflow engine for long-running and background tasks (e.g. job search, agent runs).

## 1. Access, Auth, and Shell

- [x] Turborepo monorepo with `apps/web` (Next.js App Router) exists.
- [x] `pnpm dev` starts the app and hot reload works.
- [x] Supabase magic link login works end-to-end in the UI.
- [x] Protected layout for `/(app)/*` is implemented.
- [x] Auth screens exist for `/login` and authenticated routes.
- [x] `/api/v1/*` route handlers exist with JWT verification and `team_id` resolution.
- [x] `GET /api/v1/health` and `GET /api/v1/me` are implemented.
- [x] Dashboard shell (sidebar tabs + protected routes) exists with an Overview page skeleton.
- [ ] Production/staging deployment URL is configured and tested with magic link login.

## 2. Data Model and RLS

- [x] Canonical Supabase schema is applied (tables, enums, indexes) from the canonical SQL spec.
- [x] RLS helper functions and policies are applied.
- [x] RLS is enabled and enforced for all tables.
- [x] Storage buckets exist for CV uploads (with storage policies).
- [ ] Verified that canonical schema contains all job-search-related tables needed (e.g. `jobs`, `job_rankings`, `agent_runs`) for Trigger.dev workflows.

## 3. Onboarding Core (v1 and v2 requirements)

### 3.1 Onboarding v1 (from Week 2)

- [x] `/onboarding` flow is implemented.
- [x] Onboarding writes real data for profile, skills, experience, and preferences.
- [x] Backend endpoints exist to persist onboarding data.
- [x] Backend computes `profile_completeness_score` on save.
- [x] Profile completeness gate blocks Trigger.dev agent trigger endpoints when score is too low.
- [x] API returns a structured error when profile completeness is insufficient.
- [x] Onboarding progress UX exists with a "missing fields" list or equivalent.

### 3.2 Onboarding v2 – not yet implemented (needed for polished V1)

- [x] Step 1: Team size step with radio options (current behavior preserved or improved).
- [x] Step 2: Profile setup step with radio options:
  - [x] Import from LinkedIn.
  - [x] Import from Upwork.
  - [x] Upload CV.
  - [x] Add a portfolio.
  - [x] Set up manually.
- [x] For LinkedIn option, a URL input is shown when selected.
- [x] For Upwork option, a URL input is shown when selected.
- [x] For CV option, a file upload input is shown when selected.
- [x] For Portfolio option, a URL input is shown when selected.
- [x] For manual setup option, the following inputs appear on a single step:
  - [x] Experience level radio (intern/new grad, entry, mid, senior, lead, director).
  - [x] Skills input(s).
  - [x] Experience input(s).
  - [x] Education input(s).
- [x] Only the inputs for the currently selected profile-setup radio are visible at any time.
- [x] All onboarding steps are skippable (with clear Skip buttons).

### 3.3 Onboarding v2 – UX, layout, and accessibility

- [x] Onboarding shows a "Welcome to HireMePlz" card on first visit to `/onboarding`.
- [x] Welcome card has a primary call-to-action (e.g. "Let’s set you up") that starts the flow.

- [x] Onboarding card/frame has dynamic width and height that adjust to content.
- [x] Transitions between steps have smooth animations (~300 ms) without jank.
- [x] Transitions when switching between profile-setup options are smooth and visually clear.
- [x] All components in onboarding use shadcn UI primitives.
- [x] For LinkedIn/Upwork/CV/Portfolio options, an "under construction" alert is shown.
- [x] For LinkedIn/Upwork/CV/Portfolio options, a Skip button is available so the user can continue.
- [x] All sliders and checkboxes have labels that are accessible to screen readers.
- [x] Helper text is added for work-type checkboxes:
  - [x] Full-time — 35+ hrs/week.
  - [x] Part-time — < 35 hrs/week.
  - [x] Internship — learning-focused, temporary role.

### 3.4 Preferences and constraints (Step 3)

- [x] Wage preferences step includes an hourly rate range using a shadcn range slider.
- [x] Wage preferences step includes a fixed project budget minimum using a shadcn range slider.
- [x] Step includes a preferred project length slider (min 1 day, max 1 year).
- [x] Time zone preferences can be captured (e.g. text input or multi-select).
- [x] Work type checkboxes exist for full-time, part-time, and internship.
- [x] When preferred project length < 1 week, the full-time checkbox disappears.
- [x] Tooltip explains why full-time is hidden:
  - [x] "Full-time is only available for projects of 1 week or longer."
- [x] Submitting Step 3 persists wage preferences and constraints to Supabase.

### 3.5 Completeness reminders

- [x] Backend computes profile completeness score on save (v1).
- [x] Sonner (or equivalent) toast shows when profile completeness < 0.8.
- [x] Toast appears on every page refresh until completeness >= 0.8.
- [x] Toast includes a link or button to go back to `/onboarding` to finish setup.

## 4. Job Search Core (Bright Data / LinkedIn + Trigger.dev)

- [ ] Job Source Router module exists with a provider-agnostic `RawJob` contract.
- [ ] Router interface can execute a search for a given platform and query plan.
- [ ] Bright Data adapter for LinkedIn search is implemented and returns `RawJob[]`.
- [ ] Query plan builder uses profile data and preferences to construct LinkedIn search queries.
- [ ] `RawJob` fields are mapped into canonical `jobs` rows in Supabase.
- [ ] Ranking logic computes a 0–100 score for each job based on match.
- [ ] Ranking results are written into `job_rankings` with score and explanation fields.
- [ ] Trigger.dev job search workflow (e.g. `job_search.run` task) creates an `agent_runs` row for each run.
- [ ] Trigger.dev workflow updates `agent_runs` status from pending → running → completed/failed.
- [ ] Trigger.dev workflow writes all ingested jobs and rankings for the run to Supabase.
- [ ] At least one end-to-end job search run ingests jobs from LinkedIn via Bright Data in dev/test.

## 5. Jobs API and Dashboard / Jobs UI

### 5.1 Jobs API

- [ ] `GET /api/v1/jobs` returns a list of jobs for the current user/team.
- [ ] `GET /api/v1/jobs` supports filters (platform, `min_score`, search query `q`).
- [ ] Jobs from `GET /api/v1/jobs` are joined with `job_rankings` and sorted by score.
- [ ] `GET /api/v1/jobs/:id` returns full job details and ranking breakdown.
- [ ] All jobs API endpoints enforce auth and RLS.

### 5.2 Jobs pages

- [x] Basic Overview page skeleton exists with placeholders.
- [ ] Overview page displays summary information about the last Trigger.dev job search run.
- [ ] Overview page includes a primary call-to-action to start job search.
- [ ] Overview page shows status for an ongoing job search (e.g. spinner or status text).
- [ ] `/jobs` list page shows a ranked shortlist of jobs.
- [ ] `/jobs` list page includes filters (platform, min score, text search).
- [ ] `/jobs` displays an empty state when no jobs are available, with CTA to start search.
- [ ] `/jobs/[jobId]` detail page shows full job info and ranking explanation.
- [ ] Job detail page includes a link/button to open the original job on LinkedIn.

## 6. Settings and Profile Editing

- [x] `GET/POST/PATCH /api/v1/settings` is implemented to manage user preferences.
- [ ] Settings UI page exists for editing preferences after onboarding.
- [ ] Settings page allows editing wage preferences (same fields as onboarding Step 3).
- [ ] Settings page allows editing skills, experience, and experience level.
- [ ] Changes in settings are used by future Trigger.dev job search runs.

## 7. Error Handling and UX Polish

- [x] API returns structured error when profile completeness is insufficient for agent triggers.
- [ ] Global error handling exists (e.g. error boundary or global error component).
- [ ] Authentication errors (401) redirect to `/login` with a clear message.
- [ ] Network/API failures show a toast or inline error instead of a blank screen.
- [ ] Loading states (skeletons or spinners) exist for dashboard, jobs list, and job details.
- [ ] Basic logging exists for Trigger.dev job search workflow steps (start, provider call, counts, errors).

## 8. Deployment and Environment

- [ ] Environment variables for Supabase are configured in all environments (local, staging, production).
- [ ] Environment variables for Bright Data / LinkedIn integration are configured securely on the server.
- [ ] Trigger.dev project is configured with the correct project ref and environment.
- [ ] Trigger.dev worker is deployed and able to run the job search workflow in the target environment.
- [ ] Production or staging deployment is reachable and passes the core login + onboarding smoke test.
- [ ] (Optional) Basic monitoring/alerting is configured for the Trigger.dev job search workflow.
