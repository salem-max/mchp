'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Asset {
    id: string
    name: string
    type: string
    location: string
    status: string
    model?: string
    serialNumber?: string
    createdAt: string
    digitalTwin?: {
        id: string
        currentState: any
        lastUpdated: string
    }
    workOrders: any[]
    preventiveMaintenances: any[]
}

export default function AssetDetailsPage() {
    const params = useParams()
    const assetId = params.id as string

    const [asset, setAsset] = useState<Asset | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (assetId) {
            fetchAsset()
        }
    }, [assetId])

    const fetchAsset = async () => {
        try {
            const res = await fetch(`/api/assets/${assetId}`)
            if (res.ok) {
                const data = await res.json()
                setAsset(data)
            }
        } catch (error) {
            console.error('Error fetching asset:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    if (!asset) {
        return <div className="p-6">Asset not found</div>
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500'
            case 'MAINTENANCE': return 'bg-yellow-500'
            case 'INACTIVE': return 'bg-gray-500'
            default: return 'bg-blue-500'
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{asset.name}</h1>
                    <p className="text-gray-600">{asset.type} • {asset.location}</p>
                </div>
                <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-medium">{asset.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Model</p>
                                <p className="font-medium">{asset.model || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Serial Number</p>
                                <p className="font-medium">{asset.serialNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-medium">{asset.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium">{asset.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-medium">{new Date(asset.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {asset.digitalTwin && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Digital Twin Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Current State</p>
                                <div className="space-y-1">
                                    {Object.entries(asset.digitalTwin.currentState || {}).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{key}:</span>
                                            <span className="font-medium">
                                                {typeof value === 'object' ? value.value : value}
                                                {typeof value === 'object' && value.status && (
                                                    <Badge className="ml-2 text-xs" variant="outline">{value.status}</Badge>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Last updated: {new Date(asset.digitalTwin.lastUpdated).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Work Orders ({asset.workOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {asset.workOrders.slice(0, 5).map((wo) => (
                            <div key={wo.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                <div>
                                    <div className="font-medium">{wo.title}</div>
                                    <div className="text-gray-600">Created: {new Date(wo.createdAt).toLocaleDateString()}</div>
                                </div>
                                <Badge variant="outline">{wo.status}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preventive Maintenance ({asset.preventiveMaintenances.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {asset.preventiveMaintenances.map((pm) => (
                            <div key={pm.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                <div>
                                    <div className="font-medium">{pm.description}</div>
                                    <div className="text-gray-600">Next due: {new Date(pm.nextDue).toLocaleDateString()}</div>
                                </div>
                                <Badge variant={pm.isActive ? 'default' : 'secondary'}>
                                    {pm.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}