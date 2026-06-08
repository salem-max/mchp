'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/hooks/useAuth';

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'), { ssr: false });

export default function CustomerMessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: allJobs = [], isLoading } = trpc.jobs.list.useQuery(
    { customerId: user?.id },
    { enabled: !!user?.id }
  );

  // Only show jobs that have an assigned technician (can message)
  const jobs = allJobs.filter((j: { technician?: { id: string } | null }) => j.technician);
  const selectedJob = jobs.find((j: { id: string }) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Conversations with your technicians</p>
        </div>
        <Button onClick={() => router.push('/dashboard/customer/post-job')}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active conversations yet.</p>
              <p className="text-xs mt-1">Post a job and accept a bid to start chatting.</p>
            </div>
          ) : (
            jobs.map((job: { 
              id: string; 
              title: string; 
              status: string; 
              createdAt: string | Date;
              technician?: { id: string; name?: string } | null;
            }) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full text-left border rounded-xl p-4 hover:shadow-md transition-all ${
                  selectedJobId === job.id ? 'border-blue-500 bg-blue-50' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {job.technician?.name?.[0] || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate">{job.technician?.name || 'Technician'}</p>
                      <Badge variant="outline" className="text-xs">{job.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <ChatWindow
              conversationId={selectedJob.id}
              jobId={selectedJob.id}
              otherUserId={(selectedJob as { technician?: { id: string } }).technician?.id || ''}
              otherUserName={(selectedJob as { technician?: { name?: string } }).technician?.name || 'Technician'}
              otherUserAvatar={undefined}
            />
          ) : (
            <div className="h-[600px] border rounded-xl flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
