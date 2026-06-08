import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()

    // Support both single sensor reading and batch readings
    const readings = Array.isArray(body) ? body : [body]

    const results = []

    for (const reading of readings) {
      const { assetId, sensorId, value, timestamp, metadata } = reading

      if (!assetId || !sensorId || value === null || value === undefined) {
        continue // Skip invalid readings
      }

      // Find digital twin for this asset
      const digitalTwin = await prisma.digitalTwin.findFirst({
        where: { assetId },
        include: { asset: true }
      })


      if (!digitalTwin) {
        continue // Skip if no digital twin
      }

      // Store sensor data (schema uses SensorData.payload + createdAt)
      await prisma.sensorData.create({
        data: {
          digitalTwinId: digitalTwin.id,
          sensorId,
          payload: {
            value,
            timestamp: timestamp ?? null,
            status: getSensorStatus(sensorId, value),
            metadata,
          },
        }
      })



      // Check for anomalies and create alerts
      const anomalyResult = await checkForAnomalies(digitalTwin.id, sensorId, value, prisma)

      results.push({
        assetId,
        sensorId,
        value,
        status: 'ingested',
        anomalyDetected: anomalyResult.detected,
        alertCreated: anomalyResult.alertCreated
      })
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })
  } catch (error) {
    console.error('Error ingesting IoT data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getSensorStatus(sensorId: string, value: number): string {
  // Define thresholds based on sensor type
  if (sensorId.includes('temp')) {
    if (value > 80) return 'critical'
    if (value > 60) return 'warning'
    return 'normal'
  }

  if (sensorId.includes('vibration')) {
    if (value > 0.8) return 'critical'
    if (value > 0.5) return 'warning'
    return 'normal'
  }

  if (sensorId.includes('pressure')) {
    if (value > 150 || value < 20) return 'critical'
    if (value > 120 || value < 30) return 'warning'
    return 'normal'
  }

  // Default thresholds
  if (value > 90) return 'critical'
  if (value > 75) return 'warning'
  return 'normal'
}

async function checkForAnomalies(digitalTwinId: string, sensorId: string, value: number, prisma: any) {
  try {
    // Get recent sensor data for this sensor
    const recentData = await prisma.sensorData.findMany({
      where: {
        digitalTwinId,
        // Prisma schema stores arbitrary sensor payload in payload Json,
        // so we can’t filter by sensorId here unless sensorId is a top-level field.
        // If your schema evolves to include sensorId as a column, re-enable this filter.
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })


    if (recentData.length < 10) {
      return { detected: false, alertCreated: false }
    }

    // Calculate simple statistics from payload.value
    const values = recentData.map((d: any) => d.payload?.value as number)

    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length
    const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Check if current value is an outlier (3 standard deviations)
    const deviation = Math.abs(value - mean)
    const isAnomaly = deviation > 3 * stdDev

    if (isAnomaly) {
      // Create a work order for the anomaly
      const digitalTwin = await prisma.digitalTwin.findUnique({
        where: { id: digitalTwinId },
        include: { asset: true }
      })

      if (digitalTwin?.assetId) {
        await prisma.workOrder.create({
          data: {
            assetId: digitalTwin.assetId,
            title: `Anomaly Detected: ${sensorId} - Value: ${value}`,
            description: `Sensor ${sensorId} reported anomalous value ${value}. Expected range: ${Math.round((mean - 2 * stdDev) * 100) / 100} - ${Math.round((mean + 2 * stdDev) * 100) / 100}`,
            priority: deviation > 5 * stdDev ? 'CRITICAL' : 'HIGH',
            status: 'OPEN'
          }
        })
      }

      return { detected: true, alertCreated: true }
    }


    return { detected: false, alertCreated: false }
  } catch (error) {
    console.error('Error checking for anomalies:', error)
    return { detected: false, alertCreated: false }
  }
}