import type { Prisma } from '@/lib/prisma';
import type { TxnStatus } from '@prisma/client';

export interface TransactionFilters {
  technicianId?: string;
  customerId?: string;
  jobId?: string;
  status?: TxnStatus;
}

export interface CreateTransactionInput {
  jobId: string;
  customerId: string;
  technicianId: string;
  amount: number;
  platformFee: number;
  technicianPayout: number;
}

export interface UpdateTransactionInput {
  status?: TxnStatus;
}

export async function getAllTransactions(filters?: TransactionFilters) {
  const prisma = prisma;
  const where: Record<string, unknown> = {};

  if (filters?.technicianId) where.technicianId = filters.technicianId;
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.jobId) where.jobId = filters.jobId;
  if (filters?.status) where.status = filters.status;

  return prisma.transaction.findMany({
    where,
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { job: { createdAt: 'desc' } },
  });
}

export async function getTransactionById(id: string) {
  const prisma = prisma;
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
          technician: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function getTransactionByJobId(jobId: string) {
  const prisma = prisma;
  return prisma.transaction.findUnique({
    where: { jobId },
    include: {
      job: {
        select: { id: true, title: true, category: true, status: true },
      },
    },
  });
}

export async function createTransaction(data: CreateTransactionInput) {
  const prisma = prisma;
  
  // Check if transaction already exists for this job
  const existing = await prisma.transaction.findUnique({
    where: { jobId: data.jobId },
  });
  if (existing) {
    throw new Error('Transaction already exists for this job');
  }

  return prisma.transaction.create({
    data: {
      jobId: data.jobId,
      customerId: data.customerId,
      technicianId: data.technicianId,
      amount: data.amount,
      platformFee: data.platformFee,
      technicianPayout: data.technicianPayout,
      status: 'HELD',
    },
    include: {
      job: {
        select: { id: true, title: true, category: true },
      },
    },
  });
}

export async function updateTransactionStatus(id: string, status: TxnStatus) {
  const prisma = prisma;
  return prisma.transaction.update({
    where: { id },
    data: { status },
    include: {
      job: {
        select: { id: true, title: true, category: true, status: true },
      },
    },
  });
}

export async function releasePayment(jobId: string) {
  const prisma = prisma;
  const transaction = await prisma.transaction.findUnique({
    where: { jobId },
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status !== 'HELD') {
    throw new Error(`Cannot release payment: current status is ${transaction.status}`);
  }

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'RELEASED' },
    include: {
      job: {
        select: { id: true, title: true, category: true },
      },
    },
  });
}

export async function refundPayment(jobId: string) {
  const prisma = prisma;
  const transaction = await prisma.transaction.findUnique({
    where: { jobId },
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.status === 'RELEASED') {
    throw new Error('Cannot refund: payment already released');
  }

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: { status: 'REFUNDED' },
    include: {
      job: {
        select: { id: true, title: true, category: true },
      },
    },
  });
}

export async function getEarningsSummary(technicianId: string) {
  const prisma = prisma;
  
  const transactions = await prisma.transaction.findMany({
    where: { technicianId },
  });

  const totalEarnings = transactions
    .filter(t => t.status === 'RELEASED')
    .reduce((sum, t) => sum + t.technicianPayout, 0);

  const pendingEarnings = transactions
    .filter(t => t.status === 'HELD')
    .reduce((sum, t) => sum + t.technicianPayout, 0);

  const totalJobs = transactions.length;
  const completedJobs = transactions.filter(t => t.status === 'RELEASED').length;

  return {
    totalEarnings,
    pendingEarnings,
    totalJobs,
    completedJobs,
    avgPerJob: completedJobs > 0 ? Math.round(totalEarnings / completedJobs) : 0,
  };
}
