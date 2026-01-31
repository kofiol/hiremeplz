import { NextRequest } from "next/server"
import { Agent, run } from "@openai/agents"
import { z } from "zod"
import { verifyAuth } from "@/lib/auth.server"
import { getSupabaseAdmin } from "@/lib/auth.server"

// ============================================================================
// Request Schema
// ============================================================================

const RequestSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
})

// ============================================================================
// Profile Fetcher
// ============================================================================

async function fetchUserContext(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin()

  const [profileRes, skillsRes, experiencesRes, preferencesRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, headline, about")
        .eq("user_id", userId)
        .maybeSingle<{
          display_name: string | null
          headline: string | null
          about: string | null
        }>(),
      supabase
        .from("user_skills")
        .select("name, level, years")
        .eq("user_id", userId)
        .returns<{ name: string; level: number; years: number | null }[]>(),
      supabase
        .from("user_experiences")
        .select("title, company, start_date, end_date, highlights")
        .eq("user_id", userId)
        .returns<
          {
            title: string
            company: string | null
            start_date: string | null
            end_date: string | null
            highlights: string | null
          }[]
        >(),
      supabase
        .from("user_preferences")
        .select("hourly_min, hourly_max, currency")
        .eq("user_id", userId)
        .maybeSingle<{
          hourly_min: number | null
          hourly_max: number | null
          currency: string
        }>(),
    ])

  const sections: string[] = []

  const profile = profileRes.data
  if (profile?.display_name) sections.push(`Name: ${profile.display_name}`)
  if (profile?.headline) sections.push(`Headline: ${profile.headline}`)
  if (profile?.about) sections.push(`About: ${profile.about}`)

  const skills = skillsRes.data ?? []
  if (skills.length > 0) {
    const skillList = skills
      .map((s) => {
        let str = s.name
        if (s.years) str += ` (${s.years}y)`
        return str
      })
      .join(", ")
    sections.push(`Skills: ${skillList}`)
  }

  const experiences = experiencesRes.data ?? []
  if (experiences.length > 0) {
    const expList = experiences
      .map((e) => {
        let str = e.title
        if (e.company) str += ` at ${e.company}`
        if (e.start_date || e.end_date) {
          str += ` (${e.start_date ?? "?"} - ${e.end_date ?? "present"})`
        }
        if (e.highlights) str += `\n  Highlights: ${e.highlights}`
        return str
      })
      .join("\n")
    sections.push(`Experience:\n${expList}`)
  }

  const preferences = preferencesRes.data
  if (preferences && (preferences.hourly_min || preferences.hourly_max)) {
    sections.push(
      `Rate: ${preferences.currency} ${preferences.hourly_min ?? "?"}–${preferences.hourly_max ?? "?"}/hr`
    )
  }

  return sections.length > 0
    ? sections.join("\n\n")
    : "No profile data available."
}

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `You are the HireMePlz copilot — a sharp, concise assistant that helps freelancers win more work.

## Personality
- Direct, no fluff. Like a smart colleague who gets to the point.
- No emojis. No excessive enthusiasm.
- Warm but professional.

## What you can help with
- Reviewing and improving proposals/cover letters
- Analyzing job postings and suggesting approach angles
- Polishing profile copy (headlines, about sections, skill descriptions)
- Interview prep tips for specific roles
- Rate negotiation advice
- General freelancing strategy

## Rules
- Use the freelancer's profile data when relevant — reference their actual skills and experience
- Never fabricate experience or projects the user doesn't have
- Keep responses focused and actionable
- Use markdown formatting when it improves readability (headers, lists, bold)
- If the user asks something outside freelancing scope, help if you can but keep it brief`

// ============================================================================
// API Route
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const { userId } = await verifyAuth(authHeader)

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

    const { message, conversationHistory } = parsed.data

    // Fetch user profile context
    const profileContext = await fetchUserContext(userId)

    // Build conversation
    const historyText = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n\n")

    const userPrompt = [
      `## Freelancer Profile\n${profileContext}`,
      historyText ? `## Conversation History\n${historyText}` : "",
      `## User Message\n${message}`,
    ]
      .filter(Boolean)
      .join("\n\n")

    const agent = new Agent({
      name: "HireMePlz Copilot",
      instructions: SYSTEM_PROMPT,
      model: "gpt-5-mini",
    })

    // Stream response
    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const result = await run(agent, userPrompt, { stream: true })
          const textStream = result.toTextStream({
            compatibleWithNodeStreams: false,
          })

          for await (const chunk of textStream) {
            if (request.signal.aborted) break
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`
              )
            )
          }

          if (!request.signal.aborted) {
            await result.completed
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Overview chat streaming error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Streaming failed",
              })}\n\n`
            )
          )
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
  } catch (error) {
    console.error("Overview chat error:", error)

    if (
      error instanceof Error &&
      (error.message === "Missing or invalid Authorization header" ||
        error.message === "Unauthorized")
    ) {
      return Response.json(
        { error: { code: "unauthorized", message: "Unauthorized" } },
        { status: 401 }
      )
    }

    return Response.json(
      {
        error: {
          code: "chat_error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      },
      { status: 500 }
    )
  }
}
