"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MessageSquare,
  Calendar,
  Settings,
  MapPin,
  Wrench,
  FileText,
  Package,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | 'MANAGER';
}

const roleActions = {
  CUSTOMER: [
    {
      label: 'Post New Job',
      description: 'Create a new service request',
      icon: Plus,
      href: '/dashboard/customer/jobs/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'View Messages',
      description: 'Check technician communications',
      icon: MessageSquare,
      href: '/dashboard/customer/messages',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Schedule Service',
      description: 'Book upcoming maintenance',
      icon: Calendar,
      href: '/dashboard/customer/schedule',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'View Profile',
      description: 'Update your information',
      icon: Settings,
      href: '/dashboard/customer/profile',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ],
  TECHNICIAN: [
    {
      label: 'Browse Jobs',
      description: 'Find available work nearby',
      icon: MapPin,
      href: '/dashboard/technician/feed',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'View Earnings',
      description: 'Check payments and statements',
      icon: BarChart3,
      href: '/dashboard/technician/earnings',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Messages',
      description: 'Communicate with customers',
      icon: MessageSquare,
      href: '/dashboard/technician/messages',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Settings',
      description: 'Update availability and profile',
      icon: Settings,
      href: '/dashboard/technician/profile',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ],
  ADMIN: [
    {
      label: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: Settings,
      href: '/dashboard/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'View Jobs',
      description: 'Monitor all job activities',
      icon: FileText,
      href: '/dashboard/admin/jobs',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Handle Disputes',
      description: 'Resolve customer complaints',
      icon: AlertTriangle,
      href: '/dashboard/admin/disputes',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      label: 'Analytics',
      description: 'View system metrics',
      icon: BarChart3,
      href: '/dashboard/admin/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ],
  MANAGER: [
    {
      label: 'CMMS Dashboard',
      description: 'Asset and maintenance overview',
      icon: Wrench,
      href: '/dashboard/cmms',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Work Orders',
      description: 'Manage maintenance tasks',
      icon: FileText,
      href: '/dashboard/cmms/work-orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Inventory',
      description: 'Track parts and supplies',
      icon: Package,
      href: '/dashboard/cmms/inventory',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Reports',
      description: 'Generate maintenance reports',
      icon: BarChart3,
      href: '/dashboard/cmms/reports',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]
};

export default function QuickActions({ role = 'CUSTOMER' }: QuickActionsProps) {
  const actions = roleActions[role] || roleActions.CUSTOMER;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks for {role.toLowerCase()}s
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 w-full hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
