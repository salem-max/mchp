'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth, useAuthInner } from './useAuth'

type Role = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'

interface UseRoleGuardProps {
  requiredRole: Role
}

// Define the expected shape of the user object returned by useAuth
interface User {
  role: Role
  isSuperAdmin?: boolean
  // other properties as needed
}

interface AuthContext {
  user: User | null
  isLoading: boolean
}

export function useRoleGuard({ requiredRole }: UseRoleGuardProps) {
  const { user, isLoading } = useAuthInner() as AuthContext
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait until auth is done loading
    if (isLoading) return

    // No user → redirect to login
    if (!user) {
      router.replace('/login')
      return
    }

    // Super admin bypasses all role restrictions
    if (user.isSuperAdmin) return

    // Check if user has the required role
    if (user.role !== requiredRole) {
      const roleMap: Record<Role, string> = {
        CUSTOMER: '/dashboard/customer',
        TECHNICIAN: '/dashboard/technician',
        ADMIN: '/dashboard/admin',
      }
      // Redirect to the appropriate dashboard for their actual role
      const redirectPath = roleMap[user.role] ?? '/login'
      router.replace(redirectPath)
    }
  }, [user, isLoading, requiredRole, router, pathname])
}