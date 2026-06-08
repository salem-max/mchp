"use client"

import { TechnicianList } from '@/components/features/marketplace/technicians'

export default function TechnicianDirectoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Technicians</h1>
      <TechnicianList />
    </div>
  )
}
