"use client"

import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Home,
  MapPin,
  MessageSquare,
  Calendar,
  Settings,
  DollarSign,
  Star,
  Bell,
  Search,
  Menu,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface TechnicianDashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/technician',
    icon: Home,
  },
  {
    title: 'Available Jobs',
    href: '/dashboard/technician/feed',
    icon: MapPin,
  },
  {
    title: 'My Jobs',
    href: '/dashboard/technician/jobs',
    icon: Calendar,
  },
  {
    title: 'Messages',
    href: '/dashboard/technician/messages',
    icon: MessageSquare,
  },
  {
    title: 'Earnings',
    href: '/dashboard/technician/earnings',
    icon: DollarSign,
  },
  {
    title: 'Reviews',
    href: '/dashboard/technician/reviews',
    icon: Star,
  },
  {
    title: 'Settings',
    href: '/dashboard/technician/settings',
    icon: Settings,
  },
];

export default function TechnicianDashboardLayout({
  children,
}: TechnicianDashboardLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Get technician profile for availability status
  const { data: profile } = trpc.technician.profile.useQuery(
    user?.id ? { userId: user.id } : undefined,
    { enabled: !!user?.id }
  );

  // Update availability mutation
  const updateAvailability = trpc.technician.updateAvailability.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.isAvailable ? 'You are now available for jobs' : 'You are now unavailable');
    },
    onError: (error: any) => {
      toast.error('Failed to update availability');
    }
  });

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!user?.id) return;

    try {
      await updateAvailability.mutateAsync({
        userId: user.id,
        isAvailable: checked
      });
    } catch (error) {
      console.error('Availability update error:', error);
    }
  };

  const isAvailable = profile?.isAvailable ?? true;

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
                  {user?.name?.charAt(0).toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user?.name || 'Technician'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Available</span>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={updateAvailability.isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isAvailable ? 'Receiving job notifications' : 'Not available for new jobs'}
              </p>
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
                  Technician Dashboard
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
                    5
                  </Badge>
                </Button>

                {/* Availability Status */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
                  <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
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
