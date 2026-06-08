"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Wrench,
  DollarSign,
  MapPin,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface CustomerActivityFeedProps {
  className?: string;
  limit?: number;
}

type ActivityType =
  | 'job_posted'
  | 'technician_assigned'
  | 'job_started'
  | 'job_completed'
  | 'payment_made'
  | 'message_sent'
  | 'review_submitted'
  | 'job_cancelled';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  technician?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
  job?: {
    id: string;
    title: string;
  };
  metadata?: Record<string, any>;
}

const activityIcons = {
  job_posted: AlertCircle,
  technician_assigned: UserCheck,
  job_started: Wrench,
  job_completed: CheckCircle,
  payment_made: DollarSign,
  message_sent: MessageSquare,
  review_submitted: Star,
  job_cancelled: XCircle,
};

const activityColors = {
  job_posted: 'text-blue-500',
  technician_assigned: 'text-purple-500',
  job_started: 'text-orange-500',
  job_completed: 'text-green-500',
  payment_made: 'text-green-600',
  message_sent: 'text-indigo-500',
  review_submitted: 'text-yellow-500',
  job_cancelled: 'text-red-500',
};

export default function CustomerActivityFeed({ className, limit = 15 }: CustomerActivityFeedProps) {
  const { user } = useAuth();

  // Get customer activity feed data
  const { data: activities, isLoading } = trpc.customer.activityFeed.useQuery(
    user?.id ? { userId: user.id, limit } : undefined,
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>Your recent activities and updates</CardDescription>
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
          Activity Feed
        </CardTitle>
        <CardDescription>
          Your recent activities and job updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activityItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">Post your first job to get started!</p>
              </div>
            ) : (
              activityItems.map((activity) => {
                const Icon = activityIcons[activity.type] || Activity;
                const iconColor = activityColors[activity.type] || 'text-gray-500';

                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full bg-gray-50 ${iconColor} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>

                      {/* Technician Info */}
                      {activity.technician && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activity.technician.avatar} />
                              <AvatarFallback className="text-xs">
                                {activity.technician.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{activity.technician.name}</span>
                            {activity.technician.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {activity.technician.rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Job Link */}
                      {activity.job && (
                        <div className="mt-2">
                          <Link href={`/dashboard/customer/jobs/${activity.job.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Job: {activity.job.title}
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Payment Amount */}
                      {activity.metadata?.amount && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          ${activity.metadata.amount}
                        </Badge>
                      )}

                      {/* Review Rating */}
                      {activity.metadata?.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {activity.metadata.rating} stars
                          </span>
                        </div>
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
