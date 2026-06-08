"use client"

import JobList from '@/components/features/marketplace/jobs/components/JobList'

export default function JobBoardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Job Board</h1>
      <JobList />
    </div>
  )
}
