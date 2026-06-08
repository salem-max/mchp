'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingUp, Wrench, Package } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export default function EnhancedDashboard() {
  // tRPC queries for alerts and predictions
  const { data: alerts, isLoading: alertsLoading } = trpc.analytics.alerts.useQuery()
  const { data: predictions = [], isLoading: predictionsLoading } = trpc.analytics.predictions.useQuery()

  const loading = alertsLoading || predictionsLoading

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'deteriorating': return 'text-red-600'
      case 'improving': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return <div className="p-6">Loading enhanced dashboard...</div>
  }

  const totalAlerts = alerts ?
    (alerts.criticalAlerts?.length ?? 0) + (alerts.highAlerts?.length ?? 0) + (alerts.overdueMaintenance?.length ?? 0) + (alerts.lowStockAlerts?.length ?? 0) : 0

  const highRiskPredictions = predictions.filter((p: { prediction: string }) => 
    p.prediction.includes('High risk') || p.prediction.includes('Critical')
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enhanced CMMS Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts ({totalAlerts})
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Predictions ({predictions.length})
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts?.criticalAlerts?.length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {alerts?.highAlerts?.length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {alerts?.overdueMaintenance?.length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {alerts?.lowStockAlerts?.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts?.criticalAlerts?.slice(0, 3).map((alert: { id: string; title: string; assetName: string }) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div>
                    <div className="font-medium text-red-800">{alert.title}</div>
                    <div className="text-sm text-red-600">{alert.assetName}</div>
                  </div>
                  <Badge className="bg-red-500">Critical</Badge>
                </div>
              ))}
              {alerts?.highAlerts?.slice(0, 2).map((alert: { id: string; title: string; assetName: string }) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div>
                    <div className="font-medium text-orange-800">{alert.title}</div>
                    <div className="text-sm text-orange-600">{alert.assetName}</div>
                  </div>
                  <Badge className="bg-orange-500">High</Badge>
                </div>
              ))}
              {alerts?.overdueMaintenance?.slice(0, 2).map((pm: { id: string; description: string; asset: { name: string } }) => (
                <div key={pm.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div>
                    <div className="font-medium text-yellow-800">Overdue: {pm.description}</div>
                    <div className="text-sm text-yellow-600">{pm.asset.name}</div>
                  </div>
                  <Badge className="bg-yellow-500">Overdue</Badge>
                </div>
              ))}
              {alerts?.lowStockAlerts?.slice(0, 2).map((item: { id: string; partName: string; quantity: number }) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div>
                    <div className="font-medium text-blue-800">Low Stock: {item.partName}</div>
                    <div className="text-sm text-blue-600">Quantity: {item.quantity}</div>
                  </div>
                  <Badge className="bg-blue-500">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predictive Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Predictive Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskPredictions.slice(0, 5).map((prediction: { assetId: string; assetName: string; prediction: string; confidence: number; currentTrend: string; nextMaintenance: string | null; predictedValue: number }) => (
                <div key={prediction.assetId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{prediction.assetName}</div>
                    <div className="text-sm text-gray-600">{prediction.prediction}</div>
                    <div className="text-xs text-gray-500">
                      Confidence: {Math.round(prediction.confidence * 100)}% &bull;
                      <span className={`ml-1 ${getTrendColor(prediction.currentTrend)}`}>
                        {prediction.currentTrend}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {prediction.nextMaintenance ?
                        new Date(prediction.nextMaintenance).toLocaleDateString() :
                        'N/A'
                      }
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prediction.predictedValue}
                    </Badge>
                  </div>
                </div>
              ))}
              {highRiskPredictions.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No high-risk predictions at this time
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Wrench className="w-4 h-4 mr-2" />
              Create Work Order
            </Button>
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Order Parts
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
