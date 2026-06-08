"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metric</CardTitle>
        <CardDescription>Key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">0</div>
        <p className="text-xs text-gray-500">Total</p>
      </CardContent>
    </Card>
  );
}
