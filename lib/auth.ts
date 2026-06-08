import { prisma as db } from './prisma'
import { randomUUID } from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-prod'

export interface AuthPayload {
  id: string
  role: 'CUSTOMER' | 'TECHNICIAN' | 'BOTH'
  [key: string]: unknown
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 14)
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed)
}

export async function createSession(userId: string, role: string) {
  const payload = { id: userId, role } as AuthPayload
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret))
  
  const cks = await cookies()
  cks.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
}

export async function getUserFromSession(token?: string) {
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret)) as { payload: AuthPayload }
    
    if (!('id' in payload && 'role' in payload)) return null
    
    const user = await db.user.findUnique({
      where: { id: payload.id }
    })
    
    if (!user || user.role !== payload.role) return null
    
    // Clean user without password/token
    const { password, ...cleanUser } = user
    return cleanUser
  } catch {
    return null
  }
}

export async function register(data: { 
  email: string; 
  password: string; 
  name?: string; 
  role: 'CUSTOMER' | 'TECHNICIAN' | 'BOTH' 
}) {
  // Basic validation
  if (!data.email.includes('@') || data.password.length < 8) {
    throw new Error('Invalid email or password')
  }
  
  const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } })
  if (existing) throw new Error('User exists')
  
  const hashed = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name || data.email.split('@')[0],
      password: hashed,
      role: data.role,
    }
  })
  
  await createSession(user.id, user.role)
  
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function login(data: { email: string; password: string }) {
  // Basic validation
  if (!data.email.includes('@') || data.password.length < 8) {
    throw new Error('Invalid credentials')
  }
  
  const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } })
  if (!user || !await verifyPassword(data.password, user.password)) {
    throw new Error('Invalid credentials')
  }
  
  await createSession(user.id, user.role)
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function logout() {
  const cks = await cookies()
  cks.delete('auth-token')
}
// Extend user type for super admin flag (temporary until schema update)
declare module '@prisma/client' {
  interface User {
    isSuperAdmin?: boolean;
  }
}
