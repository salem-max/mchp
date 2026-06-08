"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MaintenanceSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preventive Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Schedule maintenance tasks and monitor upcoming inspections.</p>
      </CardContent>
    </Card>
  )
}
