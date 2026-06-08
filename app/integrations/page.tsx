'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { IntegrationGrid } from '@/components/integration/integration-grid'
import { IntegrationFilters } from '@/components/integration/integration-filters'
import {
  integrations,
  searchIntegrations,
  type Integration,
  type IntegrationCategory,
} from '@/lib/integrations'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'all'>('all')

  const filteredIntegrations = useMemo<Integration[]>(() => {
    const base = searchQuery ? searchIntegrations(searchQuery) : integrations
    if (activeCategory === 'all') return base
    return base.filter((i) => i.category === activeCategory)
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Malaysia Co (Maintenance Services)
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/" className="inline-flex items-center gap-2">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Connect Your Favorite Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate with platforms across payment, delivery, fintech, and banking.
          </p>
        </div>

        <IntegrationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="mt-8">
          <IntegrationGrid integrations={filteredIntegrations} />
        </div>

        <div className="mt-16 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border text-center">
          <h3 className="text-2xl font-semibold mb-2">Don’t see your tool?</h3>
          <p className="text-muted-foreground mb-4">
            We’re constantly adding new integrations. Request yours today.
          </p>
          <Button size="lg" asChild>
            <a href="/support" className="inline-flex items-center gap-2">
              Request Integration <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  )
}

