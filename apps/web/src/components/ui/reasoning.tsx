"use client"

import * as React from "react"
import { Brain } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

type ReasoningProps = {
  isStreaming: boolean
  content: string
  duration?: number
  className?: string
}

/**
 * Compact reasoning display - always shows content, not collapsible.
 * Shows "Thinking..." header while streaming, "Thought for Xs" after.
 */
function Reasoning({ isStreaming, content, duration, className }: ReasoningProps) {
  if (!content && !isStreaming) {
    return null
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-1 text-xs">
        <div className="relative flex items-center justify-center">
          <Brain className="size-3 text-muted-foreground" />
          {isStreaming && (
            <span className="absolute inset-0 animate-ping">
              <Brain className="size-3 text-primary/50" />
            </span>
          )}
        </div>
        <span className="text-muted-foreground">
          {isStreaming ? (
            <span className="shimmer-text">Thinking...</span>
          ) : duration ? (
            `Thought for ${duration}s`
          ) : (
            "Reasoning"
          )}
        </span>
      </div>

      {/* Content - always visible, compact */}
      {content && (
        <div className="relative overflow-hidden rounded-md border bg-muted/20 px-3 py-2">
          {isStreaming && (
            <div className="pointer-events-none absolute inset-0 shimmer-overlay" />
          )}
          <div className="prose prose-xs prose-invert max-h-32 max-w-none overflow-y-auto text-xs text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="ml-1 inline-block h-2 w-0.5 animate-pulse bg-muted-foreground/50" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { Reasoning }
