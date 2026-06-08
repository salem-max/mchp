'use client';

import StatsCard from '@/components/features/dashboard/statscard';
import JobCard from '@/components/features/dashboard/Technician/jobcard';
import EarningsChart from '@/components/features/dashboard/customer-tech-earningchart';
import CustomerActivityFeed from '@/components/features/dashboard/Customer/customer-activityfeed';
import QuickActions from '@/components/features/dashboard/quickaction';
import { DollarSign, Briefcase, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';

import { MagicPageWrapper } from "@/components/layouts/MagicPageWrapper";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery(
    { customerId: user?.id },
    { enabled: !!user?.id }
  );

  const activeJobs = jobs.filter(
    (job: { status: string }) =>
      job.status === 'IN_PROGRESS' || job.status === 'ASSIGNED'
  );
  const totalSpent = jobs.reduce(
    (sum: number, job: { budget?: number }) => sum + (job.budget || 0),
    0
  );
  const averageRating = 4.9; // TODO: Fetch from user profile

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MagicPageWrapper>
      <div className="space-y-6">
        <QuickActions role="CUSTOMER" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Active Jobs"
            value={activeJobs.length.toString()}
            icon={Briefcase}
            trend={{ value: 20, isPositive: true }}
          />
          <StatsCard
            title="Total Spent"
            value={`RM ${totalSpent.toLocaleString()}`}
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
            {jobs.slice(0, 5).map((job: { id: string; title: string; location?: { address?: string } | null; budget?: number; status: string; technician?: { name?: string } | null }) => (
              <JobCard
                key={job.id}
                title={job.title}
                location={
                  typeof job.location === 'object' && job.location?.address
                    ? job.location.address
                    : 'Location not specified'
                }
                budget={job.budget || 0}
                status={
                  job.status as
                    | 'OPEN'
                    | 'ASSIGNED'
                    | 'IN_PROGRESS'
                    | 'COMPLETED'
                    | 'DISPUTED'
                }
                technicianName={job.technician?.name || 'Not assigned'}
                role="CUSTOMER"
              />
            ))}
          </div>
        </div>

        <CustomerActivityFeed />
      </div>
    </MagicPageWrapper>
  );
}
