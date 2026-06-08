import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireCMMSUser } from '@/lib/middleware/rbac';
import { getAllWorkOrders, createWorkOrder } from '@/lib/cmms/work-order-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    return NextResponse.json(await getAllWorkOrders({
      status: searchParams.get('status') as any || undefined,
      priority: searchParams.get('priority') as any || undefined,
      assetId: searchParams.get('assetId') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      search: searchParams.get('search') || undefined,
    }));
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCMMSUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json(await createWorkOrder(await request.json()), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
