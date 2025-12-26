# 🗓️ Week 1 — Repo, Auth, Shell UI

## 🎯 Goals (measurable)
- [ ] Turborepo + `pnpm` workspace runs locally with one command.
- [ ] Supabase magic link login works end-to-end in the UI.
- [ ] `/api/v1/*` verifies JWT and rejects unauthenticated calls.
- [ ] Dashboard shell exists with tabs + protected routes.

## ✅ Deliverables
- [ ] Turborepo monorepo scaffold with `apps/web` (Next.js App Router).
- [ ] Shared packages (`packages/*`) created only where reused.
- [ ] Auth screens: `/login`, `/app/*` guarded.
- [ ] Backend auth middleware for `/api/v1/*`.
- [ ] Minimal `GET /api/v1/health` and `GET /api/v1/me`.

## 🧪 Acceptance criteria
- [ ] `pnpm dev` starts the app and hot reload works.
- [ ] User can request magic link, click it, land in `/app/overview`.
- [ ] Unauthed request to `GET /api/v1/me` returns `401`.
- [ ] Authed request to `GET /api/v1/me` returns `user_id` + `team_id`.

## 🧱 Checklist (tight)
### Day 1–2 — Monorepo + Next.js baseline
- [ ] Initialize Turborepo with `pnpm`.
- [ ] Add Next.js app in `apps/web` with App Router.
- [ ] Add shared TypeScript config + lint config (minimum needed).
- [ ] Add env loading strategy for local + Vercel.

### Day 3–4 — Supabase Auth integration
- [ ] Create Supabase project + configure Auth (email magic link).
- [ ] Add Supabase client wiring in the app.
- [ ] Implement `/login` flow + session persistence.
- [ ] Add protected layout for `/app/*`.

### Day 5 — REST API auth gate
- [ ] Create `/api/v1/*` route handlers.
- [ ] Implement JWT verification + `team_id` resolution.
- [ ] Implement `GET /api/v1/me`.

### Weekend — UI shell
- [ ] Build the sidebar tab layout and empty pages for each tab.
- [ ] Add the first "Overview" skeleton with placeholders.

## 🧯 Cut list (if time slips)
- [ ] Skip shared UI package; keep UI local to `apps/web` for now.
