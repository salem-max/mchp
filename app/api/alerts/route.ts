import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/rbac';
import { getAlerts } from '@/lib/cmms/analytics-service';

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json(await getAlerts());
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
