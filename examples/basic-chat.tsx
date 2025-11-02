/**
 * 🔥 SYNERGY - Basic Chat Example
 *
 * This example shows how to integrate Synergy into a React component
 * Built by SAAAM LLC
 */

'use client'

import { useState } from 'react'
import { useSynergy } from '../hooks/useSynergy'
import type { SynergyParticipant } from '../types'

export default function SynergyChat() {
  const [input, setInput] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')

  const { messages, isLoading, sendMessage, clearMessages } = useSynergy({
    onError: (error) => {
      console.error('Synergy error:', error)
      alert(error.message)
    },
    onComplete: () => {
      console.log('Synergy conversation complete!')
    },
  })

  // Define your AI participants
  const [participants, setParticipants] = useState<SynergyParticipant[]>([
    {
      id: 'gpt-1',
      name: 'GPT-5',
      provider: 'openai',
      model: 'gpt-5',
      temperature: 1.0,
      maxTokens: 30000,
      systemPrompt: '',
    },
    {
      id: 'claude-1',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      temperature: 0.9,
      maxTokens: 64000,
      systemPrompt: '',
    },
  ])

  const handleSend = async () => {
    if (!input.trim()) return

    await sendMessage(input, participants, {
      openaiKey,
      anthropicKey,
      systemPrompt: 'You are a helpful AI assistant participating in a collaborative discussion.',
    })

    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">🔥 Synergy Chat</h1>

      {/* API Keys */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">API Keys</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="password"
            placeholder="OpenAI API Key"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Anthropic API Key"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Participants */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Active Participants</h2>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <div key={p.id} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
              {p.name} ({p.model})
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 p-3 rounded ${
                msg.type === 'user'
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : msg.isError
                  ? 'bg-red-100 max-w-[80%]'
                  : 'bg-white max-w-[80%]'
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                {msg.type === 'user' ? 'You' : msg.participant_name || msg.model}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 px-4 py-2 border rounded resize-none"
          rows={3}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isLoading ? '⏳' : '🚀'} Send
          </button>
          <button
            onClick={clearMessages}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
