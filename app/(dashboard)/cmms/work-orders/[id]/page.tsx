'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, CheckCircle, Clock, AlertTriangle, User, Wrench, Calendar, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface WorkOrder {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  asset: { id: string; name: string; type: string; location: string }
  assignedUser?: { id: string; name: string; email: string } | null
  createdAt: string
  dueDate?: string | null
  completedAt?: string | null
  notes?: string | null
  partsUsed: { id: string; quantity: number; inventory: { partName: string; cost?: number | null } }[]
}

interface User { id: string; name: string; role: string }

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800',
}
const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-gray-100 text-gray-700', ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800', COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}
const STATUS_FLOW = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [wo, setWo] = useState<WorkOrder | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchWO = useCallback(async () => {
    try {
      const res = await fetch(`/api/work-orders/${id}`, { credentials: 'include' })
      if (res.ok) setWo(await res.json())
      else { toast.error('Work order not found'); router.push('/dashboard/cmms/work-orders') }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [id, router])

  useEffect(() => {
    fetchWO()
    fetch('/api/users', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setUsers).catch(() => {})
  }, [fetchWO])

  const openEdit = () => {
    if (!wo) return
    setForm({
      title: wo.title, description: wo.description, priority: wo.priority,
      assignedTo: wo.assignedUser?.id || '', dueDate: wo.dueDate ? wo.dueDate.slice(0, 10) : '',
      notes: wo.notes || '',
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null }),
      })
      if (!res.ok) { toast.error('Failed to update'); return }
      toast.success('Work order updated')
      setEditOpen(false)
      fetchWO()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const advanceStatus = async () => {
    if (!wo) return
    const idx = STATUS_FLOW.indexOf(wo.status)
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return
    const nextStatus = STATUS_FLOW[idx + 1]
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) { toast.error('Failed to update status'); return }
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`)
      fetchWO()
    } catch { toast.error('Something went wrong') }
    finally { setStatusUpdating(false) }
  }

  const cancelWO = async () => {
    if (!confirm('Cancel this work order?')) return
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) { toast.error('Failed to cancel'); return }
      toast.success('Work order cancelled')
      fetchWO()
    } catch { toast.error('Something went wrong') }
    finally { setStatusUpdating(false) }
  }

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /></div>
        <div className="space-y-4"><Skeleton className="h-48" /></div>
      </div>
    </div>
  )

  if (!wo) return null

  const statusIdx = STATUS_FLOW.indexOf(wo.status)
  const canAdvance = statusIdx >= 0 && statusIdx < STATUS_FLOW.length - 1
  const nextStatus = canAdvance ? STATUS_FLOW[statusIdx + 1] : null
  const daysUntilDue = wo.dueDate ? Math.ceil((new Date(wo.dueDate).getTime() - Date.now()) / 86400000) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push('/dashboard/cmms/work-orders')}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back to Work Orders
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{wo.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLOR[wo.priority]}`}>{wo.priority}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[wo.status]}`}>{wo.status.replace('_', ' ')}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Created {formatDistanceToNow(new Date(wo.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}><Pencil className="w-4 h-4 mr-2" />Edit</Button>
          {canAdvance && (
            <Button onClick={advanceStatus} disabled={statusUpdating}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {statusUpdating ? 'Updating...' : `Mark ${nextStatus?.replace('_', ' ')}`}
            </Button>
          )}
        </div>
      </div>

      {/* Status progress bar */}
      <div className="flex items-center gap-2">
        {STATUS_FLOW.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 h-2 rounded-full transition-colors ${i <= statusIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <span className={`text-xs font-medium whitespace-nowrap ${i === statusIdx ? 'text-blue-700' : 'text-gray-400'}`}>
              {s.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{wo.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Asset</p><p className="font-medium">{wo.asset.name}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Assigned To</p><p className="font-medium">{wo.assignedUser?.name || 'Unassigned'}</p></div>
                </div>
                {wo.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className={`font-medium ${daysUntilDue !== null && daysUntilDue < 0 ? 'text-red-600' : ''}`}>
                        {new Date(wo.dueDate).toLocaleDateString()}
                        {daysUntilDue !== null && (
                          <span className="text-xs ml-1">({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`})</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {wo.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div><p className="text-xs text-muted-foreground">Completed</p><p className="font-medium">{new Date(wo.completedAt).toLocaleDateString()}</p></div>
                  </div>
                )}
              </div>
              {wo.notes && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{wo.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parts used */}
          {wo.partsUsed.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-4 h-4" />Parts Used</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {wo.partsUsed.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{p.inventory.partName}</p>
                        <p className="text-muted-foreground text-xs">Qty: {p.quantity}</p>
                      </div>
                      {p.inventory.cost && (
                        <p className="font-medium">${(p.inventory.cost * p.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                  {wo.partsUsed.some(p => p.inventory.cost) && (
                    <div className="flex justify-between pt-2 border-t font-semibold text-sm">
                      <span>Total Parts Cost</span>
                      <span>${wo.partsUsed.reduce((s, p) => s + (p.inventory.cost || 0) * p.quantity, 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {canAdvance && (
                <Button className="w-full" onClick={advanceStatus} disabled={statusUpdating}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {statusUpdating ? 'Updating...' : `Advance to ${nextStatus?.replace('_', ' ')}`}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={openEdit}>
                <Pencil className="w-4 h-4 mr-2" />Edit Work Order
              </Button>
              {wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED' && (
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={cancelWO} disabled={statusUpdating}>
                  <AlertTriangle className="w-4 h-4 mr-2" />Cancel Work Order
                </Button>
              )}
              {wo.status === 'COMPLETED' && (
                <div className="text-center py-3">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-700">Completed</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Asset Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{wo.asset.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p>{wo.asset.type}</p></div>
              <div><p className="text-xs text-muted-foreground">Location</p><p>{wo.asset.location}</p></div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => router.push(`/dashboard/cmms/assets/${wo.asset.id}`)}>
                View Asset
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Work Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
              <div className="col-span-2 space-y-1">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
