"use client"

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Wrench,
  UserCheck,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobStatusBadgeProps {
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'scheduled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    icon: AlertCircle,
    description: 'Job is available for technicians'
  },
  assigned: {
    label: 'Assigned',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    icon: UserCheck,
    description: 'Technician has been assigned'
  },
  scheduled: {
    label: 'Scheduled',
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
    icon: Timer,
    description: 'Job is scheduled for a specific time'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    icon: Wrench,
    description: 'Technician is working on the job'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 hover:bg-green-100',
    icon: CheckCircle,
    description: 'Job has been completed successfully'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    icon: XCircle,
    description: 'Job has been cancelled'
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    icon: Clock,
    description: 'Job is temporarily on hold'
  }
};

export default function JobStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className
}: JobStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) {
    return <Badge className={className}>Unknown</Badge>;
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeClasses[size],
        'flex items-center gap-1.5 font-medium',
        className
      )}
      title={config.description}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
