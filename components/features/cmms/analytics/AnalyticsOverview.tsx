"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Data summary for asset performance, job completion, and team efficiency.</p>
      </CardContent>
    </Card>
  )
}
