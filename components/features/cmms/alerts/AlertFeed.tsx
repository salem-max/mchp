"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AlertFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Monitor alerts for assets, workflows, and safety events.</p>
      </CardContent>
    </Card>
  )
}
