'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CMMSSearchPage() {
  const params = useSearchParams()
  const q = params?.get('q') ?? ''

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">
          Placeholder route. Query: <span className="font-medium text-foreground">{q}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Implement global search across assets, work orders, invoices, and inventory.
        </CardContent>
      </Card>
    </main>
  )
}
