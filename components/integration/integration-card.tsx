'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Integration } from '@/lib/integrations'; // adjust path if needed

// Define fallback type in case the import above is missing
type Integration = {
  name: string;
  description: string;
  status: 'connected' | 'available' | 'beta' | 'coming-soon';
  category: string;
  icon?: string | null;
  features?: string[];
};

const statusConfig = {
  connected: { icon: CheckCircle, color: 'text-green-500', label: 'Connected' },
  available: { icon: null, color: 'text-blue-500', label: 'Available' },
  beta: { icon: AlertCircle, color: 'text-yellow-500', label: 'Beta' },
  'coming-soon': { icon: Clock, color: 'text-gray-400', label: 'Coming Soon' },
} as const satisfies Record<Integration['status'], { icon: React.ElementType | null; color: string; label: string }>;

export function IntegrationCard({ integration }: { integration: Integration }) {
  const status = statusConfig[integration.status];
  const StatusIcon = status?.icon ?? null;
  const statusColor = status?.color ?? 'text-gray-400';
  const statusLabel = status?.label ?? 'Unknown';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center p-2">
              {integration.icon ? (
                <Image
                  src={integration.icon}
                  alt={`${integration.name} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">{integration.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{integration.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                {StatusIcon && <StatusIcon className={`h-3 w-3 ${statusColor}`} />}
                <span className="text-xs text-muted-foreground">{statusLabel}</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize shrink-0">
            {integration.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">{integration.description}</p>
        {integration.features && integration.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {integration.features.slice(0, 2).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link
            href="/dashboard/customer/integrations"
            className="inline-flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Configure Integration
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}