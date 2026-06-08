"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpCircle, 
  BarChart3, 
  Cpu, 
  Gauge, 
  MapPin, 
  Thermometer, 
  TrendingDown, 
  TrendingUp, 
  Vibrate, 
  Wifi, 
  Wrench 
} from 'lucide-react'
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

// ==================== TYPES ====================

interface TelemetryPoint {
  timestamp: string
  value: number
  quality: number
  anomaly?: boolean
}

interface SensorTelemetry {
  sensorId: string
  type: 'temperature' | 'vibration' | 'pressure' | 'current' | 'rpm' | 'flow'
  unit: string
  data: TelemetryPoint[]
  thresholds: {
    warning: number
    critical: number
    min?: number
    max?: number
  }
}

interface AssetHealth {
  overall: number
  reliability: number
  performance: number
  maintenance: number
}

interface Prediction {
  failureProbability: number
  rulHours: number
  confidence: number
  recommendedActions: string[]
  estimatedDowntime: number
}

interface Anomaly {
  id: string
  sensorId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

interface WorkOrder {
  id: string
  type: 'preventive' | 'predictive' | 'corrective' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'in-progress' | 'completed'
  description: string
  scheduledDate?: string
  assignedTo?: string
}

interface DigitalTwinProps {
  assetId: string
  assetName: string
  assetType: string
  location: { lat: number; lng: number; name: string }
  currentState: {
    status: 'operational' | 'degraded' | 'maintenance' | 'offline' | 'failed'
    uptime: number
    load: number
    efficiency: number
    temperature: number
    vibration: number
    pressure?: number
    rpm?: number
  }
  health: AssetHealth
  sensors: SensorTelemetry[]
  predictions: Prediction
  anomalies: Anomaly[]
  activeWorkOrders: WorkOrder[]
  onRefresh?: () => Promise<void>
  onCreateWorkOrder?: (workOrder: Partial<WorkOrder>) => Promise<void>
  onAcknowledgeAnomaly?: (anomalyId: string) => Promise<void>
  className?: string
}

// ==================== UTILITY FUNCTIONS ====================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational': return 'text-green-600 bg-green-50 border-green-200'
    case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'maintenance': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'failed': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getHealthColor = (health: number) => {
  if (health >= 80) return 'text-green-600'
  if (health >= 60) return 'text-yellow-600'
  if (health >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getSensorIcon = (type: string) => {
  switch (type) {
    case 'temperature': return Thermometer
    case 'vibration': return Vibrate
    case 'pressure': return Gauge
    case 'current': return Activity
    case 'rpm': return TrendingUp
    case 'flow': return ArrowUpCircle
    default: return Activity
  }
}

// ==================== SUB-COMPONENTS ====================

function HealthGauge({ health, size = 'md' }: { health: number; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = { sm: 80, md: 120, lg: 160 }
  const dimension = dimensions[size]
  const radius = dimension / 2 - 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (health / 100) * circumference
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dimension} height={dimension} className="transform -rotate-90">
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={health >= 80 ? '#22c55e' : health >= 60 ? '#eab308' : health >= 40 ? '#f97316' : '#ef4444'}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl'} ${getHealthColor(health)}`}>
          {Math.round(health)}%
        </span>
      </div>
    </div>
  )
}

function SensorCard({ sensor, onViewHistory }: { sensor: SensorTelemetry; onViewHistory: (sensorId: string) => void }) {
  const Icon = getSensorIcon(sensor.type)
  const latestReading = sensor.data[sensor.data.length - 1]
  const isWarning = latestReading?.value >= sensor.thresholds.warning
  const isCritical = latestReading?.value >= sensor.thresholds.critical
  const hasAnomaly = sensor.data.some(d => d.anomaly)
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'}`} />
            <span className="font-medium capitalize">{sensor.type}</span>
          </div>
          {hasAnomaly && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
        </div>
        
        <div className="mb-3">
          <span className="text-2xl font-bold">
            {latestReading?.value.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">{sensor.unit}</span>
        </div>
        
        <Progress 
          value={(latestReading?.value / sensor.thresholds.critical) * 100} 
          className="h-2 mb-2"
          style={{ "--progress-color": isCritical ? "#ef4444" : isWarning ? "#eab308" : "#22c55e" } as React.CSSProperties}
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Warning: {sensor.thresholds.warning}{sensor.unit}</span>
          <span>Critical: {sensor.thresholds.critical}{sensor.unit}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => onViewHistory(sensor.type)}
        >
          View History
        </Button>
      </CardContent>
    </Card>
  )
}

function TelemetryChart({ data, title, unit, color }: { data: TelemetryPoint[]; title: string; unit: string; color: string }) {
  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    value: d.value,
    anomaly: d.anomaly
  }))
  
  return (
    <div className="h-64">
      <h4 className="font-medium mb-3 capitalize">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} unit={unit} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {data.some(d => d.anomaly) && (
            <Area
              type="monotone"
              dataKey="anomaly"
              fill="#ef4444"
              fillOpacity={0.3}
              stroke="none"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function AnomalyAlert({ anomaly, onAcknowledge }: { anomaly: Anomaly; onAcknowledge: () => void }) {
  const severityColors = {
    low: 'border-yellow-200 bg-yellow-50',
    medium: 'border-orange-200 bg-orange-50',
    high: 'border-red-200 bg-red-50',
    critical: 'border-red-400 bg-red-100'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 border rounded-lg ${severityColors[anomaly.severity]} mb-2`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-medium text-sm">{anomaly.sensorId} Anomaly</span>
            <Badge variant="outline" className="text-xs">
              {anomaly.severity}
            </Badge>
          </div>
          <p className="text-sm">{anomaly.message}</p>
          <span className="text-xs text-gray-500">
            {new Date(anomaly.timestamp).toLocaleString()}
          </span>
        </div>
        {!anomaly.resolved && (
          <Button size="sm" variant="outline" onClick={onAcknowledge}>
            Acknowledge
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ==================== MAIN COMPONENT ====================

export function DigitalTwin({ 
  assetId, 
  assetName, 
  assetType,
  location,
  currentState, 
  health,
  sensors, 
  predictions,
  anomalies,
  activeWorkOrders,
  onRefresh,
  onCreateWorkOrder,
  onAcknowledgeAnomaly,
  className = '' 
}: DigitalTwinProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showPredictionModal, setShowPredictionModal] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
  }, [onRefresh])

  const handleCreateWorkOrder = useCallback(async () => {
    if (onCreateWorkOrder && predictions) {
      await onCreateWorkOrder({
        type: 'predictive',
        priority: predictions.failureProbability > 0.8 ? 'critical' : 'high',
        description: `AI-generated work order for ${assetName} - Failure probability: ${(predictions.failureProbability * 100).toFixed(1)}%, RUL: ${predictions.rulHours.toFixed(1)} hours`
      })
      setShowPredictionModal(false)
    }
  }, [onCreateWorkOrder, predictions, assetName])

  const overallHealth = useMemo(() => {
    return (health.overall * 0.4 + health.reliability * 0.3 + health.performance * 0.2 + health.maintenance * 0.1)
  }, [health])

  const criticalAnomalies = anomalies.filter(a => !a.resolved && (a.severity === 'high' || a.severity === 'critical'))

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {assetName}
              <Badge className={getStatusColor(currentState.status)}>
                {currentState.status}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location.name}
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-4 h-4" />
                {assetType}
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                Uptime: {(currentState.uptime / 24).toFixed(1)} days
              </div>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
      </Card>

      {/* Critical Alerts Banner */}
      {criticalAnomalies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-600">Critical Alerts</span>
          </div>
          <AnimatePresence>
            {criticalAnomalies.map(anomaly => (
              <AnomalyAlert 
                key={anomaly.id} 
                anomaly={anomaly} 
                onAcknowledge={() => onAcknowledgeAnomaly?.(anomaly.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Health</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <HealthGauge health={overallHealth} size="lg" />
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Reliability</div>
                    <div className="text-xl font-semibold">{health.reliability}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Performance</div>
                    <div className="text-xl font-semibold">{health.performance}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Load</span>
                  <span className="font-medium">{currentState.load}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Efficiency</span>
                  <span className="font-medium">{currentState.efficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Temperature</span>
                  <span className="font-medium">{currentState.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vibration</span>
                  <span className="font-medium">{currentState.vibration} mm/s</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">AI Prediction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Failure Probability</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress 
                        value={predictions.failureProbability * 100} 
                        className={`h-2 ${predictions.failureProbability > 0.7 ? '[&>div]:bg-red-500' : '[&>div]:bg-yellow-500'}`}
                      />
                    </div>
                    <span className="font-bold">{(predictions.failureProbability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">RUL</span>
                  <span className="font-medium">{predictions.rulHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{predictions.confidence}%</span>
                </div>
                {predictions.failureProbability > 0.6 && (
                  <Button 
                    className="w-full mt-2" 
                    variant="destructive"
                    onClick={() => setShowPredictionModal(true)}
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Create Work Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Work Orders */}
          {activeWorkOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeWorkOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={order.priority === 'critical' ? 'destructive' : 'default'}>
                            {order.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">{order.type}</span>
                        </div>
                        <p className="text-sm">{order.description}</p>
                        {order.scheduledDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="mt-4">
          {selectedSensor ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedSensor(null)} className="mb-2">
                ← Back to Sensors
              </Button>
              <Card>
                <CardContent className="p-6">
                  {(() => {
                    const sensor = sensors.find(s => s.type === selectedSensor)
                    if (!sensor) return null
                    return (
                      <TelemetryChart 
                        data={sensor.data}
                        title={`${sensor.type} History`}
                        unit={sensor.unit}
                        color="#3b82f6"
                      />
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map((sensor, idx) => (
                <SensorCard 
                  key={idx} 
                  sensor={sensor} 
                  onViewHistory={setSelectedSensor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#22c55e" name="Efficiency %" />
                    <Line yAxisId="right" type="monotone" dataKey="load" stroke="#3b82f6" name="Load %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anomaly Detection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalies.map(anomaly => (
                  <div key={anomaly.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={anomaly.resolved ? 'outline' : 'default'}>
                          {anomaly.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        <span className="font-medium">{anomaly.sensorId}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{anomaly.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(anomaly.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maintenance Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Wrench className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated downtime: {predictions.estimatedDowntime} hours
                    </p>
                  </div>
                  <Button size="sm" onClick={handleCreateWorkOrder}>
                    Schedule
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                No maintenance records available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Create Work Order</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Failure Probability:</span>
                <span className="font-bold text-red-600">{(predictions.failureProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining Life:</span>
                <span className="font-bold">{predictions.rulHours.toFixed(1)} hours</span>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  AI recommends immediate maintenance action to prevent failure.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleCreateWorkOrder}>
                Create Work Order
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowPredictionModal(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}