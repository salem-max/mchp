"use client"

import { MessageSquare } from 'lucide-react'

interface ChatBubbleProps {
  message?: string
  isUser?: boolean
}

export default function ChatBubble({ message = 'This is a chat bubble.', isUser = false }: ChatBubbleProps) {
  return (
    <div className={`rounded-2xl p-4 ${isUser ? 'bg-primary text-white self-end' : 'bg-slate-100 text-slate-900'}`}>
      <div className="flex items-start gap-2">
        <MessageSquare className="h-4 w-4" />
        <p>{message}</p>
      </div>
    </div>
  )
}
