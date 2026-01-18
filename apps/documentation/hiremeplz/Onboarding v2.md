****Onboarding refactor v2****  
  
goal: refactor the /onboarding experience by accomplishing these goals:  

Remove name, last name, date of birth (will be extracted from the CV/LI/UW/Portfolio pages)

the onboarding card (frame) currently is of static width and dynamic length. i want it to be of dynamic both width and lenght so it shrinks and enlarges depending on the content it holds

  

onboarding steps:

  

step 1: team size: radio (leave as is)

step 2: Profile setup: radio: Import from LinkedIn, Import from Upwork, Upload CV, or add a portfolio, or set up manually

  

if import from linkedin: url input

if import from upwork: url input

if upload cv: file upload input

if add a portfolio: url input

if set up manually: put current skills, experience, and education inputs just like now but all in the same step. also at the top add experience level radio select, with sum like intern/new grad, entry, mid, senior, lead, director

  

these 5 options are on the same page and display depending on the radio input.

  

step 3:

wage preferences: hourly range (shadcn range slider), fixed project budget minimum (shadcn range slider)

  

constraints:

- preferred project length (shadcn range slider)

- time zones

- full-time part-time internship (checkboxes, styled neatly with shadcn). if you select project lenghts less than one week in the slider, full-time option dissapears. minimal project lenght is 1 day, max is 1 year. If full-time disappears when project < 1 week, add a small tooltip:

  

> “Full-time is only available for projects of 1 week or longer.”

  

Example helper text:

  

- **Full‑time** — 35+ hrs/week

- **Part‑time** — < 35 hrs/week

- **Internship** — learning‑focused, temporary role

Ensure all checkboxes and sliders have **labels readable by screen readers**.

make all parts of the onboarding skippable (for now). update profile completeness score compute on backend. if profile completeness score < 0.8, add a shadcn Sonner that you cna close but that opens on every page refresh to remind about finishing onboarding for a better experience

  

for linkedin, upwork, cv and portfolio add a under consturction alert and say that you can add allat manually or skip it for now. add a 'skip' button for each of the steps.

  

also, when user first visit /onboarding, add a pretty 'Welcome to HireMePlz' card and a button that leads to the actual onboarding. something like let's set you up or anything like really anything. make it pretty. Also remove the 'What this setup powers' explaination or make it user facing (not what there is rn, like why tf would the user need to know this data is saved in Supabase? He is a user not a developer of the app). make sure to use shadcn for components.  
  
also add super smooth react animation (actual smooth animations), when you are changing inputs, or when the side of the card changes (shrinks/expands). in between steps, add a 300ms delay and a smooth transition between steps

