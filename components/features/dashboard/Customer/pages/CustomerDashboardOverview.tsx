"use client"

import { CustomerSummaryCard } from '@/components/features/dashboard/customer/components'

export default function CustomerDashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customer Dashboard</h1>
      <CustomerSummaryCard />
    </div>
  )
}
