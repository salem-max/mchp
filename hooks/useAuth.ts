'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  avatar?: string
  isSuperAdmin?: boolean
}

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  role: AuthUser['role'] | null
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string, password: string, name: string, role: 'CUSTOMER' | 'ADMIN' }) => Promise<void>
  logout: () => Promise<void>
}

const SANDBOX_USER_BASE: AuthUser = {
  id: 'sandbox-user',
  email: 'sandbox@fixswift.dev',
  name: 'Sandbox User',
  role: 'CUSTOMER',
  isSuperAdmin: false,
}

// Inner hook — must be used inside a Suspense boundary when useSearchParams is needed
function useAuthInner(): UseAuthReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isDemo = searchParams?.get('demo') === 'true'
  const demoRole = (searchParams?.get('role') || 'CUSTOMER').toUpperCase() as 'CUSTOMER' | 'TECHNICIAN'
  const demoName = searchParams?.get('name') || 'Demo User'

  const isSandbox =
    process.env.NEXT_PUBLIC_ENABLE_AUTH === 'false' ||
    process.env.NEXT_PUBLIC_SKIP_LOGIN === 'true' ||
    isDemo

  const sandboxUser: AuthUser = isDemo
    ? { id: 'demo-user', email: 'demo@fixswift.dev', name: demoName, role: demoRole, avatar: '/demo-avatar.png', isSuperAdmin: false }
    : SANDBOX_USER_BASE

  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) setUser(await res.json())
      else setUser(null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSandbox) {
      setUser(sandboxUser)
      setIsLoading(false)
    } else {
      fetchUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Login failed')
    const userData = await res.json()
    setUser(userData)
    router.push(`/dashboard/${(userData.role as string).toLowerCase()}`)
  }, [router])

  const register = useCallback(async (data: { email: string, password: string, name: string, role: 'CUSTOMER' | 'ADMIN' }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Registration failed')
    const userData = await res.json()
    setUser(userData)
    router.push(`/dashboard/${(userData.role as string).toLowerCase()}`)
  }, [router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    router.push('/')
  }, [router])

  return { user, isLoading, isAuthenticated: !!user, role: user?.role ?? null, login, register, logout }
}

// Safe wrapper that doesn't call useSearchParams — used by layouts/components
// that are NOT inside a Suspense boundary
function useAuthSafe(): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isSandbox =
    process.env.NEXT_PUBLIC_ENABLE_AUTH === 'false' ||
    process.env.NEXT_PUBLIC_SKIP_LOGIN === 'true'

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) setUser(await res.json())
      else setUser(null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSandbox) {
      setUser(SANDBOX_USER_BASE)
      setIsLoading(false)
    } else {
      fetchUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Login failed')
    const userData = await res.json()
    setUser(userData)
    router.push(`/dashboard/${(userData.role as string).toLowerCase()}`)
  }, [router])

  const register = useCallback(async (data: { email: string, password: string, name: string, role: 'CUSTOMER' | 'ADMIN' }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Registration failed')
    const userData = await res.json()
    setUser(userData)
    router.push(`/dashboard/${(userData.role as string).toLowerCase()}`)
  }, [router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    router.push('/')
  }, [router])

  return { user, isLoading, isAuthenticated: !!user, role: user?.role ?? null, login, register, logout }
}

// Export the safe version as default — pages that need demo/role from URL
// should use useAuthInner inside their own Suspense boundary
export function useAuth(): UseAuthReturn {
  return useAuthSafe()
}

// Export inner version for pages that already have Suspense (login, signup, dashboard pages)
export { useAuthInner }
