"use client"

import { AdminControlPanel } from '@/components/features/dashboard/admin/components'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <AdminControlPanel />
    </div>
  )
}
