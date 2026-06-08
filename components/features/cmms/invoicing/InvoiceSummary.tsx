"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InvoiceSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Track invoices, billing, and payment statuses for service orders.</p>
      </CardContent>
    </Card>
  )
}
