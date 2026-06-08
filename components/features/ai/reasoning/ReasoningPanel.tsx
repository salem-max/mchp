"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReasoningPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reasoning Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Visualize inference paths, decision chains, and context reasoning in a compact panel.
        </p>
      </CardContent>
    </Card>
  )
}
