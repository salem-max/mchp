import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const prisma = await getPrisma() as any
        const cookieStore = await cookies()
        const jwtToken = cookieStore.get('auth-token')?.value

        if (!jwtToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await getUserFromSession(jwtToken)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { sensorId, value, metadata, timestamp } = body


        // Update digital twin current state
        const digitalTwin = await prisma.digitalTwin.findFirst({
            where: { assetId: id }
        })


        if (!digitalTwin) {
            return NextResponse.json({ error: 'Digital twin not found' }, { status: 404 })
        }

        // Persist arbitrary sensor payload (schema uses SensorData.payload + createdAt only)
        await prisma.sensorData.create({
            data: {
                digitalTwinId: digitalTwin.id,
                payload: { sensorId, value, metadata, timestamp },
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error updating digital twin:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const prisma = await getPrisma() as any

        const digitalTwin = await prisma.digitalTwin.findFirst({
            where: { assetId: id },
            include: {
                sensorData: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        })


        if (!digitalTwin) {
            return NextResponse.json({ error: 'Digital twin not found' }, { status: 404 })
        }

        return NextResponse.json(digitalTwin)
    } catch (error) {
        console.error('Error fetching digital twin:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}