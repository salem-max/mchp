'use client'

import { Suspense } from 'react'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import CustomerDashboardLayout from "@/components/features/dashboard/Customer/CustomerDashboardLayout"

function CustomerLayoutInner({ children }: { children: React.ReactNode }) {
  useRoleGuard({ requiredRole: 'CUSTOMER' })
  return <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>}>
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </Suspense>
  )
}
