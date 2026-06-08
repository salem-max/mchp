'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, RefreshCw, Package, AlertTriangle } from 'lucide-react'

interface InventoryItem {
  id: string
  partName: string
  description?: string | null
  quantity: number
  threshold: number
  supplier?: string | null
  cost?: number | null
  location?: string | null
  createdAt: string
}

const emptyForm = { partName: '', description: '', quantity: '0', threshold: '5', supplier: '', cost: '', location: '' }

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventory', { credentials: 'include' })
      if (res.ok) setInventory(await res.json())
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  const openCreate = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setForm({
      partName: item.partName,
      description: item.description || '',
      quantity: String(item.quantity),
      threshold: String(item.threshold),
      supplier: item.supplier || '',
      cost: item.cost != null ? String(item.cost) : '',
      location: item.location || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.partName) { toast.error('Part name is required'); return }
    setSaving(true)
    try {
      const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory'
      const method = editingItem ? 'PUT' : 'POST'
      const body = {
        partName: form.partName,
        description: form.description || null,
        quantity: parseInt(form.quantity) || 0,
        threshold: parseInt(form.threshold) || 0,
        supplier: form.supplier || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        location: form.location || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to save'); return }
      toast.success(editingItem ? 'Item updated' : 'Item added')
      setDialogOpen(false)
      fetchInventory()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { toast.error('Failed to delete item'); return }
      toast.success('Item deleted')
      setDeleteId(null)
      fetchInventory()
    } catch { toast.error('Something went wrong') }
  }

  const filtered = inventory.filter(item => {
    const matchSearch = item.partName.toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(search.toLowerCase())
    const matchLow = !showLowStock || item.quantity <= item.threshold
    return matchSearch && matchLow
  })

  const lowStockItems = inventory.filter(i => i.quantity <= i.threshold)
  const outOfStock = inventory.filter(i => i.quantity === 0)
  const totalValue = inventory.reduce((sum, i) => sum + ((i.cost || 0) * i.quantity), 0)

  const stockLevel = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (item.quantity <= item.threshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track spare parts and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventory}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />Add Part
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total Parts</p>
            <p className="text-3xl font-bold">{loading ? '—' : inventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{loading ? '—' : lowStockItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{loading ? '—' : outOfStock.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-3xl font-bold text-green-600">{loading ? '—' : `$${totalValue.toFixed(2)}`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alert banner */}
      {!loading && lowStockItems.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 flex-1">
            <strong>{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''}</strong> below reorder threshold.
          </p>
          <Button size="sm" variant="outline" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? 'Show All' : 'Show Low Stock Only'}
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search parts, supplier, location..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Inventory ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No inventory items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Part Name</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Location</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Supplier</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Qty</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Threshold</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Unit Cost</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const sl = stockLevel(item)
                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium">{item.partName}</div>
                          {item.description && <div className="text-xs text-muted-foreground truncate max-w-[180px]">{item.description}</div>}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{item.location || '—'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.supplier || '—'}</td>
                        <td className="py-3 px-4 text-right font-medium">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{item.threshold}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {item.cost != null ? `$${item.cost.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sl.color}`}>{sl.label}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
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
            <DialogTitle>{editingItem ? 'Edit Part' : 'Add New Part'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Part Name *</Label>
              <Input value={form.partName} onChange={e => setForm(f => ({ ...f, partName: e.target.value }))} placeholder="e.g. Bearing 6205-2RS" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Reorder Threshold</Label>
                <Input type="number" min="0" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Unit Cost ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Shelf A3" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Supplier</Label>
                <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. Acme Parts Co." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingItem ? 'Update' : 'Add Part'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Part</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove this part from inventory.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
