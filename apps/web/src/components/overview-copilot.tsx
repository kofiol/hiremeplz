"use client"

import * as React from "react"
import { useCallback, useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "@/app/auth/session-provider"
import { useUserPlan } from "@/hooks/use-user-plan"
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageError,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Square } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

// ============================================================================
// Helpers
// ============================================================================

function generateId() {
  return Math.random().toString(36).slice(2)
}

// ============================================================================
// Main Component
// ============================================================================

export function OverviewCopilot() {
  const { session } = useSession()
  const { displayName: planDisplayName } = useUserPlan()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Resolve user name
  const userName = React.useMemo(() => {
    const metaName =
      (session?.user?.user_metadata?.full_name as string | undefined) ??
      (session?.user?.user_metadata?.name as string | undefined) ??
      (session?.user?.user_metadata?.display_name as string | undefined)

    return planDisplayName ?? metaName ?? "there"
  }, [planDisplayName, session?.user])

  // Get first name only
  const firstName = React.useMemo(() => {
    const name = userName === "there" ? "there" : userName.split(" ")[0]
    return name
  }, [userName])

  // Get greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good morning"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    if (hour >= 17 && hour < 21) return "Good evening"
    return "Good night"
  }, [])

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const hasMessages = messages.length > 0

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || isStreaming) return
      if (!session?.access_token) return

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput("")
      setIsLoading(true)
      setError(null)

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const conversationHistory = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch("/api/v1/overview/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(
            errorData?.error?.message || "Failed to send message"
          )
        }

        // Parse SSE stream
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let accumulated = ""

        setIsStreaming(true)
        setStreamingContent("")

        try {
          while (true) {
            if (controller.signal.aborted) break

            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue

              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "text") {
                  accumulated += parsed.content
                  setStreamingContent(accumulated)
                } else if (parsed.type === "error") {
                  throw new Error(parsed.message || "Streaming failed")
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue
                throw e
              }
            }
          }
        } finally {
          setIsStreaming(false)
          setStreamingContent("")
        }

        // Add the completed assistant message
        if (accumulated.trim()) {
          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content: accumulated.trim(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        setError(err instanceof Error ? err.message : "Failed to send message")
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, isLoading, isStreaming, session?.access_token]
  )

  // Stop streaming
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setIsStreaming(false)
    setStreamingContent("")
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text) {
        sendMessage(message.text)
      }
    },
    [sendMessage]
  )

  // Focus textarea after sending
  useEffect(() => {
    if (!isLoading && !isStreaming && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isLoading, isStreaming])

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          // Empty state — centered greeting + input
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center justify-center gap-8 p-6 min-h-0"
          >
            <div className="text-center">
              <h1
                className="mb-2 text-3xl font-semibold tracking-tight"
                suppressHydrationWarning
              >
                {greeting}, {firstName}
              </h1>
              <p className="text-muted-foreground">
                How can I help you today?
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <PromptInput
                onSubmit={handleSubmit}
                className="[&_[data-slot=input-group]]:border-border/50 [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-[0_2px_8px_rgba(0,0,0,0.08)] [&_[data-slot=input-group]]:focus-within:ring-0 [&_[data-slot=input-group]]:focus-within:border-border"
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about proposals, job strategy, rate advice..."
                    className="min-h-12 text-base"
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputSubmit
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!input.trim()}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.div>
        ) : (
          // Chat state — messages + input pinned at bottom
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col min-h-0 overflow-hidden"
          >
            <Conversation className="flex-1 min-h-0">
              <ConversationContent className="mx-auto w-full max-w-3xl pt-8 pb-4">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    hideAvatar
                  >
                    <MessageContent>
                      {message.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="rounded-2xl bg-accent px-4 py-2.5 text-base text-accent-foreground">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-base prose-invert max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <Message from="assistant" hideAvatar>
                    <MessageContent>
                      <div className="prose prose-base prose-invert max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingContent}
                        </ReactMarkdown>
                        <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-foreground/50" />
                      </div>
                    </MessageContent>
                  </Message>
                )}

                {/* Loading dots */}
                {isLoading && !isStreaming && (
                  <Message from="assistant" hideAvatar>
                    <MessageContent>
                      <div className="flex h-8 items-center">
                        <div className="flex items-center gap-1 translate-y-[1px]">
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50" />
                        </div>
                      </div>
                    </MessageContent>
                  </Message>
                )}

                {error && (
                  <MessageError
                    error={error}
                    onRetry={() => {
                      setError(null)
                    }}
                  />
                )}
              </ConversationContent>
            </Conversation>

            {/* Input area */}
            <div className="shrink-0 bg-background px-4 pb-6 pt-4">
              <div className="mx-auto max-w-3xl">
                <PromptInput
                  onSubmit={handleSubmit}
                  className="[&_[data-slot=input-group]]:border-border/50 [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-[0_1px_2px_rgba(0,0,0,0.08)] [&_[data-slot=input-group]]:focus-within:ring-0 [&_[data-slot=input-group]]:focus-within:border-border"
                >
                  <PromptInputBody>
                    <PromptInputTextarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="min-h-10 text-base"
                    />
                  </PromptInputBody>
                  <PromptInputFooter>
                    {isLoading || isStreaming ? (
                      <PromptInputSubmit
                        type="button"
                        onClick={stopGeneration}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Square className="size-4 fill-current" />
                      </PromptInputSubmit>
                    ) : (
                      <PromptInputSubmit
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={!input.trim()}
                      />
                    )}
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
