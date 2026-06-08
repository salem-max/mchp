import { z } from 'zod';
import {
  router,
  publicAccessProcedure,
  viewerProcedure,
  userProcedure,
} from '../trpc';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  assignTechnician,
  updateJobStatus,
  getJobStats,
  getOpenJobsForFeed,
} from '@/lib/cmms/jobs-service';
import { createTransaction } from '@/lib/cmms/transactions-service';
import { TRPCError } from '@trpc/server';

const JobStatusEnum = z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED']);

const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});

export const jobsRouter = router({
  // ── List jobs with filters ────────────────────────────────────────────────
  list: publicAccessProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        technicianId: z.string().optional(),
        status: JobStatusEnum.optional(),
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const jobs = await getAllJobs(input);

      // Public: minimal fields
      if (!ctx.user && !ctx.viewer) {
        return jobs.map((job) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          status: job.status,
          budget: job.budget,
          createdAt: job.createdAt,
        }));
      }

      // Viewer: expanded read-only
      if (ctx.viewer && !ctx.user) {
        return jobs.map((job) => ({
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          status: job.status,
          budget: job.budget,
          location: job.location,
          customer: job.customer ? { name: job.customer.name, avgRating: job.customer.avgRating } : null,
          createdAt: job.createdAt,
        }));
      }

      // User: full data
      return jobs.map((job) => ({
        ...job,
        canEdit: ctx.user?.id === job.customerId,
        canBid: ctx.user?.id !== job.customerId && job.status === 'OPEN',
        canStart: ctx.user?.id === job.technicianId && job.status === 'ASSIGNED',
        canComplete: ctx.user?.id === job.technicianId && job.status === 'IN_PROGRESS',
      }));
    }),

  // ── Get single job by ID ──────────────────────────────────────────────────
  byId: publicAccessProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await getJobById(input.id);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      // Public: minimal fields
      if (!ctx.user && !ctx.viewer) {
        return {
          id: job.id,
          title: job.title,
          category: job.category,
          status: job.status,
          budget: job.budget,
        };
      }

      // Viewer: expanded read-only
      if (ctx.viewer && !ctx.user) {
        return {
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          status: job.status,
          budget: job.budget,
          location: job.location,
          customer: job.customer ? { name: job.customer.name, avgRating: job.customer.avgRating } : null,
          createdAt: job.createdAt,
        };
      }

      // User: full data with permissions
      return {
        ...job,
        canEdit: ctx.user?.id === job.customerId,
        canBid: ctx.user?.id !== job.customerId && job.status === 'OPEN',
        canStart: ctx.user?.id === job.technicianId && job.status === 'ASSIGNED',
        canComplete: ctx.user?.id === job.technicianId && job.status === 'IN_PROGRESS',
        canAcceptBid: ctx.user?.id === job.customerId && job.status === 'OPEN',
      };
    }),

  // ── Get job statistics ────────────────────────────────────────────────────
  stats: userProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        technicianId: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return getJobStats(input);
    }),

  // ── Get open jobs for technician feed ─────────────────────────────────────
  feed: userProcedure
    .input(z.object({ excludeTechnicianId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return getOpenJobsForFeed(input?.excludeTechnicianId);
    }),

  // ── Create new job (customer) ─────────────────────────────────────────────
  create: userProcedure
    .input(
      z.object({
        title: z.string().min(5, 'Title must be at least 5 characters'),
        category: z.string().min(1, 'Category is required'),
        description: z.string().min(20, 'Description must be at least 20 characters'),
        budget: z.number().min(100, 'Budget must be at least 100 cents'),
        location: LocationSchema,
        images: z.array(z.string()).optional(),
        scheduledTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return createJob({
        ...input,
        customerId: ctx.user.id,
      });
    }),

  // ── Update job ────────────────────────────────────────────────────────────
  update: userProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        budget: z.number().min(100).optional(),
        location: LocationSchema.optional(),
        images: z.array(z.string()).optional(),
        scheduledTime: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const job = await getJobById(id);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id !== job.customerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the job owner can edit' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot edit job after it has been assigned' });
      }

      return updateJob(id, data);
    }),

  // ── Delete job ────────────────────────────────────────────────────────────
  delete: userProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.id);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id !== job.customerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the job owner can delete' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot delete job after it has been assigned' });
      }

      return deleteJob(input.id);
    }),

  // ── Assign technician to job (accept bid) ─────────────────────────────────
  acceptBid: userProcedure
    .input(
      z.object({
        jobId: z.string(),
        technicianId: z.string(),
        agreedAmount: z.number().min(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id !== job.customerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the job owner can accept bids' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job is no longer accepting bids' });
      }

      // Assign technician
      const updatedJob = await assignTechnician(input.jobId, input.technicianId);

      // Create held transaction
      const platformFee = Math.round(input.agreedAmount * 0.1); // 10% platform fee
      await createTransaction({
        jobId: input.jobId,
        customerId: job.customerId,
        technicianId: input.technicianId,
        amount: input.agreedAmount,
        platformFee,
        technicianPayout: input.agreedAmount - platformFee,
      });

      return updatedJob;
    }),

  // ── Update job status ─────────────────────────────────────────────────────
  updateStatus: userProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: JobStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      // Validate permissions based on status change
      const isCustomer = ctx.user?.id === job.customerId;
      const isTechnician = ctx.user?.id === job.technicianId;

      if (input.status === 'IN_PROGRESS' && !isTechnician) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the assigned technician can start the job' });
      }

      if (input.status === 'COMPLETED' && !isTechnician) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the assigned technician can complete the job' });
      }

      if (input.status === 'DISPUTED' && !isCustomer && !isTechnician) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only job participants can dispute' });
      }

      return updateJobStatus(input.jobId, input.status, ctx.user?.id);
    }),

  // ── Start job (technician) ────────────────────────────────────────────────
  start: userProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id !== job.technicianId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the assigned technician can start' });
      }

      if (job.status !== 'ASSIGNED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job must be assigned before starting' });
      }

      return updateJobStatus(input.jobId, 'IN_PROGRESS', ctx.user?.id);
    }),

  // ── Complete job (technician) ─────────────────────────────────────────────
  complete: userProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id !== job.technicianId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the assigned technician can complete' });
      }

      if (job.status !== 'IN_PROGRESS') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job must be in progress to complete' });
      }

      return updateJobStatus(input.jobId, 'COMPLETED', ctx.user?.id);
    }),

  // ── SOS emergency action ──────────────────────────────────────────────────
  sos: userProcedure
    .input(
      z.object({
        jobId: z.string(),
        message: z.string().optional(),
        location: LocationSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      const isParticipant = ctx.user?.id === job.customerId || ctx.user?.id === job.technicianId;
      if (!isParticipant) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only job participants can trigger SOS' });
      }

      // In a real implementation, this would:
      // 1. Send emergency notifications
      // 2. Log the SOS event
      // 3. Alert platform admins
      // For now, we mark the job as disputed and return the info

      await updateJobStatus(input.jobId, 'DISPUTED', ctx.user?.id);

      return {
        success: true,
        jobId: input.jobId,
        triggeredBy: ctx.user?.id,
        message: input.message,
        location: input.location,
        timestamp: new Date().toISOString(),
      };
    }),

  // ── Submit bid (technician) ───────────────────────────────────────────────
  bid: userProcedure
    .input(
      z.object({
        jobId: z.string(),
        amount: z.number().min(100),
        message: z.string().optional(),
        estimatedTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await getJobById(input.jobId);

      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      if (ctx.user?.id === job.customerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot bid on your own job' });
      }

      if (job.status !== 'OPEN') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job is no longer accepting bids' });
      }

      // In a full implementation, this would store bids in a separate table
      // For now, return the bid info
      return {
        success: true,
        jobId: input.jobId,
        technicianId: ctx.user?.id,
        amount: input.amount,
        message: input.message,
        estimatedTime: input.estimatedTime,
        submittedAt: new Date().toISOString(),
      };
    }),
});
