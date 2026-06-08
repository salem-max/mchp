export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}
