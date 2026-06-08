"use client"

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface AvailabilityToggleProps {
  className?: string;
}

export default function AvailabilityToggle({ className }: AvailabilityToggleProps) {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);

  // Get technician profile
  const { data: profile, isLoading } = trpc.technician.profile.useQuery(
    user?.id ? { userId: user.id } : undefined,
    { enabled: !!user?.id }
  );

  // Update availability mutation
  const updateAvailability = trpc.technician.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success(isAvailable ? 'You are now available for jobs' : 'You are now unavailable');
    },
    onError: (error: any) => {
      toast.error('Failed to update availability');
      console.error('Availability update error:', error);
    }
  });

  const handleToggle = async (checked: boolean) => {
    if (!user?.id) return;

    setIsAvailable(checked);
    try {
      await updateAvailability.mutateAsync({
        userId: user.id,
        isAvailable: checked
      });
    } catch (error) {
      // Revert on error
      setIsAvailable(!checked);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actualAvailability = profile?.isAvailable ?? true;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability Status
        </CardTitle>
        <CardDescription>
          Control when you're available to receive job notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Switch
              id="availability"
              checked={actualAvailability}
              onCheckedChange={handleToggle}
              disabled={updateAvailability.isPending}
            />
            <Label htmlFor="availability" className="text-sm font-medium">
              {actualAvailability ? 'Available' : 'Unavailable'}
            </Label>
          </div>
          <Badge
            variant={actualAvailability ? 'default' : 'secondary'}
            className={`flex items-center gap-1 ${
              actualAvailability
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            }`}
          >
            {actualAvailability ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {actualAvailability ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          {actualAvailability
            ? 'You will receive job notifications and can accept new work.'
            : 'You will not receive new job notifications. Existing jobs remain active.'
          }
        </div>

        {profile?.lastActiveAt && (
          <div className="text-xs text-muted-foreground">
            Last active: {new Date(profile.lastActiveAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
