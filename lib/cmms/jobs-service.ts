import type { Prisma } from '@/lib/prisma';
import type { JobStatus } from '@prisma/client';

export interface JobFilters {
  customerId?: string;
  technicianId?: string;
  status?: JobStatus;
  category?: string;
  search?: string;
}

export interface CreateJobInput {
  customerId: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  location: { lat: number; lng: number; address: string };
  images?: string[];
  scheduledTime?: string;
}

export interface UpdateJobInput {
  title?: string;
  category?: string;
  description?: string;
  budget?: number;
  status?: JobStatus;
  technicianId?: string | null;
  location?: { lat: number; lng: number; address: string };
  images?: string[];
  scheduledTime?: string | null;
}

// Status transition rules for jobs
const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  OPEN: ['ASSIGNED', 'DISPUTED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'DISPUTED'],
  IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
  COMPLETED: ['DISPUTED'],
  DISPUTED: ['OPEN', 'COMPLETED'],
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function getAllJobs(filters?: JobFilters) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};

  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.technicianId) where.technicianId = filters.technicianId;
  if (filters?.status) where.status = filters.status;
  if (filters?.category) where.category = filters.category;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.job.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true, avgRating: true },
      },
      technician: {
        select: { id: true, name: true, email: true, phone: true, avgRating: true },
      },
      transactions: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJobById(id: string) {
  const prisma = prisma;
  return prisma.job.findUnique({
    where: { id },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true, avgRating: true, location: true },
      },
      technician: {
        select: { id: true, name: true, email: true, phone: true, avgRating: true },
      },
      transactions: true,
    },
  });
}

export async function createJob(data: CreateJobInput) {
  const prisma = prisma;
  return prisma.job.create({
    data: {
      customerId: data.customerId,
      title: data.title,
      category: data.category,
      description: data.description,
      budget: data.budget,
      location: data.location,
      images: data.images ?? [],
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
      status: 'OPEN',
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });
}

export async function updateJob(id: string, data: UpdateJobInput) {
  const prisma = prisma;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) throw new Error('Job not found');

  // Validate status transition
  if (data.status && data.status !== existing.status) {
    if (!canTransitionJob(existing.status, data.status)) {
      throw new Error(`Cannot transition from ${existing.status} to ${data.status}`);
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.scheduledTime !== undefined) {
    updateData.scheduledTime = data.scheduledTime ? new Date(data.scheduledTime) : null;
  }

  return prisma.job.update({
    where: { id },
    data: updateData,
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      technician: {
        select: { id: true, name: true, email: true, phone: true },
      },
      transactions: true,
    },
  });
}

export async function deleteJob(id: string) {
  const prisma = prisma;
  return prisma.job.delete({ where: { id } });
}

export async function assignTechnician(jobId: string, technicianId: string) {
  const prisma = prisma;
  return prisma.job.update({
    where: { id: jobId },
    data: {
      technicianId,
      status: 'ASSIGNED',
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      technician: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function updateJobStatus(jobId: string, status: JobStatus, userId?: string) {
  const prisma = prisma;
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) throw new Error('Job not found');

  if (!canTransitionJob(existing.status, status)) {
    throw new Error(`Cannot transition from ${existing.status} to ${status}`);
  }

  return prisma.job.update({
    where: { id: jobId },
    data: { status },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true, email: true } },
      transactions: true,
    },
  });
}

export async function getJobStats(filters?: { customerId?: string; technicianId?: string }) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.technicianId) where.technicianId = filters.technicianId;

  const [total, open, inProgress, completed] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.count({ where: { ...where, status: 'OPEN' } }),
    prisma.job.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.job.count({ where: { ...where, status: 'COMPLETED' } }),
  ]);

  return { total, open, inProgress, completed };
}

export async function getOpenJobsForFeed(excludeTechnicianId?: string) {
  const prisma = prisma;
  const where: Record<string, unknown> = { status: 'OPEN' };
  
  // Optionally exclude jobs the technician has already bid on
  // This would require a bids table which we can add later

  return prisma.job.findMany({
    where,
    include: {
      customer: {
        select: { id: true, name: true, avgRating: true, location: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
