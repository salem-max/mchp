"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Marker, Popup, Tooltip, Circle, useMap } from "react-leaflet";
import { LatLngExpression, LatLng, Icon, DivIcon, point } from "leaflet";
import { socket } from "@/services/socket";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { createRoot } from 'react-dom/client';
import { cn } from "@/lib/utils";

// ==================== TYPES ====================

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline' | 'on_break' | 'traveling';
  rating: number;
  skills: string[];
  currentWorkOrder?: {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assetId: string;
    assetName: string;
  };
  zone?: string;
  lastActive: string;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  certifications: string[];
  completedOrders: number;
  responseTime: number; // average response time in minutes
  efficiency: number; // percentage
}

interface TechnicianActivity {
  id: string;
  technicianId: string;
  action: 'started' | 'completed' | 'assigned' | 'delayed';
  workOrderId?: string;
  timestamp: string;
  notes?: string;
}

interface TechnicianStats {
  totalTechnicians: number;
  availableCount: number;
  busyCount: number;
  avgResponseTime: number;
  avgRating: number;
  totalCompletedToday: number;
}

interface TechnicianLayerProps {
  onTechnicianSelect?: (technician: Technician) => void;
  onTechnicianHover?: (technician: Technician | null) => void;
  showLiveTracking?: boolean;
  showZones?: boolean;
  showEfficiencyMetrics?: boolean;
  enableClustering?: boolean;
  filterStatus?: Technician['status'][];
  minRating?: number;
  refreshInterval?: number;
  showPaths?: boolean;
  showHeatmap?: boolean;
}

// ==================== CUSTOM ICONS ====================

const getTechnicianIcon = (status: Technician['status'], isSelected: boolean = false): DivIcon => {
  const colors = {
    available: { bg: '#22c55e', border: '#16a34a', pulse: true },
    busy: { bg: '#ef4444', border: '#dc2626', pulse: true },
    offline: { bg: '#6b7280', border: '#4b5563', pulse: false },
    on_break: { bg: '#f59e0b', border: '#d97706', pulse: false },
    traveling: { bg: '#3b82f6', border: '#2563eb', pulse: true }
  };
  
  const color = colors[status];
  const size = isSelected ? 36 : 32;
  
  return new DivIcon({
    html: `
      <div class="relative">
        <div class="w-${size/4} h-${size/4} bg-${color.bg} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        ${color.pulse ? `
          <div class="absolute inset-0 rounded-full animate-ping bg-${color.bg} opacity-75"></div>
        ` : ''}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: point(size, size),
    popupAnchor: point(0, -size/2)
  });
};

const getVehicleIcon = (heading: number = 0): DivIcon => {
  return new DivIcon({
    html: `
      <div class="relative" style="transform: rotate(${heading}deg)">
        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
      </div>
    `,
    className: 'custom-vehicle-icon',
    iconSize: point(24, 24),
    popupAnchor: point(0, -12)
  });
};

// ==================== TECHNICIAN PATH COMPONENT ====================

function TechnicianPath({ positions, color }: { positions: LatLng[]; color: string }) {
  const map = useMap();
  const pathRef = useRef<L.Polyline | null>(null);
  
  useEffect(() => {
    if (positions.length > 1 && map) {
      if (pathRef.current) {
        pathRef.current.setLatLngs(positions);
      } else {
        pathRef.current = L.polyline(positions, {
          color: color,
          weight: 3,
          opacity: 0.6,
          dashArray: '5, 10',
          lineCap: 'round'
        }).addTo(map);
      }
    }
    
    return () => {
      if (pathRef.current) {
        pathRef.current.remove();
      }
    };
  }, [positions, map, color]);
  
  return null;
}

// ==================== EFFICIENCY METER ====================

function EfficiencyMeter({ efficiency }: { efficiency: number }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Efficiency</span>
        <span className={cn(
          efficiency >= 90 ? 'text-green-600' :
          efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {efficiency}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            efficiency >= 90 ? "bg-green-500" :
            efficiency >= 70 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${efficiency}%` }}
        />
      </div>
    </div>
  );
}

// ==================== TECHNICIAN POPUP CONTENT ====================

function TechnicianPopupContent({ technician, onClose }: { technician: Technician; onClose: () => void }) {
  const statusColors = {
    available: 'text-green-600 bg-green-50',
    busy: 'text-red-600 bg-red-50',
    offline: 'text-gray-600 bg-gray-50',
    on_break: 'text-yellow-600 bg-yellow-50',
    traveling: 'text-blue-600 bg-blue-50'
  };
  
  const statusLabels = {
    available: 'Available',
    busy: 'On Job',
    offline: 'Offline',
    on_break: 'On Break',
    traveling: 'Traveling'
  };
  
  return (
    <div className="min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pb-2 border-b">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
            {technician.name.charAt(0)}
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
            technician.status === 'available' ? "bg-green-500" :
            technician.status === 'busy' ? "bg-red-500" :
            technician.status === 'traveling' ? "bg-blue-500" :
            technician.status === 'on_break' ? "bg-yellow-500" : "bg-gray-500"
          )} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{technician.name}</h3>
          <p className="text-xs text-gray-500">{technician.email}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Status Badge */}
      <div className="mb-3">
        <span className={cn("inline-block px-2 py-1 rounded-full text-xs font-medium", statusColors[technician.status])}>
          {statusLabels[technician.status]}
        </span>
      </div>
      
      {/* Skills */}
      {technician.skills && technician.skills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {technician.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {technician.skills.length > 3 && (
              <span className="text-xs text-gray-400">+{technician.skills.length - 3}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Current Work Order */}
      {technician.currentWorkOrder && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 mb-1">Current Assignment</p>
          <p className="text-sm font-medium">{technician.currentWorkOrder.title}</p>
          <p className="text-xs text-gray-600">{technician.currentWorkOrder.assetName}</p>
          <div className="mt-1">
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              technician.currentWorkOrder.priority === 'critical' ? "bg-red-100 text-red-700" :
              technician.currentWorkOrder.priority === 'high' ? "bg-orange-100 text-orange-700" :
              technician.currentWorkOrder.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            )}>
              {technician.currentWorkOrder.priority.toUpperCase()}
            </span>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Rating</p>
          <p className="text-lg font-bold text-yellow-600">{technician.rating.toFixed(1)}/5</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-bold text-green-600">{technician.completedOrders}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Response Time</p>
          <p className="text-lg font-bold text-blue-600">{technician.responseTime} min</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Battery</p>
          <p className="text-lg font-bold">{technician.batteryLevel || 85}%</p>
        </div>
      </div>
      
      {/* Efficiency Meter */}
      <EfficiencyMeter efficiency={technician.efficiency} />
      
      {/* Last Active */}
      <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
        Last active: {new Date(technician.lastActive).toLocaleTimeString()}
      </div>
    </div>
  );
}

// ==================== MAIN TECHNICIAN LAYER COMPONENT ====================

export default function TechnicianLayer({ 
  onTechnicianSelect, 
  onTechnicianHover,
  showLiveTracking = true,
  showZones = false,
  showEfficiencyMetrics = false,
  enableClustering = false,
  filterStatus,
  minRating = 0,
  refreshInterval = 3000,
  showPaths = true,
  showHeatmap = false
}: TechnicianLayerProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [hoveredTechnician, setHoveredTechnician] = useState<Technician | null>(null);
  const [technicianPaths, setTechnicianPaths] = useState<Map<string, LatLng[]>>(new Map());
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [historyPositions, setHistoryPositions] = useState<Map<string, LatLng[]>>(new Map());
  const map = useMap();
  
  // Filter technicians based on props
  const filteredTechnicians = useMemo(() => {
    let filtered = [...technicians];
    
    if (filterStatus && filterStatus.length > 0) {
      filtered = filtered.filter(tech => filterStatus.includes(tech.status));
    }
    
    if (minRating > 0) {
      filtered = filtered.filter(tech => tech.rating >= minRating);
    }
    
    return filtered;
  }, [technicians, filterStatus, minRating]);
  
  // Calculate statistics
  useEffect(() => {
    const total = technicians.length;
    const available = technicians.filter(t => t.status === 'available').length;
    const busy = technicians.filter(t => t.status === 'busy').length;
    const avgResponse = technicians.reduce((sum, t) => sum + t.responseTime, 0) / total || 0;
    const avgRating = technicians.reduce((sum, t) => sum + t.rating, 0) / total || 0;
    const totalCompleted = technicians.reduce((sum, t) => sum + t.completedOrders, 0);
    
    setStats({
      totalTechnicians: total,
      availableCount: available,
      busyCount: busy,
      avgResponseTime: avgResponse,
      avgRating: avgRating,
      totalCompletedToday: totalCompleted
    });
  }, [technicians]);
  
  // Socket connection and event handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      setIsConnected(true);
    }
    
    // Initial data load
    socket.emit("technician:request");
    
    // Real-time position updates
    socket.on("technician:move", (data: Technician[]) => {
      setTechnicians(prev => {
        const newTechs = [...data];
        
        // Track movement history for paths
        if (showPaths) {
          const newPaths = new Map(technicianPaths);
          data.forEach(tech => {
            const prevTech = prev.find(t => t.id === tech.id);
            if (prevTech && (prevTech.lat !== tech.lat || prevTech.lng !== tech.lng)) {
              const path = newPaths.get(tech.id) || [];
              path.push(new LatLng(prevTech.lat, prevTech.lng));
              if (path.length > 50) path.shift(); // Keep last 50 positions
              newPaths.set(tech.id, path);
            }
          });
          setTechnicianPaths(newPaths);
        }
        
        return newTechs;
      });
    });
    
    // Technician status updates
    socket.on("technician:status", (data: { id: string; status: Technician['status'] }) => {
      setTechnicians(prev => 
        prev.map(tech => 
          tech.id === data.id ? { ...tech, status: data.status, lastActive: new Date().toISOString() } : tech
        )
      );
    });
    
    // New work order assignment
    socket.on("technician:assigned", (data: { technicianId: string; workOrder: any }) => {
      setTechnicians(prev => 
        prev.map(tech => 
          tech.id === data.technicianId 
            ? { ...tech, status: 'traveling' as const, currentWorkOrder: data.workOrder }
            : tech
        )
      );
    });
    
    // Technician activity feed
    socket.on("technician:activity", (activity: TechnicianActivity) => {
      console.log(`Technician activity: ${activity.action}`, activity);
      // Could trigger notifications or update UI
    });
    
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    return () => {
      socket.off("technician:move");
      socket.off("technician:status");
      socket.off("technician:assigned");
      socket.off("technician:activity");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [showPaths]);
  
  // Auto-refresh technician data
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("technician:request");
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  // Handle technician click
  const handleTechnicianClick = useCallback((technician: Technician) => {
    setSelectedTechnician(technician);
    onTechnicianSelect?.(technician);
    
    // Center map on technician
    map.setView([technician.lat, technician.lng], map.getZoom());
  }, [map, onTechnicianSelect]);
  
  // Handle technician hover
  const handleTechnicianHover = useCallback((technician: Technician | null) => {
    setHoveredTechnician(technician);
    onTechnicianHover?.(technician);
    
    // Change cursor style
    if (technician) {
      map.getContainer().style.cursor = 'pointer';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [map, onTechnicianHover]);
  
  // Render zone indicators if enabled
  const zones = useMemo(() => {
    if (!showZones) return [];
    
    // Define operational zones
    return [
      { name: 'North Zone', center: [1.555, 110.362], radius: 500, color: '#3b82f6' },
      { name: 'South Zone', center: [1.550, 110.358], radius: 500, color: '#10b981' },
      { name: 'East Zone', center: [1.553, 110.365], radius: 500, color: '#f59e0b' },
      { name: 'West Zone', center: [1.551, 110.355], radius: 500, color: '#ef4444' },
    ];
  }, [showZones]);
  
  return (
    <>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          Reconnecting...
        </div>
      )}
      
      {/* Stats Summary Overlay */}
      {showEfficiencyMetrics && stats && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold mb-2">Team Performance</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span>Available:</span>
              <span className="font-bold text-green-600">{stats.availableCount}/{stats.totalTechnicians}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Avg Response:</span>
              <span className="font-bold text-blue-600">{stats.avgResponseTime.toFixed(0)} min</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Avg Rating:</span>
              <span className="font-bold text-yellow-600">{stats.avgRating.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Completed Today:</span>
              <span className="font-bold text-green-600">{stats.totalCompletedToday}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Zones */}
      {zones.map((zone, idx) => (
        <Circle
          key={idx}
          center={zone.center as LatLngExpression}
          radius={zone.radius}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5'
          }}
        >
          <Popup>
            <b>{zone.name}</b>
            <br />
            Coverage Area
          </Popup>
        </Circle>
      ))}
      
      {/* Technician Paths */}
      {showPaths && Array.from(technicianPaths.entries()).map(([techId, positions]) => {
        const technician = technicians.find(t => t.id === techId);
        if (!technician || positions.length < 2) return null;
        
        const color = technician.status === 'available' ? '#22c55e' :
                     technician.status === 'busy' ? '#ef4444' :
                     technician.status === 'traveling' ? '#3b82f6' : '#6b7280';
        
        return (
          <TechnicianPath key={`path-${techId}`} positions={positions} color={color} />
        );
      })}
      
      {/* Technician Markers */}
      {filteredTechnicians.map((technician) => {
        const isSelected = selectedTechnician?.id === technician.id;
        const isHovered = hoveredTechnician?.id === technician.id;
        const icon = showLiveTracking && technician.speed && technician.speed > 0
          ? getVehicleIcon(technician.heading)
          : getTechnicianIcon(technician.status, isSelected);
        
        return (
          <Marker
            key={technician.id}
            position={[technician.lat, technician.lng] as LatLngExpression}
            icon={icon}
            eventHandlers={{
              click: () => handleTechnicianClick(technician),
              mouseover: () => handleTechnicianHover(technician),
              mouseout: () => handleTechnicianHover(null),
            }}
          >
            {/* Tooltip for quick info */}
            <Tooltip 
              direction="top" 
              offset={[0, -20]} 
              opacity={0.9}
              className="custom-tooltip"
            >
              <div className="text-xs">
                <div className="font-semibold">{technician.name}</div>
                <div className="text-gray-600">{technician.status}</div>
                {technician.currentWorkOrder && (
                  <div className="text-blue-600">Working on: {technician.currentWorkOrder.assetName}</div>
                )}
              </div>
            </Tooltip>
            
            {/* Popup with detailed info */}
            {isSelected && (
              <Popup
                autoPan={true}
                autoPanPadding={[50, 50]}
                closeButton={false}
                eventHandlers={{ remove: () => setSelectedTechnician(null) }}
              >
                <TechnicianPopupContent 
                  technician={technician} 
                  onClose={() => setSelectedTechnician(null)} 
                />
              </Popup>
            )}
          </Marker>
        );
      })}
      
      {/* Hover Effect Animation Layer */}
      <AnimatePresence>
        {hoveredTechnician && !selectedTechnician && (
          <Circle
            center={[hoveredTechnician.lat, hoveredTechnician.lng] as LatLngExpression}
            radius={30}
            pathOptions={{
              color: hoveredTechnician.status === 'available' ? '#22c55e' :
                     hoveredTechnician.status === 'busy' ? '#ef4444' : '#3b82f6',
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