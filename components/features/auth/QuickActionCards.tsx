"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuickActionCards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded">
            Action 1
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded">
            Action 2
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded">
            Action 3
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
