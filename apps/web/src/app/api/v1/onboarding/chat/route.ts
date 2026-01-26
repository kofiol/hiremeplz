import { NextRequest } from "next/server"
import { Agent, run } from "@openai/agents"
import { z } from "zod"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

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

// Data extraction response schema
const DataExtractionResponseSchema = z.object({
  collectedData: CollectedDataSchema.describe(
    "All data collected so far, merged with any new data from the confirmed conversation. Keep all previously collected data."
  ),
  isComplete: z
    .boolean()
    .describe(
      "True only when ALL required fields have been collected: teamMode, profilePath (and corresponding URL if applicable), and at least some preferences (hourlyMin or fixedBudgetMin, currency)"
    ),
})

type DataExtractionResponse = z.infer<typeof DataExtractionResponseSchema>

const nullableString = { type: ["string", "null"] } as const
const nullableNumber = { type: ["number", "null"] } as const
const nullableBoolean = { type: ["boolean", "null"] } as const
const nullableEnum = (values: string[]) => ({
  anyOf: [{ type: "string", enum: values }, { type: "null" }],
})

const DataExtractionJsonSchema = {
  type: "json_schema" as const,
  name: "DataExtractionResponse",
  strict: true,
  schema: {
    type: "object" as const,
    additionalProperties: false,
    required: ["collectedData", "isComplete"],
    properties: {
      collectedData: {
        type: "object" as const,
        additionalProperties: false,
        required: [
          "teamMode",
          "profilePath",
          "linkedinUrl",
          "upworkUrl",
          "portfolioUrl",
          "experienceLevel",
          "skills",
          "experiences",
          "educations",
          "hourlyMin",
          "hourlyMax",
          "fixedBudgetMin",
          "currency",
          "preferredProjectLengthMin",
          "preferredProjectLengthMax",
          "timeZones",
          "engagementTypes",
          "remoteOnly",
        ],
        properties: {
          teamMode: nullableEnum(["solo", "team"]),
          profilePath: nullableEnum(["linkedin", "upwork", "cv", "portfolio", "manual"]),
          linkedinUrl: nullableString,
          upworkUrl: nullableString,
          portfolioUrl: nullableString,
          experienceLevel: nullableEnum([
            "intern_new_grad",
            "entry",
            "mid",
            "senior",
            "lead",
            "director",
          ]),
          skills: {
            anyOf: [
              {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                  },
                },
              },
              { type: "null" },
            ],
          },
          experiences: {
            anyOf: [
              {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["title", "company", "startDate", "endDate", "highlights"],
                  properties: {
                    title: { type: "string" },
                    company: nullableString,
                    startDate: nullableString,
                    endDate: nullableString,
                    highlights: nullableString,
                  },
                },
              },
              { type: "null" },
            ],
          },
          educations: {
            anyOf: [
              {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["school", "degree", "field", "startYear", "endYear"],
                  properties: {
                    school: { type: "string" },
                    degree: nullableString,
                    field: nullableString,
                    startYear: nullableString,
                    endYear: nullableString,
                  },
                },
              },
              { type: "null" },
            ],
          },
          hourlyMin: nullableNumber,
          hourlyMax: nullableNumber,
          fixedBudgetMin: nullableNumber,
          currency: nullableEnum(["USD", "EUR", "GBP", "CAD", "AUD"]),
          preferredProjectLengthMin: nullableNumber,
          preferredProjectLengthMax: nullableNumber,
          timeZones: {
            anyOf: [
              { type: "array", items: { type: "string" } },
              { type: "null" },
            ],
          },
          engagementTypes: {
            anyOf: [
              {
                type: "array",
                items: {
                  type: "string",
                  enum: ["full_time", "part_time", "internship"],
                },
              },
              { type: "null" },
            ],
          },
          remoteOnly: nullableBoolean,
        },
      },
      isComplete: { type: "boolean" },
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
// Agent Instructions
// ============================================================================

const CONVERSATIONAL_AGENT_INSTRUCTIONS = `You are a friendly onboarding assistant for HireMePlz, a platform that helps freelancers find jobs.
Your job is to have a natural conversation to collect user preferences.

## CRITICAL: Validate User Responses
Before accepting ANY user response, you MUST:
1. Check if the response is complete and makes sense
2. If the response is incomplete, unclear, or too short (less than 3 characters for important answers), ask for clarification
3. Never accept single characters, random letters, or gibberish as valid answers
4. If someone says "I lead a team of" but doesn't specify the size, ask "How many people are on your team?"

Examples of INVALID responses you should ask to clarify:
- "o" → Ask: "I didn't catch that. Could you tell me if you're working solo or leading a team?"
- "ll" → Ask: "I'm not sure I understood. Could you please provide a clearer response?"
- "I lead a team of" → Ask: "Great! How many people are on your team?"
- Random characters → Ask: "I couldn't understand that. Could you please rephrase?"

## Guidelines
- Be concise and professional
- No emojis
- Ask ONE question at a time
- Use short sentences so users can answer quickly
- Be encouraging and make the process feel quick
- Just respond naturally - don't output any JSON or structured data
- ALWAYS confirm you understood before moving to the next question

## Conversation Flow
1. **Start**: Greet warmly and ask if they're a solo freelancer or leading a small team
2. **Profile Setup**: Ask how they'd like to set up their profile:
   - Import from LinkedIn (ask for URL)
   - Import from Upwork (ask for URL)
   - Add a portfolio link (ask for URL)
   - Set up manually (ask about experience level, skills, work history, education)
3. **Preferences**: Ask about their work preferences:
   - Hourly rate range (min/max in their preferred currency)
   - Fixed project budget minimum
   - Preferred currency (USD, EUR, GBP, CAD, AUD)
   - Preferred project length (days)
   - Time zones they can work in
   - Engagement types (full-time, part-time, internship)
   - Remote only preference
4. **Wrap Up**: When you have enough info, summarize and confirm

## Example Responses
User: "solo"
You: "Got it, you're working solo. Now, how would you like to set up your profile? You can import from LinkedIn, Upwork, add a portfolio link, or set up manually."

User: "team"
You: "Great, you lead a team! How many people are on your team, including yourself?"

User: "manual"
You: "Perfect, let's set up your profile manually. What's your experience level? Are you entry-level, mid-level, senior, or in a leadership role?"

User: "50-75"
You: "Got it, $50-75 per hour. What currency is that in - USD, EUR, GBP, CAD, or AUD?"

## Important
- Keep track of what's been discussed in the conversation history
- Don't repeat questions that have already been answered with VALID responses
- If user wants to skip optional fields, that's okay - acknowledge and move on
- ALWAYS validate before accepting - if something seems incomplete, ask for clarification`

const DATA_EXTRACTION_INSTRUCTIONS = `You are a data extraction agent. Your ONLY job is to extract structured data from CONFIRMED conversation exchanges.

IMPORTANT: You are "blind" - you only see what the conversational agent has confirmed. You should ONLY extract data from clear, confirmed statements in the conversation where the assistant acknowledged the information.

## Rules
- ALWAYS preserve all previously collected data
- Only update fields when the conversation shows CLEAR, CONFIRMED information
- If the conversational agent asked for clarification, do NOT extract data from the incomplete response
- Set isComplete to true ONLY when you have: teamMode, profilePath (with URL if needed), and at least some rate/budget preferences (hourlyMin or fixedBudgetMin + currency)

## What to Extract
ONLY extract when you see the assistant confirming/acknowledging like:
- "Got it, you're working solo" → teamMode: "solo"
- "Great, you lead a team!" → teamMode: "team"
- "Perfect, let's set up manually" → profilePath: "manual"
- "Got it, $50-75 per hour" → hourlyMin: 50, hourlyMax: 75

## What NOT to Extract
- Incomplete user responses that the assistant asked to clarify
- Random characters or gibberish
- Anything where the assistant responded with "I didn't catch that" or "Could you please rephrase"
- User responses that weren't acknowledged/confirmed by the assistant

## Current Data
Preserve ALL existing data and only add/update based on clearly confirmed information in the conversation.`

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

    // Verify API key is configured
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

    // Build conversation context
    const conversationContext = conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n")

    const conversationalPrompt = `
Conversation so far:
${conversationContext}

User's new message: ${message}

Respond naturally to continue the onboarding conversation. Remember to validate the user's response - if it's incomplete or unclear, ask for clarification.`

    // Create conversational agent
    const conversationalAgent = new Agent({
      name: "Conversational Assistant",
      instructions: CONVERSATIONAL_AGENT_INSTRUCTIONS,
      model: "gpt-4.1-nano",
    })

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder()

      // Run conversational agent with streaming
      const conversationalResult = await run(conversationalAgent, conversationalPrompt, { stream: true })

      const readableStream = new ReadableStream({
        async start(controller) {
          let fullConversationalResponse = ""

          try {
            // Stream the conversational response
            const textStream = conversationalResult.toTextStream({ compatibleWithNodeStreams: false })

            for await (const chunk of textStream) {
              fullConversationalResponse += chunk
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`)
              )
            }

            // Wait for conversational agent to complete
            await conversationalResult.completed

            // Now run data extraction AFTER conversational agent completes
            // The extraction agent only sees the CONFIRMED conversation
            const fullConversation = `${conversationContext}
user: ${message}
assistant: ${fullConversationalResponse}`

            const dataExtractionPrompt = `
Current collected data (preserve all of this):
${JSON.stringify(collectedData, null, 2)}

Full conversation with the assistant's response:
${fullConversation}

Extract ONLY data that the assistant has clearly confirmed/acknowledged. If the assistant asked for clarification, do NOT extract from the user's unclear response.`

            const dataExtractionAgent = new Agent({
              name: "Data Extraction Agent",
              instructions: DATA_EXTRACTION_INSTRUCTIONS,
              model: "gpt-4.1-nano",
              outputType: DataExtractionJsonSchema,
            })

            const dataResult = await run(dataExtractionAgent, dataExtractionPrompt)

            if (dataResult.finalOutput) {
              const extracted = DataExtractionResponseSchema.parse(dataResult.finalOutput) as DataExtractionResponse

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "final",
                    collectedData: extracted.collectedData,
                    isComplete: extracted.isComplete,
                  })}\n\n`
                )
              )
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: error instanceof Error ? error.message : "Streaming failed",
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
    }

    // Non-streaming response: run conversational agent first, then extraction
    const conversationalResult = await run(conversationalAgent, conversationalPrompt)

    const messageText = typeof conversationalResult.finalOutput === "string"
      ? conversationalResult.finalOutput
      : String(conversationalResult.finalOutput ?? "")

    // Build full conversation with the assistant's response
    const fullConversation = `${conversationContext}
user: ${message}
assistant: ${messageText}`

    const dataExtractionPrompt = `
Current collected data (preserve all of this):
${JSON.stringify(collectedData, null, 2)}

Full conversation with the assistant's response:
${fullConversation}

Extract ONLY data that the assistant has clearly confirmed/acknowledged. If the assistant asked for clarification, do NOT extract from the user's unclear response.`

    const dataExtractionAgent = new Agent({
      name: "Data Extraction Agent",
      instructions: DATA_EXTRACTION_INSTRUCTIONS,
      model: "gpt-4.1-nano",
      outputType: DataExtractionJsonSchema,
    })

    const dataResult = await run(dataExtractionAgent, dataExtractionPrompt)

    let extractedData = collectedData
    let isComplete = false

    if (dataResult.finalOutput) {
      const extracted = DataExtractionResponseSchema.parse(dataResult.finalOutput) as DataExtractionResponse
      extractedData = extracted.collectedData
      isComplete = extracted.isComplete
    }

    return Response.json({
      message: messageText,
      collectedData: extractedData,
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
