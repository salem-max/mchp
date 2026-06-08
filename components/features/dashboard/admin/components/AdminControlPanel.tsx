"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminControlPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Manage users, roles, and operational settings.</p>
      </CardContent>
    </Card>
  )
}
