"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TechnicianShiftCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Shift load, upcoming assignments, and availability status.</p>
      </CardContent>
    </Card>
  )
}
