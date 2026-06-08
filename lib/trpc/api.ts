/**
 * Standalone tRPC client for use outside React components
 * (e.g. in Zustand stores, server scripts, etc.)
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/trpc/root';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        const headers: Record<string, string> = { 'x-trpc-source': 'api-client' };
        // Forward auth token if in browser
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/auth-token=([^;]+)/);
          if (match) headers['Authorization'] = `Bearer ${match[1]}`;
        }
        return headers;
      },
    }),
  ],
});
