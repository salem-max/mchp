import type { Prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateAssetRequest, AssetFilters } from '@/types/cmms';

export async function getAllAssets(filters?: AssetFilters) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
      { type: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.asset.findMany({
    where,
    include: { digitalTwin: true, workOrders: { take: 5, orderBy: { createdAt: 'desc' } }, preventiveMaintenances: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAssetById(id: string) {
  const prisma = prisma;
  return prisma.asset.findUnique({
    where: { id },
    include: {
      digitalTwins: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sensorData: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
      workOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
}


export async function createAsset(data: CreateAssetRequest) {
  const prisma = prisma;
  const asset = await prisma.asset.create({
    data: {
      // Prisma schema: Asset has (id, name, status, location, createdAt, updatedAt)
      name: data.name,
      location: data.location,
      status: (data.status ?? 'ACTIVE') as any,
    },
  })

  // Auto-create digital twin (schema: DigitalTwin has name + optional assetId)
  await prisma.digitalTwin.create({
    data: {
      assetId: asset.id,
      name: `${asset.name} - Twin`,
      description: null,
    },
  })

  return getAssetById(asset.id)

}

export async function updateAsset(id: string, data: Partial<CreateAssetRequest>) {
  const prisma = prisma

  return prisma.asset.update({
    where: { id },
    data: {
      name: data.name,
      location: data.location,
      status: data.status as any,
      updatedAt: new Date(),
    },
    include: { digitalTwins: true },
  })
}



export async function deleteAsset(id: string) {
  const prisma = prisma;
  return prisma.asset.delete({ where: { id } });
}

