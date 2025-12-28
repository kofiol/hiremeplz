# 🗓️ Week 2 — Supabase Schema, RLS, Onboarding

## 🎯 Goals (measurable)
- [ ] Canonical Supabase schema is applied (tables + enums + indexes).
- [ ] RLS is enabled and enforced for all tables.
- [ ] Onboarding writes real data: profile, skills, experience, preferences.
- [ ] Profile completeness gate blocks agent triggers.

## ✅ Deliverables
- [ ] SQL migration(s) applied in Supabase for the canonical schema.
- [ ] RLS helper functions + policies applied.
- [ ] Storage buckets created (CV uploads + snapshots).
- [ ] `/onboarding` flow implemented.
- [ ] `GET/POST/PATCH /api/v1/settings` (reads/writes `user_preferences` and `user_agent_settings`).

## 🧪 Acceptance criteria
- [ ] A user sees only their team’s rows (verified with 2 test users).
- [ ] User completes onboarding and `profiles.profile_completeness_score >= 0.8`.
- [ ] API returns a structured error when completeness is insufficient.

## 🧱 Checklist (tight)
### Day 1–2 — Schema + RLS
- [ ] Apply `04 🗄️ Supabase/01 SQL Schema (Canonical)` into Supabase.
- [ ] Apply `04 🗄️ Supabase/02 RLS Policies` and verify RLS works.
- [ ] Create Storage buckets and storage policies for CV uploads.

### Day 3–4 — Onboarding UI
- [ ] Build `/onboarding` steps (CV upload, skills/experience, preferences).
- [ ] Implement backend endpoints to persist onboarding data.
- [ ] Compute `profile_completeness_score` server-side on save.

### Day 5 — Gate enforcement
- [ ] Add backend completeness gate on agent trigger endpoints.
- [ ] Add onboarding progress UX + "missing fields" list.

### Weekend — Polish + QA
- [ ] Validate RLS with multiple team scenarios (leader/member).
- [ ] Fix schema/typing friction.

## 🧯 Cut list (if time slips)
- [ ] Defer education table UI; keep schema but skip UI editing.
