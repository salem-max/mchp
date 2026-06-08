"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportGallery() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Browse performance reports and export summaries for management review.</p>
      </CardContent>
    </Card>
  )
}
