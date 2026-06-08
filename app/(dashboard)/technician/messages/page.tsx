'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'), { ssr: false });

interface Job {
  id: string;
  title: string;
  status: string;
  customer: { id: string; full_name: string | null; avatar_url: string | null } | null;
  created_at: string;
}

export default function TechnicianMessagesPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/jobs?technicianId=${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.data || []));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Conversations with your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-1">Accept a job to start chatting with customers.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left border rounded-xl p-4 hover:shadow-md transition-all ${
                  selectedJob?.id === job.id ? 'border-emerald-500 bg-emerald-50' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {job.customer?.full_name?.[0] || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate">{job.customer?.full_name || 'Customer'}</p>
                      <Badge variant="outline" className="text-xs">{job.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
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
              otherUserId={selectedJob.customer?.id || ''}
              otherUserName={selectedJob.customer?.full_name || 'Customer'}
              otherUserAvatar={selectedJob.customer?.avatar_url || undefined}
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
