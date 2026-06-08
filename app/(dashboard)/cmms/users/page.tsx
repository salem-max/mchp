'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, RefreshCw, Users, ShieldCheck, Wrench, BarChart3 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string | null
  createdAt: string
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ADMIN:      { label: 'Admin',      color: 'bg-red-100 text-red-800',    icon: <ShieldCheck className="w-3 h-3" /> },
  MANAGER:    { label: 'Manager',    color: 'bg-purple-100 text-purple-800', icon: <BarChart3 className="w-3 h-3" /> },
  TECHNICIAN: { label: 'Technician', color: 'bg-blue-100 text-blue-800',  icon: <Wrench className="w-3 h-3" /> },
  CUSTOMER:   { label: 'Customer',   color: 'bg-green-100 text-green-800', icon: <Users className="w-3 h-3" /> },
  BOTH:       { label: 'Both',       color: 'bg-yellow-100 text-yellow-800', icon: <Users className="w-3 h-3" /> },
}

const emptyForm = { name: '', email: '', password: '', role: 'TECHNICIAN', phone: '' }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (res.ok) setUsers(await res.json())
      else toast.error('Failed to load users — check permissions')
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email || (!editingUser && !form.password)) {
      toast.error('Name, email and password are required')
      return
    }
    setSaving(true)
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser
        ? { name: form.name, role: form.role, phone: form.phone || null }
        : { name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone || null }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to save'); return }
      toast.success(editingUser ? 'User updated' : 'User created')
      setDialogOpen(false)
      fetchUsers()
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { toast.error('Failed to delete user'); return }
      toast.success('User deleted')
      setDeleteId(null)
      fetchUsers()
    } catch { toast.error('Something went wrong') }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and role-based access control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />Add User
          </Button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { role: 'ADMIN', label: 'Admins', color: 'text-red-600' },
          { role: 'MANAGER', label: 'Managers', color: 'text-purple-600' },
          { role: 'TECHNICIAN', label: 'Technicians', color: 'text-blue-600' },
          { role: 'CUSTOMER', label: 'Customers', color: 'text-green-600' },
        ].map(({ role, label, color }) => (
          <Card key={role}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : (roleCounts[role] || 0)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="TECHNICIAN">Technician</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Email</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Role</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Phone</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground">Joined</th>
                    <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const rc = ROLE_CONFIG[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700', icon: null }
                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}>
                            {rc.icon}{rc.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{user.phone || '—'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(user.id)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Smith" />
            </div>
            {!editingUser && (
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
              </div>
            )}
            {!editingUser && (
              <div className="space-y-1">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+60 12-345 6789" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the user account. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
