import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireManager } from '@/lib/middleware/rbac';
import { getAssetById, updateAsset, deleteAsset } from '@/lib/cmms/asset-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const asset = await getAssetById(id);
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(asset);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireManager();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    return NextResponse.json(await updateAsset(id, await request.json()));
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireManager();
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await deleteAsset(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
