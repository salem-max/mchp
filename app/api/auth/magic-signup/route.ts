import { NextRequest, NextResponse } from 'next/server';
import { z } from "zod";
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { sendMagicLinkEmail } from '@/lib/resend-emails';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  role: z.enum(['CUSTOMER', 'TECHNICIAN', 'BOTH']).default('CUSTOMER'),
})

export async function POST(request: NextRequest) {
  try {
    const data = await schema.parse(await request.json());

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      // If exists, just send login link (future: separate login magic)
      // For now, treat as error to avoid confusion
      return NextResponse.json({ error: 'User already exists. Please login.' }, { status: 409 });
    }

    // Create pending user with magic token
    const magicToken = randomUUID();
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.email.split('@')[0],
        role: 'CUSTOMER',
        password: null, // No password for magic users initially
        magicToken,
        magicTokenExpiry: expiry,
      }
    });

    // Send email
    await sendMagicLinkEmail({
      to: data.email,
      token: magicToken,
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic signup error:', error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
