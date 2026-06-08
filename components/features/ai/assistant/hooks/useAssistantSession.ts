import { useState } from 'react'

export function useAssistantSession() {
  const [sessionId] = useState(() => `assistant-${Date.now()}`)
  return { sessionId }
}
