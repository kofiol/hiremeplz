---

kanban-plugin: board

---

## Todo

- [ ] landing page: add a price hook above the join the waitlist button
- [ ] define how messages work & wire them to the actual messages icon AND the popover
- [ ] make ts work![[Pasted image 20260112164100.png]]
- [ ] ![[Pasted image 20260112164113.png]]
	make buttons lead to these actual pages, except for logout which already works
- [ ] design actual settings
- [ ] implement settings tabs and parameters
- [ ] ![[Pasted image 20260112164627.png]]remove these from onboarding
- [ ] ![[Pasted image 20260112165057.png]]make this page wider because not all fields and elements are visible
- [ ] make onboarding transitions extra smooth


## Working on



## Done

**Complete**
- [x] remove the badges like Cv missing skills missing from onboarding.
- [x] ![[Pasted image 20260112164642.png]]fix the onboarding DoB calendar
- [x] ![[Pasted image 20260112165028.png]]remove this
- [x] Compute `profile_completeness_score` server-side on save.
- [x] Implement backend endpoints to persist onboarding data.
- [x] Build `/onboarding` steps (CV upload, skills/experience, preferences).
- [x] Create Storage buckets and storage policies for CV uploads.
- [x] Apply [[02 RLS Policies]] and verify RLS works.
- [x] Apply [[01 SQL Schema (Canonical)]] into Supabase.
- [ ] Create Supabase project + configure Auth (email magic link).
- [ ] Implement `/login` flow + session persistence.
- [ ] Add protected layout for `/(app)/*`.
- [ ] Create `/api/v1/*` route handlers.
- [x] Implement JWT verification + `team_id` resolution.
- [x] **Build the sidebar tab layout and empty pages for each tab.**
- [x] Add the first "Overview" skeleton with placeholders.


## Freezed

- [ ] replace /page with app?view=page


***

## Archive

- [ ] Implement and test`GET /api/v1/me`, `GET /api/v1/health.

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false],"show-checkboxes":false}
```
%%