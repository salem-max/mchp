// @ts-nocheck
import type { Prisma } from '@/lib/prisma';
import type { CreateInventoryRequest, InventoryFilters } from '@/types/cmms';

export async function getAllInventory(filters?: InventoryFilters) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};
  if (filters?.search) {
    where.OR = [
      { partName: { contains: filters.search, mode: 'insensitive' } },
      { supplier: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  const items = await prisma.inventory.findMany({
    where,
    include: { workOrderParts: { include: { workOrder: { select: { id: true, title: true, status: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  if (filters?.lowStockOnly) return items.filter(i => i.quantity <= i.threshold);
  return items;
}

export async function getInventoryById(id: string) {
  const prisma = prisma;
  return prisma.inventory.findUnique({
    where: { id },
    include: { workOrderParts: { include: { workOrder: true } } },
  });
}

export async function createInventoryItem(data: CreateInventoryRequest) {
  const prisma = prisma;
  return prisma.inventory.create({
    data: {
      partName: data.partName,
      description: data.description ?? null,
      quantity: data.quantity,
      threshold: data.threshold,
      supplier: data.supplier ?? null,
      cost: data.cost ?? null,
      location: data.location ?? null,
    },
  });
}

export async function updateInventoryItem(id: string, data: Partial<CreateInventoryRequest>) {
  const prisma = prisma;
  return prisma.inventory.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteInventoryItem(id: string) {
  const prisma = prisma;
  return prisma.inventory.delete({ where: { id } });
}

export async function getLowStockItems() {
  const prisma = prisma;
  const all = await prisma.inventory.findMany();
  return all.filter(i => i.quantity <= i.threshold);
}
