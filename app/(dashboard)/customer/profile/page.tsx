'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CreditCard, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: { address?: string } | null;
  role: string;
  avgRating: number | null;
  createdAt: string;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          setForm({
            name: data.name || '',
            phone: data.phone || '',
            address: data.location?.address || '',
          });
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.address ? { address: form.address } : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        toast.success('Profile updated');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground mt-1 capitalize">{profile.role.toLowerCase()}</p>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-card border space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Details
        </h2>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+60 12-345 6789" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Location</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Kuala Lumpur, Malaysia" />
            </div>
            <div className="grid gap-2">
              <Label>Email (cannot be changed)</Label>
              <Input value={profile.email} disabled className="bg-muted" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{profile.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{profile.location?.address || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-card border space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Methods
        </h2>
        <p className="text-sm text-muted-foreground">Payment method management coming soon.</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border">
        <h2 className="text-xl font-bold mb-6">Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">—</div>
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">—</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {profile.avgRating?.toFixed(1) || '—'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
