'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ScheduleWorkOrdersPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">Placeholder route.</p>
        </div>
        <Button variant="outline" onClick={() => window.alert('TODO: implement scheduling view')}>
          Demo action
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add calendar/scheduler UI for upcoming work orders.
        </CardContent>
      </Card>
    </main>
  )
}
