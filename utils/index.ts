/**
 * 🔥 SYNERGY - Utility Functions
 *
 * Helper utilities for Synergy
 * Built by SAAAM LLC
 */

/**
 * Format a participant name for display
 */
export function formatParticipantName(name: string, model: string): string {
  return name ? `${name} (${model})` : model
}

/**
 * Generate a unique participant ID
 */
export function generateParticipantId(): string {
  return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if a model requires temperature = 1.0
 */
export function requiresFixedTemperature(model: string): boolean {
  // GPT-5 family requires temp = 1.0
  return model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3')
}

/**
 * Get default temperature for a model
 */
export function getDefaultTemperature(model: string): number {
  if (requiresFixedTemperature(model)) {
    return 1.0
  }
  return 0.7
}

/**
 * Get default max tokens for a model
 */
export function getDefaultMaxTokens(model: string): number {
  const tokenLimits: { [key: string]: number } = {
    // Anthropic models
    'claude-opus-4-1-20250805': 64000,
    'claude-4-sonnet-20250514': 64000,
    'claude-sonnet-4-5-20250929': 64000,
    'claude-haiku-4-5-20251001': 64000,

    // OpenAI models
    'gpt-5': 30000,
    'gpt-5-mini': 30000,
    'gpt-5-nano': 30000,
    'gpt-4.1': 32768,
    'o1': 30000,
    'o3-mini': 16384,
  }

  return tokenLimits[model] || 16000
}

/**
 * Validate participant configuration
 */
export function validateParticipant(participant: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!participant.id) errors.push('Participant ID is required')
  if (!participant.name) errors.push('Participant name is required')
  if (!participant.provider) errors.push('Provider is required')
  if (!participant.model) errors.push('Model is required')

  if (participant.provider === 'openai' && requiresFixedTemperature(participant.model)) {
    if (participant.temperature && participant.temperature !== 1.0) {
      errors.push(`${participant.model} requires temperature = 1.0`)
    }
  }

  return { valid: errors.length === 0, errors }
}
