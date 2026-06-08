"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: {
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    scheduledDate?: Date;
    customer: {
      id: string;
      name: string;
      avatar?: string;
      rating: number;
      reviewCount: number;
    };
    category: string;
    skills: string[];
    attachments?: string[];
  };
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function JobCard({
  job,
  showActions = true,
  compact = false,
  className
}: JobCardProps) {
  const budgetRange = job.budget.min === job.budget.max
    ? `$${job.budget.min}`
    : `$${job.budget.min} - $${job.budget.max}`;

  if (compact) {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm truncate">{job.title}</h3>
                <Badge variant="outline" className={urgencyColors[job.urgency]}>
                  {job.urgency}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{job.location.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{budgetRange}</span>
                </div>
              </div>
            </div>
            {showActions && (
              <Button size="sm" variant="outline">
                View
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <Badge variant="outline" className={urgencyColors[job.urgency]}>
                {job.urgency}
              </Badge>
              <Badge variant="outline" className={statusColors[job.status]}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {job.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={job.customer.avatar} />
              <AvatarFallback>
                {job.customer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{job.customer.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {job.customer.rating} ({job.customer.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{budgetRange}</div>
            <div className="text-xs text-muted-foreground">{job.budget.currency}</div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{job.location.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          {job.scheduledDate && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span>{job.category}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Link href={`/dashboard/technician/jobs/${job.id}`}>
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            {job.status === 'open' && (
              <Button size="sm" className="flex-1">
                Accept Job
              </Button>
            )}
            {job.status === 'in_progress' && (
              <Button size="sm" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
