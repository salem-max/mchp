'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AssetHierarchyPlaceholder() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Hierarchy</h1>
        <p className="text-muted-foreground mt-1">Placeholder route.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Implement a real asset hierarchy/graph view here.
        </CardContent>
      </Card>
    </main>
  )
}

