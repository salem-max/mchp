"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Wrench,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

type ActivityType = 'job_completed' | 'job_accepted' | 'payment_received' | 'message_received' | 'location_update' | 'system_alert';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

const activityIcons = {
  job_completed: CheckCircle,
  job_accepted: Wrench,
  payment_received: DollarSign,
  message_received: MessageSquare,
  location_update: MapPin,
  system_alert: AlertCircle,
};

const activityColors = {
  job_completed: 'text-green-500',
  job_accepted: 'text-blue-500',
  payment_received: 'text-green-600',
  message_received: 'text-purple-500',
  location_update: 'text-orange-500',
  system_alert: 'text-red-500',
};

export default function ActivityFeed({ className, limit = 10 }: ActivityFeedProps) {
  const { user } = useAuth();

  // Get activity feed data
  const { data: activities, isLoading } = trpc.user.activityFeed.useQuery(
    user?.id ? { userId: user.id, limit } : undefined,
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activityItems = activities || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest updates and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activityItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activityItems.map((activity) => {
                const Icon = activityIcons[activity.type] || Activity;
                const iconColor = activityColors[activity.type] || 'text-gray-500';

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-50 ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <div className="flex items-center mt-2">
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.user.name}
                          </span>
                        </div>
                      )}
                      {activity.metadata?.amount && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          ${activity.metadata.amount}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
