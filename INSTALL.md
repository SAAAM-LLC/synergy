# 🔥 Synergy - Quick Installation Guide

## For New Projects

### Step 1: Copy Synergy to Your Project

```bash
# Copy the entire synergy directory
cp -r /path/to/synergy /your/project/root/
```

### Step 2: Install Dependencies

```bash
npm install openai @anthropic-ai/sdk
```

### Step 3: Set Up the API Route

```bash
# Create the API directory
mkdir -p app/api/synergy

# Copy the route handler
cp synergy/api/route.ts app/api/synergy/route.ts
```

### Step 4: Use in Your Component

```tsx
'use client'

import { useSynergy } from '@/synergy'
import type { SynergyParticipant } from '@/synergy'

export default function MyChat() {
  const { messages, sendMessage, isLoading } = useSynergy()

  const participants: SynergyParticipant[] = [
    {
      id: '1',
      name: 'GPT-5',
      provider: 'openai',
      model: 'gpt-5',
      temperature: 1.0,
      maxTokens: 30000,
    },
  ]

  return (
    <div>
      {/* Your chat UI here */}
    </div>
  )
}
```

---

## Project Structure

After installation, your project should look like:

```
your-project/
├── app/
│   └── api/
│       └── synergy/
│           └── route.ts          ← API route handler
├── synergy/                      ← Synergy package
│   ├── api/
│   │   └── route.ts             ← Template API route
│   ├── hooks/
│   │   └── useSynergy.ts        ← React hook
│   ├── types/
│   │   └── index.ts             ← TypeScript types
│   ├── examples/
│   │   └── basic-chat.tsx       ← Example component
│   ├── index.ts                 ← Main exports
│   ├── package.json
│   └── README.md
└── ...
```

---

## Verify Installation

Create a test component:

```tsx
// app/test-synergy/page.tsx
'use client'

import { useSynergy } from '@/synergy'

export default function TestPage() {
  const { messages } = useSynergy()

  return <div>Synergy Loaded! Messages: {messages.length}</div>
}
```

Visit `/test-synergy` - if it loads without errors, you're good to go! 🚀

---

## Next Steps

1. Check out `synergy/README.md` for full documentation
2. See `synergy/examples/basic-chat.tsx` for a complete example
3. Configure your API keys
4. Start building!

---

**Built with 🔥 by SAAAM LLC**
