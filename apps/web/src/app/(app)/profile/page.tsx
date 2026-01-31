"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "@/app/auth/session-provider"
import { useUserPlan } from "@/hooks/use-user-plan"
import {
  ProfileAnalysisResults,
} from "@/components/ui/score-indicator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { RefreshCw, AlertCircle } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

type ProfileAnalysis = {
  id: string
  overallScore: number
  categories: {
    skillsBreadth: number
    experienceQuality: number
    ratePositioning: number
    marketReadiness: number
  }
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  createdAt: string
}

// ============================================================================
// Page
// ============================================================================

export default function ProfilePage() {
  const { session, isLoading: sessionLoading } = useSession()
  const { displayName, email } = useUserPlan()
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve user info
  const userInfo = useMemo(() => {
    const name =
      displayName ??
      (session?.user?.user_metadata?.full_name as string) ??
      (session?.user?.user_metadata?.name as string) ??
      "User"

    const userEmail = email ?? session?.user?.email ?? ""

    const avatarUrl =
      (session?.user?.user_metadata?.avatar_url as string) ??
      (session?.user?.user_metadata?.picture as string)

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

    return { name, email: userEmail, avatarUrl, initials }
  }, [session, displayName, email])

  const fetchAnalysis = useCallback(async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch("/api/v1/profile/analysis", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || "Failed to fetch analysis")
      }

      const data = await response.json()
      setAnalysis(data.analysis ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis")
    } finally {
      setIsLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    if (!sessionLoading && session?.access_token) {
      fetchAnalysis()
    }
  }, [sessionLoading, session?.access_token, fetchAnalysis])

  const refreshAnalysis = useCallback(async () => {
    if (!session?.access_token || isRefreshing) return

    setIsRefreshing(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/profile/analysis", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || "Failed to refresh analysis")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh analysis")
    } finally {
      setIsRefreshing(false)
    }
  }, [session?.access_token, isRefreshing])

  if (sessionLoading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-8 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
              <AvatarFallback className="text-lg">
                {userInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {userInfo.name}
              </h1>
              <p className="text-muted-foreground">{userInfo.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Profile Analysis
                </Badge>
                <Badge variant="outline" className="text-xs">
                  BETA
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalysis}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analysis content */}
        {analysis ? (
          <div className="space-y-6">
            {/* Score card + category bars */}
            <ProfileAnalysisResults analysis={analysis} />

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-emerald-500">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-amber-500">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed feedback */}
            <div className="rounded-lg border border-border/50 p-6">
              <div className="prose prose-base prose-invert max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis.detailedFeedback}
                </ReactMarkdown>
              </div>
            </div>

            {/* Last analyzed timestamp */}
            <p className="text-xs text-muted-foreground">
              Last analyzed{" "}
              {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/50 p-12 text-center">
            <p className="text-muted-foreground">
              No profile analysis yet. Run your first analysis to see scores and
              feedback.
            </p>
            <Button
              onClick={refreshAnalysis}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
