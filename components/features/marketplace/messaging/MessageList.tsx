"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  online: boolean;
}

interface MessageListProps {
  onSelectConversation?: (participantId: string) => void;
}

export default function MessageList({ onSelectConversation }: MessageListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Get conversations
  const { data: conversations, isLoading } = trpc.messaging.listConversations.useQuery();

  const filtered = conversations?.filter((conv) =>
    conv.participantName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSelectConversation = (participantId: string) => {
    if (onSelectConversation) {
      onSelectConversation(participantId);
    } else {
      router.push(`/dashboard/messages/${participantId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {/* Conversations List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i: any) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {conversations?.length === 0
                ? "No conversations yet"
                : "No conversations match your search"}
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {filtered.map((conversation) => (
              <motion.button
                key={conversation.id}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
                onClick={() => handleSelectConversation(conversation.participantId)}
                className="w-full text-left"
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participantAvatar} />
                        <AvatarFallback>
                          {conversation.participantName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">
                          {conversation.participantName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      {conversation.lastMessageTime && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessageTime),
                            { addSuffix: true }
                          )}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
