"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerSummaryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Overview of customer activity, jobs, and billing.</p>
      </CardContent>
    </Card>
  )
}
