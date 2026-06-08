import { CMMSNavbar } from '@/components/features/dashboard/CMMS/CMMSNavbar'

export default function CMMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CMMSNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
