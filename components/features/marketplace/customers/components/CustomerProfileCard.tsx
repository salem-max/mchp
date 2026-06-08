"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerProfileCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Customer profile card with contact and job history.</p>
      </CardContent>
    </Card>
  )
}
