'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InvoicingHubPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">E-Invoicing</h1>
          <p className="text-muted-foreground mt-1">Placeholder route.</p>
        </div>
        <Button variant="outline" onClick={() => window.alert('TODO: implement create invoice')}>
          Demo action
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Implement invoicing list + actions (create invoice, approvals, payments, vendors, exports, etc.).
        </CardContent>
      </Card>
    </main>
  )
}
