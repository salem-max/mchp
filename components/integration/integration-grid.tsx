'use client'

import { IntegrationCard } from './integration-card'
import type { Integration } from '@/lib/integrations'

export function IntegrationGrid({ integrations }: { integrations: Integration[] }) {
  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No integrations found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  )
}

