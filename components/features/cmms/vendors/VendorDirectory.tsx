"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VendorDirectory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Manage vendors, suppliers, and partner contacts for service supply chains.</p>
      </CardContent>
    </Card>
  )
}
