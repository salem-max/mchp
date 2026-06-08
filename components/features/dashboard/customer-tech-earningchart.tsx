"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/client';

interface EarningsChartProps {
  className?: string;
}

export default function EarningsChart({ className }: EarningsChartProps) {
  const { user } = useAuth();

  // Get earnings data
  const { data: earnings, isLoading } = trpc.technician.earnings.useQuery(
    user?.id ? { userId: user.id, period: 'month' } : undefined,
    { enabled: !!user?.id }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = earnings?.total || 0;
  const monthlyChange = earnings?.monthlyChange || 0;
  const weeklyData = earnings?.weeklyData || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Earnings Overview
        </CardTitle>
        <CardDescription>
          Your earnings for the current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Earnings */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total earnings this month</div>
            </div>
            {monthlyChange !== 0 && (
              <Badge
                variant={monthlyChange > 0 ? 'default' : 'secondary'}
                className={`flex items-center gap-1 ${
                  monthlyChange > 0
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                }`}
              >
                {monthlyChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(monthlyChange)}%
              </Badge>
            )}
          </div>

          {/* Weekly Chart Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Weekly Earnings</div>
              <div className="flex items-end justify-center space-x-2 h-16">
                {weeklyData.length > 0 ? (
                  weeklyData.map((day, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t w-6"
                      style={{
                        height: `${Math.max((day.amount / Math.max(...weeklyData.map(d => d.amount))) * 100, 10)}%`
                      }}
                      title={`$${day.amount.toFixed(2)} on ${day.day}`}
                    />
                  ))
                ) : (
                  // Placeholder bars
                  Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-blue-200 rounded-t w-6"
                      style={{ height: `${20 + Math.random() * 40}%` }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Jobs Completed</div>
              <div className="text-lg font-semibold">{earnings?.jobsCompleted || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg. per Job</div>
              <div className="text-lg font-semibold">
                ${earnings?.jobsCompleted ? (totalEarnings / earnings.jobsCompleted).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
