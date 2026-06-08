'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRoleGuard } from '@/hooks/useRoleGuard'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Briefcase, AlertTriangle,
  LogOut, Menu, X, Shield, Star,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/mobile'
import { MobileHeader, MobileBottomTabs, MobileSafeAreaContainer } from '@/components/mobile'

const adminLinks = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Users',     href: '/dashboard/admin/users', icon: Users },
  { name: 'Jobs',      href: '/dashboard/admin/jobs', icon: Briefcase },
  { name: 'Disputes',  href: '/dashboard/admin/disputes', icon: AlertTriangle },
]

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/login')
  }

  return (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <Link href="/dashboard/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={name}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        {user?.isSuperAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-400">Super Admin</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

const adminMobileTabs = [
  { icon: <LayoutDashboard size={22} />, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: <Users size={22} />, label: 'Users', href: '/dashboard/admin/users' },
  { icon: <Briefcase size={22} />, label: 'Jobs', href: '/dashboard/admin/jobs' },
  { icon: <AlertTriangle size={22} />, label: 'Disputes', href: '/dashboard/admin/disputes' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useRoleGuard({ requiredRole: 'ADMIN' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <MobileSafeAreaContainer>
        <MobileHeader title="Admin Panel" variant="default" showMenuButton={false} showBackButton={false} />
        <main className="flex-1 overflow-y-auto pb-20 p-4">{children}</main>
        <MobileBottomTabs tabs={adminMobileTabs} />
      </MobileSafeAreaContainer>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="hidden lg:block flex-shrink-0">
        <AdminSidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
