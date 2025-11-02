/**
 * 🔥 SYNERGY - Multi-AI Collaboration System
 *
 * React hook for easy Synergy integration
 * Built by SAAAM LLC
 */

import { useState, useCallback, useRef } from "react"
import type { SynergyParticipant, SynergyMessage, SynergyStreamEvent, SynergyConfig } from "../types"

export interface UseSynergyOptions {
  apiEndpoint?: string
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function useSynergy(options: UseSynergyOptions = {}) {
  const { apiEndpoint = "/api/synergy", onError, onComplete } = options

  const [messages, setMessages] = useState<SynergyMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (
      userMessage: string,
      participants: SynergyParticipant[],
      config: SynergyConfig
    ) => {
      if (!userMessage.trim() || isLoading) return

      // Validate API keys
      const needsOpenAI = participants.some((p) => p.provider === "openai")
      const needsAnthropic = participants.some((p) => p.provider === "anthropic")

      if (needsOpenAI && !config.openaiKey) {
        const error = new Error("OpenAI API Key is required for OpenAI participants")
        onError?.(error)
        throw error
      }
      if (needsAnthropic && !config.anthropicKey) {
        const error = new Error("Anthropic API Key is required for Anthropic participants")
        onError?.(error)
        throw error
      }

      // Create user message
      const newUserMessage: SynergyMessage = {
        id: Date.now(),
        type: "user",
        content: userMessage,
        timestamp: new Date().toLocaleTimeString(),
      }

      const newMessages = [...messages, newUserMessage]
      setMessages(newMessages)
      setIsLoading(true)

      // Create placeholder bubbles for each participant
      const participantBubbles = participants.map((participant, index) => ({
        id: Date.now() + index + 1,
        type: "assistant" as const,
        content: "",
        timestamp: new Date().toLocaleTimeString(),
        model: participant.model,
        participant_name: participant.name,
      }))

      setMessages((prev) => [...prev, ...participantBubbles])

      try {
        const controller = new AbortController()
        abortControllerRef.current = controller

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            participants,
            ...config,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          const participantResponses = new Map<string, string>()
          participants.forEach((participant) => {
            participantResponses.set(participant.name, "")
          })

          await reader.read().then(function processText({ done, value }): any {
            if (done) return

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data: SynergyStreamEvent = JSON.parse(line.slice(6))

                  if (data.type === "chunk" && data.participant !== undefined) {
                    // Update the participant's response
                    const currentResponse = participantResponses.get(data.participant) || ""
                    const updatedResponse = currentResponse + data.content
                    participantResponses.set(data.participant, updatedResponse)

                    // Find participant index
                    const participantIndex = participants.findIndex((p) =>
                      p.name === data.participant || (data.participant === "" && p.model === data.model)
                    )

                    // Update the UI
                    if (participantIndex >= 0 && participantBubbles[participantIndex]) {
                      setMessages((prev) =>
                        prev.map((msg) => {
                          if (msg.id === participantBubbles[participantIndex].id) {
                            return {
                              ...msg,
                              content: updatedResponse,
                              model: data.model,
                              participant_name: data.participant || data.model,
                            }
                          }
                          return msg
                        })
                      )
                    }
                  } else if (data.type === "error") {
                    console.error(`Participant error for ${data.participant}: ${data.message}`)

                    // Show error for specific participant
                    const participantIndex = participants.findIndex((p) => p.name === data.participant)
                    if (participantIndex >= 0) {
                      setMessages((prev) =>
                        prev.map((msg) => {
                          if (msg.id === participantBubbles[participantIndex]?.id) {
                            return {
                              ...msg,
                              content: data.message || "Unknown error",
                              isError: true,
                            }
                          }
                          return msg
                        })
                      )
                    }
                  } else if (data.type === "complete") {
                    setIsLoading(false)
                    abortControllerRef.current = null
                    onComplete?.()
                    return
                  }
                } catch (e) {
                  console.error("Error parsing stream chunk:", e, "Line:", line)
                }
              }
            }

            return reader.read().then(processText)
          })
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Synergy request aborted")
        } else {
          onError?.(error)
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              content: `⚠️ **SYNERGY ERROR** ⚠️\n\n${error.message}\n\nPlease check your API keys and network connection.`,
              timestamp: new Date().toLocaleTimeString(),
              model: "Synergy",
              isError: true,
            },
          ])
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, isLoading, apiEndpoint, onError, onComplete]
  )

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    abort,
    clearMessages,
    setMessages,
  }
}
