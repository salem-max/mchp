'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, FileText, Wrench, Package, Users } from 'lucide-react'
import { toast } from 'sonner'

interface ReportData {
  kpis: {
    totalWorkOrders: number; completedWorkOrders: number; pendingWorkOrders: number
    totalAssets: number; activeAssets: number; assetAvailability: string
    mttr: number; mtbf: number; totalMaintenanceCost: number; averageCostPerWO: number
  }
  workOrderTrend: { open: number; assigned: number; inProgress: number; completed: number }
  assetDowntime: { assetName: string; downtime: number }[]
}

type ReportType = 'work-orders' | 'assets' | 'maintenance' | 'inventory'

const REPORT_TABS: { id: ReportType; label: string; icon: any }[] = [
  { id: 'work-orders', label: 'Work Orders', icon: FileText },
  { id: 'assets', label: 'Assets', icon: Wrench },
  { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
  { id: 'inventory', label: 'Inventory', icon: Package },
]

function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast.success(`${filename} downloaded`)
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReportType>('work-orders')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [analyticsRes, invRes, assetRes, woRes] = await Promise.all([
        fetch('/api/analytics', { credentials: 'include' }),
        fetch('/api/inventory', { credentials: 'include' }),
        fetch('/api/assets', { credentials: 'include' }),
        fetch('/api/work-orders', { credentials: 'include' }),
      ])
      if (analyticsRes.ok) setData(await analyticsRes.json())
      if (invRes.ok) setInventory(await invRes.json())
      if (assetRes.ok) setAssets(await assetRes.json())
      if (woRes.ok) setWorkOrders(await woRes.json())
    } catch { toast.error('Failed to load report data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleExport = () => {
    if (activeTab === 'work-orders') {
      exportCSV('work-orders-report.csv',
        workOrders.map(w => [w.id, w.title, w.status, w.priority, w.asset?.name || '', w.assignedUser?.name || 'Unassigned', w.createdAt?.slice(0, 10) || '', w.dueDate?.slice(0, 10) || '']),
        ['ID', 'Title', 'Status', 'Priority', 'Asset', 'Assigned To', 'Created', 'Due Date']
      )
    } else if (activeTab === 'assets') {
      exportCSV('assets-report.csv',
        assets.map(a => [a.id, a.name, a.type, a.location, a.status, a.model || '', a.serialNumber || '', a.createdAt?.slice(0, 10) || '']),
        ['ID', 'Name', 'Type', 'Location', 'Status', 'Model', 'Serial Number', 'Created']
      )
    } else if (activeTab === 'inventory') {
      exportCSV('inventory-report.csv',
        inventory.map(i => [i.id, i.partName, i.quantity, i.threshold, i.supplier || '', i.cost || '', i.location || '', i.quantity <= i.threshold ? 'LOW STOCK' : 'OK']),
        ['ID', 'Part Name', 'Quantity', 'Threshold', 'Supplier', 'Unit Cost', 'Location', 'Stock Status']
      )
    } else if (activeTab === 'maintenance' && data) {
      exportCSV('maintenance-report.csv',
        [
          ['MTTR (minutes)', data.kpis.mttr.toFixed(2)],
          ['MTBF (hours)', data.kpis.mtbf.toFixed(2)],
          ['Total Work Orders', String(data.kpis.totalWorkOrders)],
          ['Completed', String(data.kpis.completedWorkOrders)],
          ['Pending', String(data.kpis.pendingWorkOrders)],
          ['Completion Rate', `${data.kpis.totalWorkOrders > 0 ? ((data.kpis.completedWorkOrders / data.kpis.totalWorkOrders) * 100).toFixed(1) : 0}%`],
          ['Total Cost', `$${(data.kpis.totalMaintenanceCost / 100).toFixed(2)}`],
          ['Avg Cost/WO', `$${(typeof data.kpis.averageCostPerWO === 'string' ? parseFloat(data.kpis.averageCostPerWO) : data.kpis.averageCostPerWO / 100).toFixed(2)}`],
        ],
        ['Metric', 'Value']
      )
    }
  }

  const completionRate = data && data.kpis.totalWorkOrders > 0
    ? ((data.kpis.completedWorkOrders / data.kpis.totalWorkOrders) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">CMMS Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and export maintenance reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 flex-wrap">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Work Orders Report */}
      {activeTab === 'work-orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />) : data ? [
              { label: 'Total', value: data.kpis.totalWorkOrders, color: 'text-gray-900' },
              { label: 'Completed', value: data.kpis.completedWorkOrders, color: 'text-green-600' },
              { label: 'Pending', value: data.kpis.pendingWorkOrders, color: 'text-yellow-600' },
              { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <Card key={label}><CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent></Card>
            )) : null}
          </div>
          <Card>
            <CardHeader><CardTitle>Recent Work Orders</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left">
                      {['Title', 'Asset', 'Priority', 'Status', 'Assigned', 'Due'].map(h => (
                        <th key={h} className="py-2 px-3 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {workOrders.slice(0, 10).map(wo => (
                        <tr key={wo.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium max-w-[180px] truncate">{wo.title}</td>
                          <td className="py-2 px-3 text-muted-foreground">{wo.asset?.name || '—'}</td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            wo.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : wo.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : wo.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>{wo.priority}</span></td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            wo.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : wo.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>{wo.status?.replace('_', ' ')}</span></td>
                          <td className="py-2 px-3 text-muted-foreground">{wo.assignedUser?.name || '—'}</td>
                          <td className="py-2 px-3 text-muted-foreground">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets Report */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />) : [
              { label: 'Total Assets', value: assets.length, color: 'text-gray-900' },
              { label: 'Active', value: assets.filter(a => a.status === 'ACTIVE').length, color: 'text-green-600' },
              { label: 'In Maintenance', value: assets.filter(a => a.status === 'MAINTENANCE').length, color: 'text-yellow-600' },
              { label: 'Inactive', value: assets.filter(a => a.status === 'INACTIVE').length, color: 'text-gray-500' },
            ].map(({ label, value, color }) => (
              <Card key={label}><CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>Asset Registry</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left">
                      {['Name', 'Type', 'Location', 'Status', 'Model', 'Created'].map(h => (
                        <th key={h} className="py-2 px-3 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {assets.slice(0, 10).map(a => (
                        <tr key={a.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{a.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{a.type}</td>
                          <td className="py-2 px-3 text-muted-foreground">{a.location}</td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : a.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>{a.status}</span></td>
                          <td className="py-2 px-3 text-muted-foreground">{a.model || '—'}</td>
                          <td className="py-2 px-3 text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Report */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />) : data ? [
            { label: 'MTTR', value: `${data.kpis.mttr.toFixed(1)} min`, desc: 'Mean Time To Repair' },
            { label: 'MTBF', value: `${data.kpis.mtbf.toFixed(1)} hrs`, desc: 'Mean Time Between Failures' },
            { label: 'Total Cost', value: `$${(data.kpis.totalMaintenanceCost / 100).toFixed(2)}`, desc: 'Total maintenance spend' },
            { label: 'Avg Cost/WO', value: `$${(typeof data.kpis.averageCostPerWO === 'string' ? parseFloat(data.kpis.averageCostPerWO) : data.kpis.averageCostPerWO / 100).toFixed(2)}`, desc: 'Average cost per work order' },
          ].map(({ label, value, desc }) => (
            <Card key={label}><CardContent className="pt-5 pb-5">
              <p className="text-sm text-muted-foreground">{desc}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent></Card>
          )) : null}
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />) : [
              { label: 'Total Parts', value: inventory.length, color: 'text-gray-900' },
              { label: 'Low Stock', value: inventory.filter(i => i.quantity <= i.threshold && i.quantity > 0).length, color: 'text-yellow-600' },
              { label: 'Out of Stock', value: inventory.filter(i => i.quantity === 0).length, color: 'text-red-600' },
              { label: 'Total Value', value: `$${inventory.reduce((s, i) => s + (i.cost || 0) * i.quantity, 0).toFixed(2)}`, color: 'text-green-600' },
            ].map(({ label, value, color }) => (
              <Card key={label}><CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>Inventory Status</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left">
                      {['Part Name', 'Qty', 'Threshold', 'Supplier', 'Unit Cost', 'Status'].map(h => (
                        <th key={h} className="py-2 px-3 font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {inventory.slice(0, 15).map(item => (
                        <tr key={item.id} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{item.partName}</td>
                          <td className="py-2 px-3">{item.quantity}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.threshold}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.supplier || '—'}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.cost ? `$${item.cost}` : '—'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.quantity === 0 ? 'bg-red-100 text-red-700' : item.quantity <= item.threshold ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
