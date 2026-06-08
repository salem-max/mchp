'use client';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline?: boolean;
}

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export default function ChatList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ChatListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Messages</h2>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              whileHover={{ backgroundColor: '#f9fafb' }}
              className={cn(
                'w-full p-3 border-b border-gray-100 text-left transition-colors',
                activeConversationId === conversation.id && 'bg-blue-50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.userAvatar ? (
                    <img
                      src={conversation.userAvatar}
                      alt={conversation.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  )}
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.userName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                        addSuffix: false,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
