## Overview
- Replace the ad‑hoc aside in `apps/web/src/app/(app)/layout.tsx` with the existing shadcn sidebar block (`SidebarProvider`, `AppSidebar`, `SidebarInset`) and keep session gating intact.
- Create empty, routed pages for all 10 tabs using shadcn components/blocks only.

## Navigation & Icons
- Update `apps/web/src/components/app-sidebar.tsx` to use a top‑level nav list with links:
  - `Overview` → `/overview` (icon: `Home`)
  - `Jobs` → `/jobs` (icon: `Search`)
  - `Applications` → `/applications` (icon: `Rocket`)
  - `Cover Letters` → `/cover-letters` (icon: `FileText`)
  - `Messages` → `/messages` (icon: `MessageSquare`)
  - `Feedback` → `/feedback` (icon: `Star`)
  - `Earnings` → `/earnings` (icon: `Wallet` or `DollarSign`)
  - `Analytics` → `/analytics` (icon: `BarChart3`)
  - `Team` → `/team` (icon: `Users`)
  - `Settings` → `/settings` (icon: `Settings`)
- Keep `NavSecondary` and `NavUser` sections; they already use shadcn blocks and can remain as footer/secondary content.

## Layout Integration
- In `apps/web/src/app/(app)/layout.tsx`:
  - Wrap children in `SidebarProvider`.
  - Render `<AppSidebar />` on the left.
  - Render `<SidebarInset>` for main content and include `SiteHeader` at the top for a consistent page shell.
  - Preserve the existing session check (`useSession`) and redirect to `/login` when unauthenticated.

## Routes & Empty Pages
Create these directories/files under `apps/web/src/app/(app)/` (group segment keeps clean URLs):
- `overview/page.tsx` (refactor to shadcn placeholders)
- `jobs/page.tsx`
- `applications/page.tsx`
- `cover-letters/page.tsx`
- `messages/page.tsx`
- `feedback/page.tsx`
- `earnings/page.tsx`
- `analytics/page.tsx`
- `team/page.tsx`
- `settings/page.tsx`

Each page uses shadcn components/blocks only and renders an empty state shell:
- Common pattern: a top title area and a content placeholder composed of `Card`, `Separator`, `Tabs` or `Table` where relevant.
- `Overview`: grid of `Card` placeholders for the listed sections (Today’s actions, Pipeline snapshot, Recent agent runs, Alerts) with no data, just block structure.
- `Jobs`: a `Card` with a `Table` header and a “No jobs yet” row; filter bar using `Select`, `Input`, `Checkbox`, and `Switch` placeholders.
- `Applications`: `Tabs` with `Board` and `Table` triggers; `Board` shows empty columns (cards), `Table` shows an empty `Table`.
- `Cover Letters`: list of cards grouped by job (simple stacked `Card`s) with empty content.
- `Messages`: inbox list of cards with empty items; action buttons present but nonfunctional.
- `Feedback`: segmented empty list with `Badge` for statuses/categories.
- `Earnings`: timeline placeholder (`Card` with dashed box) plus monthly totals cards.
- `Analytics`: KPIs using the existing `SectionCards` block for placeholder cards.
- `Team`: leader/member sections as cards; invite button placeholder using `Button`.
- `Settings`: split into `Card` sections (Profile completeness, Agent settings, Integrations, Extension pairing, Billing).

## Implementation Notes
- Use the existing shadcn UI components from `@/components/ui/*` and blocks (`AppSidebar`, `SiteHeader`, `SectionCards`).
- Keep `globals.css` (Tailwind v4) variables that style the sidebar; no changes needed.
- Keep anchor links in `NavMain` for now to match existing block pattern; optionally upgrade to `next/link` later.

## Verification
- Start the web app and navigate through all 10 tabs; confirm sidebar collapses/expands and mobile sheet works.
- Confirm each page renders its empty shadcn block shell (no data) and dark/light styles apply.
- Ensure unauthenticated users redirect to `/login` due to the `(app)` layout’s session enforcement.