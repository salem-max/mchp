'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, DollarSign, Calendar, Loader2, RefreshCw, Zap, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface Job {
  id: string;
  title: string;
  description: string;
  address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  customer: { id: string; full_name: string | null } | null;
}

const STATUS_TABS = [
  { value: 'all',         label: 'All Jobs' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  accepted:    { label: 'Accepted',    className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-800' },
  cancelled:   { label: 'Cancelled',   className: 'bg-red-100 text-red-800' },
};

export default function TechnicianJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs?technicianId=${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.data || []));
      } else {
        toast.error('Failed to load jobs');
      }
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = jobs.filter((j) =>
    activeTab === 'all' ? true : j.status === activeTab
  );

  const stats = [
    { label: 'Active',    value: jobs.filter((j) => j.status === 'in_progress').length, icon: Zap,   color: 'text-blue-600' },
    { label: 'Completed', value: jobs.filter((j) => j.status === 'completed').length,   icon: Check, color: 'text-green-600' },
    { label: 'Accepted',  value: jobs.filter((j) => j.status === 'accepted').length,    icon: Clock, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Jobs</h1>
          <p className="text-muted-foreground">Manage your accepted and completed jobs</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold">{isLoading ? '—' : value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs + List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No jobs found</div>
          ) : (
            filtered.map((job) => {
              const badge = STATUS_BADGE[job.status] || { label: job.status, className: 'bg-gray-100 text-gray-800' };
              return (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/technician/jobs/${job.id}`)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={badge.className}>{badge.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-semibold truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{job.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          {job.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{job.address}
                            </span>
                          )}
                          {job.customer?.full_name && (
                            <span>Customer: {job.customer.full_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">
                          {job.budget_max ? `RM ${job.budget_max.toFixed(0)}` : 'TBD'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
