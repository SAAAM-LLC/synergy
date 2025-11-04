# 🔥 SYNERGY

**Multi-AI Collaboration System**

Built by SAAAM LLC

Synergy enables multiple AI models (OpenAI & Anthropic) to collaborate in a single conversation. Whether you want 1 model or 50 models working together, Synergy handles it all with real-time streaming responses.

---

## ✨ Features

- 🤖 **Multi-Provider Support**: OpenAI (GPT models) and Anthropic (Claude models)
- 🔄 **Real-time Streaming**: See responses as they're generated
- 🧠 **Extended Thinking**: Enable Claude's extended thinking mode
- 🎯 **Per-Participant Configuration**: Custom settings for each AI participant
- 📦 **Easy Integration**: Drop into any Next.js project
- 🚀 **Zero Rate Limiting**: No artificial delays, full speed ahead
- 💪 **TypeScript Support**: Full type safety out of the box

---

## 📦 Installation

### 1. Copy Files to Your Project

```bash
# Copy the entire synergy directory to your project root
cp -r synergy /path/to/your/project/
```

### 2. Install Dependencies

```bash
npm install openai @anthropic-ai/sdk
# or
pnpm add openai @anthropic-ai/sdk
```

### 3. Set Up API Route

Copy the API route to your Next.js app:

```bash
mkdir -p app/api/synergy
cp synergy/api/route.ts app/api/synergy/route.ts
```

### 4. Add to Your Project

```typescript
// Import types
import type { SynergyParticipant } from '@/synergy/types'

// Import hook
import { useSynergy } from '@/synergy/hooks/useSynergy'
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
'use client'

import { useSynergy } from '@/synergy/hooks/useSynergy'
import type { SynergyParticipant } from '@/synergy/types'

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useSynergy()

  const participants: SynergyParticipant[] = [
    {
      id: 'gpt-1',
      name: 'GPT-5',
      provider: 'openai',
      model: 'gpt-5',
      temperature: 1.0,
      maxTokens: 30000,
    },
    {
      id: 'claude-1',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.9,
      maxTokens: 64000,
    },
  ]

  const handleSend = async (userInput: string) => {
    await sendMessage(userInput, participants, {
      openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      anthropicKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      systemPrompt: 'You are a helpful AI assistant.',
    })
  }

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.type}>
            <strong>{msg.participant_name || msg.type}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <button onClick={() => handleSend('Hello!')} disabled={isLoading}>
        Send
      </button>
    </div>
  )
}
```

---

## 🎯 Advanced Usage

### Extended Thinking (Claude)

```typescript
const participants: SynergyParticipant[] = [
  {
    id: 'claude-1',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    temperature: 1.0,
    maxTokens: 64000,
    anthropic: {
      extendedThinking: true,
      budgetTokens: 5000, // Thinking budget
    },
  },
]

await sendMessage(userInput, participants, {
  anthropicKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  extendedThinking: true,
  budgetTokens: 5000,
})
```

### OpenAI Reasoning Models

```typescript
const participants: SynergyParticipant[] = [
  {
    id: 'o1-1',
    name: 'O1 Reasoner',
    provider: 'openai',
    model: 'o1',
    temperature: 1.0,
    maxTokens: 30000,
    openai: {
      reasoning: {
        effort: 'high',
        summary: 'detailed',
      },
    },
  },
]
```

### Multiple Models from Same Provider

```typescript
const participants: SynergyParticipant[] = [
  {
    id: 'gpt-fast',
    name: 'GPT-5 Mini (Fast)',
    provider: 'openai',
    model: 'gpt-5-mini',
    temperature: 1.0,
    maxTokens: 10000,
  },
  {
    id: 'gpt-smart',
    name: 'GPT-5 (Detailed)',
    provider: 'openai',
    model: 'gpt-5',
    temperature: 1.0,
    maxTokens: 30000,
  },
  {
    id: 'gpt-reasoning',
    name: 'O1 (Deep Reasoning)',
    provider: 'openai',
    model: 'o1',
    temperature: 1.0,
    maxTokens: 30000,
  },
]
```

### Custom System Prompts per Participant

```typescript
const participants: SynergyParticipant[] = [
  {
    id: 'creative',
    name: 'Creative Writer',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.9,
    systemPrompt: 'You are a creative storyteller focused on vivid descriptions.',
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    provider: 'openai',
    model: 'gpt-5',
    temperature: 1.0,
    systemPrompt: 'You are a data analyst focused on facts and statistics.',
  },
]
```

---

## 🎨 Pre-Built Presets

```typescript
// Claude Duo (Sonnet 4 + Haiku 4.5)
const claudeDuo: SynergyParticipant[] = [
  {
    id: 'sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    model: 'claude-4-sonnet-20250514',
    temperature: 0.7,
    maxTokens: 64000,
  },
  {
    id: 'haiku',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    temperature: 0.7,
    maxTokens: 64000,
  },
]

// GPT Power Trio
const gptTrio: SynergyParticipant[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    model: 'gpt-5',
    temperature: 1.0,
    maxTokens: 30000,
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    model: 'gpt-5-mini',
    temperature: 1.0,
    maxTokens: 30000,
  },
  {
    id: 'o1',
    name: 'O1',
    provider: 'openai',
    model: 'o1',
    temperature: 1.0,
    maxTokens: 30000,
  },
]

// Mixed Provider Power Team
const mixedTeam: SynergyParticipant[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    model: 'gpt-5',
    temperature: 1.0,
    maxTokens: 30000,
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    model: 'claude-4-sonnet-20250514',
    temperature: 0.7,
    maxTokens: 64000,
  },
  {
    id: 'claude-sonnet-45',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 64000,
  },
]
```

---

## 📚 API Reference

### `useSynergy(options?)`

React hook for Synergy integration.

**Options:**
```typescript
{
  apiEndpoint?: string        // Default: '/api/synergy'
  onError?: (error: Error) => void
  onComplete?: () => void
}
```

**Returns:**
```typescript
{
  messages: SynergyMessage[]
  isLoading: boolean
  sendMessage: (message: string, participants: SynergyParticipant[], config: SynergyConfig) => Promise<void>
  abort: () => void
  clearMessages: () => void
  setMessages: (messages: SynergyMessage[]) => void
}
```

---

## 🏗️ TypeScript Types

### `SynergyParticipant`

```typescript
interface SynergyParticipant {
  id: string
  name: string
  provider: "openai" | "anthropic"
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  useTools?: boolean
  openai?: {
    reasoning?: {
      effort?: "low" | "medium" | "high"
      summary?: "auto" | "concise" | "detailed"
    }
    // ... other OpenAI options
  }
  anthropic?: {
    extendedThinking?: boolean
    budgetTokens?: number
  }
}
```

### `SynergyMessage`

```typescript
interface SynergyMessage {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: string
  model?: string
  participant_name?: string
  isError?: boolean
}
```

### `SynergyConfig`

```typescript
interface SynergyConfig {
  openaiKey?: string
  anthropicKey?: string
  systemPrompt?: string
  extendedThinking?: boolean
  budgetTokens?: number
  prefillContent?: string
  sessionId?: string
  maxIterations?: number
}
```

---

## 🔥 Why Synergy?

- **No Bullshit**: Clean, straightforward API
- **Zero Rate Limiting**: We removed all artificial delays
- **Production Ready**: Battle-tested in SAAAM LLC projects
- **Fully Typed**: TypeScript support from the ground up
- **Streaming First**: Real-time responses, no waiting
- **Flexible**: Works with 1 model or 500 models | Theres no limit except your own API limits // Been tested with flawless results with 52 Claude variants & 52 GPT variants in one conversation
- **Provider Agnostic**: Mix and match OpenAI and Anthropic | easy to add any provider

---

## 🤝 Contributing

Built by SAAAM LLC. Fork it, Use it, modify it, make it more badass

---

## 📝 License

Do whatever you want with it. Just mention us. 🤝

---

## 🚀 Examples

Check out the `examples/` directory for complete working examples.

---

**Built with 🔥 by SAAAM LLC**
