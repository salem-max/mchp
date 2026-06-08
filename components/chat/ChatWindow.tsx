'use client'

import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, Video, BotIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ai-elements
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageResponse,
  MessageToolbar,
} from '@/components/ai-elements/message'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from '@/components/ai-elements/confirmation'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
} from '@/components/ai-elements/prompt-input'
import { Attachments } from '@/components/ai-elements/attachments'
import { CopyIcon } from 'lucide-react'

interface ChatWindowProps {
  conversationId: string
  jobId?: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  onCall?: (type: 'phone' | 'video') => void
}

export default function ChatWindow({
  conversationId,
  jobId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  onCall,
}: ChatWindowProps) {
  const [input, setInput] = useState('')

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/ai/chat', body: { jobId } }),
    [jobId]
  )

  const { messages, sendMessage, status, addToolApprovalResponse, stop } = useChat({
    transport,
    onError: (err: Error) => toast.error(err.message || 'Chat error'),
  })

  return (
    <div className="flex flex-col h-[600px] rounded-lg border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>{otherUserName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{otherUserName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BotIcon className="h-3 w-3" /> AI-assisted
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onCall?.('phone')}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onCall?.('video')}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<BotIcon className="h-8 w-8" />}
              title="Start the conversation"
              description="Ask the AI assistant about this job, or send a message to the other party."
            />
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              {message.parts.map((part, i) => {
                // Text part
                if (part.type === 'text') {
                  return (
                    <MessageContent key={i}>
                      <MessageResponse>{part.text}</MessageResponse>
                    </MessageContent>
                  )
                }

                // Tool invocation part
                if (part.type === 'tool-invocation') {
                  const toolInvocation = (part as any).toolInvocation

                  // Human-in-the-loop: request_confirmation tool
                  if (toolInvocation.toolName === 'request_confirmation') {
                    const approval =
                      toolInvocation.state === 'approval-responded' ||
                        toolInvocation.state === 'output-available' ||
                        toolInvocation.state === 'output-denied'
                        ? { id: toolInvocation.toolCallId, approved: (toolInvocation as any).result?.approved ?? false }
                        : { id: toolInvocation.toolCallId }

                    return (
                      <Confirmation key={i} approval={approval as any} state={toolInvocation.state}>
                        <ConfirmationTitle>
                          <strong>{(toolInvocation.args as any)?.action}</strong>
                          {' — '}{(toolInvocation.args as any)?.reason}
                        </ConfirmationTitle>

                        <ConfirmationRequest>
                          <ConfirmationActions>
                            <ConfirmationAction
                              variant="outline"
                              onClick={() =>
                                addToolApprovalResponse({
                                  id: toolInvocation.toolCallId,
                                  approved: false,
                                })
                              }
                            >
                              Reject
                            </ConfirmationAction>
                            <ConfirmationAction
                              onClick={() =>
                                addToolApprovalResponse({
                                  id: toolInvocation.toolCallId,
                                  approved: true,
                                })
                              }
                            >
                              Approve
                            </ConfirmationAction>
                          </ConfirmationActions>
                        </ConfirmationRequest>

                        <ConfirmationAccepted>
                          <span className="text-green-600 text-sm">✓ Approved</span>
                        </ConfirmationAccepted>

                        <ConfirmationRejected>
                          <span className="text-destructive text-sm">✗ Rejected</span>
                        </ConfirmationRejected>
                      </Confirmation>
                    )
                  }

                  // All other tools
                  return (
                    <Tool key={i}>
                      <ToolHeader
                        type={toolInvocation.toolName as any}
                        state={toolInvocation.state}
                        title={toolInvocation.toolName.replace(/_/g, ' ')}
                      />
                      <ToolContent>
                        <ToolInput input={toolInvocation.args} />
                        {(toolInvocation.state === 'output-available' || toolInvocation.state === 'output-error') && (
                          <ToolOutput
                            output={(toolInvocation as any).result}
                            errorText={toolInvocation.state === 'output-error' ? 'Tool execution failed' : undefined}
                          />
                        )}
                      </ToolContent>
                    </Tool>
                  )
                }

                return null
              })}

              {/* Copy action for assistant messages */}
              {message.role === 'assistant' && (
                <MessageToolbar>
                  <MessageActions>
                    <MessageAction
                      tooltip="Copy"
                      onClick={() => {
                        const text = message.parts
                          .filter((p: any) => p.type === 'text')
                          .map((p: any) => (p as any).text)
                          .join('')
                        navigator.clipboard.writeText(text)
                        toast.success('Copied')
                      }}
                    >
                      <CopyIcon className="h-3 w-3" />
                    </MessageAction>
                  </MessageActions>
                </MessageToolbar>
              )}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="border-t p-3">
        <PromptInput
          onSubmit={async ({ text }) => {
            const trimmed = text.trim()
            if (!trimmed) return
            await sendMessage({ text: trimmed })
            setInput('')
          }}
        >
          <Attachments />
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI assistant or send a message..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
