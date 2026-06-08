"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

interface AgentCardProps {
  name?: string
  role?: string
  status?: 'online' | 'offline'
}

export default function AgentCard({ name = 'AI Agent', role = 'Assistant', status = 'online' }: AgentCardProps) {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
          <Badge variant={status === 'online' ? 'secondary' : 'outline'}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">A lightweight agent profile card with status and role.</p>
      </CardContent>
    </Card>
  )
}
