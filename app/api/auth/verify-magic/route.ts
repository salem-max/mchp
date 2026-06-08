import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/signup?error=missing-token', request.url));
    }

    const user = await db.user.findFirst({
      where: {
        magicToken: token,
        magicTokenExpiry: { gt: new Date() },
      }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/signup?error=invalid-or-expired-token', request.url));
    }

// Complete: clear magic, set dummy password for compatibility
    const dummyPassword = await bcrypt.hash('magic-user-password', 14);
    await db.user.update({
      where: { id: user.id },
      data: {
        magicToken: null,
        magicTokenExpiry: null,
        password: dummyPassword,
      }
    });

    // Create session
    await createSession(user.id, user.role);

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Verify magic error:', error);
    return NextResponse.redirect(new URL('/signup?error=server-error', request.url));
  }
}
