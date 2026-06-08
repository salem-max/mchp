import type { Prisma } from '@/lib/prisma';
import type { CreateWorkOrderRequest, UpdateWorkOrderRequest, WorkOrderFilters, WorkOrderStatus } from '@/types/cmms';

const STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  OPEN:        ['ASSIGNED', 'CANCELLED'],
  ASSIGNED:    ['IN_PROGRESS', 'OPEN', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ASSIGNED', 'CANCELLED'],
  COMPLETED:   [],
  CANCELLED:   [],
};

export function canTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function getAllWorkOrders(filters?: WorkOrderFilters) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.assetId) where.assetId = filters.assetId;
  if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.workOrder.findMany({
    where,
    include: {
      asset: { select: { id: true, name: true, type: true, location: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
      partsUsed: { include: { inventory: { select: { id: true, partName: true, cost: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkOrderById(id: string) {
  const prisma = prisma;
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      asset: true,
      assignedUser: { select: { id: true, name: true, email: true } },
      partsUsed: { include: { inventory: true } },
    },
  });
}

export async function createWorkOrder(data: CreateWorkOrderRequest) {
  const prisma = prisma;
  return prisma.workOrder.create({
    data: {
      assetId: data.assetId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'MEDIUM',
      status: data.status ?? 'OPEN',
      assignedTo: data.assignedTo ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes ?? null,
    },
    include: {
      asset: { select: { id: true, name: true, type: true, location: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateWorkOrder(id: string, data: Partial<UpdateWorkOrderRequest>) {
  const prisma = prisma;
  const existing = await prisma.workOrder.findUnique({ where: { id } });
  if (!existing) throw new Error('Work order not found');

  // Validate status transition
  if (data.status && data.status !== existing.status) {
    if (!canTransition(existing.status as WorkOrderStatus, data.status)) {
      throw new Error(`Cannot transition from ${existing.status} to ${data.status}`);
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.status === 'COMPLETED') updateData.completedAt = new Date();

  return prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: {
      asset: { select: { id: true, name: true, type: true, location: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
      partsUsed: { include: { inventory: true } },
    },
  });
}

export async function deleteWorkOrder(id: string) {
  const prisma = prisma;
  return prisma.workOrder.delete({ where: { id } });
}
