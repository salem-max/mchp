import { z } from 'zod';
import {
  router,
  userProcedure,
  adminProcedure,
} from '../trpc';
import {
  getAllTransactions,
  getTransactionById,
  getTransactionByJobId,
  updateTransactionStatus,
  releasePayment,
  refundPayment,
  getEarningsSummary,
} from '@/lib/cmms/transactions-service';
import { TRPCError } from '@trpc/server';

const TxnStatusEnum = z.enum(['HELD', 'RELEASED', 'REFUNDED']);

export const transactionsRouter = router({
  // ── List transactions with filters ────────────────────────────────────────
  list: userProcedure
    .input(
      z.object({
        technicianId: z.string().optional(),
        customerId: z.string().optional(),
        jobId: z.string().optional(),
        status: TxnStatusEnum.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Users can only see their own transactions unless admin
      const filters = { ...input };
      
      if (ctx.user?.role !== 'ADMIN') {
        // Auto-filter to user's transactions
        if (!filters.technicianId && !filters.customerId) {
          // Return transactions where user is either customer or technician
          const allTransactions = await getAllTransactions();
          return allTransactions.filter(
            (t) => t.technicianId === ctx.user?.id || t.customerId === ctx.user?.id
          );
        }
        
        // Ensure user can only query their own
        if (filters.technicianId && filters.technicianId !== ctx.user?.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view other users\' transactions' });
        }
        if (filters.customerId && filters.customerId !== ctx.user?.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view other users\' transactions' });
        }
      }

      return getAllTransactions(filters);
    }),

  // ── Get transaction by ID ─────────────────────────────────────────────────
  byId: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await getTransactionById(input.id);

      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });
      }

      // Check access
      const isParticipant =
        transaction.customerId === ctx.user?.id ||
        transaction.technicianId === ctx.user?.id;
      const isAdmin = ctx.user?.role === 'ADMIN';

      if (!isParticipant && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return transaction;
    }),

  // ── Get transaction by job ID ─────────────────────────────────────────────
  byJobId: userProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await getTransactionByJobId(input.jobId);

      if (!transaction) {
        return null;
      }

      // Check access
      const isParticipant =
        transaction.customerId === ctx.user?.id ||
        transaction.technicianId === ctx.user?.id;
      const isAdmin = ctx.user?.role === 'ADMIN';

      if (!isParticipant && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return transaction;
    }),

  // ── Get earnings summary for technician ───────────────────────────────────
  earnings: userProcedure
    .input(z.object({ technicianId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const technicianId = input?.technicianId || ctx.user?.id;

      if (!technicianId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Technician ID required' });
      }

      // Non-admins can only see their own earnings
      if (ctx.user?.role !== 'ADMIN' && technicianId !== ctx.user?.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot view other users\' earnings' });
      }

      return getEarningsSummary(technicianId);
    }),

  // ── Release payment (admin only) ──────────────────────────────────────────
  release: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await releasePayment(input.jobId);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to release payment';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

  // ── Refund payment (admin only) ───────────────────────────────────────────
  refund: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await refundPayment(input.jobId);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to refund payment';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),

  // ── Update transaction status (admin only) ────────────────────────────────
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: TxnStatusEnum,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateTransactionStatus(input.id, input.status);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to update transaction';
        throw new TRPCError({ code: 'BAD_REQUEST', message });
      }
    }),
});
