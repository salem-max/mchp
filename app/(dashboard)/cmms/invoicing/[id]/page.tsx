'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvoiceDetailsPage() {
  const params = useParams()
  const id = (params as any)?.id ?? 'unknown'

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoice {id}</h1>
        <p className="text-muted-foreground mt-1">Placeholder route.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Implement invoice details view: line items, totals, status, work order link, and actions.
        </CardContent>
      </Card>
    </main>
  )
}
