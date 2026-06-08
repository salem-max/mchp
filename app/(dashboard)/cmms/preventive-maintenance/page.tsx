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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Plus, RefreshCw, Calendar, Clock, AlertTriangle, CheckCircle, Pencil, Trash2, Wrench } from 'lucide-react'
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns'

interface PM {
  id: string
  assetId: string
  asset: { id: string; name: string; type: string; location: string }
  scheduleType: 'TIME_BASED' | 'USAGE_BASED'
  interval: number
  lastDone: string | null
  nextDue: string
  description: string
  isActive: boolean
}

interface Asset { id: string; name: string; type: string }

const emptyForm = {
  assetId: '', scheduleType: 'TIME_BASED' as const,
  interval: '30', description: '', isActive: true, lastDone: '',
}

function statusOf(pm: PM) {
  const due = new Date(pm.nextDue)
  if (!pm.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: null }
  if (isPast(due)) return { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
  if (isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 7) }))
    return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
  return { label: 'Scheduled', color: 'bg-green-100 text-green-700', icon: CheckCircle }
}

export default function PreventiveMaintenancePage() {
  const [items, setItems] = useState<PM[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PM | null>(null)
  const [form, setForm] = useState<{
    assetId: string; scheduleType: 'TIME_BASED' | 'USAGE_BASED';
    interval: string; description: string; isActive: boolean; lastDone: string
  }>(emptyForm as any)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-soon' | 'active'>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pmRes, assetRes] = await Promise.all([
        fetch('/api/preventive-maintenance', { credentials: 'include' }),
        fetch('/api/assets', { credentials: 'include' }),
      ])
      if (pmRes.ok) {
        const data = await pmRes.json()
        setItems(data.items || [])
      }
      if (assetRes.ok) setAssets(await assetRes.json())
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (pm: PM) => {
    setEditingItem(pm)
    setForm({
      assetId: pm.assetId,
      scheduleType: pm.scheduleType,
      interval: String(pm.interval),
      description: pm.description,
      isActive: pm.isActive,
      lastDone: pm.lastDone ? pm.lastDone.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.assetId || !form.description) { toast.error('Asset and description are required'); return }
    setSaving(true)
    try {
      const url = editingItem ? `/api/preventive-maintenance/${editingItem.id}` : '/api/preventive-maintenance'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assetId: form.assetId,
          scheduleType: form.scheduleType,
          interval: parseInt(form.interval) || 30,
          description: form.description,
          isActive: form.isActive,
          lastDone: form.lastDone || null,
        }),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to save'); return }
      toast.success(editingItem ? 'Schedule updated' : 'Schedule created')
      setDialogOpen(false)
      fetchAll()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleMarkDone = async (pm: PM) => {
    try {
      const res = await fetch(`/api/preventive-maintenance/${pm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lastDone: new Date().toISOString(), isActive: true }),
      })
      if (!res.ok) { toast.error('Failed to update'); return }
      toast.success('Marked as done — next schedule recalculated')
      fetchAll()
    } catch { toast.error('Something went wrong') }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/preventive-maintenance/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Schedule deleted')
      setDeleteId(null)
      fetchAll()
    } catch { toast.error('Something went wrong') }
  }

  const filtered = items.filter(pm => {
    if (filter === 'overdue') return pm.isActive && isPast(new Date(pm.nextDue))
    if (filter === 'due-soon') return pm.isActive && isWithinInterval(new Date(pm.nextDue), { start: new Date(), end: addDays(new Date(), 7) })
    if (filter === 'active') return pm.isActive
    return true
  })

  const counts = {
    total: items.length,
    overdue: items.filter(p => p.isActive && isPast(new Date(p.nextDue))).length,
    dueSoon: items.filter(p => p.isActive && isWithinInterval(new Date(p.nextDue), { start: new Date(), end: addDays(new Date(), 7) })).length,
    active: items.filter(p => p.isActive).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Preventive Maintenance</h1>
          <p className="text-muted-foreground mt-1">Schedule and track recurring maintenance tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />New Schedule
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Schedules', value: counts.total, color: 'text-gray-900', filter: 'all' as const },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-600', filter: 'overdue' as const },
          { label: 'Due This Week', value: counts.dueSoon, color: 'text-yellow-600', filter: 'due-soon' as const },
          { label: 'Active', value: counts.active, color: 'text-green-600', filter: 'active' as const },
        ].map(({ label, value, color, filter: f }) => (
          <Card key={label} className={`cursor-pointer transition-shadow hover:shadow-md ${filter === f ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setFilter(f)}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue alert */}
      {!loading && counts.overdue > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">
            <strong>{counts.overdue} schedule{counts.overdue > 1 ? 's are' : ' is'} overdue</strong> — immediate attention required.
          </p>
          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => setFilter('overdue')}>
            View Overdue
          </Button>
        </div>
      )}

      {/* Schedule list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'all' ? 'All Schedules' : filter === 'overdue' ? 'Overdue Schedules' : filter === 'due-soon' ? 'Due This Week' : 'Active Schedules'}
            {' '}({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No schedules found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(pm => {
                const s = statusOf(pm)
                const StatusIcon = s.icon
                return (
                  <div key={pm.id} className="flex items-start justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {s.label}
                          </span>
                          <Badge variant="outline" className="text-xs">{pm.scheduleType === 'TIME_BASED' ? 'Time-based' : 'Usage-based'}</Badge>
                          {!pm.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                        </div>
                        <p className="font-medium text-sm">{pm.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pm.asset.name} · {pm.asset.location}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Every {pm.interval} {pm.scheduleType === 'TIME_BASED' ? 'days' : 'hours'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(pm.nextDue).toLocaleDateString()} ({formatDistanceToNow(new Date(pm.nextDue), { addSuffix: true })})
                          </span>
                          {pm.lastDone && (
                            <span>Last done: {new Date(pm.lastDone).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleMarkDone(pm)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Done
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(pm)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(pm.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Schedule' : 'New Maintenance Schedule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Asset *</Label>
              <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Replace air filter and check belts" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Schedule Type</Label>
                <Select value={form.scheduleType} onValueChange={v => setForm(f => ({ ...f, scheduleType: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TIME_BASED">Time-based (days)</SelectItem>
                    <SelectItem value="USAGE_BASED">Usage-based (hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Interval ({form.scheduleType === 'TIME_BASED' ? 'days' : 'hours'})</Label>
                <Input type="number" min="1" value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Last Completed (optional)</Label>
              <Input type="date" value={form.lastDone} onChange={e => setForm(f => ({ ...f, lastDone: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Active schedule</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Schedule</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete this maintenance schedule.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
