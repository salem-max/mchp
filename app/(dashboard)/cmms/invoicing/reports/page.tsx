'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvoicingReportsPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Placeholder route.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Implement invoicing reports + export/download options.
        </CardContent>
      </Card>
    </main>
  )
}
