> **Goal:** Build a production-ready implementation of the **Job Search Core** + **Trigger.dev workflow orchestration** for LinkedIn job search using Bright Data’s Web Scraper API.  
> The system must be testable, maintainable, scalable, and ready for deployment.
> 
> Use the Obsidian vault for existing technical details, schema definitions (Supabase `jobs`, `job_sources`, `job_rankings`, `agent_runs`), and domain logic already defined in the project.
> 
> You must produce the following **TypeScript modules** (Node 18+ / Bun / Bun:spawn friendly) with appropriate typing, tests, and integration entry points:
> 
> ---
> 
> ## 1) **packages/job-source-router**
> 
> **1.1) Types**
> 
> - `RawJob` (provider-agnostic job shape; normalizes LinkedIn/Bright Data output)
> - `QueryPlan` (search terms, filters, pagination plan)
>     
> 
> **1.2) Router Interface**
> 
> `interface JobSourceRouter {   search(plan: QueryPlan): Promise<RawJob[]> }`
> 
> **1.3) LinkedIn + Bright Data Adapter**
> 
> - Implement `BrightDataLinkedInAdapter implements JobSourceRouter`
>     
> - Accepts a `QueryPlan` with fields like `{ keyword, location, filters }`
>     
> - Calls Bright Data LinkedIn jobs endpoint
>     
> - Normalizes API responses into `RawJob[]`
>     
> - Respect rate limits & errors; expose a `retry` strategy
>     
> - Write Jest/ Vitest tests for requests + parsing logic
>     
> 
> Use the **Bright Data LinkedIn API docs** to construct request URLs and field mappings. You may need to:
> 
> - Form a Bright Data API request with `apiKey` from env
>     
> - Use parameters: `location`, `keyword`, `country`, `remote`, `experience_level`, etc.
>     
> 
> ---
> 
> ## 2) **Query Plan Builder**
> 
> - Input: User profile data + preferences (location, skills, title preferences)
>     
> - Output: A `QueryPlan` ready for router.search()
>     
> - Must be tested
>     
> 
> ---
> 
> ## 3) **Mapping & Ranking (Domain Logic)**
> 
> **3.1) Mapper**
> 
> - Normalize `RawJob[]` → canonical Supabase `jobs` row shapes
>     
> - Do not write to DB here; just transform / validate
>     
> 
> **3.2) Ranking**
> 
> - Compute a score `0–100` based on what is described in the vault.
> - Provide `explanation`: array of scoring factors
>     
> 
> Test coverage must assert scoring correctness for edge cases.
> 
> ---
> 
> ## 4) **Trigger.dev Workflow — job_search.run**
> 
> - Must be implemented using latest Trigger.dev SDK (https://trigger.dev/docs/)
>     
> - Workflow must:
>     
>     1. Create a Supabase `agent_runs` row with `pending`
>         
>     2. Mark `running` at start
>         
>     3. Call:
>         
>         - Query Plan Builder
>             
>         - Job Source Router (Bright Data LinkedIn)
>             
>         - Mapper
>             
>         - Ranking
>             
>     4. Write:
>         
>         - Jobs → Supabase `jobs`
>             
>         - Rankings → Supabase `job_rankings` (with explanation + score)
>             
>     5. On success `completed` with stats
>         
>     6. On failure `failed` with errors logged
>         
> - Add robust error handling and idempotence. Trigger.dev workflow should be reschedulable.
>     
> 
> ---
> 
> ## 5) **Supabase Integration**
> 
> - Use @supabase/supabase-js for all DB actions
>     
> - Must use prepared statements / transactions where appropriate
>     
> - Type-safe schema bindings (Zod or Drizzle)
>     
> 
> ---
> 
> ## 6) **Tests + Local Dev Environment**
> 
> - Provide / mock Bright Data responses for LinkedIn jobs
>     
> - Local Supabase schema migrations
>     
> - CI test scripts
>     
> 
> ---
> 
> ## **Deliverables**
> 
> 1. Full source code under `packages/job-source-router`, `packages/workflows/job_search`
>     
> 2. Unit & integration tests
>     
> 3. Trigger.dev workflow ready for deployment
>     
> 4. Example environment config file
>     
> 
> **Constraints**
> 
> - Must be production ready
>     
> - Clear code documentation
>     
> - Resilient to LinkedIn scraping anti-bot responses
>     
> - Respect API key security best practices
>     
> 
> **Reference:** Use your Obsidian vault to pull any info you don't know. Use WEB SEARCH tool for any uncertainities regarding SDKs and APIs, including but not limited to Trigger.dev and brightData.
> 
> brightData latest API (search jobs by keywords, fitlers):  https://docs.brightdata.com/api-reference/web-scraper-api/social-media-apis/linkedin#job-listings-information-api