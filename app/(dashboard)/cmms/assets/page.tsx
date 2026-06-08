'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Eye, RefreshCw, Wrench, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: string
  location: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  model?: string
  serialNumber?: string
  createdAt: string
  _count?: { workOrders: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE:      { label: 'Active',      color: 'bg-green-100 text-green-800',  icon: <CheckCircle className="w-3 h-3" /> },
  INACTIVE:    { label: 'Inactive',    color: 'bg-gray-100 text-gray-700',    icon: <XCircle className="w-3 h-3" /> },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800', icon: <Wrench className="w-3 h-3" /> },
  RETIRED:     { label: 'Retired',     color: 'bg-red-100 text-red-800',      icon: <AlertTriangle className="w-3 h-3" /> },
}

const ASSET_TYPES = ['Pump', 'Motor', 'Generator', 'HVAC', 'Compressor', 'Conveyor', 'Boiler', 'Transformer', 'Valve', 'Sensor', 'Other']

const emptyForm = { name: '', type: '', location: '', model: '', serialNumber: '', status: 'ACTIVE' as const }

export default function AssetsPage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState<{ name: string; type: string; location: string; model: string; serialNumber: string; status: Asset['status'] }>(emptyForm as any)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assets', { credentials: 'include' })
      if (res.ok) setAssets(await res.json())
    } catch { toast.error('Failed to load assets') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const openCreate = () => {
    setEditingAsset(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setForm({ name: asset.name, type: asset.type, location: asset.location, model: asset.model || '', serialNumber: asset.serialNumber || '', status: asset.status })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.type || !form.location) {
      toast.error('Name, type and location are required')
      return
    }
    setSaving(true)
    try {
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const method = editingAsset ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to save'); return }
      toast.success(editingAsset ? 'Asset updated' : 'Asset created')
      setDialogOpen(false)
      fetchAssets()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { toast.error('Failed to delete asset'); return }
      toast.success('Asset deleted')
      setDeleteId(null)
      fetchAssets()
    } catch { toast.error('Something went wrong') }
  }

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    total: assets.length,
    active: assets.filter(a => a.status === 'ACTIVE').length,
    maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
    inactive: assets.filter(a => a.status === 'INACTIVE').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Asset Registry</h1>
          <p className="text-muted-foreground mt-1">Manage and track all physical assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAssets}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />Add Asset
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: counts.total, color: 'text-gray-900' },
          { label: 'Active', value: counts.active, color: 'text-green-600' },
          { label: 'In Maintenance', value: counts.maintenance, color: 'text-yellow-600' },
          { label: 'Inactive', value: counts.inactive, color: 'text-gray-500' },
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
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assets ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No assets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Type</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Location</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Model</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Created</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => {
                    const sc = STATUS_CONFIG[asset.status] || STATUS_CONFIG.INACTIVE
                    return (
                      <tr key={asset.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{asset.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{asset.type}</td>
                        <td className="py-3 px-4 text-muted-foreground">{asset.location}</td>
                        <td className="py-3 px-4 text-muted-foreground">{asset.model || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                            {sc.icon}{sc.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/cmms/assets/${asset.id}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(asset)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(asset.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Pump Station A" />
              </div>
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Location *</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Building A, Floor 2" />
              </div>
              <div className="space-y-1">
                <Label>Model</Label>
                <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. XR-2000" />
              </div>
              <div className="space-y-1">
                <Label>Serial Number</Label>
                <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="e.g. SN-123456" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingAsset ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the asset and all associated data. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
