import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireCMMSUser } from '@/lib/middleware/rbac';
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from '@/lib/cmms/work-order-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const wo = await getWorkOrderById(id);
    if (!wo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(wo);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCMMSUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    return NextResponse.json(await updateWorkOrder(id, await request.json()));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: e?.message?.includes('Cannot transition') ? 400 : 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCMMSUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await deleteWorkOrder(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
