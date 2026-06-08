"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Wrench, FileText, Package, BarChart3,
  AlertTriangle, Users, Cpu, ChevronDown, Menu, X, Bell,
  LogOut, Settings, TrendingUp, Calendar, Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/lib/trpc/client'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  children?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/cmms',
    icon: LayoutDashboard,
  },
  {
    label: 'Assets',
    href: '/dashboard/cmms/assets',
    icon: Wrench,
    children: [
      { label: 'All Assets', href: '/dashboard/cmms/assets', icon: Wrench },
      { label: 'Digital Twins', href: '/dashboard/cmms/enhanced', icon: Cpu },
    ],
  },
  {
    label: 'Work Orders',
    href: '/dashboard/cmms/work-orders',
    icon: FileText,
    children: [
      { label: 'All Work Orders', href: '/dashboard/cmms/work-orders', icon: FileText },
      { label: 'Preventive Maintenance', href: '/dashboard/cmms/preventive-maintenance', icon: Calendar },
    ],
  },
  {
    label: 'Inventory',
    href: '/dashboard/cmms/inventory',
    icon: Package,
  },
  {
    label: 'Analytics',
    href: '/dashboard/cmms/analytics',
    icon: BarChart3,
    children: [
      { label: 'KPI Dashboard', href: '/dashboard/cmms/analytics', icon: TrendingUp },
      { label: 'Reports', href: '/dashboard/cmms/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Alerts',
    href: '/dashboard/cmms/enhanced',
    icon: AlertTriangle,
  },
  {
    label: 'Users',
    href: '/dashboard/cmms/users',
    icon: Users,
  },
]

function AlertBadge() {
  const { data: alerts } = trpc.analytics.alerts.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })
  const count = alerts ? (alerts.criticalAlerts?.length ?? 0) + (alerts.highAlerts?.length ?? 0) : 0
  if (!count) return null
  return <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{count}</span>
}

function WorkOrderBadge() {
  const { data: workOrders = [] } = trpc.workOrders.list.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })
  const count = workOrders.filter((w: { status: string }) => w.status === 'OPEN').length
  if (!count) return null
  return <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">{count}</span>
}

export function CMMSNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const isActive = useCallback((href: string) =>
    href === '/dashboard/cmms'
      ? pathname === href
      : pathname?.startsWith(href), [pathname])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/dashboard/cmms" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">CMMS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href)
              if (item.children) {
                return (
                  <DropdownMenu key={item.label} open={openDropdown === item.label} onOpenChange={o => setOpenDropdown(o ? item.label : null)}>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {item.label === 'Alerts' && <AlertBadge />}
                        {item.label === 'Work Orders' && <WorkOrderBadge />}
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52">
                      {item.children.map(child => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link href={child.href} className={cn(
                            'flex items-center gap-2 cursor-pointer',
                            pathname === child.href && 'text-blue-700 font-medium'
                          )}>
                            <child.icon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
              return (
                <Link key={item.label} href={item.href} className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.label === 'Alerts' && <AlertBadge />}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Back to main app */}
            <Link href="/dashboard/customer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              ← Main App
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{user?.role}</Badge>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/cmms/users" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.label === 'Alerts' && <AlertBadge />}
                  {item.label === 'Work Orders' && <WorkOrderBadge />}
                </Link>
                {item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          pathname === child.href ? 'text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link href="/dashboard/customer" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
                ← Back to Main App
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
