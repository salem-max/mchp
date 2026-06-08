"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AssistantCardProps {
  title?: string
  description?: string
}

export default function AssistantCard({ title = 'AI Assistant', description = 'An intelligent assistant card.' }: AssistantCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
