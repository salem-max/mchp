// @ts-nocheck
import type { Prisma } from '@/lib/prisma';

export async function getAnalytics() {
  const prisma = prisma;

  const [workOrders, assets, inventory] = await Promise.all([
    prisma.workOrder.findMany({ include: { asset: true } }),
    prisma.asset.findMany({ include: { workOrders: true } }),
    prisma.inventory.findMany(),
  ]);

  const completed = workOrders.filter((wo: any) => wo.status === 'COMPLETED');

  const totalDowntime = completed.reduce((acc: number, wo: any) => {
    if (wo.createdAt && wo.completedAt) {
      return acc + (wo.completedAt.getTime() - wo.createdAt.getTime());
    }
    return acc;
  }, 0);

  const mttr = completed.length > 0 ? totalDowntime / completed.length / 60000 : 0;

  const totalOperatingTime = assets.reduce(
    (acc, a) => acc + (Date.now() - a.createdAt.getTime()), 0
  );
  const mtbf = workOrders.length > 0 ? totalOperatingTime / workOrders.length / 3600000 : 0;

  const assetDowntime = (assets as any[]).map((asset: any) => ({
    assetId: asset.id,
    assetName: asset.name,
    downtime: asset.workOrders
      .filter((wo: any) => wo.status === 'COMPLETED' && wo.completedAt)
      .reduce((acc: number, wo: any) => acc + (wo.completedAt!.getTime() - wo.createdAt.getTime()), 0) / 60000,
  }));

  const totalMaintenanceCost = workOrders.length * 5000; // 50 USD per WO in cents
  const averageCostPerWO = completed.length > 0
    ? (totalMaintenanceCost / completed.length).toFixed(2)
    : 0;

  const lowStockItems = inventory.filter(i => i.quantity <= i.threshold);

  return {
    kpis: {
      mttr: Math.round(mttr * 100) / 100,
      mtbf: Math.round(mtbf * 100) / 100,
      totalWorkOrders: workOrders.length,
      completedWorkOrders: completed.length,
      pendingWorkOrders: workOrders.filter(wo => wo.status !== 'COMPLETED').length,
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === 'ACTIVE').length,
      assetAvailability: assets.length > 0
        ? (assets.filter(a => a.status === 'ACTIVE').length / assets.length * 100).toFixed(2) + '%'
        : '0%',
      totalMaintenanceCost,
      averageCostPerWO,
      lowStockItems: lowStockItems.length,
    },
    assetDowntime,
    workOrderTrend: {
      open: workOrders.filter(wo => wo.status === 'OPEN').length,
      assigned: workOrders.filter(wo => wo.status === 'ASSIGNED').length,
      inProgress: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length,
      completed: completed.length,
    },
    inventorySummary: {
      total: inventory.length,
      lowStock: lowStockItems.length,
      outOfStock: inventory.filter(i => i.quantity === 0).length,
      totalValue: inventory.reduce((s: any, i: any) => s + (i.cost ?? 0) * i.quantity, 0),
    },
  };
}

export async function getAlerts() {
  const prisma = prisma;
  const yesterday = new Date(Date.now() - 86400000);

  const [alerts, overduePM, allInventory] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        createdAt: { gte: yesterday },
        priority: { in: ['HIGH', 'CRITICAL'] },
        status: { in: ['OPEN', 'ASSIGNED'] },
      },
      include: { asset: true, assignedUser: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.preventiveMaintenance.findMany({
      where: { nextDue: { lt: new Date() }, isActive: true },
      include: { asset: true },
    }),
    prisma.inventory.findMany(),
  ]);

  const lowStockItems = allInventory.filter(i => i.quantity <= i.threshold);

  return {
    criticalAlerts: alerts.filter(a => a.priority === 'CRITICAL'),
    highAlerts: alerts.filter(a => a.priority === 'HIGH'),
    overdueMaintenance: overduePM,
    lowStockAlerts: lowStockItems,
  };
}
