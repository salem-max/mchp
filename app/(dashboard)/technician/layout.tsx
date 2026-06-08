'use client'

import { Suspense } from 'react'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import TechnicianDashboardLayout from "@/components/features/dashboard/Technician/TechnicianDashboardLayout"

function TechnicianLayoutInner({ children }: { children: React.ReactNode }) {
  useRoleGuard({ requiredRole: 'TECHNICIAN' })
  return <TechnicianDashboardLayout>{children}</TechnicianDashboardLayout>
}

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>}>
      <TechnicianLayoutInner>{children}</TechnicianLayoutInner>
    </Suspense>
  )
}
