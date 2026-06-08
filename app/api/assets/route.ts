import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireManager } from '@/lib/middleware/rbac';
import { getAllAssets, createAsset } from '@/lib/cmms/asset-service';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const assets = await getAllAssets({
      status: searchParams.get('status') as any || undefined,
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return NextResponse.json(assets);
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireManager();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    return NextResponse.json(await createAsset(body), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
