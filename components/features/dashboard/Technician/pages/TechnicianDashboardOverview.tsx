"use client"

import { JobCard } from '@/components/features/dashboard/technician/components'

export default function TechnicianDashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Technician Dashboard</h1>
      <JobCard />
    </div>
  )
}
