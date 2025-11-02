/**
 * 🔥 SYNERGY - Multi-AI Collaboration System
 *
 * TypeScript type definitions for Synergy
 * Built by SAAAM LLC
 */

export interface SynergyParticipant {
  id: string
  name: string
  provider: "openai" | "anthropic"
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  useTools?: boolean

  // OpenAI fine-grained controls
  openai?: {
    response_format?: {
      type: "json_schema" | "json_object"
      json_schema?: { name: string; schema: any; strict?: boolean }
    }
    tools?: any[]
    tool_choice?: "auto" | "none" | "required" | { type: "function"; function: { name: string } }
    parallel_tool_calls?: boolean
    include?: string[]
    store?: boolean
    background?: boolean
    previous_response_id?: string
    reasoning?: {
      effort?: "low" | "medium" | "high"
      summary?: "auto" | "concise" | "detailed"
    }
    modalities?: ("text" | "audio")[]
    audio?: { voice?: string; format?: string }
    truncation?: any
  }

  // Anthropic fine-grained controls
  anthropic?: {
    extendedThinking?: boolean
    budgetTokens?: number
  }
}

export interface SynergyMessage {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: string
  model?: string
  participant_name?: string
  attachedFiles?: AttachedFile[] | null
  attribution?: string
  isError?: boolean
}

export interface AttachedFile {
  id: number
  name: string
  type: string
  size: number
  content: string | null
}

export interface SynergyStreamEvent {
  type: "chunk" | "error" | "complete" | "tool_start" | "tool_call" | "tool_result" | "tool_error" | "approval_needed"
  participant?: string
  model?: string
  provider?: string
  content?: string
  message?: string
  toolCount?: number
  tool?: string
  args?: any
  result?: any
  error?: string
  toolUseId?: string
  toolCallId?: string
  toolName?: string
  operation?: string
  details?: any
}

export interface SynergyConfig {
  openaiKey?: string
  anthropicKey?: string
  systemPrompt?: string
  extendedThinking?: boolean
  budgetTokens?: number
  prefillContent?: string
  sessionId?: string
  maxIterations?: number
}

export interface SynergyRequest {
  messages: SynergyMessage[]
  participants: SynergyParticipant[]
  openaiKey?: string
  anthropicKey?: string
  systemPrompt?: string
  extendedThinking?: boolean
  budgetTokens?: number
  prefillContent?: string
  sessionId?: string
  maxIterations?: number
}
