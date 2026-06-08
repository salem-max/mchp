import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { z, ZodError } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(['CUSTOMER', 'TECHNICIAN', 'BOTH']).default('CUSTOMER'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    const user = await register(data)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const msg = (error as Error).message ?? 'Registration failed'
    const status = msg === 'User exists' ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
