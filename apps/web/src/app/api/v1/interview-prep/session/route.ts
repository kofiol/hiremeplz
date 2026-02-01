import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin, verifyAuth } from "@/lib/auth.server"
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit.server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const { userId, teamId } = await verifyAuth(authHeader)

    const rl = checkRateLimit(userId, RATE_LIMITS.interviewPrepSession)
    if (!rl.allowed) return rateLimitResponse(rl)

    const supabaseAdmin = getSupabaseAdmin()

    const body = await request.json()
    const interviewType = body.interviewType as string
    const context = typeof body.context === "string" ? body.context.slice(0, 2000) : null

    if (
      !interviewType ||
      !["client_discovery", "technical", "rate_negotiation", "behavioral"].includes(interviewType)
    ) {
      return NextResponse.json(
        { error: { code: "invalid_type", message: "Invalid interview type" } },
        { status: 400 }
      )
    }

    // Fetch interview prep settings
    const { data: interviewSettings } = await supabaseAdmin
      .from("user_agent_settings")
      .select("settings_json")
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .eq("agent_type", "interview_prep")
      .maybeSingle<{
        settings_json: {
          difficulty_level?: string
          session_length?: number
          auto_save?: boolean
        } | null
      }>()

    const difficultyLevel = interviewSettings?.settings_json?.difficulty_level ?? "medium"
    const sessionLengthMinutes = interviewSettings?.settings_json?.session_length ?? 10

    // Create interview session record with settings in metrics
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("interview_sessions")
      .insert({
        team_id: teamId,
        user_id: userId,
        interview_type: interviewType,
        status: "pending",
        context,
        metrics: {
          difficulty_level: difficultyLevel,
          session_length: sessionLengthMinutes,
        },
      })
      .select("id")
      .single<{ id: string }>()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { code: "session_create_failed", message: "Failed to create session" } },
        { status: 500 }
      )
    }

    // Fetch ephemeral token from OpenAI Realtime API
    const realtimeResponse = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-realtime-mini-2025-10-06",
          voice: "alloy",
          modalities: ["audio", "text"],
          input_audio_transcription: {
            model: "whisper-1",
          },
        }),
      }
    )

    if (!realtimeResponse.ok) {
      const errText = await realtimeResponse.text()
      console.error("OpenAI Realtime session error:", errText)
      return NextResponse.json(
        { error: { code: "realtime_failed", message: "Failed to create realtime session" } },
        { status: 502 }
      )
    }

    const realtimeData = await realtimeResponse.json()

    return NextResponse.json({
      sessionId: session.id,
      clientSecret: realtimeData.client_secret?.value ?? null,
      interviewType,
      difficultyLevel,
      sessionLength: sessionLengthMinutes,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
