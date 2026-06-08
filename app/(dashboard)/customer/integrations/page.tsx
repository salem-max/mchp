'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Unplug,
  Plug,
  ShieldCheck,
  Loader2,
  Zap,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'NOT_LINKED' | 'PENDING' | 'ACTIVE' | 'RESTRICTED'
type Platform = 'WHATSAPP' | 'TELEGRAM' | 'TIKTOK' | 'FACEBOOK'

const DEFAULT_ICON_COLOR = '6366f1'
const getSimpleIconUrl = (brand: string, color: string = DEFAULT_ICON_COLOR) =>
  `https://cdn.simpleicons.org/${encodeURIComponent(brand)}/${color}`

interface IntegrationRecord {
  platform: Platform
  status: IntegrationStatus
  platformId: string | null
  linkedAt: string | null
  lastSyncAt: string | null
}

interface PageData {
  phone: string | null
  integrations: IntegrationRecord[]
}

// ── Platform metadata ─────────────────────────────────────────────────────────

const PLATFORMS: Record<
  Platform,
  { label: string; description: string; color: string; icon: string | null }
> = {
  WHATSAPP: {
    label: 'WhatsApp',
    description: 'Enable messaging via WhatsApp Business API using your mobile number.',
    color: 'bg-green-500',
    icon: getSimpleIconUrl('whatsapp', '25D366'),
  },
  TELEGRAM: {
    label: 'Telegram',
    description: 'Link your Telegram account via bot association for direct messaging.',
    color: 'bg-sky-500',
    icon: getSimpleIconUrl('telegram', '26A5E4'),
  },
  TIKTOK: {
    label: 'TikTok',
    description: 'Map your number for CRM outreach and analytics — no login required.',
    color: 'bg-pink-500',
    icon: getSimpleIconUrl('tiktok', '000000'),
  },
  FACEBOOK: {
    label: 'Facebook',
    description: 'Associate your number with a Facebook Page for identity matching.',
    color: 'bg-blue-600',
    icon: getSimpleIconUrl('facebook', '1877F2'),
  },
}

function renderPlatformIcon(meta: { label: string; icon: string | null }) {
  if (meta.icon) {
    return (
      <img
        src={meta.icon}
        alt={`${meta.label} logo`}
        className="h-6 w-6 object-contain"
        loading="lazy"
      />
    )
  }

  return (
    <span className="text-sm font-semibold text-white">{meta.label.charAt(0)}</span>
  )
}

// ── Status helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const config: Record<IntegrationStatus, { label: string; className: string; icon: React.ReactNode }> = {
    ACTIVE: {
      label: 'Active',
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: <Clock className="w-3 h-3" />,
    },
    NOT_LINKED: {
      label: 'Not linked',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
      icon: <XCircle className="w-3 h-3" />,
    },
    RESTRICTED: {
      label: 'Restricted',
      className: 'bg-red-100 text-red-600 border-red-200',
      icon: <AlertCircle className="w-3 h-3" />,
    },
  }
  const { label, className, icon } = config[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {icon}
      {label}
    </span>
  )
}

// ── Phone verification card ───────────────────────────────────────────────────

function PhoneCard({
  phone,
  onVerified,
}: {
  phone: string | null
  onVerified: (phone: string) => void
}) {
  const [step, setStep] = useState<'input' | 'otp' | 'done'>(phone ? 'done' : 'input')
  const [phoneInput, setPhoneInput] = useState(phone ?? '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const sendOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('OTP sent to your phone')
      if (data.otp) setDevOtp(data.otp) // dev mode only
      setStep('otp')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneInput, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Phone number verified!')
      setStep('done')
      onVerified(data.phone)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-card border space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Phone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-base">Mobile Number</h2>
          <p className="text-xs text-muted-foreground">Your integration identity key</p>
        </div>
        {step === 'done' && (
          <div className="ml-auto flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'done' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="font-mono text-sm font-medium text-green-800">{phone ?? phoneInput}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs h-7"
              onClick={() => { setStep('input'); setPhoneInput('') }}
            >
              Change
            </Button>
          </motion.div>
        ) : step === 'input' ? (
          <motion.div key="input" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone-input" className="text-sm">Phone number (E.164 format)</Label>
              <Input
                id="phone-input"
                placeholder="+60123456789"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button onClick={sendOtp} disabled={loading || !phoneInput} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="otp-input" className="text-sm">Enter 6-digit OTP</Label>
              <Input
                id="otp-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="font-mono tracking-widest text-center text-lg"
                maxLength={6}
              />
              {devOtp && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  Dev mode OTP: <span className="font-mono font-bold">{devOtp}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">Back</Button>
              <Button onClick={confirmOtp} disabled={loading || otp.length !== 6} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Integration card ──────────────────────────────────────────────────────────

function IntegrationCard({
  record,
  phoneVerified,
  onSync,
  onDisconnect,
}: {
  record: IntegrationRecord
  phoneVerified: boolean
  onSync: (platform: Platform) => Promise<void>
  onDisconnect: (platform: Platform) => Promise<void>
}) {
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const meta = PLATFORMS[record.platform]

  const handleSync = async () => {
    setSyncing(true)
    await onSync(record.platform)
    setSyncing(false)
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await onDisconnect(record.platform)
    setDisconnecting(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
          {renderPlatformIcon(meta)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{meta.label}</span>
            <StatusBadge status={record.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{meta.description}</p>
          {record.linkedAt && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Linked {new Date(record.linkedAt).toLocaleDateString()}
              {record.lastSyncAt && ` · Synced ${new Date(record.lastSyncAt).toLocaleDateString()}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {record.status === 'ACTIVE' ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleSync}
              disabled={syncing || !phoneVerified}
            >
              {syncing ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1.5 h-3 w-3" />}
              Re-sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Unplug className="mr-1.5 h-3 w-3" />}
              Disconnect
            </Button>
          </>
        ) : record.status === 'PENDING' ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleSync}
            disabled={syncing || !phoneVerified}
          >
            {syncing ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1.5 h-3 w-3" />}
            Retry sync
          </Button>
        ) : record.status === 'RESTRICTED' ? (
          <p className="text-xs text-muted-foreground italic">
            Not available — platform credentials not configured.
          </p>
        ) : (
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={handleSync}
            disabled={syncing || !phoneVerified}
          >
            {syncing ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Plug className="mr-1.5 h-3 w-3" />}
            {phoneVerified ? 'Link using mobile number' : 'Verify phone first'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations', { credentials: 'include' })
      if (res.ok) setData(await res.json())
    } catch {
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSync = async (platform: Platform) => {
    try {
      const res = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ platform }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success(`${PLATFORMS[platform].label} synced`)
      await fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      const res = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success('All integrations synced')
      await fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSyncingAll(false)
    }
  }

  const handleDisconnect = async (platform: Platform) => {
    try {
      const res = await fetch(`/api/integrations/disconnect/${platform.toLowerCase()}`, {
        method: 'POST',
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success(`${PLATFORMS[platform].label} disconnected`)
      await fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const phoneVerified = !!data?.phone
  const activeCount = data?.integrations.filter((i) => i.status === 'ACTIVE').length ?? 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect platforms using your mobile number as the identity key.
          </p>
        </div>
        {phoneVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={syncingAll}
          >
            {syncingAll
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Zap className="mr-2 h-4 w-4" />}
            Sync all
          </Button>
        )}
      </div>

      {/* Summary badges */}
      {!loading && data && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {phoneVerified ? '✓ Phone verified' : '⚠ Phone not verified'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {activeCount} of {data.integrations.length} active
          </Badge>
        </div>
      )}

      {/* Phone card */}
      {loading ? (
        <Skeleton className="h-36 rounded-2xl" />
      ) : (
        <PhoneCard
          phone={data?.phone ?? null}
          onVerified={(phone) => setData((d) => d ? { ...d, phone } : d)}
        />
      )}

      {/* Platform grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Connected Platforms
        </h2>
        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-4">
            {(data?.integrations ?? []).map((record) => (
              <IntegrationCard
                key={record.platform}
                record={record}
                phoneVerified={phoneVerified}
                onSync={handleSync}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        No OAuth login required. All platform connections are resolved server-side using your verified mobile number.
      </p>
    </div>
  )
}
