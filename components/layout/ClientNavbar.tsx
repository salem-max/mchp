'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LayoutDashboard, LogOut, Menu, Wrench, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
  avatar?: string
}

const ROLE_DASHBOARD: Record<string, string> = {
  CUSTOMER: '/dashboard/customer',
  TECHNICIAN: '/dashboard/technician',
  ADMIN: '/dashboard/admin',
  BOTH: '/dashboard/customer',
}

const getNavLinks = (user: AuthUser | null) => {
  const base = [
    { href: '/', label: 'Home' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/#how-it-works', label: 'How it works' },
  ]
  if (user) {
    const jobsHref = `${ROLE_DASHBOARD[user.role] ?? '/dashboard/customer'}/jobs`
    return [...base, { href: jobsHref, label: 'Jobs' }]
  }
  return [...base, { href: '/signup', label: 'Jobs' }]
}

export default function ClientNavbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hide on landing page (has its own navbar), auth pages, and dashboard routes
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard/')
  ) return null

  const navLinks = getNavLinks(user)

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50 h-16" role="banner">
        <div className="container flex h-full items-center justify-between px-4 max-w-screen-xl mx-auto min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 rounded-lg hover:bg-accent/50 transition-all p-1" aria-label="Malaysia Co (Maintenance Services) homepage">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Wrench className="w-4 h-4 text-white" />
            </div>
<span className="font-bold text-xl tracking-tight hidden sm:inline whitespace-nowrap">Malaysia Co (Maintenance Services)</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1" role="menubar">
            {navLinks.map(({ href, label }: { href: string; label: string }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Auth section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar ?? ''} alt={user.name ?? ''} />
                      <AvatarFallback className="text-xs font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROLE_DASHBOARD[user.role] ?? '/dashboard/customer'} className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-all"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

          {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b shadow-lg">
          <div className="container px-4 py-3 space-y-1 max-w-screen-xl mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">

            {navLinks.map(({ href, label }: { href: string; label: string }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-foreground bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2 border-t">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">Get started</Button>
                </Link>
              </div>
            )}
            {user && (
              <div className="pt-2 border-t">
                <Link
                  href={ROLE_DASHBOARD[user.role] ?? '/dashboard/customer'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
