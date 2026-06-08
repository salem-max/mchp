// @ts-nocheck
import type { Prisma } from '@/lib/prisma';
import type { CreatePMRequest } from '@/types/cmms';

export async function getAllPM() {
  const prisma = prisma;
  const items = await prisma.preventiveMaintenance.findMany({
    include: { asset: true },
    orderBy: { nextDue: 'asc' },
  });
  const now = new Date();
  return {
    total: items.length,
    active: items.filter(p => p.isActive).length,
    upcoming: items.filter(p => p.isActive && p.nextDue > now && p.nextDue <= new Date(now.getTime() + 7 * 86400000)).length,
    overdue: items.filter(p => p.isActive && p.nextDue <= now).length,
    items,
  };
}

export async function getPMById(id: string) {
  const prisma = prisma;
  return prisma.preventiveMaintenance.findUnique({ where: { id }, include: { asset: true } });
}

export async function createPM(data: CreatePMRequest) {
  const prisma = prisma;
  const base = data.lastDone ? new Date(data.lastDone) : new Date();
  const nextDue = new Date(base.getTime() + data.interval * 86400000);
  return prisma.preventiveMaintenance.create({
    data: {
      assetId: data.assetId,
      scheduleType: data.scheduleType,
      interval: data.interval,
      description: data.description,
      isActive: data.isActive ?? true,
      lastDone: data.lastDone ? new Date(data.lastDone) : null,
      nextDue,
    },
    include: { asset: true },
  });
}

export async function updatePM(id: string, data: Partial<CreatePMRequest>) {
  const prisma = prisma;
  const existing = await prisma.preventiveMaintenance.findUnique({ where: { id } });
  if (!existing) throw new Error('Schedule not found');

  const interval = data.interval ?? existing.interval;
  const base = data.lastDone ? new Date(data.lastDone) : (existing.lastDone ?? new Date());
  const nextDue = new Date(base.getTime() + interval * 86400000);

  return prisma.preventiveMaintenance.update({
    where: { id },
    data: {
      ...(data.scheduleType && { scheduleType: data.scheduleType }),
      ...(data.interval !== undefined && { interval: data.interval }),
      ...(data.description && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.lastDone !== undefined && { lastDone: data.lastDone ? new Date(data.lastDone) : null }),
      nextDue,
    },
    include: { asset: true },
  });
}

export async function deletePM(id: string) {
  const prisma = prisma;
  return prisma.preventiveMaintenance.delete({ where: { id } });
}

/** Auto-generate work orders for overdue PM schedules */
export async function autoGenerateWorkOrders() {
  const prisma = prisma;
  const now = new Date();
  const overdue = await prisma.preventiveMaintenance.findMany({
    where: { nextDue: { lte: now }, isActive: true },
    include: { asset: true },
  });

  const created = [];
  for (const pm of overdue) {
    // Check if a WO already exists for this PM in the last 24h
    const recent = await prisma.workOrder.findFirst({
      where: {
        assetId: pm.assetId,
        title: { contains: pm.description },
        createdAt: { gte: new Date(now.getTime() - 86400000) },
      },
    });
    if (recent) continue;

    const wo = await prisma.workOrder.create({
      data: {
        assetId: pm.assetId,
        title: `[PM] ${pm.description}`,
        description: `Auto-generated from preventive maintenance schedule. Asset: ${pm.asset.name}`,
        priority: 'MEDIUM',
        status: 'OPEN',
        dueDate: now,
      },
    });
    created.push(wo);
  }
  return created;
}
