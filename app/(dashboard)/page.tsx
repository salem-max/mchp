'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    const roleMap: Record<string, string> = {
      CUSTOMER: '/dashboard/customer',
      TECHNICIAN: '/dashboard/technician',
      ADMIN: '/dashboard/admin',
    }
    router.replace(roleMap[user.role] ?? '/login')
  }, [user, isLoading, router])

  return null
}
