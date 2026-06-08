'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Eye, RefreshCw, FileText } from 'lucide-react'

interface WorkOrder {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  asset: { id: string; name: string }
  assignedUser?: { id: string; name: string } | null
  createdAt: string
  dueDate?: string | null
}

interface Asset { id: string; name: string }
interface User  { id: string; name: string; role: string }

const PRIORITY_COLOR: Record<string, string> = {
  LOW:      'bg-green-100 text-green-800',
  MEDIUM:   'bg-yellow-100 text-yellow-800',
  HIGH:     'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const STATUS_COLOR: Record<string, string> = {
  OPEN:        'bg-gray-100 text-gray-700',
  ASSIGNED:    'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED:   'bg-green-100 text-green-800',
  CANCELLED:   'bg-red-100 text-red-800',
}

const emptyForm = {
  title: '', description: '', assetId: '', priority: 'MEDIUM' as const,
  status: 'OPEN' as const, assignedTo: '', dueDate: '',
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null)
  const [form, setForm] = useState<{
    title: string; description: string; assetId: string
    priority: WorkOrder['priority']; status: WorkOrder['status']
    assignedTo: string; dueDate: string
  }>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [woRes, assetRes, userRes] = await Promise.all([
        fetch('/api/work-orders', { credentials: 'include' }),
        fetch('/api/assets', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' }),
      ])
      if (woRes.ok) setWorkOrders(await woRes.json())
      if (assetRes.ok) setAssets(await assetRes.json())
      if (userRes.ok) setUsers(await userRes.json())
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => {
    setEditingWO(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (wo: WorkOrder) => {
    setEditingWO(wo)
    setForm({
      title: wo.title,
      description: wo.description,
      assetId: wo.asset.id,
      priority: wo.priority,
      status: wo.status,
      assignedTo: wo.assignedUser?.id || '',
      dueDate: wo.dueDate ? wo.dueDate.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.assetId) {
      toast.error('Title and asset are required')
      return
    }
    setSaving(true)
    try {
      const url = editingWO ? `/api/work-orders/${editingWO.id}` : '/api/work-orders'
      const method = editingWO ? 'PUT' : 'POST'
      const body = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to save'); return }
      toast.success(editingWO ? 'Work order updated' : 'Work order created')
      setDialogOpen(false)
      fetchAll()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/work-orders/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Work order deleted')
      setDeleteId(null)
      fetchAll()
    } catch { toast.error('Something went wrong') }
  }

  const filtered = workOrders.filter(wo => {
    const matchSearch = wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.asset.name.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeTab === 'ALL' || wo.status === activeTab
    return matchSearch && matchTab
  })

  const counts = {
    ALL: workOrders.length,
    OPEN: workOrders.filter(w => w.status === 'OPEN').length,
    IN_PROGRESS: workOrders.filter(w => w.status === 'IN_PROGRESS').length,
    COMPLETED: workOrders.filter(w => w.status === 'COMPLETED').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Create, assign and track maintenance work orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />New Work Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.ALL, color: 'text-gray-900' },
          { label: 'Open', value: counts.OPEN, color: 'text-gray-600' },
          { label: 'In Progress', value: counts.IN_PROGRESS, color: 'text-purple-600' },
          { label: 'Completed', value: counts.COMPLETED, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search work orders..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="OPEN">Open ({counts.OPEN})</TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">In Progress ({counts.IN_PROGRESS})</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed ({counts.COMPLETED})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No work orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Title</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Asset</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Priority</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Assigned To</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Due Date</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(wo => (
                    <tr key={wo.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium max-w-[200px] truncate">{wo.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{wo.asset.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLOR[wo.priority]}`}>{wo.priority}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[wo.status]}`}>{wo.status.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{wo.assignedUser?.name || '—'}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/cmms/work-orders/${wo.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(wo)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(wo.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWO ? 'Edit Work Order' : 'New Work Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Replace pump seal" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the work required..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Asset *</Label>
                <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                  <SelectContent>
                    {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Assign To</Label>
                <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingWO ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Work Order</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the work order. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
