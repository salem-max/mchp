import { appRouter } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

export async function createServerCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}
