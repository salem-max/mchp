"use client"

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: Date;
  isOwn?: boolean;
}

interface MessageThreadProps {
  participantId: string;
  participantName?: string;
  participantAvatar?: string;
}

export default function MessageThread({
  participantId,
  participantName,
  participantAvatar
}: MessageThreadProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Get messages
  const { data: messages, isLoading } = trpc.messaging.getThread.useQuery({
    participantId
  });

  // Send message mutation
  const sendMessage = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    },
    onError: () => {
      toast.error("Failed to send message");
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        participantId,
        content: message.trim()
      });
    } finally {
      setIsSending(false);
    }
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={participantAvatar} />
            <AvatarFallback>
              {participantName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold">{participantName || "User"}</h2>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader className="h-5 w-5 animate-spin" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-xs ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                  {!msg.isOwn && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.senderAvatar} />
                      <AvatarFallback>
                        {msg.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`${msg.isOwn ? "text-right" : ""}`}>
                    <div
                      className={`rounded-lg px-3 py-2 break-words ${
                        msg.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <Separator />
      <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );
}
