import type { Prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import type { CreateUserRequest, UpdateUserRequest, UserRole } from '@/types/cmms';

export async function getAllUsers() {
  const prisma = await Prisma();
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, createdAt: true, isSuperAdmin: true,
      technicianProfile: { select: { skills: true, isAvailable: true, verified: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserById(id: string) {
  const prisma = prisma;
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, createdAt: true, isSuperAdmin: true,
      technicianProfile: true,
    },
  });
}

export async function createUser(data: CreateUserRequest) {
  const prisma = prisma;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');
  const hashed = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role,
      phone: data.phone ?? null,
    },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: UpdateUserRequest) {
  const prisma = prisma;
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.role && { role: data.role }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  const prisma = prisma;
  return prisma.user.delete({ where: { id } });
}

export async function getUsersByRole(role: UserRole) {
  const prisma = prisma;
  return prisma.user.findMany({
    where: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}
