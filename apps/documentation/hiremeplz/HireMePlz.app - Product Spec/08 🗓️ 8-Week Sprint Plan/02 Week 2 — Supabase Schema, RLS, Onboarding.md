# 🗓️ Week 2 — Supabase Schema, RLS, Onboarding

## 🎯 Goals (measurable)
- [x] Canonical Supabase schema is applied (tables + enums + indexes).
- [x] RLS is enabled and enforced for all tables.
- [x] Onboarding writes real data: profile, skills, experience, preferences.
- [x] Profile completeness gate blocks agent triggers.

## ✅ Deliverables
- [x] SQL migration(s) applied in Supabase for the canonical schema.
- [x] RLS helper functions + policies applied.
- [x] Storage buckets created (CV uploads + snapshots).
- [x] `/onboarding` flow implemented.
- [x] `GET/POST/PATCH /api/v1/settings` (reads/writes `user_preferences` and `user_agent_settings`).

## 🧪 Acceptance criteria
- [x] A user sees only their team’s rows (verified with 2 test users).
- [x] User completes onboarding and `profiles.profile_completeness_score >= 0.8`.
- [x] API returns a structured error when completeness is insufficient.

## 🧱 Checklist (tight)
### Day 1–2 — Schema + RLS
- [x] Apply [[01 SQL Schema (Canonical)]] into Supabase.
- [x] Apply [[02 RLS Policies]] and verify RLS works.
- [x] Create Storage buckets and storage policies for CV uploads.

### Day 3–4 — Onboarding UI
- [x] Build `/onboarding` steps (CV upload, skills/experience, preferences).
- [x] Implement backend endpoints to persist onboarding data.
- [x] Compute `profile_completeness_score` server-side on save.

### Day 5 — Gate enforcement
- [x] Add backend completeness gate on agent trigger endpoints.
- [x] Add onboarding progress UX + "missing fields" list.

### Weekend — Polish + QA
- [x] Validate RLS with multiple team scenarios (leader/member).

