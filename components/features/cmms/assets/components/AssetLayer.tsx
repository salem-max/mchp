"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { LatLngExpression, LeafletMouseEvent } from "leaflet";
import { socket } from "@/services/socket";
import { motion, AnimatePresence } from "framer-motion";

// ==================== TYPES ====================

interface SensorData {
  temperature?: number;
  vibration?: number;
  pressure?: number;
  rpm?: number;
  current?: number;
  timestamp?: string;
}

interface AssetMetrics {
  efficiency: number;
  load: number;
  uptime: number;
  lastMaintenance: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
}

interface WorkOrder {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed';
}

interface Asset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  health: number;
  type: 'pump' | 'compressor' | 'conveyor' | 'hvac' | 'generator';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline' | 'failed';
  sensor?: SensorData;
  metrics?: AssetMetrics;
  alerts?: Alert[];
  activeWorkOrders?: WorkOrder[];
  lastUpdate?: string;
  predictedFailure?: {
    probability: number;
    rulHours: number;
    confidence: number;
  };
}

interface AssetLayerProps {
  onAssetClick?: (asset: Asset) => void;
  onAssetHover?: (asset: Asset | null) => void;
  showLabels?: boolean;
  showHeatmap?: boolean;
  clusterEnabled?: boolean;
  filterStatus?: Asset['status'][];
  minHealth?: number;
  maxHealth?: number;
  refreshInterval?: number;
}

// ==================== UTILITY FUNCTIONS ====================

const getAssetColor = (health: number, status: Asset['status']) => {
  if (status === 'offline') return '#6b7280';
  if (status === 'maintenance') return '#3b82f6';
  if (status === 'failed') return '#ef4444';
  if (health < 30) return '#dc2626';
  if (health < 50) return '#f97316';
  if (health < 70) return '#eab308';
  if (health < 85) return '#84cc16';
  return '#22c55e';
};

const getAssetIcon = (type: Asset['type']) => {
  const icons = {
    pump: '🔧',
    compressor: '⚙️',
    conveyor: '📦',
    hvac: '❄️',
    generator: '⚡'
  };
  return icons[type] || '🏭';
};

const getStatusBadge = (status: Asset['status']) => {
  const badges = {
    operational: { color: '#22c55e', text: 'Operational' },
    degraded: { color: '#eab308', text: 'Degraded' },
    maintenance: { color: '#3b82f6', text: 'Maintenance' },
    offline: { color: '#6b7280', text: 'Offline' },
    failed: { color: '#ef4444', text: 'Failed' }
  };
  return badges[status];
};

// ==================== CUSTOM POPUP COMPONENT ====================

const AssetPopupContent = ({ asset, onClose }: { asset: Asset; onClose: () => void }) => {
  const statusBadge = getStatusBadge(asset.status);
  const criticalAlerts = asset.alerts?.filter(a => a.severity === 'critical') || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-w-[280px] max-w-[320px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getAssetIcon(asset.type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{asset.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Health Status */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Health Score</span>
          <span className="font-semibold" style={{ color: getAssetColor(asset.health, asset.status) }}>
            {asset.health.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${asset.health}%` }}
            className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: getAssetColor(asset.health, asset.status) }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className="inline-block px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${statusBadge.color}20`, color: statusBadge.color }}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Sensor Data */}
      {asset.sensor && (
        <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
          {asset.sensor.temperature !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Temperature</div>
              <div className="font-semibold text-gray-900">{asset.sensor.temperature}°C</div>
            </div>
          )}
          {asset.sensor.vibration !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Vibration</div>
              <div className="font-semibold text-gray-900">{asset.sensor.vibration} mm/s</div>
            </div>
          )}
          {asset.sensor.pressure !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">Pressure</div>
              <div className="font-semibold text-gray-900">{asset.sensor.pressure} bar</div>
            </div>
          )}
          {asset.sensor.rpm !== undefined && (
            <div className="text-center">
              <div className="text-xs text-gray-500">RPM</div>
              <div className="font-semibold text-gray-900">{asset.sensor.rpm}</div>
            </div>
          )}
        </div>
      )}

      {/* Metrics */}
      {asset.metrics && (
        <div className="mb-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Efficiency:</span>
              <span className="ml-1 font-medium">{asset.metrics.efficiency}%</span>
            </div>
            <div>
              <span className="text-gray-500">Load:</span>
              <span className="ml-1 font-medium">{asset.metrics.load}%</span>
            </div>
            <div>
              <span className="text-gray-500">Uptime:</span>
              <span className="ml-1 font-medium">{asset.metrics.uptime} days</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Predictions */}
      {asset.predictedFailure && asset.predictedFailure.probability > 0.5 && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-red-600 text-sm">⚠️ AI Alert</span>
          </div>
          <div className="text-xs text-red-700">
            Failure risk: {(asset.predictedFailure.probability * 100).toFixed(1)}%
            <br />
            RUL: {asset.predictedFailure.rulHours.toFixed(1)} hours
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="mb-3">
          {criticalAlerts.map((alert, idx) => (
            <div key={idx} className="text-xs text-red-600 flex items-center gap-1 mb-1">
              <span>🔴</span>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Work Orders */}
      {asset.activeWorkOrders && asset.activeWorkOrders.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">Active Work Orders</div>
          {asset.activeWorkOrders.map((wo, idx) => (
            <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
              <span>{wo.priority === 'critical' ? '🔴' : '🟡'}</span>
              {wo.status}
            </div>
          ))}
        </div>
      )}

      {/* Last Update */}
      {asset.lastUpdate && (
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
          Last update: {new Date(asset.lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function AssetLayer({ 
  onAssetClick, 
  onAssetHover,
  showLabels = false,
  showHeatmap = false,
  clusterEnabled = false,
  filterStatus,
  minHealth = 0,
  maxHealth = 100,
  refreshInterval = 2000
}: AssetLayerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const map = useMap();

  // Filter assets based on props
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];
    
    if (filterStatus && filterStatus.length > 0) {
      filtered = filtered.filter(asset => filterStatus.includes(asset.status));
    }
    
    filtered = filtered.filter(asset => 
      asset.health >= minHealth && asset.health <= maxHealth
    );
    
    return filtered;
  }, [assets, filterStatus, minHealth, maxHealth]);

  // Group assets by status for heatmap
  const healthDistribution = useMemo(() => {
    const distribution = {
      critical: 0,
      warning: 0,
      normal: 0,
      good: 0
    };
    
    assets.forEach(asset => {
      if (asset.health < 30) distribution.critical++;
      else if (asset.health < 50) distribution.warning++;
      else if (asset.health < 70) distribution.normal++;
      else distribution.good++;
    });
    
    return distribution;
  }, [assets]);

  // Socket connection and event handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      setIsConnected(true);
    }

    socket.on("asset:update", (data: Asset[]) => {
      setAssets(data);
    });

    socket.on("asset:alert", (alert: Alert) => {
      if (alert.severity === 'critical') {
        console.warn(`Critical alert: ${alert.message}`);
      }
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.off("asset:update");
      socket.off("asset:alert");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // Auto-refresh assets
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("request:assets");
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Handle asset click
  const handleAssetClick = useCallback((asset: Asset, event: LeafletMouseEvent) => {
    event.originalEvent.stopPropagation();
    setSelectedAsset(asset);
    onAssetClick?.(asset);
    
    map.setView([asset.lat, asset.lng], map.getZoom());
  }, [map, onAssetClick]);

  // Handle asset hover
  const handleAssetHover = useCallback((asset: Asset | null) => {
    setHoveredAsset(asset);
    onAssetHover?.(asset);
    
    if (asset) {
      map.getContainer().style.cursor = 'pointer';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [map, onAssetHover]);

  // Custom popup close handler
  const handlePopupClose = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  // Render heatmap overlay if enabled
  useEffect(() => {
    if (showHeatmap && assets.length > 0) {
      console.log('Heatmap enabled with', assets.length, 'assets');
    }
  }, [showHeatmap, assets]);

  return (
    <>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          Reconnecting...
        </div>
      )}

      {/* Health Distribution Summary (if enabled) */}
      {showHeatmap && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold mb-2">Asset Health Distribution</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critical: {healthDistribution.critical}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Warning: {healthDistribution.warning}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Normal: {healthDistribution.normal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Good: {healthDistribution.good}</span>
            </div>
          </div>
        </div>
      )}

      {/* Asset Markers */}
      {filteredAssets.map((asset) => {
        const color = getAssetColor(asset.health, asset.status);
        const isSelected = selectedAsset?.id === asset.id;
        const isHovered = hoveredAsset?.id === asset.id;
        
        return (
          <CircleMarker
            key={asset.id}
            center={[asset.lat, asset.lng] as LatLngExpression}
            radius={isSelected ? 12 : isHovered ? 10 : 8}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: isSelected ? 3 : 1,
              className: `transition-all duration-200 ${isHovered ? 'animate-pulse' : ''}`
            }}
            eventHandlers={{
              click: (e) => handleAssetClick(asset, e),
              mouseover: () => handleAssetHover(asset),
              mouseout: () => handleAssetHover(null),
            }}
          >
            <Tooltip 
              permanent={showLabels}
              direction="top"
              offset={[0, -10]}
              opacity={0.8}
              className="custom-tooltip"
            >
              <span className="text-xs font-medium">
                {asset.name} - {asset.health.toFixed(0)}%
              </span>
            </Tooltip>
            
            {isSelected && (
              <Popup
                autoPan={true}
                autoPanPadding={[50, 50]}
                closeButton={false}
                eventHandlers={{ remove: handlePopupClose }}
              >
                <AssetPopupContent asset={asset} onClose={handlePopupClose} />
              </Popup>
            )}
          </CircleMarker>
        );
      })}

      {/* Hover Effect Animation Layer */}
      <AnimatePresence>
        {hoveredAsset && !selectedAsset && (
          <CircleMarker
            center={[hoveredAsset.lat, hoveredAsset.lng] as LatLngExpression}
            radius={14}
            pathOptions={{
              color: getAssetColor(hoveredAsset.health, hoveredAsset.status),
              fillColor: 'transparent',
              weight: 2,
              opacity: 0.6
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}