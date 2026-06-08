"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Circle, Marker, Popup, Tooltip, Polyline, useMap } from "react-leaflet";
import { LatLngExpression, LatLng, Icon, DivIcon, point } from "leaflet";
import { socket } from "@/services/socket";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";

// ==================== TYPES ====================

interface WorkOrderItem {
  id: string;
  description: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
}

interface WorkOrderAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'drawing';
  uploadedAt: string;
}

interface WorkOrderComment {
  id: string;
  author: string;
  authorRole: 'technician' | 'manager' | 'client';
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  type: 'preventive' | 'predictive' | 'corrective' | 'emergency' | 'inspection';
  assetId: string;
  assetName: string;
  assetType: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  scheduledDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedDuration: number; // hours
  actualDuration?: number; // hours
  estimatedCost: number;
  actualCost?: number;
  items: WorkOrderItem[];
  attachments: WorkOrderAttachment[];
  comments: WorkOrderComment[];
  checklists: {
    id: string;
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
  }[];
  safetyProtocols: string[];
  requiredSkills: string[];
  requiredParts: {
    partId: string;
    partName: string;
    quantity: number;
    status: 'pending' | 'picked' | 'installed';
  }[];
  aiRecommendation?: {
    confidence: number;
    suggestedActions: string[];
    estimatedFailureProbability: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface WorkOrderStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgCompletionTime: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}

interface WorkOrderLayerProps {
  onWorkOrderSelect?: (workOrder: WorkOrder) => void;
  onWorkOrderHover?: (workOrder: WorkOrder | null) => void;
  showLabels?: boolean;
  showHeatmap?: boolean;
  showZones?: boolean;
  filterPriority?: WorkOrder['priority'][];
  filterStatus?: WorkOrder['status'][];
  filterType?: WorkOrder['type'][];
  minPriority?: WorkOrder['priority'];
  showCompleted?: boolean;
  showOverdueOnly?: boolean;
  showActiveOnly?: boolean;
  refreshInterval?: number;
  enableClustering?: boolean;
  showAssignmentLines?: boolean;
  showRadius?: boolean;
  radiusSize?: number;
}

// ==================== CUSTOM ICONS ====================

const getWorkOrderIcon = (priority: WorkOrder['priority'], status: WorkOrder['status'], isSelected: boolean = false): DivIcon => {
  const priorityColors = {
    critical: { bg: '#ef4444', border: '#dc2626', icon: '🔴' },
    high: { bg: '#f97316', border: '#ea580c', icon: '🟠' },
    medium: { bg: '#eab308', border: '#ca8a04', icon: '🟡' },
    low: { bg: '#22c55e', border: '#16a34a', icon: '🟢' }
  };
  
  const statusIcons = {
    open: '📋',
    assigned: '👤',
    in_progress: '🔧',
    review: '✅',
    completed: '✔️',
    cancelled: '❌'
  };
  
  const color = priorityColors[priority];
  const size = isSelected ? 40 : 32;
  
  return new DivIcon({
    html: `
      <div class="relative">
        <div class="w-${size/4} h-${size/4} bg-${color.bg} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg">
          ${statusIcons[status] || priorityColors[priority].icon}
        </div>
        ${status === 'open' ? `
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        ` : ''}
      </div>
    `,
    className: 'custom-workorder-icon',
    iconSize: point(size, size),
    popupAnchor: point(0, -size/2)
  });
};

// ==================== PROGRESS BAR COMPONENT ====================

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ==================== WORK ORDER POPUP CONTENT ====================

function WorkOrderPopupContent({ workOrder, onClose, onAssign, onStart, onComplete }: { 
  workOrder: WorkOrder; 
  onClose: () => void;
  onAssign?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}) {
  const priorityColors = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50'
  };
  
  const statusColors = {
    open: 'text-gray-600 bg-gray-50',
    assigned: 'text-blue-600 bg-blue-50',
    in_progress: 'text-purple-600 bg-purple-50',
    review: 'text-yellow-600 bg-yellow-50',
    completed: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50'
  };
  
  const isOverdue = isAfter(new Date(), new Date(workOrder.dueDate)) && workOrder.status !== 'completed';
  const daysUntilDue = Math.ceil((new Date(workOrder.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  const completedItems = workOrder.items.filter(i => i.status === 'completed').length;
  const completedChecklists = workOrder.checklists.filter(c => c.completed).length;
  
  return (
    <div className="min-w-[320px] max-w-[400px] max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{workOrder.title}</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", priorityColors[workOrder.priority])}>
              {workOrder.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{workOrder.workOrderNumber}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      
      {/* Status and Type */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[workOrder.status])}>
          {workOrder.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 capitalize">{workOrder.type}</span>
        {isOverdue && (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            OVERDUE
          </span>
        )}
      </div>
      
      {/* Asset Info */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Asset</p>
        <p className="text-sm font-medium">{workOrder.assetName}</p>
        <p className="text-xs text-gray-400 capitalize">{workOrder.assetType}</p>
      </div>
      
      {/* Description */}
      {workOrder.description && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Description</p>
          <p className="text-sm text-gray-600">{workOrder.description}</p>
        </div>
      )}
      
      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-gray-500">Scheduled</p>
          <p className="text-sm font-medium">{format(new Date(workOrder.scheduledDate), 'MMM dd, yyyy')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Due Date</p>
          <p className={cn("text-sm font-medium", isOverdue ? "text-red-600" : "")}>
            {format(new Date(workOrder.dueDate), 'MMM dd, yyyy')}
            {!isOverdue && daysUntilDue <= 3 && (
              <span className="text-xs text-orange-600 ml-1">({daysUntilDue} days left)</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Overall Progress</span>
          <span>{Math.round((completedItems / workOrder.items.length) * 100)}%</span>
        </div>
        <ProgressBar 
          value={completedItems} 
          max={workOrder.items.length} 
          color={workOrder.priority === 'critical' ? '#ef4444' : '#3b82f6'} 
        />
      </div>
      
      {/* Checklist Progress */}
      {workOrder.checklists.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Checklist</span>
            <span>{completedChecklists}/{workOrder.checklists.length}</span>
          </div>
          <ProgressBar 
            value={completedChecklists} 
            max={workOrder.checklists.length} 
            color="#10b981" 
          />
        </div>
      )}
      
      {/* Assigned To */}
      {workOrder.assignedTo && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-500">Assigned To</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {workOrder.assignedTo.name.charAt(0)}
            </div>
            <span className="text-sm font-medium">{workOrder.assignedTo.name}</span>
          </div>
        </div>
      )}
      
      {/* Required Parts */}
      {workOrder.requiredParts.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Required Parts</p>
          <div className="space-y-1">
            {workOrder.requiredParts.slice(0, 3).map((part) => (
              <div key={part.partId} className="flex justify-between text-xs">
                <span>{part.partName}</span>
                <span className={cn(
                  part.status === 'installed' ? "text-green-600" :
                  part.status === 'picked' ? "text-blue-600" : "text-gray-500"
                )}>
                  {part.quantity}x - {part.status}
                </span>
              </div>
            ))}
            {workOrder.requiredParts.length > 3 && (
              <p className="text-xs text-gray-400">+{workOrder.requiredParts.length - 3} more</p>
            )}
          </div>
        </div>
      )}
      
      {/* AI Recommendation */}
      {workOrder.aiRecommendation && workOrder.aiRecommendation.confidence > 0.7 && (
        <div className="mb-3 p-2 bg-purple-50 rounded-lg">
          <p className="text-xs font-semibold text-purple-800 mb-1">🤖 AI Recommendation</p>
          <p className="text-xs text-purple-700">
            {workOrder.aiRecommendation.suggestedActions.slice(0, 2).join(', ')}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Confidence: {(workOrder.aiRecommendation.confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}
      
      {/* Cost Info */}
      <div className="flex justify-between text-xs pt-2 border-t">
        <span className="text-gray-500">Est. Cost</span>
        <span className="font-medium">${workOrder.estimatedCost.toLocaleString()}</span>
        {workOrder.actualCost && (
          <>
            <span className="text-gray-500">Actual</span>
            <span className="font-medium">${workOrder.actualCost.toLocaleString()}</span>
          </>
        )}
      </div>
      
      {/* Action Buttons */}
      {workOrder.status === 'open' && (
        <button 
          onClick={onAssign}
          className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Assign to Me
        </button>
      )}
      
      {workOrder.status === 'assigned' && (
        <button 
          onClick={onStart}
          className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Start Work
        </button>
      )}
      
      {workOrder.status === 'in_progress' && (
        <button 
          onClick={onComplete}
          className="w-full mt-3 bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          Mark Complete
        </button>
      )}
    </div>
  );
}

// ==================== WORK ORDER RADIUS ZONE ====================

function WorkOrderRadius({ center, radius, color, opacity = 0.1 }: { 
  center: LatLngExpression; 
  radius: number; 
  color: string;
  opacity?: number;
}) {
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 1,
        dashArray: '5, 5'
      }}
    />
  );
}

// ==================== ASSIGNMENT LINE ====================

function AssignmentLine({ from, to, color }: { from: LatLngExpression; to: LatLngExpression; color: string }) {
  const positions = [from, to];
  
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: color,
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10'
      }}
    />
  );
}

// ==================== MAIN WORK ORDER LAYER COMPONENT ====================

export default function WorkOrderLayer({ 
  onWorkOrderSelect,
  onWorkOrderHover,
  showLabels = false,
  showHeatmap = false,
  showZones = false,
  filterPriority,
  filterStatus,
  filterType,
  minPriority,
  showCompleted = false,
  showOverdueOnly = false,
  refreshInterval = 5000,
  enableClustering = false,
  showAssignmentLines = false,
  showRadius = false,
  radiusSize = 200
}: WorkOrderLayerProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [hoveredWorkOrder, setHoveredWorkOrder] = useState<WorkOrder | null>(null);
  const [stats, setStats] = useState<WorkOrderStats | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'heatmap' | 'radius'>('list');
  const map = useMap();
  
  // Filter work orders based on props
  const filteredWorkOrders = useMemo(() => {
    let filtered = [...workOrders];
    
    if (filterPriority && filterPriority.length > 0) {
      filtered = filtered.filter(wo => filterPriority.includes(wo.priority));
    }
    
    if (filterStatus && filterStatus.length > 0) {
      filtered = filtered.filter(wo => filterStatus.includes(wo.status));
    }
    
    if (filterType && filterType.length > 0) {
      filtered = filtered.filter(wo => filterType.includes(wo.type));
    }
    
    if (minPriority) {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const minValue = priorityOrder[minPriority];
      filtered = filtered.filter(wo => priorityOrder[wo.priority] >= minValue);
    }
    
    if (!showCompleted) {
      filtered = filtered.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled');
    }
    
    if (showOverdueOnly) {
      filtered = filtered.filter(wo => isAfter(new Date(), new Date(wo.dueDate)) && wo.status !== 'completed');
    }
    
    return filtered;
  }, [workOrders, filterPriority, filterStatus, filterType, minPriority, showCompleted, showOverdueOnly]);
  
  // Calculate statistics
  useEffect(() => {
    const total = workOrders.length;
    const open = workOrders.filter(wo => wo.status === 'open').length;
    const inProgress = workOrders.filter(wo => wo.status === 'in_progress').length;
    const completed = workOrders.filter(wo => wo.status === 'completed').length;
    const overdue = workOrders.filter(wo => isAfter(new Date(), new Date(wo.dueDate)) && wo.status !== 'completed').length;
    const critical = workOrders.filter(wo => wo.priority === 'critical').length;
    const high = workOrders.filter(wo => wo.priority === 'high').length;
    const medium = workOrders.filter(wo => wo.priority === 'medium').length;
    const low = workOrders.filter(wo => wo.priority === 'low').length;
    
    const completedOrders = workOrders.filter(wo => wo.status === 'completed' && wo.actualDuration);
    const avgCompletionTime = completedOrders.reduce((sum, wo) => sum + (wo.actualDuration || 0), 0) / completedOrders.length || 0;
    
    const totalEstimatedCost = workOrders.reduce((sum, wo) => sum + wo.estimatedCost, 0);
    const totalActualCost = workOrders.reduce((sum, wo) => sum + (wo.actualCost || 0), 0);
    
    setStats({
      total, open, inProgress, completed, overdue,
      critical, high, medium, low,
      avgCompletionTime,
      totalEstimatedCost,
      totalActualCost
    });
  }, [workOrders]);
  
  // Socket connection and event handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      setIsConnected(true);
    }
    
    // Initial data load
    socket.emit("workorder:request");
    
    // Work order updates
    socket.on("workorder:update", (data: WorkOrder[]) => {
      setWorkOrders(data);
    });
    
    // New work order created
    socket.on("workorder:created", (workOrder: WorkOrder) => {
      setWorkOrders(prev => [...prev, workOrder]);
      // Show notification
      console.log(`New work order created: ${workOrder.workOrderNumber}`);
    });
    
    // Work order status changed
    socket.on("workorder:status", (data: { id: string; status: WorkOrder['status'] }) => {
      setWorkOrders(prev => 
        prev.map(wo => wo.id === data.id ? { ...wo, status: data.status, updatedAt: new Date().toISOString() } : wo)
      );
    });
    
    // Technician locations for assignment lines
    socket.on("technician:move", (techs: any[]) => {
      const techMap = new Map();
      techs.forEach(tech => {
        techMap.set(tech.id, { lat: tech.lat, lng: tech.lng });
      });
      setTechnicians(techMap);
    });
    
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    return () => {
      socket.off("workorder:update");
      socket.off("workorder:created");
      socket.off("workorder:status");
      socket.off("technician:move");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
  
  // Auto-refresh work orders
  useEffect(() => {
    const interval = setInterval(() => {
      socket.emit("workorder:request");
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  // Handle work order click
  const handleWorkOrderClick = useCallback((workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    onWorkOrderSelect?.(workOrder);
    
    // Center map on work order
    map.setView([workOrder.lat, workOrder.lng], map.getZoom());
  }, [map, onWorkOrderSelect]);
  
  // Handle work order hover
  const handleWorkOrderHover = useCallback((workOrder: WorkOrder | null) => {
    setHoveredWorkOrder(workOrder);
    onWorkOrderHover?.(workOrder);
    
    if (workOrder) {
      map.getContainer().style.cursor = 'pointer';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [map, onWorkOrderHover]);
  
  // Handle work order actions
  const handleAssign = useCallback((workOrderId: string) => {
    socket.emit("workorder:assign", { workOrderId, technicianId: 'current-user' });
  }, []);
  
  const handleStart = useCallback((workOrderId: string) => {
    socket.emit("workorder:start", { workOrderId });
  }, []);
  
  const handleComplete = useCallback((workOrderId: string) => {
    socket.emit("workorder:complete", { workOrderId });
  }, []);
  
  // Get color based on priority
  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  };
  
  // Get zone data for heatmap
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return [];
    
    return filteredWorkOrders.map(wo => ({
      lat: wo.lat,
      lng: wo.lng,
      intensity: wo.priority === 'critical' ? 1 : 
                  wo.priority === 'high' ? 0.7 : 
                  wo.priority === 'medium' ? 0.4 : 0.1
    }));
  }, [filteredWorkOrders, showHeatmap]);
  
  return (
    <>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          Reconnecting...
        </div>
      )}
      
      {/* Stats Summary Overlay */}
      {stats && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs min-w-[200px]">
          <div className="font-semibold mb-2 flex items-center justify-between">
            <span>Work Orders Summary</span>
            <span className="text-blue-600">{stats.total} total</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Open / In Progress:</span>
              <span className="font-bold text-orange-600">{stats.open} / {stats.inProgress}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-bold text-green-600">{stats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue:</span>
              <span className={cn("font-bold", stats.overdue > 0 ? "text-red-600" : "text-gray-600")}>
                {stats.overdue}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Critical / High:</span>
              <span className="font-bold text-red-600">{stats.critical} / {stats.high}</span>
            </div>
            <div className="border-t pt-1 mt-1">
              <div className="flex justify-between text-xs">
                <span>Avg Completion:</span>
                <span>{stats.avgCompletionTime.toFixed(1)} hrs</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Mode Toggle */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setViewMode('list')}
          className={cn("px-2 py-1 text-xs rounded", viewMode === 'list' ? "bg-blue-500 text-white" : "text-gray-600")}
        >
          List
        </button>
        <button
          onClick={() => setViewMode('heatmap')}
          className={cn("px-2 py-1 text-xs rounded", viewMode === 'heatmap' ? "bg-blue-500 text-white" : "text-gray-600")}
        >
          Heatmap
        </button>
        <button
          onClick={() => setViewMode('radius')}
          className={cn("px-2 py-1 text-xs rounded", viewMode === 'radius' ? "bg-blue-500 text-white" : "text-gray-600")}
        >
          Zones
        </button>
      </div>
      
      {/* Work Order Radius Zones */}
      {showRadius && viewMode === 'radius' && filteredWorkOrders.map((wo) => (
        <WorkOrderRadius
          key={`radius-${wo.id}`}
          center={[wo.lat, wo.lng]}
          radius={radiusSize}
          color={getPriorityColor(wo.priority)}
          opacity={0.15}
        />
      ))}
      
      {/* Assignment Lines */}
      {showAssignmentLines && filteredWorkOrders.map((wo) => {
        if (wo.assignedTo && technicians.has(wo.assignedTo.id)) {
          const techPos = technicians.get(wo.assignedTo.id);
          if (techPos) {
            return (
              <AssignmentLine
                key={`line-${wo.id}`}
                from={[techPos.lat, techPos.lng]}
                to={[wo.lat, wo.lng]}
                color={getPriorityColor(wo.priority)}
              />
            );
          }
        }
        return null;
      })}
      
      {/* Work Order Circles/Markers */}
      {filteredWorkOrders.map((workOrder) => {
        const isSelected = selectedWorkOrder?.id === workOrder.id;
        const isHovered = hoveredWorkOrder?.id === workOrder.id;
        const isOverdue = isAfter(new Date(), new Date(workOrder.dueDate)) && workOrder.status !== 'completed';
        
        return (
          <Circle
            key={workOrder.id}
            center={[workOrder.lat, workOrder.lng] as LatLngExpression}
            radius={isSelected ? 150 : isHovered ? 120 : 100}
            pathOptions={{
              color: getPriorityColor(workOrder.priority),
              fillColor: getPriorityColor(workOrder.priority),
              fillOpacity: isSelected ? 0.4 : isHovered ? 0.35 : 0.3,
              weight: isSelected ? 3 : isHovered ? 2.5 : 2,
              className: isOverdue ? 'animate-pulse' : ''
            }}
            eventHandlers={{
              click: () => handleWorkOrderClick(workOrder),
              mouseover: () => handleWorkOrderHover(workOrder),
              mouseout: () => handleWorkOrderHover(null),
            }}
          >
            {/* Tooltip for quick info */}
            <Tooltip 
              direction="top" 
              offset={[0, -20]} 
              opacity={0.95}
              className="custom-workorder-tooltip"
              permanent={showLabels}
            >
              <div className="text-xs">
                <div className="font-semibold">{workOrder.workOrderNumber}</div>
                <div className="text-gray-600 truncate max-w-[150px]">{workOrder.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "px-1 rounded text-white text-[10px]",
                    workOrder.priority === 'critical' ? "bg-red-500" :
                    workOrder.priority === 'high' ? "bg-orange-500" :
                    workOrder.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                  )}>
                    {workOrder.priority}
                  </span>
                  {isOverdue && (
                    <span className="text-red-600 text-[10px]">OVERDUE</span>
                  )}
                </div>
              </div>
            </Tooltip>
            
            {/* Popup with detailed info */}
            <Popup
              autoPan={true}
              autoPanPadding={[50, 50]}
              closeButton={false}
              eventHandlers={{ remove: () => setSelectedWorkOrder(null) }}
            >
              <WorkOrderPopupContent
                workOrder={workOrder}
                onClose={() => setSelectedWorkOrder(null)}
                onAssign={() => handleAssign(workOrder.id)}
                onStart={() => handleStart(workOrder.id)}
                onComplete={() => handleComplete(workOrder.id)}
              />
            </Popup>
          </Circle>
        );
      })}
      
      {/* Hover Effect Animation Layer */}
      <AnimatePresence>
        {hoveredWorkOrder && !selectedWorkOrder && (
          <Circle
            center={[hoveredWorkOrder.lat, hoveredWorkOrder.lng] as LatLngExpression}
            radius={130}
            pathOptions={{
              color: getPriorityColor(hoveredWorkOrder.priority),
              fillColor: 'transparent',
              weight: 2,
              opacity: 0.5,
              className: 'animate-pulse'
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Heatmap Visualization (simplified - would need actual heatmap library) */}
      {showHeatmap && viewMode === 'heatmap' && (
        <div className="absolute inset-0 pointer-events-none z-[500]">
          {heatmapData.map((point, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-30 blur-xl"
              style={{
                left: `${((point.lng + 180) % 360) / 360 * 100}%`,
                top: `${(90 - point.lat) / 180 * 100}%`,
                width: `${point.intensity * 100}px`,
                height: `${point.intensity * 100}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}