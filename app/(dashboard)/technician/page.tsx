"use client";

import StatsCard from '@/components/features/dashboard/statscard'
import JobCard from '@/components/features/dashboard/Technician/jobcard'
import EarningsChart from '@/components/features/dashboard/customer-tech-earningchart';
import ActivityFeed from '@/components/features/dashboard/activityfeed';
import QuickActions from '@/components/features/dashboard/quickaction';
import AvailabilityToggle from '@/components/features/dashboard/availabilitytoggle';
import { DollarSign, Briefcase, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';
import { MagicPageWrapper } from "@/components/layouts/MagicPageWrapper";

export default function TechnicianDashboard() {
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery(
    { technicianId: user?.id },
    { enabled: !!user?.id }
  );

  const pendingJobs = jobs.filter((job: { status: string }) => job.status === 'OPEN' || job.status === 'ASSIGNED');
  const thisMonthEarnings = jobs
    .filter((job: { status: string }) => job.status === 'COMPLETED')
    .reduce((sum: number, job: { budget?: number }) => sum + (job.budget || 0), 0);
  const averageRating = 4.8; // TODO: Fetch from user profile

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MagicPageWrapper>

      <div className="space-y-6">
        <QuickActions role="TECHNICIAN" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Pending Jobs"
            value={pendingJobs.length.toString()}
            icon={Briefcase}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="This Month Earnings"
            value={`RM ${(thisMonthEarnings / 100).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Rating"
            value={averageRating.toString()}
            icon={Star}
            color="purple"
          />
        </div>

        <EarningsChart />

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Jobs</h2>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job: { 
              id: string; 
              title: string; 
              description: string; 
              location?: { address?: string } | null; 
              budget?: number; 
              status: string; 
              customer?: { name?: string } | null 
            }) => (
              <JobCard
                key={job.id}
                title={job.title}
                description={job.description}
                location={
                  typeof job.location === 'object' && job.location?.address
                    ? job.location.address
                    : 'Location not specified'
                }
                budget={job.budget ? job.budget / 100 : 0}
                status={job.status as 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED'}
                customerName={job.customer?.name || 'Unknown customer'}
                role="TECHNICIAN"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <AvailabilityToggle />
        </div>
      </div>
    </MagicPageWrapper>
  );
}
