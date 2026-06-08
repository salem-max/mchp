"use client"

import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Plus,
  MessageSquare,
  Calendar,
  Settings,
  CreditCard,
  Star,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CustomerDashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/customer',
    icon: Home,
  },
  {
    title: 'Post New Job',
    href: '/dashboard/customer/jobs/new',
    icon: Plus,
  },
  {
    title: 'My Jobs',
    href: '/dashboard/customer/jobs',
    icon: Calendar,
  },
  {
    title: 'Messages',
    href: '/dashboard/customer/messages',
    icon: MessageSquare,
  },
  {
    title: 'Payments',
    href: '/dashboard/customer/payments',
    icon: CreditCard,
  },
  {
    title: 'Reviews',
    href: '/dashboard/customer/reviews',
    icon: Star,
  },
  {
    title: 'Settings',
    href: '/dashboard/customer/settings',
    icon: Settings,
  },
];

export default function CustomerDashboardLayout({
  children,
}: CustomerDashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user?.name || 'Customer'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>

              <div className="flex-1">
                <h1 className="text-lg font-semibold">
                  Customer Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* Quick Actions */}
                <Link href="/dashboard/customer/jobs/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
