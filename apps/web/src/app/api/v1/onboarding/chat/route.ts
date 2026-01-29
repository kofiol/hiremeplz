import { NextRequest } from "next/server"
import { Agent, run } from "@openai/agents"
import { z } from "zod"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import {
  triggerLinkedInScrape as triggerScrapeUtil,
  getLinkedInScrapeStatus as getScrapeStatusUtil,
} from "@/lib/linkedin-scraper.server"

// ============================================================================
// Zod Schema for Collected Onboarding Data
// ============================================================================

const SkillSchema = z.object({
  name: z.string(),
})

const ExperienceSchema = z.object({
  title: z.string(),
  company: z.union([z.string(), z.null()]),
  startDate: z.union([z.string(), z.null()]),
  endDate: z.union([z.string(), z.null()]),
  highlights: z.union([z.string(), z.null()]),
})

const EducationSchema = z.object({
  school: z.string(),
  degree: z.union([z.string(), z.null()]),
  field: z.union([z.string(), z.null()]),
  startYear: z.union([z.string(), z.null()]),
  endYear: z.union([z.string(), z.null()]),
})

const CollectedDataSchema = z.object({
  teamMode: z.union([z.enum(["solo", "team"]), z.null()]),
  profilePath: z.union([
    z.enum(["linkedin", "upwork", "cv", "portfolio", "manual"]),
    z.null(),
  ]),
  linkedinUrl: z.union([z.string(), z.null()]),
  upworkUrl: z.union([z.string(), z.null()]),
  portfolioUrl: z.union([z.string(), z.null()]),
  experienceLevel: z.union([
    z.enum(["intern_new_grad", "entry", "mid", "senior", "lead", "director"]),
    z.null(),
  ]),
  skills: z.union([z.array(SkillSchema), z.null()]),
  experiences: z.union([z.array(ExperienceSchema), z.null()]),
  educations: z.union([z.array(EducationSchema), z.null()]),
  hourlyMin: z.union([z.number(), z.null()]),
  hourlyMax: z.union([z.number(), z.null()]),
  fixedBudgetMin: z.union([z.number(), z.null()]),
  currency: z.union([z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]), z.null()]),
  preferredProjectLengthMin: z.union([z.number(), z.null()]),
  preferredProjectLengthMax: z.union([z.number(), z.null()]),
  timeZones: z.union([z.array(z.string()), z.null()]),
  engagementTypes: z.union([
    z.array(z.enum(["full_time", "part_time", "internship"])),
    z.null(),
  ]),
  remoteOnly: z.union([z.boolean(), z.null()]),
})

type CollectedData = z.infer<typeof CollectedDataSchema>

// Profile Analysis Response Schema
const ProfileAnalysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  title: z.string(),
  summary: z.string(),
  analysis: z.string(),
})

type ProfileAnalysisResponse = z.infer<typeof ProfileAnalysisResponseSchema>

const ProfileAnalysisJsonSchema = {
  type: "json_schema" as const,
  name: "ProfileAnalysisResponse",
  strict: true,
  schema: {
    type: "object" as const,
    additionalProperties: false,
    required: ["score", "title", "summary", "analysis"],
    properties: {
      score: { type: "number" },
      title: { type: "string" },
      summary: { type: "string" },
      analysis: { type: "string" },
    },
  },
}

// ============================================================================
// Request Schema
// ============================================================================

const RequestSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  collectedData: CollectedDataSchema.partial(),
  stream: z.boolean().optional().default(false),
})

function readEnvLocalValue(key: string) {
  try {
    const envPath = path.join(process.cwd(), ".env.local")
    if (!existsSync(envPath)) {
      return null
    }

    const lines = readFileSync(envPath, "utf8").split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const separatorIndex = trimmed.indexOf("=")
      if (separatorIndex === -1) {
        continue
      }

      const currentKey = trimmed.slice(0, separatorIndex).trim()
      if (currentKey !== key) {
        continue
      }

      let value = trimmed.slice(separatorIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      return value || null
    }
  } catch {
    return null
  }

  return null
}

// ============================================================================
// SIMPLE DETERMINISTIC EXTRACTION (No AI needed!)
// ============================================================================

/**
 * Extract teamMode from user message
 */
function extractTeamMode(message: string): "solo" | "team" | null {
  const lower = message.toLowerCase()
  if (/\b(solo|alone|just me|by myself|individual)\b/.test(lower)) {
    return "solo"
  }
  if (/\b(team|group|we|us|together|partners?)\b/.test(lower)) {
    return "team"
  }
  return null
}

/**
 * Extract profile path from user message
 */
function extractProfilePath(message: string): "linkedin" | "manual" | null {
  const lower = message.toLowerCase()
  if (/linkedin/.test(lower) || /import/.test(lower)) {
    return "linkedin"
  }
  if (/manual|tell you|myself|type/.test(lower)) {
    return "manual"
  }
  return null
}

/**
 * Extract hourly rate from user message
 * Handles: "$50-100", "50-100/hr", "€50-80", "£40-60", etc.
 */
function extractHourlyRate(message: string): {
  hourlyMin: number | null
  hourlyMax: number | null
  currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | null
} {
  // Detect currency from symbols
  let currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD" | null = null
  if (message.includes("$")) currency = "USD"
  else if (message.includes("€")) currency = "EUR"
  else if (message.includes("£")) currency = "GBP"

  // Extract numbers - look for patterns like "50-100", "$50-$100", "50 to 100"
  const rangeMatch = message.match(/(\d+)\s*[-–—to]+\s*(\d+)/)
  if (rangeMatch) {
    return {
      hourlyMin: parseInt(rangeMatch[1], 10),
      hourlyMax: parseInt(rangeMatch[2], 10),
      currency: currency || "USD", // Default to USD
    }
  }

  // Single number
  const singleMatch = message.match(/(\d+)/)
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10)
    return {
      hourlyMin: num,
      hourlyMax: null,
      currency: currency || "USD",
    }
  }

  return { hourlyMin: null, hourlyMax: null, currency: null }
}

/**
 * Extract engagement type from user message
 */
function extractEngagementType(message: string): ("full_time" | "part_time")[] | null {
  const lower = message.toLowerCase()
  const types: ("full_time" | "part_time")[] = []

  if (/full[- ]?time|full time/.test(lower)) {
    types.push("full_time")
  }
  if (/part[- ]?time|part time/.test(lower)) {
    types.push("part_time")
  }
  if (/both/.test(lower)) {
    return ["full_time", "part_time"]
  }

  return types.length > 0 ? types : null
}

/**
 * Extract remote preference from user message
 */
function extractRemotePreference(message: string): boolean | null {
  const lower = message.toLowerCase()

  if (/remote only|only remote|strictly remote|100% remote/.test(lower)) {
    return true
  }
  if (/remote/.test(lower) && !/on[- ]?site|hybrid|office/.test(lower)) {
    return true
  }
  if (/on[- ]?site|office|in[- ]?person|hybrid|either|both|open to/.test(lower)) {
    return false
  }

  return null
}

/**
 * Extract experience level from user message
 */
function extractExperienceLevel(
  message: string
): "intern_new_grad" | "entry" | "mid" | "senior" | "lead" | "director" | null {
  const lower = message.toLowerCase()

  if (/director|executive|c-level|cto|ceo|vp|vice president/.test(lower)) {
    return "director"
  }
  if (/lead|principal|staff|architect|head/.test(lower)) {
    return "lead"
  }
  if (/senior|sr\.?|expert|experienced/.test(lower)) {
    return "senior"
  }
  if (/mid[- ]?level|intermediate|moderate/.test(lower)) {
    return "mid"
  }
  if (/entry|junior|jr\.?|beginner/.test(lower)) {
    return "entry"
  }
  if (/intern|new grad|graduate|student|fresher/.test(lower)) {
    return "intern_new_grad"
  }

  return null
}

/**
 * Check if all required data is collected for profile analysis
 */
function isProfileComplete(data: Partial<CollectedData>): boolean {
  // For LinkedIn profiles: skills/experiences come from LinkedIn, we only need preferences
  if (data.profilePath === "linkedin") {
    return !!(
      data.teamMode &&
      (data.hourlyMin !== null || data.hourlyMax !== null) &&
      data.engagementTypes?.length &&
      data.remoteOnly !== null
    )
  }

  // For manual profiles: need skills, experiences, educations, experienceLevel too
  return !!(
    data.teamMode &&
    data.profilePath &&
    data.experienceLevel &&
    data.skills?.length &&
    data.experiences?.length &&
    data.educations?.length &&
    (data.hourlyMin !== null || data.hourlyMax !== null) &&
    data.engagementTypes?.length &&
    data.remoteOnly !== null
  )
}

/**
 * Extract skills from user message
 * Handles: comma-separated skills, "and" separated, etc.
 */
function extractSkills(message: string): { name: string }[] | null {
  // Don't extract from very short messages or navigation words
  if (message.length < 5) return null
  if (/^(yes|no|ok|sure|thanks|next|skip)$/i.test(message.trim())) return null

  // Split by common separators
  const parts = message
    .split(/[,;]|\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 50)

  if (parts.length > 0) {
    return parts.map((name) => ({ name }))
  }

  // Single skill (if message is reasonable length)
  if (message.trim().length >= 2 && message.trim().length <= 100) {
    return [{ name: message.trim() }]
  }

  return null
}

/**
 * Extract experience from user message
 * Looks for patterns like "Software Engineer at Google for 3 years" or "Senior Dev, Microsoft, 2020-2023"
 */
function extractExperience(message: string): ExperienceSchema[] | null {
  // Don't extract from very short messages
  if (message.length < 10) return null
  if (/^(yes|no|ok|sure|thanks|next|skip)$/i.test(message.trim())) return null

  // Look for "at" pattern: "Title at Company"
  const atMatch = message.match(/(.+?)\s+at\s+(.+?)(?:\s+for\s+(.+?))?(?:\.|,|$)/i)
  if (atMatch) {
    return [{
      title: atMatch[1].trim(),
      company: atMatch[2].trim(),
      startDate: null,
      endDate: null,
      highlights: atMatch[3] ? atMatch[3].trim() : null,
    }]
  }

  // Look for comma-separated: "Title, Company"
  const commaMatch = message.match(/^([^,]+),\s*([^,]+)(?:,\s*(.+))?$/i)
  if (commaMatch) {
    return [{
      title: commaMatch[1].trim(),
      company: commaMatch[2].trim(),
      startDate: null,
      endDate: null,
      highlights: commaMatch[3] ? commaMatch[3].trim() : null,
    }]
  }

  // If nothing matched but message is substantial, treat whole message as experience info
  if (message.trim().length >= 15) {
    return [{
      title: message.trim(),
      company: null,
      startDate: null,
      endDate: null,
      highlights: null,
    }]
  }

  return null
}

type ExperienceSchema = {
  title: string
  company: string | null
  startDate: string | null
  endDate: string | null
  highlights: string | null
}

type EducationSchema = {
  school: string
  degree: string | null
  field: string | null
  startYear: string | null
  endYear: string | null
}

/**
 * Extract education from user message
 * Looks for patterns like "BS Computer Science from MIT" or "Masters, Stanford, 2020"
 */
function extractEducation(message: string): EducationSchema[] | null {
  // Don't extract from very short messages
  if (message.length < 5) return null
  if (/^(yes|no|ok|sure|thanks|next|skip|none|no degree)$/i.test(message.trim())) return null

  // Look for "from" pattern: "Degree in Field from School"
  const fromMatch = message.match(/(.+?)\s+(?:from|at)\s+(.+?)(?:\s+in\s+(\d{4}))?(?:\.|,|$)/i)
  if (fromMatch) {
    const degreeField = fromMatch[1].trim()
    const inMatch = degreeField.match(/(.+?)\s+in\s+(.+)/i)
    return [{
      school: fromMatch[2].trim(),
      degree: inMatch ? inMatch[1].trim() : degreeField,
      field: inMatch ? inMatch[2].trim() : null,
      startYear: null,
      endYear: fromMatch[3] || null,
    }]
  }

  // Look for comma-separated: "Degree, School"
  const commaMatch = message.match(/^([^,]+),\s*([^,]+)(?:,\s*(.+))?$/i)
  if (commaMatch) {
    return [{
      school: commaMatch[2].trim(),
      degree: commaMatch[1].trim(),
      field: commaMatch[3] ? commaMatch[3].trim() : null,
      startYear: null,
      endYear: null,
    }]
  }

  // If nothing matched but message is substantial, treat as school name
  if (message.trim().length >= 3) {
    return [{
      school: message.trim(),
      degree: null,
      field: null,
      startYear: null,
      endYear: null,
    }]
  }

  return null
}

/**
 * Apply all extractors to update collected data from user message
 */
function updateCollectedData(
  currentData: Partial<CollectedData>,
  userMessage: string
): Partial<CollectedData> {
  const updated = { ...currentData }

  // Only extract if not already set
  if (!updated.teamMode) {
    const teamMode = extractTeamMode(userMessage)
    if (teamMode) updated.teamMode = teamMode
  }

  if (!updated.profilePath) {
    const profilePath = extractProfilePath(userMessage)
    if (profilePath) updated.profilePath = profilePath
  }

  if (updated.hourlyMin === null || updated.hourlyMin === undefined) {
    const rate = extractHourlyRate(userMessage)
    if (rate.hourlyMin !== null) {
      updated.hourlyMin = rate.hourlyMin
      updated.hourlyMax = rate.hourlyMax
      updated.currency = rate.currency
    }
  }

  if (!updated.engagementTypes?.length) {
    const engagement = extractEngagementType(userMessage)
    if (engagement) updated.engagementTypes = engagement
  }

  if (updated.remoteOnly === null || updated.remoteOnly === undefined) {
    const remote = extractRemotePreference(userMessage)
    if (remote !== null) updated.remoteOnly = remote
  }

  if (!updated.experienceLevel) {
    const level = extractExperienceLevel(userMessage)
    if (level) updated.experienceLevel = level
  }

  // Only extract skills if we're in manual path and don't have skills yet
  if (updated.profilePath === "manual" && !updated.skills?.length) {
    const skills = extractSkills(userMessage)
    if (skills) updated.skills = skills
  }

  // Extract experiences if manual path and don't have experiences yet
  if (updated.profilePath === "manual" && !updated.experiences?.length) {
    const experiences = extractExperience(userMessage)
    if (experiences) updated.experiences = experiences
  }

  // Extract education if manual path and don't have educations yet
  if (updated.profilePath === "manual" && !updated.educations?.length) {
    const educations = extractEducation(userMessage)
    if (educations) updated.educations = educations
  }

  return updated
}

// ============================================================================
// Agent Instructions
// ============================================================================

const CONVERSATIONAL_AGENT_INSTRUCTIONS = `You are a friendly, casual onboarding assistant for HireMePlz, a platform that helps freelancers find work.

## Your Personality
- Warm, approachable, and conversational
- Concise but not robotic
- No emojis
- Never be annoying or repetitive

## CRITICAL RULES
1. **ONE question per message** - never ask multiple questions
2. **Check the "ALREADY COLLECTED" section** - NEVER ask about those items
3. **Ask about the FIRST item in "STILL NEEDED"** - that's your only job

## LinkedIn Flow (profilePath: linkedin)
When LinkedIn data is fetched:
- Skills, experience, and education come FROM LinkedIn - DO NOT ask about them
- ONLY ask about: hourlyRate → engagementTypes → remoteOnly
- Summarize their profile briefly, then immediately ask about hourly rate

## Manual Flow (profilePath: manual)
Ask in this EXACT order (one at a time):
1. experienceLevel - "What's your experience level?" (entry/mid/senior/lead/director)
2. skills - "What are your main skills?" (ask for specific technologies, frameworks, languages)
3. experiences - "Tell me about your most recent job - what was your title and company?"
4. education - "What's your highest education? School and degree/field?"
5. hourlyRate - "What's your typical hourly rate range?"
6. engagementTypes - "Are you looking for full-time, part-time, or both?"
7. remoteOnly - "Do you prefer remote-only work, or are you open to on-site?"

## Response Format
- 1-2 sentences acknowledging their input
- Then ask the ONE question for the first missing item
- Sound human, not like a form`

const PROFILE_ANALYSIS_INSTRUCTIONS = `You are a professional career advisor. Analyze the user's freelancer profile and provide comprehensive feedback.

## Response Format
Return valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "title": "Profile Analysis",
  "summary": "<3-5 word summary like 'Strong Senior Developer Profile'>",
  "analysis": "<Full markdown analysis with proper ### headings>"
}

## Analysis Markdown Format - USE EXACT SYNTAX
The "analysis" field MUST use proper markdown heading syntax with ### prefix:

\`\`\`markdown
### Overview
Brief 2-3 sentence overview of the profile.

### Strengths
- First strength point
- Second strength point
- Third strength point

### Areas for Improvement
- First improvement area
- Second improvement area

### Market Insights
- Rate recommendations based on experience
- In-demand skills to consider

### Next Steps
1. First action item
2. Second action item
3. Third action item
\`\`\`

IMPORTANT: You MUST include the "### " prefix (hash-hash-hash-space) before each heading. Without it, headings won't render correctly.

Be encouraging but honest.`

// ============================================================================
// LinkedIn Scraping Helpers
// ============================================================================

const POLL_INTERVAL_MS = 5_000
const MAX_TOTAL_POLLS = 60

const LINKEDIN_URL_RE = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i

function extractLinkedInUrl(message: string): string | null {
  const match = message.match(LINKEDIN_URL_RE)
  return match ? match[0] : null
}

// ============================================================================
// API Route
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = RequestSchema.safeParse(json)

    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "invalid_payload",
            message: "Invalid request payload",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const { message, conversationHistory, collectedData, stream } = parsed.data

    const apiKey =
      readEnvLocalValue("OPENAI_API_KEY") ?? process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not configured in environment")
      return Response.json(
        {
          error: {
            code: "configuration_error",
            message: "OpenAI API key is not configured",
          },
        },
        { status: 500 }
      )
    }

    process.env.OPENAI_API_KEY = apiKey

    const conversationContext = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")

    // Helper to show what's collected vs missing
    const getDataStatus = (data: Partial<CollectedData>) => {
      const filled: string[] = []
      const missing: string[] = []
      const isLinkedIn = data.profilePath === "linkedin"
      const isManual = data.profilePath === "manual"

      if (data.teamMode) filled.push(`teamMode: ${data.teamMode}`)
      else missing.push("teamMode")

      if (data.profilePath) filled.push(`profilePath: ${data.profilePath}`)
      else missing.push("profilePath")

      // For LinkedIn: these come from profile, don't ask
      if (isLinkedIn) {
        if (data.experienceLevel) filled.push(`experienceLevel: ${data.experienceLevel} (from LinkedIn)`)
        else filled.push("experienceLevel: inferred from LinkedIn")

        if (data.skills?.length) filled.push(`skills: ${data.skills.map(s => s.name).join(", ")} (from LinkedIn)`)
        else filled.push("skills: from LinkedIn profile")

        if (data.experiences?.length) filled.push(`experiences: ${data.experiences.length} positions (from LinkedIn)`)
        else filled.push("experiences: from LinkedIn profile")

        if (data.educations?.length) filled.push(`educations: ${data.educations.length} entries (from LinkedIn)`)
        else filled.push("educations: from LinkedIn profile")
      } else if (isManual) {
        // Manual path: need to ask all of these
        if (data.experienceLevel) filled.push(`experienceLevel: ${data.experienceLevel}`)
        else missing.push("experienceLevel")

        if (data.skills?.length) filled.push(`skills: ${data.skills.map(s => s.name).join(", ")}`)
        else missing.push("skills (ask for specific technical skills, frameworks, languages)")

        if (data.experiences?.length) filled.push(`experiences: ${data.experiences.map(e => `${e.title} at ${e.company}`).join("; ")}`)
        else missing.push("experiences (ask for recent job: title, company name, duration)")

        if (data.educations?.length) filled.push(`educations: ${data.educations.map(e => `${e.degree} from ${e.school}`).join("; ")}`)
        else missing.push("education (ask for highest degree, school name, field of study)")
      }

      // These ALWAYS need to be asked (LinkedIn doesn't have them)
      if (data.hourlyMin !== null && data.hourlyMin !== undefined)
        filled.push(`hourlyRate: $${data.hourlyMin}${data.hourlyMax ? `-${data.hourlyMax}` : "+"}`)
      else missing.push("hourlyRate")

      if (data.engagementTypes?.length) filled.push(`engagementTypes: ${data.engagementTypes.join(", ")}`)
      else missing.push("engagementTypes (full-time, part-time, or both)")

      if (data.remoteOnly !== null && data.remoteOnly !== undefined)
        filled.push(`remoteOnly: ${data.remoteOnly}`)
      else missing.push("remoteOnly (remote only or open to on-site)")

      return { filled, missing }
    }

    // Create prompt dynamically with current data state
    const createPrompt = (currentData: Partial<CollectedData>, extraContext?: string) => {
      const { filled, missing } = getDataStatus(currentData)
      return `
## ALREADY COLLECTED (DO NOT ask about these again):
${filled.length > 0 ? filled.join("\n") : "Nothing yet"}

## STILL NEEDED (ask about the FIRST one only):
${missing.length > 0 ? missing.join(", ") : "ALL DONE - profile is complete!"}

## Conversation so far:
${conversationContext}

## User's new message:
${message}
${extraContext ? `\n## Additional context:\n${extraContext}` : ""}

Respond naturally. Ask about the FIRST missing item only. NEVER re-ask about already collected data.`
    }

    if (stream) {
      const encoder = new TextEncoder()

      const readableStream = new ReadableStream({
        async start(controller) {
          const sseEmit = (event: object) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            )
          }

          async function streamAgent(
            agent: Agent,
            prompt: string
          ): Promise<string> {
            let text = ""
            const result = await run(agent, prompt, { stream: true })
            const textStream = result.toTextStream({
              compatibleWithNodeStreams: false,
            })
            for await (const chunk of textStream) {
              text += chunk
              sseEmit({ type: "text", content: chunk })
            }
            await result.completed
            return text
          }

          const linkedInUrl = extractLinkedInUrl(message)
          let fullConversationalResponse = ""

          // Start with current data and update with user's message
          let updatedData: Partial<CollectedData> = updateCollectedData(
            { ...collectedData },
            message
          )

          try {
            if (linkedInUrl) {
              // ── Phase 1: Stream filler text ──────────────────────────
              const fillerAgent = new Agent({
                name: "Conversational Assistant",
                instructions:
                  CONVERSATIONAL_AGENT_INSTRUCTIONS +
                  `\n\nIMPORTANT: The user just provided their LinkedIn profile URL. Acknowledge it briefly and let them know you're fetching their profile data now. Keep your response to 1-2 short sentences.`,
                model: "gpt-4.1-nano",
              })
              fullConversationalResponse += await streamAgent(
                fillerAgent,
                createPrompt(updatedData)
              )

              // ── Phase 2: Trigger scrape + poll ──────────────────────
              sseEmit({
                type: "tool_call",
                name: "linkedin_scrape",
                status: "started",
              })

              const { runId } = await triggerScrapeUtil(linkedInUrl)

              let scrapeResult: Awaited<
                ReturnType<typeof getScrapeStatusUtil>
              > | null = null

              for (let i = 0; i < MAX_TOTAL_POLLS; i++) {
                const status = await getScrapeStatusUtil(runId)

                if (
                  status.status === "completed" ||
                  status.status === "failed"
                ) {
                  scrapeResult = status
                  break
                }

                sseEmit({ type: "tool_status", elapsed: (i + 1) * 5 })
                await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
              }

              if (!scrapeResult) {
                scrapeResult = {
                  status: "failed" as const,
                  error: "Scraping timed out",
                }
              }

              // ── Phase 3: Handle results ────────────────────────────
              if (scrapeResult.status === "completed") {
                sseEmit({
                  type: "tool_call",
                  name: "linkedin_scrape",
                  status: "completed",
                })

                const profile = scrapeResult.profile

                // DIRECTLY populate data from LinkedIn (no AI needed!)
                updatedData = {
                  ...updatedData,
                  profilePath: "linkedin",
                  linkedinUrl: profile.linkedinUrl || linkedInUrl,
                  experienceLevel: profile.experienceLevel || updatedData.experienceLevel,
                  skills: profile.skills?.length
                    ? profile.skills.map((s) => ({ name: s.name }))
                    : updatedData.skills,
                  experiences: profile.experiences?.length
                    ? profile.experiences.map((e) => ({
                        title: e.title,
                        company: e.company,
                        startDate: e.startDate,
                        endDate: e.endDate,
                        highlights: e.highlights,
                      }))
                    : updatedData.experiences,
                  educations: profile.educations?.length
                    ? profile.educations.map((e) => ({
                        school: e.school,
                        degree: e.degree,
                        field: e.field,
                        startYear: e.startYear,
                        endYear: e.endYear,
                      }))
                    : updatedData.educations,
                }

                const profileJson = JSON.stringify(profile, null, 2)

                const summaryAgent = new Agent({
                  name: "Conversational Assistant",
                  instructions: CONVERSATIONAL_AGENT_INSTRUCTIONS,
                  model: "gpt-4.1-nano",
                })

                // Use createPrompt with UPDATED data after LinkedIn extraction
                const summaryPrompt = createPrompt(
                  updatedData,
                  `LinkedIn profile fetched successfully:\n${profileJson}\n\nIMPORTANT: LinkedIn provides skills and experience - DO NOT ask about those. Summarize their profile in 1-2 sentences (name, headline, notable skills/experience), then ask: "What's your typical hourly rate range?"`
                )

                fullConversationalResponse += "\n\n"
                sseEmit({ type: "text", content: "\n\n" })
                fullConversationalResponse += await streamAgent(
                  summaryAgent,
                  summaryPrompt
                )
              } else {
                sseEmit({
                  type: "tool_call",
                  name: "linkedin_scrape",
                  status: "failed",
                })

                const errorAgent = new Agent({
                  name: "Conversational Assistant",
                  instructions: CONVERSATIONAL_AGENT_INSTRUCTIONS,
                  model: "gpt-4.1-nano",
                })

                const errorPrompt = createPrompt(
                  updatedData,
                  `LinkedIn scrape failed: "${scrapeResult.error}". Apologize briefly and ask them to try again or set up manually.`
                )

                fullConversationalResponse += "\n\n"
                sseEmit({ type: "text", content: "\n\n" })
                fullConversationalResponse += await streamAgent(
                  errorAgent,
                  errorPrompt
                )
              }
            } else {
              // ── Normal flow (no LinkedIn URL) ───────────────────────
              const conversationalAgent = new Agent({
                name: "Conversational Assistant",
                instructions: CONVERSATIONAL_AGENT_INSTRUCTIONS,
                model: "gpt-4.1-nano",
              })
              fullConversationalResponse += await streamAgent(
                conversationalAgent,
                createPrompt(updatedData)
              )
            }

            // ── Check if profile is complete ────────────────────────
            const isComplete = isProfileComplete(updatedData)

            // Emit final data
            sseEmit({
              type: "final",
              collectedData: updatedData,
              isComplete,
            })

            // ── Profile Analysis (when complete) ────────────────────
            if (isComplete) {
              sseEmit({ type: "analysis_started" })

              const profileAnalysisPrompt = `
Analyze this freelancer profile and provide comprehensive feedback:

Profile Data:
${JSON.stringify(updatedData, null, 2)}

Provide a score (0-100), brief summary, and detailed markdown analysis.`

              const profileAnalysisAgent = new Agent({
                name: "Profile Analyst",
                instructions: PROFILE_ANALYSIS_INSTRUCTIONS,
                model: "gpt-4.1-mini",
                outputType: ProfileAnalysisJsonSchema,
              })

              try {
                const reasoningStartTime = Date.now()
                sseEmit({ type: "reasoning_started" })

                const analysisResult = await run(
                  profileAnalysisAgent,
                  profileAnalysisPrompt,
                  { stream: true }
                )

                const textStream = analysisResult.toTextStream({
                  compatibleWithNodeStreams: false,
                })

                for await (const chunk of textStream) {
                  if (chunk) {
                    sseEmit({ type: "reasoning_chunk", content: chunk })
                  }
                }

                await analysisResult.completed

                const reasoningDuration = Math.round(
                  (Date.now() - reasoningStartTime) / 1000
                )
                sseEmit({
                  type: "reasoning_completed",
                  duration: reasoningDuration,
                })

                if (analysisResult.finalOutput) {
                  const analysis = ProfileAnalysisResponseSchema.parse(
                    analysisResult.finalOutput
                  ) as ProfileAnalysisResponse

                  sseEmit({
                    type: "profile_analysis",
                    score: analysis.score,
                    title: analysis.title,
                    summary: analysis.summary,
                    analysis: analysis.analysis,
                  })
                }
              } catch (analysisError) {
                console.error("Profile analysis error:", analysisError)
                sseEmit({
                  type: "analysis_error",
                  message: "Could not generate profile analysis",
                })
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)
            sseEmit({
              type: "error",
              message:
                error instanceof Error ? error.message : "Streaming failed",
            })
            controller.close()
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // Non-streaming response (simplified)
    let messageText = ""
    const linkedInUrl = extractLinkedInUrl(message)
    let updatedData: Partial<CollectedData> = updateCollectedData(
      { ...collectedData },
      message
    )

    if (linkedInUrl) {
      messageText = "Thanks for sharing your LinkedIn profile! Let me fetch your details..."

      const { runId } = await triggerScrapeUtil(linkedInUrl)
      let scrapeResult: Awaited<ReturnType<typeof getScrapeStatusUtil>> | null =
        null
      for (let i = 0; i < MAX_TOTAL_POLLS; i++) {
        const status = await getScrapeStatusUtil(runId)
        if (status.status === "completed" || status.status === "failed") {
          scrapeResult = status
          break
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }

      if (scrapeResult?.status === "completed") {
        const profile = scrapeResult.profile
        updatedData = {
          ...updatedData,
          profilePath: "linkedin",
          linkedinUrl: profile.linkedinUrl || linkedInUrl,
          experienceLevel: profile.experienceLevel,
          skills: profile.skills?.map((s) => ({ name: s.name })),
          experiences: profile.experiences?.map((e) => ({
            title: e.title,
            company: e.company,
            startDate: e.startDate,
            endDate: e.endDate,
            highlights: e.highlights,
          })),
          educations: profile.educations?.map((e) => ({
            school: e.school,
            degree: e.degree,
            field: e.field,
            startYear: e.startYear,
            endYear: e.endYear,
          })),
        }
        messageText += `\n\nI found your profile! What's your typical hourly rate range?`
      } else {
        messageText += `\n\nSorry, I couldn't fetch your profile. Would you like to try again or set up manually?`
      }
    } else {
      const conversationalAgent = new Agent({
        name: "Conversational Assistant",
        instructions: CONVERSATIONAL_AGENT_INSTRUCTIONS,
        model: "gpt-4.1-nano",
      })
      const result = await run(conversationalAgent, createPrompt(updatedData))
      messageText =
        typeof result.finalOutput === "string"
          ? result.finalOutput
          : String(result.finalOutput ?? "")
    }

    const isComplete = isProfileComplete(updatedData)

    return Response.json({
      message: messageText,
      collectedData: updatedData,
      isComplete,
    })
  } catch (error) {
    console.error("Onboarding chat error:", error)

    if (error instanceof Error) {
      return Response.json(
        {
          error: {
            code: "chat_error",
            message: error.message,
          },
        },
        { status: 500 }
      )
    }

    return Response.json(
      {
        error: {
          code: "chat_error",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    )
  }
}
