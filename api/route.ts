/**
 * 🔥 SYNERGY - Multi-AI Collaboration System
 *
 * API Route Handler for Next.js
 * Copy this to: app/api/synergy/route.ts
 *
 * Built by SAAAM LLC
 */

import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SynergyParticipant {
  id: string
  name: string
  provider: "openai" | "anthropic"
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  useTools?: boolean
  openai?: any
  anthropic?: {
    extendedThinking?: boolean
    budgetTokens?: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function generateSystemPrompt(
  participant: SynergyParticipant,
  otherParticipants: SynergyParticipant[],
  baseSystemPrompt?: string
): string {
  const otherNames = otherParticipants.map((p) => `${p.name} (${p.model})`).join(", ")
  const identityPrompt = `CRITICAL IDENTITY INSTRUCTIONS:
- You are ${participant.name} running ${participant.model}
- You are NOT any of the other participants: ${otherNames}
- Always maintain your identity as ${participant.name}
- Never confuse yourself with responses from other participants

MULTI-AI COLLABORATION:
You are participating in a multi-AI conversation with: ${otherNames}
Each participant responds in sequence. You can see and reference other participants' responses.

${participant.systemPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${participant.systemPrompt}` : ""}
${baseSystemPrompt ? `\nBASE SYSTEM PROMPT:\n${baseSystemPrompt}` : ""}`

  return identityPrompt
}

// ═══════════════════════════════════════════════════════════════════════════
// ANTHROPIC HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleAnthropicParticipant(
  participant: SynergyParticipant,
  anthropic: Anthropic,
  conversationHistory: any[],
  systemPrompt: string,
  flush: (obj: any) => void,
  prefillContent: string | undefined,
  isLastParticipant: boolean,
  extendedThinking: boolean,
  budgetTokens: number
) {
  const anthropicMessages: any[] = []
  conversationHistory.forEach((msg: any) => {
    if (msg.role === "user" && msg.attachedFiles && msg.attachedFiles.length > 0) {
      const content: any[] = []
      content.push({ type: "text", text: msg.content })
      msg.attachedFiles.forEach((file: any) => {
        if (file.type?.startsWith?.("image/")) {
          const matches = file.content.match(/^data:([^;]+);base64,(.+)$/)
          if (matches) {
            const mediaType = matches[1]
            const base64Data = matches[2]
            content.push({
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            })
          }
        }
      })
      anthropicMessages.push({ role: "user", content: content.length === 1 ? content[0].text : content })
    } else {
      anthropicMessages.push({
        role: msg.role,
        content: msg.attribution ? `[${msg.attribution}]: ${msg.content}` : msg.content,
      })
    }
  })

  if (prefillContent && isLastParticipant) {
    anthropicMessages.push({ role: "assistant", content: prefillContent })
  }

  const useThinking = participant.anthropic?.extendedThinking ?? extendedThinking
  const thinkBudget = participant.anthropic?.budgetTokens ?? Math.min(budgetTokens || 2000, (participant.maxTokens || 32000) - 100)

  const anthropicReq: Anthropic.Messages.MessageCreateParams = {
    model: participant.model,
    stream: true,
    max_tokens: participant.maxTokens || 64000,
    messages: anthropicMessages,
    system: systemPrompt,
    temperature: participant.temperature ?? 0.9,
  }

  if (useThinking) {
    // @ts-ignore
    anthropicReq.thinking = { type: "enabled", budget_tokens: thinkBudget }
    anthropicReq.temperature = 1.0
  }

  const response = await anthropic.messages.stream(anthropicReq)

  if (prefillContent && isLastParticipant) {
    flush({
      type: "chunk",
      participant: participant.name,
      model: participant.model,
      provider: participant.provider,
      content: prefillContent,
    })
  }

  let fullResponse = prefillContent || ""

  for await (const chunk of response as any) {
    if (chunk.type === "content_block_delta" && (chunk.delta as any)?.text) {
      const content = (chunk.delta as any).text
      fullResponse += content
      flush({
        type: "chunk",
        participant: participant.name,
        model: participant.model,
        provider: participant.provider,
        content,
      })
    } else if (chunk.type === "content_block_delta" && (chunk.delta as any)?.type === "thinking_delta") {
      const thinkingText = (chunk.delta as any).thinking
      flush({
        type: "chunk",
        participant: participant.name,
        model: participant.model,
        provider: participant.provider,
        content: `[THINKING]${thinkingText}[/THINKING]`,
      })
    }
  }

  conversationHistory.push({
    role: "assistant",
    content: fullResponse,
    attribution: participant.name,
    participant_name: participant.name,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleOpenAIParticipant(
  participant: SynergyParticipant,
  openai: OpenAI,
  conversationHistory: any[],
  systemPrompt: string,
  flush: (obj: any) => void,
  prefillContent: string | undefined,
  isLastParticipant: boolean
) {
  const input: any[] = []

  for (const msg of conversationHistory) {
    if (msg.role === "user") {
      input.push({
        role: "user",
        content: [{ type: "input_text", text: msg.content }],
      })
    } else if (msg.role === "assistant") {
      input.push({
        role: "assistant",
        content: msg.attribution ? `[${msg.attribution}]: ${msg.content}` : msg.content,
      })
    }
  }

  const config: any = {
    model: participant.model,
    stream: true,
    max_output_tokens: participant.maxTokens || 16200,
    temperature: participant.temperature ?? 0.9,
    instructions: systemPrompt,
    input: input,
  }

  if (participant.openai?.reasoning) {
    config.reasoning = participant.openai.reasoning
  }

  const stream: any = await openai.responses.create(config)

  let fullResponse = ""

  for await (const event of stream as any) {
    if (event.type === "response.output_text.delta") {
      const content = event.delta || ""
      fullResponse += content
      flush({
        type: "chunk",
        participant: participant.name,
        model: participant.model,
        provider: participant.provider,
        content,
      })
    }
  }

  conversationHistory.push({
    role: "assistant",
    content: fullResponse,
    attribution: participant.name,
    participant_name: participant.name,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN POST HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      participants,
      openaiKey,
      anthropicKey,
      systemPrompt,
      extendedThinking,
      budgetTokens,
      prefillContent,
    } = await req.json()

    if (!participants || participants.length < 1) {
      return NextResponse.json({ error: "At least 1 participant required" }, { status: 400 })
    }

    const needsOpenAI = participants.some((p: SynergyParticipant) => p.provider === "openai")
    const needsAnthropic = participants.some((p: SynergyParticipant) => p.provider === "anthropic")

    if (needsOpenAI && !openaiKey) {
      return NextResponse.json({ error: "OpenAI API key is required for OpenAI models" }, { status: 400 })
    }
    if (needsAnthropic && !anthropicKey) {
      return NextResponse.json({ error: "Anthropic API key is required for Anthropic models" }, { status: 400 })
    }

    const openai = needsOpenAI ? new OpenAI({ apiKey: openaiKey }) : null
    const anthropic = needsAnthropic
      ? new Anthropic({
          apiKey: anthropicKey,
          defaultHeaders: {
            "anthropic-beta":
              "message-batches-2024-09-24,files-api-2025-04-14,skills-2025-10-02,interleaved-thinking-2025-05-14,mcp-client-2025-04-04,web-fetch-2025-09-10,fine-grained-tool-streaming-2025-05-14,bash_20250124,text_editor_20250728,code-execution-2025-08-25,context-management-2025-06-27,context-1m-2025-08-07,computer-use-2025-01-24,web_search_20250305",
          },
        })
      : null

    // Process messages
    const processedMessages: any[] = []
    for (const msg of messages.filter((m: any) => m.type === "user" || m.type === "assistant")) {
      if (msg.type === "user") {
        processedMessages.push({
          role: "user" as const,
          content: msg.content,
          attachedFiles: msg.attachedFiles || null,
        })
      } else {
        const attribution = msg.participant_name || msg.model || "Assistant"
        processedMessages.push({
          role: "assistant" as const,
          content: `${msg.content}`,
          attribution,
          attachedFiles: msg.attachedFiles || null,
        })
      }
    }

    console.log("🔥 SYNERGY:", {
      totalMessages: processedMessages.length,
      participants: participants.map((p: SynergyParticipant) => `${p.name} (${p.provider}:${p.model})`),
    })

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const conversationHistory = [...processedMessages]
        const flush = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

        try {
          for (let i = 0; i < participants.length; i++) {
            const participant: SynergyParticipant = participants[i]
            const otherParticipants = participants.filter((_: any, idx: number) => idx !== i)

            try {
              const participantSystemPrompt = generateSystemPrompt(participant, otherParticipants, systemPrompt)

              if (participant.provider === "anthropic" && anthropic) {
                await handleAnthropicParticipant(
                  participant,
                  anthropic,
                  conversationHistory,
                  participantSystemPrompt,
                  flush,
                  prefillContent,
                  i === participants.length - 1,
                  extendedThinking,
                  budgetTokens
                )
              } else if (participant.provider === "openai" && openai) {
                await handleOpenAIParticipant(
                  participant,
                  openai,
                  conversationHistory,
                  participantSystemPrompt,
                  flush,
                  prefillContent,
                  i === participants.length - 1
                )
              }
            } catch (error: any) {
              console.error(`Error with participant ${participant.name}:`, error)
              flush({
                type: "error",
                participant: participant.name,
                message: `❌ ${participant.name} error: ${error?.message || String(error)}`,
              })
            }
          }

          flush({ type: "complete" })
          controller.close()
        } catch (error: any) {
          console.error("Synergy streaming error:", error)
          flush({ type: "error", message: error?.message || String(error) })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[SYNERGY_ERROR]", error)
    return NextResponse.json({ error: error?.message || "Synergy API error" }, { status: 500 })
  }
}
