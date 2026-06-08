'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { ComponentType } from 'react'
import { RefreshCw, TrendingUp, Clock, Wrench, CheckCircle, AlertTriangle, Package } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'

interface Analytics {
  kpis: {
    mttr: number
    mtbf: number
    totalWorkOrders: number
    completedWorkOrders: number
    pendingWorkOrders: number
    totalAssets: number
    activeAssets: number
    assetAvailability: string
    totalMaintenanceCost: number
    averageCostPerWO: number
  }
  assetDowntime: { assetId: string; assetName: string; downtime: number }[]
  workOrderTrend: { open: number; assigned: number; inProgress: number; completed: number }
}

const PIE_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#22c55e']

const MOCK_TREND = [
  { month: 'Jan', created: 12, completed: 10 },
  { month: 'Feb', created: 18, completed: 15 },
  { month: 'Mar', created: 14, completed: 14 },
  { month: 'Apr', created: 22, completed: 18 },
  { month: 'May', created: 16, completed: 20 },
  { month: 'Jun', created: 25, completed: 22 },
]

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics', { credentials: 'include' })
      if (res.ok) setAnalytics(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAnalytics() }, [])

  const pieData = analytics ? [
    { name: 'Open', value: analytics.workOrderTrend.open },
    { name: 'Assigned', value: analytics.workOrderTrend.assigned },
    { name: 'In Progress', value: analytics.workOrderTrend.inProgress },
    { name: 'Completed', value: analytics.workOrderTrend.completed },
  ] : []

  const downtimeData = (analytics?.assetDowntime || [])
    .filter(a => a.downtime > 0)
    .sort((a, b) => b.downtime - a.downtime)
    .slice(0, 8)
    .map(a => ({ name: a.assetName.length > 12 ? a.assetName.slice(0, 12) + '…' : a.assetName, hours: +(a.downtime / 60).toFixed(1) }))

  const completionRate = analytics
    ? analytics.kpis.totalWorkOrders > 0
      ? ((analytics.kpis.completedWorkOrders / analytics.kpis.totalWorkOrders) * 100).toFixed(1)
      : '0'
    : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & KPIs</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and maintenance insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard label="Total Assets" value={analytics.kpis.totalAssets} sub={`${analytics.kpis.activeAssets} active`} icon={Wrench} color="bg-blue-500" />
          <KPICard label="Asset Availability" value={analytics.kpis.assetAvailability} icon={CheckCircle} color="bg-green-500" />
          <KPICard label="Total Work Orders" value={analytics.kpis.totalWorkOrders} icon={AlertTriangle} color="bg-purple-500" />
          <KPICard label="Completion Rate" value={`${completionRate}%`} sub={`${analytics.kpis.completedWorkOrders} completed`} icon={TrendingUp} color="bg-emerald-500" />
          <KPICard label="MTTR (min)" value={analytics.kpis.mttr.toFixed(1)} sub="Mean time to repair" icon={Clock} color="bg-orange-500" />
          <KPICard label="MTBF (hrs)" value={analytics.kpis.mtbf.toFixed(1)} sub="Mean time between failures" icon={Package} color="bg-teal-500" />
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No analytics data available</div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Order Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Status Distribution</CardTitle>
            <CardDescription>Current breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Work Order Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Trend</CardTitle>
            <CardDescription>Created vs completed over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={MOCK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="#dbeafe" name="Created" />
                  <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="#dcfce7" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Downtime */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Downtime</CardTitle>
            <CardDescription>Hours of downtime per asset (top 8)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : downtimeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No downtime data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={downtimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => [`${v}h`, 'Downtime']} />
                  <Bar dataKey="hours" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Cost Analysis</CardTitle>
            <CardDescription>Total and average cost per work order</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64" /> : analytics ? (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">Total Maintenance Cost</p>
                    <p className="text-2xl font-bold text-blue-700">${(analytics.kpis.totalMaintenanceCost / 100).toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <p className="text-xs text-green-600 font-medium mb-1">Avg Cost per WO</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${(typeof analytics.kpis.averageCostPerWO === 'string'
                        ? parseFloat(analytics.kpis.averageCostPerWO)
                        : analytics.kpis.averageCostPerWO / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Open', value: analytics.workOrderTrend.open, color: 'bg-gray-400', total: analytics.kpis.totalWorkOrders },
                    { label: 'In Progress', value: analytics.workOrderTrend.inProgress, color: 'bg-purple-500', total: analytics.kpis.totalWorkOrders },
                    { label: 'Completed', value: analytics.workOrderTrend.completed, color: 'bg-green-500', total: analytics.kpis.totalWorkOrders },
                  ].map(({ label, value, color, total }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value} ({total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
