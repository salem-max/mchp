'use client';

import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';

import { CodeBlock } from '@/components/ai-elements/code-block';
import { Reasoning } from '@/components/ai-elements/reasoning';
import { StackTrace } from '@/components/ai-elements/stack-trace';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
  message: Message;
}

function detectContentType(content: string): 'text' | 'code' | 'tool' | 'reasoning' | 'error' {
  if (content.includes('```')) return 'code';
  if (content.includes('"type": "function"') || content.includes('"tool_call"')) return 'tool';
  if (content.includes('Error:') || content.includes('Exception:')) return 'error';
  if (content.includes('Thought:') || content.includes('Reasoning:')) return 'reasoning';
  return 'text';
}

function ContentRenderer({ content }: { content: string }) {
  const type = detectContentType(content);
  
  switch (type) {
    case 'code':
      return <CodeBlock code={content} language="typescript" />;
    case 'error':
      return <StackTrace trace={content} />;
    case 'reasoning':
      return <Reasoning isStreaming={false}>{content}</Reasoning>;
    default:
      return <div className="text-sm prose prose-sm max-w-none">{content}</div>;
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const timeStr = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  return (
    <div className={`flex gap-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      {!message.isOwn && message.senderAvatar && (
        <Image
          src={message.senderAvatar}
          alt={message.senderName}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
        {!message.isOwn && (
          <p className="text-xs font-medium text-gray-600 mb-1">
            {message.senderName}
          </p>
        )}

        <div
          className={`max-w-xs px-4 py-2 rounded-lg break-words ${
            message.isOwn
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          <ContentRenderer content={message.content} />
        </div>

        <div className={`flex items-center gap-1 mt-1 text-xs ${
          message.isOwn ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <span>{timeStr}</span>
          {message.isOwn && (
            <>
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
