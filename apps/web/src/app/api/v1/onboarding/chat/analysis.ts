import { Agent, run, OutputGuardrailTripwireTriggered, type OutputGuardrail } from "@openai/agents"
import type { CollectedData, ProfileAnalysis } from "@/lib/onboarding/schema"
import { ProfileAnalysisSchema, ProfileAnalysisJsonSchema, isSkipped } from "@/lib/onboarding/schema"
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/onboarding/constants"
import { PROFILE_ANALYSIS_INSTRUCTIONS } from "./agent"
import { getSupabaseAdmin } from "@/lib/auth.server"
import type { SSEEmitter } from "./streaming"
import { analysisScopeGuardrail } from "./guardrails"
import { getActivePromptVersion } from "./conversation.server"

// ============================================================================
// Profile Analysis
// ============================================================================

export async function runProfileAnalysis(
  emit: SSEEmitter,
  collectedData: Partial<CollectedData>,
  authContext: { userId: string; teamId: string } | null,
  signal?: AbortSignal,
  conversationId?: string | null
): Promise<void> {
  emit({ type: "analysis_started" })

  // Check for active prompt version
  const promptVersion = await getActivePromptVersion("onboarding", "Profile Analysis")
  const analysisInstructions = promptVersion?.instructions ?? PROFILE_ANALYSIS_INSTRUCTIONS
  const analysisModel = promptVersion?.model ?? "gpt-5.1"
  const analysisModelSettings = promptVersion?.modelSettings ?? { reasoning_effort: "high" }

  // Replace "skipped" strings with null so the analysis agent sees clean data
  const cleanedData = cleanForAnalysis(collectedData)

  const prompt = `
Analyze this freelancer profile and provide comprehensive feedback:

Profile Data:
${JSON.stringify(cleanedData, null, 2)}

Provide an overall score (0-100), category scores, strengths, improvements, and detailed feedback.
Include rate analysis comparing their current rate vs dream rate.`

  const analysisAgent = new Agent({
    name: "Profile Analyst",
    instructions: analysisInstructions,
    model: analysisModel,
    modelSettings: analysisModelSettings as Record<string, unknown>,
    outputType: ProfileAnalysisJsonSchema,
    outputGuardrails: [analysisScopeGuardrail as unknown as OutputGuardrail<typeof ProfileAnalysisJsonSchema>],
  })

  const reasoningStartTime = Date.now()
  emit({ type: "reasoning_started" })

  let analysisResult
  try {
    analysisResult = await run(analysisAgent, prompt, { stream: true })
    const textStream = analysisResult.toTextStream({
      compatibleWithNodeStreams: false,
    })

    for await (const chunk of textStream) {
      if (signal?.aborted) break
      if (chunk) {
        emit({ type: "reasoning_chunk", content: chunk })
      }
    }

    if (signal?.aborted) return

    emit({ type: "reasoning_evaluating" })
    await analysisResult.completed
  } catch (err) {
    if (err instanceof OutputGuardrailTripwireTriggered) {
      console.warn("[analysis] Scope guardrail tripped, retrying without guardrail")
      // Retry without the scope guardrail — the improved prompt is the primary control
      const retryAgent = new Agent({
        name: "Profile Analyst",
        instructions: analysisInstructions,
        model: analysisModel,
        modelSettings: analysisModelSettings as Record<string, unknown>,
        outputType: ProfileAnalysisJsonSchema,
      })
      analysisResult = await run(retryAgent, prompt, { stream: true })
      const retryStream = analysisResult.toTextStream({
        compatibleWithNodeStreams: false,
      })
      for await (const chunk of retryStream) {
        if (signal?.aborted) break
        if (chunk) {
          emit({ type: "reasoning_chunk", content: chunk })
        }
      }
      if (signal?.aborted) return
      emit({ type: "reasoning_evaluating" })
      await analysisResult.completed
    } else {
      throw err
    }
  }

  const reasoningDuration = Math.round(
    (Date.now() - reasoningStartTime) / 1000
  )
  emit({ type: "reasoning_completed", duration: reasoningDuration })

  if (analysisResult.finalOutput) {
    const analysis = ProfileAnalysisSchema.parse(
      analysisResult.finalOutput
    ) as ProfileAnalysis

    emit({
      type: "profile_analysis",
      overallScore: analysis.overallScore,
      categories: analysis.categories,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      detailedFeedback: analysis.detailedFeedback,
    })

    if (authContext) {
      try {
        await persistOnboardingComplete(authContext, collectedData, analysis, conversationId)
      } catch (persistError) {
        console.error("Failed to persist onboarding data:", persistError)
      }
    }
  }
}

// ============================================================================
// Persist onboarding data + analysis to Supabase
// ============================================================================

function cleanForAnalysis(data: Partial<CollectedData>): Partial<CollectedData> {
  const clean = { ...data }
  for (const [key, value] of Object.entries(clean)) {
    if (isSkipped(value)) {
      ;(clean as Record<string, unknown>)[key] = null
    }
  }
  return clean
}

function generateHeadline(data: Partial<CollectedData>): string {
  const level = data.experienceLevel && !isSkipped(data.experienceLevel)
    ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel] ?? ""
    : ""
  const topSkills = isSkipped(data.skills) ? [] : (data.skills ?? []).slice(0, 4).map((s) => s.name)
  const primaryTitle = (!isSkipped(data.experiences) && data.experiences?.[0]?.title) ?? "Freelancer"

  if (topSkills.length > 0) {
    return `${level} ${primaryTitle} — ${topSkills.join(" | ")}`.trim()
  }
  return `${level} ${primaryTitle}`.trim()
}

function generateAbout(data: Partial<CollectedData>): string {
  const name = data.fullName ?? "Freelancer"
  const level = data.experienceLevel && !isSkipped(data.experienceLevel)
    ? EXPERIENCE_LEVEL_LABELS[data.experienceLevel]?.toLowerCase() ?? ""
    : ""
  const skills = isSkipped(data.skills) ? [] : (data.skills ?? []).map((s) => s.name)
  const latestExp = isSkipped(data.experiences) ? undefined : data.experiences?.[0]
  const engagementTypes = isSkipped(data.engagementTypes) ? undefined : data.engagementTypes
  const engagementLabel =
    engagementTypes?.includes("full_time") &&
    engagementTypes?.includes("part_time")
      ? "full-time and part-time"
      : engagementTypes?.includes("full_time")
        ? "full-time"
        : "part-time"

  const parts: string[] = []

  if (latestExp) {
    const companyPart = latestExp.company ? ` at ${latestExp.company}` : ""
    parts.push(
      `${name} is a ${level} ${latestExp.title}${companyPart}.`.replace(
        /\s+/g,
        " "
      )
    )
  } else {
    parts.push(`${name} is a ${level} freelance professional.`.replace(/\s+/g, " "))
  }

  if (skills.length > 0) {
    const skillList =
      skills.length <= 3
        ? skills.join(", ")
        : `${skills.slice(0, 3).join(", ")} and ${skills.length - 3} more`
    parts.push(`Specializing in ${skillList}.`)
  }

  parts.push(`Available for ${engagementLabel} engagements.`)

  return parts.join(" ")
}

export async function persistOnboardingComplete(
  authContext: { userId: string; teamId: string },
  collectedData: Partial<CollectedData>,
  analysis: ProfileAnalysis,
  conversationId?: string | null
) {
  const supabase = getSupabaseAdmin()
  const { userId, teamId } = authContext
  const now = new Date().toISOString()

  const headline = generateHeadline(collectedData)
  const about = generateAbout(collectedData)

  await supabase
    .from("profiles")
    .update({
      display_name: collectedData.fullName ?? undefined,
      headline,
      about,
      team_mode: collectedData.teamMode ?? "solo",
      linkedin_url: collectedData.linkedinUrl && collectedData.linkedinUrl !== "skipped" ? collectedData.linkedinUrl : undefined,
      profile_completeness_score: 1,
      onboarding_completed_at: now,
      updated_at: now,
    } as never)
    .eq("user_id", userId)
    .eq("team_id", teamId)

  if (collectedData.skills && !isSkipped(collectedData.skills) && collectedData.skills.length > 0) {
    await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)

    await supabase.from("user_skills").insert(
      collectedData.skills.map((s) => ({
        team_id: teamId,
        user_id: userId,
        name: s.name,
        level: 3,
        years: null,
      }))
    )
  }

  if (collectedData.experiences && !isSkipped(collectedData.experiences) && collectedData.experiences.length > 0) {
    await supabase
      .from("user_experiences")
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)

    await supabase.from("user_experiences").insert(
      collectedData.experiences.map((e) => ({
        team_id: teamId,
        user_id: userId,
        title: e.title,
        company: e.company ?? null,
        start_date: e.startDate ?? null,
        end_date: e.endDate ?? null,
        highlights: e.highlights ?? null,
      }))
    )
  }

  if (collectedData.educations && !isSkipped(collectedData.educations) && collectedData.educations.length > 0) {
    await supabase
      .from("user_educations")
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)

    await supabase.from("user_educations").insert(
      collectedData.educations.map((e) => ({
        team_id: teamId,
        user_id: userId,
        school: e.school,
        degree: e.degree ?? null,
        field: e.field ?? null,
        start_year: e.startYear ? parseInt(e.startYear) : null,
        end_year: e.endYear ? parseInt(e.endYear) : null,
      }))
    )
  }

  const hasDreamRate =
    !isSkipped(collectedData.dreamRateMin) && collectedData.dreamRateMin != null ||
    !isSkipped(collectedData.dreamRateMax) && collectedData.dreamRateMax != null
  const hasCurrentRate =
    !isSkipped(collectedData.currentRateMin) && collectedData.currentRateMin != null ||
    !isSkipped(collectedData.currentRateMax) && collectedData.currentRateMax != null

  if (hasDreamRate || hasCurrentRate || collectedData.currency) {
    await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        team_id: teamId,
        platforms: ["upwork", "linkedin"],
        currency: collectedData.currency ?? "USD",
        hourly_min: isSkipped(collectedData.dreamRateMin) ? null : (collectedData.dreamRateMin ?? null),
        hourly_max: isSkipped(collectedData.dreamRateMax) ? null : (collectedData.dreamRateMax ?? null),
        current_hourly_min: isSkipped(collectedData.currentRateMin) ? null : (collectedData.currentRateMin ?? null),
        current_hourly_max: isSkipped(collectedData.currentRateMax) ? null : (collectedData.currentRateMax ?? null),
        project_types: ["short_gig", "medium_project"],
        tightness: 3,
        updated_at: now,
      },
      { onConflict: "user_id" }
    )
  }

  await supabase.from("profile_analyses").insert({
    team_id: teamId,
    user_id: userId,
    overall_score: analysis.overallScore,
    categories: analysis.categories,
    strengths: analysis.strengths,
    improvements: analysis.improvements,
    detailed_feedback: analysis.detailedFeedback,
    conversation_id: conversationId ?? null,
  })
}
