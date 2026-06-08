import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export interface ProxyOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  path?: string;
}

/**
 * Proxies an incoming Next.js request to the backend service.
 *
 * @param req - The incoming NextRequest
 * @param endpoint - Backend endpoint path (e.g., '/assets', '/work-orders')
 * @param options - Optional overrides for method, headers, body, or custom path
 * @returns NextResponse with the backend's response data and status
 *
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   return proxyToBackend(req, '/assets');
 * }
 *
 * export async function POST(req: NextRequest) {
 *   return proxyToBackend(req, '/assets', { body: await req.json() });
 * }
 * ```
 */
export async function proxyToBackend(
  req: NextRequest,
  endpoint: string,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  try {
    const url = new URL(
      options.path || endpoint,
      BACKEND_URL
    );

    // Forward query params
    const { searchParams } = new URL(req.url);
    searchParams.forEach((value, key) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.append(key, value);
      }
    });

    // Build headers to forward
    const forwardHeaders = new Headers();
    const headersToForward = ['authorization', 'content-type', 'x-request-id'];
    headersToForward.forEach((header) => {
      const value = req.headers.get(header);
      if (value) forwardHeaders.set(header, value);
    });

    // Merge any additional headers from options
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        forwardHeaders.set(key, value);
      });
    }

    const method = options.method || req.method;
    const body = options.body ? JSON.stringify(options.body) : undefined;

    // Set content-type if we're sending a body and it's not already set
    if (body && !forwardHeaders.has('content-type')) {
      forwardHeaders.set('content-type', 'application/json');
    }

    const response = await fetch(url.toString(), {
      method,
      headers: forwardHeaders,
      body,
    });

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Create response with same status and JSON content-type
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Proxy Error] ${req.method} ${endpoint}:`, error);
    return NextResponse.json(
      { error: 'Backend service unavailable' },
      { status: 503 }
    );
  }
}

/**
 * Builds a backend URL for a resource with optional ID.
 * Useful for constructing proxy paths in dynamic routes.
 */
export function buildBackendPath(base: string, id?: string, suffix?: string): string {
  let path = base;
  if (id) path += `/${id}`;
  if (suffix) path += `/${suffix}`;
  return path;
}

