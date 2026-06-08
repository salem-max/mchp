import { router } from './trpc';
import { assetsRouter } from './routers/assets';
import { workOrdersRouter } from './routers/workOrders';
import { inventoryRouter } from './routers/inventory';
import { preventiveMaintenanceRouter } from './routers/preventiveMaintenance';
import { analyticsRouter } from './routers/analytics';
import { usersRouter } from './routers/users';
import { jobsRouter } from './routers/jobs';
import { transactionsRouter } from './routers/transactions';

export const appRouter = router({
  assets: assetsRouter,
  workOrders: workOrdersRouter,
  inventory: inventoryRouter,
  preventiveMaintenance: preventiveMaintenanceRouter,
  analytics: analyticsRouter,
  users: usersRouter,
  jobs: jobsRouter,
  transactions: transactionsRouter,
});

export type AppRouter = typeof appRouter;
