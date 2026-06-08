'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Wrench,
  FileText,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { MagicPageWrapper } from '@/components/layouts/MagicPageWrapper'

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
}

export default function CMMSPage() {
  const router = useRouter()

  // tRPC queries for analytics, work orders, alerts, and inventory
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.kpis.useQuery()
  const { data: workOrders = [], isLoading: workOrdersLoading } = trpc.workOrders.list.useQuery()
  const { data: alerts, isLoading: alertsLoading } = trpc.analytics.alerts.useQuery()
  const { data: inventory = [], isLoading: inventoryLoading } = trpc.inventory.list.useQuery()

  const loading = analyticsLoading || workOrdersLoading || alertsLoading || inventoryLoading

  // Compute stats from tRPC data
  const stats = analytics
    ? {
        assets: {
          total: (analytics as any).totalAssets ?? 0,
          active: (analytics as any).activeAssets ?? 0,
          maintenance: ((analytics as any).totalAssets ?? 0) - ((analytics as any).activeAssets ?? 0),
        },
        workOrders: {
          total: (analytics as any).totalWorkOrders ?? 0,
          open: workOrders.filter((wo: { status: string }) => wo.status === 'OPEN').length,
          inProgress: workOrders.filter((wo: { status: string }) => wo.status === 'IN_PROGRESS').length,
          completed: (analytics as any).completedWorkOrders ?? 0,
        },
        inventory: {
          total: inventory.length,
          lowStock: inventory.filter((i: { quantity: number; threshold?: number }) =>
            i.threshold && i.quantity <= i.threshold && i.quantity > 0
          ).length,
          outOfStock: inventory.filter((i: { quantity: number }) => i.quantity === 0).length,
        },
        alerts: {
          critical: (alerts as any)?.criticalAlerts?.length ?? 0,
          high: (alerts as any)?.highAlerts?.length ?? 0,
          overdue: (alerts as any)?.overdueMaintenance?.length ?? 0,
        },
      }
    : null

  const recentWOs = workOrders.slice(0, 5)

  return (
    <MagicPageWrapper>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">CMMS Dashboard</h1>
            <p className="text-muted-foreground mt-1">Computerized Maintenance Management System</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/cmms/work-orders')}>
              <Plus className="w-4 h-4 mr-2" />New Work Order
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assets */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/cmms/assets')}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-3xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stats?.assets.total ?? '—'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {loading ? '' : `${stats?.assets.active} active`}
              </p>
            </CardContent>
          </Card>

          {/* Work Orders */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/cmms/work-orders')}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Work Orders</p>
              <p className="text-3xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stats?.workOrders.total ?? '—'}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {loading ? '' : `${stats?.workOrders.inProgress} in progress`}
              </p>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/cmms/inventory')}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Inventory Parts</p>
              <p className="text-3xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stats?.inventory.total ?? '—'}
              </p>
              {!loading && (stats?.inventory.lowStock || 0) > 0 && (
                <p className="text-xs text-yellow-600 mt-1">{stats?.inventory.lowStock} low stock</p>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/dashboard/cmms/enhanced')}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  (stats?.alerts.critical || 0) + (stats?.alerts.high || 0)
                )}
              </p>
              {!loading && (stats?.alerts.overdue || 0) > 0 && (
                <p className="text-xs text-orange-600 mt-1">{stats?.alerts.overdue} overdue PM</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Assets', href: '/dashboard/cmms/assets', icon: Wrench, color: 'from-blue-500 to-blue-600' },
            { label: 'Work Orders', href: '/dashboard/cmms/work-orders', icon: FileText, color: 'from-purple-500 to-purple-600' },
            { label: 'Inventory', href: '/dashboard/cmms/inventory', icon: Package, color: 'from-green-500 to-green-600' },
            { label: 'Analytics', href: '/dashboard/cmms/analytics', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
          ].map(({ label, href, icon: Icon, color }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`bg-gradient-to-r ${color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <p className="font-semibold">{label}</p>
            </button>
          ))}
        </div>

        {/* Recent Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Work Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/cmms/work-orders')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recentWOs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No work orders yet</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/dashboard/cmms/work-orders')}
                >
                  <Plus className="w-4 h-4 mr-1" />Create First Work Order
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentWOs.map(
                  (wo: { id: string; title: string; asset?: { name: string }; createdAt: string | Date; priority: string; status: string }) => (
                    <div
                      key={wo.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/cmms/work-orders/${wo.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{wo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {wo.asset?.name} &bull; {new Date(wo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLOR[wo.priority] || ''}`}
                        >
                          {wo.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[wo.status] || ''}`}
                        >
                          {wo.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MagicPageWrapper>
  )
}

