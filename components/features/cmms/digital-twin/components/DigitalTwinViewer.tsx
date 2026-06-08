"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Sparkles, MeshReflectorMaterial } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainIcon, 
  AlertTriangle, 
  Activity, 
  Wifi, 
  Battery, 
  Thermometer, 
  Vibrate, 
  Gauge,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  RefreshCw,
  Download,
  Maximize2,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Cpu,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Terminal } from '@/components/ai-elements/terminal';
import { Context } from '@/components/ai-elements/context';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from 'recharts';
import * as THREE from 'three';

// ==================== CURRENT DATE CONSTANTS ====================
const CURRENT_DATE = new Date('2026-04-23');
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 'April';
const CURRENT_DAY = 23;

// ==================== TYPES ====================

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
  history: { timestamp: number; value: number }[];
  threshold: { warning: number; critical: number };
  trend: 'up' | 'down' | 'stable';
  prediction?: number;
}

interface AssetNode {
  id: string;
  name: string;
  type: 'pump' | 'motor' | 'valve' | 'sensor' | 'controller' | 'generator' | 'conveyor' | 'compressor';
  position: [number, number, number];
  rotation?: [number, number, number];
  sensors: SensorData[];
  healthScore: number;
  efficiency: number;
  load: number;
  temperature: number;
  vibration: number;
  status: 'online' | 'offline' | 'maintenance' | 'fault' | 'degraded';
  lastMaintenance: string;
  nextMaintenance: string;
  lastInspection: string;
  alerts: Alert[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
  uptime: number;
  energyConsumption: number;
  co2Saved: number;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface AIPrediction {
  assetId: string;
  assetName: string;
  failureProbability: number;
  rulDays: number;
  rulHours: number;
  confidence: number;
  recommendations: string[];
  anomalyDetected: boolean;
  detectedAt: string;
  modelVersion: string;
}

interface MaintenanceSchedule {
  id: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'predictive' | 'corrective';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate: string;
  estimatedDuration: number;
  assignedTeam: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
}

// ==================== UPDATED MOCK DATA WITH CURRENT DATE ====================

const generateHistory = (baseValue: number, variance: number, points: number, trend: 'up' | 'down' | 'stable' = 'stable') => {
  const history = [];
  const now = Date.now();
  const hourInMs = 3600000;
  
  for (let i = points; i >= 0; i--) {
    let trendFactor = 0;
    if (trend === 'up') trendFactor = (points - i) / points * variance;
    if (trend === 'down') trendFactor = -(points - i) / points * variance;
    
    history.push({
      timestamp: now - i * hourInMs,
      value: baseValue + (Math.random() - 0.5) * variance + trendFactor
    });
  }
  return history;
};

// Current date formatted strings
const formatMaintenanceDate = (daysFromNow: number) => {
  const date = new Date(CURRENT_DATE);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const formatInspectionDate = (monthsAgo: number) => {
  const date = new Date(CURRENT_DATE);
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toISOString().split('T')[0];
};

const mockSensors: SensorData[] = [
  { 
    id: 'temp', 
    name: 'Temperature', 
    value: 72.5, 
    unit: '°C', 
    status: 'normal', 
    timestamp: Date.now(),
    history: generateHistory(72, 5, 72, 'stable'),
    threshold: { warning: 80, critical: 90 },
    trend: 'stable',
    prediction: 73.2
  },
  { 
    id: 'vib', 
    name: 'Vibration', 
    value: 2.1, 
    unit: 'mm/s', 
    status: 'warning', 
    timestamp: Date.now() - 5000,
    history: generateHistory(2.0, 1.5, 72, 'up'),
    threshold: { warning: 4.5, critical: 7.0 },
    trend: 'up',
    prediction: 3.8
  },
  { 
    id: 'press', 
    name: 'Pressure', 
    value: 245, 
    unit: 'kPa', 
    status: 'normal', 
    timestamp: Date.now(),
    history: generateHistory(240, 15, 72, 'stable'),
    threshold: { warning: 280, critical: 320 },
    trend: 'stable'
  },
  { 
    id: 'flow', 
    name: 'Flow Rate', 
    value: 150, 
    unit: 'L/min', 
    status: 'normal', 
    timestamp: Date.now(),
    history: generateHistory(145, 10, 72, 'down'),
    threshold: { warning: 180, critical: 200 },
    trend: 'down',
    prediction: 142
  },
  { 
    id: 'current', 
    name: 'Current', 
    value: 45, 
    unit: 'A', 
    status: 'normal', 
    timestamp: Date.now(),
    history: generateHistory(42, 8, 72, 'up'),
    threshold: { warning: 55, critical: 65 },
    trend: 'up',
    prediction: 48
  },
  { 
    id: 'rpm', 
    name: 'RPM', 
    value: 1750, 
    unit: 'rpm', 
    status: 'normal', 
    timestamp: Date.now(),
    history: generateHistory(1720, 50, 72, 'stable'),
    threshold: { warning: 1850, critical: 1950 },
    trend: 'stable'
  },
];

const mockAssets: AssetNode[] = [
  {
    id: 'pump-001',
    name: 'Main Water Pump',
    type: 'pump',
    position: [0, 0, 0],
    rotation: [0, Math.PI / 4, 0],
    sensors: mockSensors,
    healthScore: 92,
    efficiency: 94,
    load: 78,
    temperature: 72.5,
    vibration: 2.1,
    status: 'online',
    lastMaintenance: formatMaintenanceDate(-45),
    nextMaintenance: formatMaintenanceDate(15),
    lastInspection: formatInspectionDate(1),
    alerts: [],
    criticality: 'high',
    uptime: 3285, // hours
    energyConsumption: 125000, // kWh
    co2Saved: 18750 // kg
  },
  {
    id: 'motor-101',
    name: 'Drive Motor',
    type: 'motor',
    position: [3.5, 0, 2.5],
    rotation: [0, 0, 0],
    sensors: mockSensors.map(s => ({ 
      ...s, 
      value: s.id === 'vib' ? 5.8 : s.id === 'temp' ? 85.3 : s.value * 1.2,
      status: s.id === 'vib' ? 'critical' : s.id === 'temp' ? 'warning' : s.status,
      trend: s.id === 'vib' ? 'up' : s.trend
    })),
    healthScore: 68,
    efficiency: 72,
    load: 92,
    temperature: 85.3,
    vibration: 5.8,
    status: 'degraded',
    lastMaintenance: formatMaintenanceDate(-30),
    nextMaintenance: formatMaintenanceDate(5),
    lastInspection: formatInspectionDate(0.5),
    alerts: [
      { 
        id: 'alert-1', 
        severity: 'critical', 
        message: 'High vibration detected - Immediate inspection required', 
        timestamp: new Date(CURRENT_DATE.setHours(10, 30, 0)).toISOString(), 
        resolved: false 
      },
      { 
        id: 'alert-2', 
        severity: 'warning', 
        message: 'Temperature exceeding normal range', 
        timestamp: new Date(CURRENT_DATE.setHours(8, 15, 0)).toISOString(), 
        resolved: false 
      }
    ],
    criticality: 'critical',
    uptime: 1890,
    energyConsumption: 89000,
    co2Saved: 13350
  },
  {
    id: 'valve-202',
    name: 'Control Valve',
    type: 'valve',
    position: [-2.5, 0.5, 1.8],
    sensors: mockSensors.slice(0, 3),
    healthScore: 88,
    efficiency: 91,
    load: 45,
    temperature: 45.2,
    vibration: 1.2,
    status: 'online',
    lastMaintenance: formatMaintenanceDate(-60),
    nextMaintenance: formatMaintenanceDate(20),
    lastInspection: formatInspectionDate(2),
    alerts: [],
    criticality: 'medium',
    uptime: 4320,
    energyConsumption: 45000,
    co2Saved: 6750
  },
  {
    id: 'gen-305',
    name: 'Backup Generator',
    type: 'generator',
    position: [1.5, 0, -3],
    sensors: mockSensors.slice(0, 4),
    healthScore: 95,
    efficiency: 96,
    load: 15,
    temperature: 38.5,
    vibration: 0.8,
    status: 'offline',
    lastMaintenance: formatMaintenanceDate(-90),
    nextMaintenance: formatMaintenanceDate(60),
    lastInspection: formatInspectionDate(3),
    alerts: [],
    criticality: 'low',
    uptime: 120,
    energyConsumption: 15000,
    co2Saved: 2250
  },
  {
    id: 'conveyor-408',
    name: 'Assembly Line Conveyor',
    type: 'conveyor',
    position: [-1, 0, -2],
    sensors: mockSensors.filter(s => ['temp', 'vib', 'current'].includes(s.id)),
    healthScore: 82,
    efficiency: 88,
    load: 65,
    temperature: 52.3,
    vibration: 2.8,
    status: 'online',
    lastMaintenance: formatMaintenanceDate(-20),
    nextMaintenance: formatMaintenanceDate(25),
    lastInspection: formatInspectionDate(0.7),
    alerts: [],
    criticality: 'high',
    uptime: 2100,
    energyConsumption: 67000,
    co2Saved: 10050
  },
  {
    id: 'compressor-503',
    name: 'Air Compressor',
    type: 'compressor',
    position: [2, 0, -1.5],
    sensors: mockSensors,
    healthScore: 76,
    efficiency: 79,
    load: 82,
    temperature: 78.4,
    vibration: 3.9,
    status: 'degraded',
    lastMaintenance: formatMaintenanceDate(-35),
    nextMaintenance: formatMaintenanceDate(10),
    lastInspection: formatInspectionDate(0.3),
    alerts: [
      { 
        id: 'alert-3', 
        severity: 'warning', 
        message: 'Increased vibration detected - Schedule inspection', 
        timestamp: new Date(CURRENT_DATE.setHours(14, 20, 0)).toISOString(), 
        resolved: false 
      }
    ],
    criticality: 'high',
    uptime: 2650,
    energyConsumption: 112000,
    co2Saved: 16800
  }
];

// ==================== AI PREDICTIONS ====================

const generateAIPredictions = (assets: AssetNode[]): AIPrediction[] => {
  return assets.map(asset => ({
    assetId: asset.id,
    assetName: asset.name,
    failureProbability: (100 - asset.healthScore) / 100,
    rulDays: Math.floor((asset.healthScore / 20) * 30),
    rulHours: Math.floor((asset.healthScore / 20) * 30 * 24),
    confidence: 85 + Math.random() * 10,
    recommendations: [
      asset.vibration > 4 ? '🔧 Check bearing alignment and lubrication' : null,
      asset.temperature > 80 ? '🌡️ Inspect cooling system and clean heat exchangers' : null,
      asset.load > 85 ? '⚡ Reduce operational load or upgrade capacity' : null,
      asset.healthScore < 70 ? '📋 Schedule comprehensive maintenance inspection' : null,
      asset.efficiency < 80 ? '🔄 Calibrate sensors and optimize parameters' : null
    ].filter(Boolean) as string[],
    anomalyDetected: asset.vibration > 5 || asset.temperature > 85 || asset.healthScore < 65,
    detectedAt: new Date(CURRENT_DATE).toISOString(),
    modelVersion: 'v3.2.1-2026.04'
  }));
};

// ==================== MAINTENANCE SCHEDULES ====================

const maintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 'maint-001',
    assetId: 'motor-101',
    assetName: 'Drive Motor',
    type: 'predictive',
    priority: 'critical',
    scheduledDate: new Date(CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 2)).toISOString(),
    estimatedDuration: 6,
    assignedTeam: 'Electrical Maintenance Team A',
    status: 'scheduled'
  },
  {
    id: 'maint-002',
    assetId: 'compressor-503',
    assetName: 'Air Compressor',
    type: 'preventive',
    priority: 'high',
    scheduledDate: new Date(CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 5)).toISOString(),
    estimatedDuration: 4,
    assignedTeam: 'Mechanical Maintenance',
    status: 'scheduled'
  },
  {
    id: 'maint-003',
    assetId: 'pump-001',
    assetName: 'Main Water Pump',
    type: 'preventive',
    priority: 'medium',
    scheduledDate: new Date(CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 12)).toISOString(),
    estimatedDuration: 3,
    assignedTeam: 'Facilities Team',
    status: 'scheduled'
  }
];

// ==================== 3D COMPONENTS ====================

function RotatingMesh({ children, speed = 0.5, ...props }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += speed * 0.01;
    }
  });
  
  return <mesh ref={meshRef} {...props}>{children}</mesh>;
}

function AssetNode3D({ asset, scale = 1, selected, onClick }: { 
  asset: AssetNode; 
  scale?: number; 
  selected?: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  
  const color = asset.healthScore > 85 ? '#10b981' : asset.healthScore > 70 ? '#f59e0b' : '#ef4444';
  const emissiveColor = selected ? '#3b82f6' : hovered ? '#6366f1' : '#000000';
  
  const getModelGeometry = () => {
    switch(asset.type) {
      case 'pump':
        return <cylinderGeometry args={[0.6, 0.6, 1, 32]} />;
      case 'motor':
        return <boxGeometry args={[0.8, 0.8, 1.2]} />;
      case 'valve':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'generator':
        return <boxGeometry args={[1, 0.8, 1.5]} />;
      case 'conveyor':
        return <boxGeometry args={[1.2, 0.4, 0.8]} />;
      case 'compressor':
        return <cylinderGeometry args={[0.7, 0.7, 1.1, 32]} />;
      default:
        return <boxGeometry args={[0.6, 0.6, 0.6]} />;
    }
  };
  
  return (
    <group 
      position={asset.position} 
      rotation={asset.rotation as [number, number, number]}
      scale={scale}
    >
      {/* Main Asset Body */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getModelGeometry()}
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
          emissive={emissiveColor}
          emissiveIntensity={selected ? 0.3 : hovered ? 0.15 : 0}
        />
      </mesh>
      
      {/* Health Ring */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Sensor Particles for warnings */}
      {asset.sensors.some(s => s.status === 'warning' || s.status === 'critical') && (
        <Sparkles 
          count={30}
          scale={[1.5, 1.5, 1.5]}
          size={0.1}
          color="#ef4444"
          speed={0.5}
        />
      )}
      
      {/* Floating Label */}
      <Html distanceFactor={8} position={[0, 1.2, 0]}>
        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs whitespace-nowrap">
          {asset.name}
          <div className="text-[10px] text-gray-300">{asset.healthScore}% health</div>
        </div>
      </Html>
      
      {/* Status Light */}
      <pointLight 
        position={[0, 0.5, 0.6]} 
        intensity={asset.status === 'online' ? 0.5 : 0.1}
        color={asset.status === 'online' ? '#22c55e' : asset.status === 'degraded' ? '#f59e0b' : '#6b7280'}
      />
    </group>
  );
}

function DigitalTwin3DScene({ assets, selectedAsset, onAssetSelect }: { 
  assets: AssetNode[]; 
  selectedAsset: string | null;
  onAssetSelect: (assetId: string) => void;
}) {
  const { camera } = useThree();
  
  // Auto-zoom to selected asset
  useEffect(() => {
    if (selectedAsset) {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset) {
        camera.position.set(asset.position[0] + 3, asset.position[1] + 2, asset.position[2] + 4);
        camera.lookAt(asset.position[0], asset.position[1], asset.position[2]);
      }
    }
  }, [selectedAsset, assets, camera]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.3} />
      
      {/* Ground Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1e293b"
          metalness={0.5}
        />
      </mesh>
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {assets.map((asset) => (
        <AssetNode3D 
          key={asset.id} 
          asset={asset} 
          selected={selectedAsset === asset.id}
          onClick={() => onAssetSelect(asset.id)}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={!selectedAsset}
        autoRotateSpeed={1}
      />
    </>
  );
}

// ==================== SENSOR CARD COMPONENT ====================

function SensorCard({ sensor, assetName }: { sensor: SensorData; assetName: string }) {
  const statusColors = {
    normal: 'border-green-500 bg-green-50 dark:bg-green-950/20',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    critical: 'border-red-500 bg-red-50 dark:bg-red-950/20'
  };
  
  const statusIcons = {
    normal: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle
  };
  
  const Icon = statusIcons[sensor.status];
  const latestHistory = sensor.history.slice(-24);
  
  return (
    <div className={`p-4 border-l-4 rounded-lg ${statusColors[sensor.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {sensor.id === 'temp' && <Thermometer className="w-4 h-4" />}
          {sensor.id === 'vib' && <Vibrate className="w-4 h-4" />}
          {sensor.id === 'press' && <Gauge className="w-4 h-4" />}
          {sensor.id === 'flow' && <Activity className="w-4 h-4" />}
          {sensor.id === 'current' && <Zap className="w-4 h-4" />}
          {sensor.id === 'rpm' && <TrendingUp className="w-4 h-4" />}
          <span className="font-medium">{sensor.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {sensor.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
          {sensor.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
          <Icon className={`w-4 h-4 ${sensor.status === 'normal' ? 'text-green-500' : sensor.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold">{sensor.value.toFixed(1)}</span>
        <span className="text-sm text-gray-500">{sensor.unit}</span>
        {sensor.prediction && (
          <span className="text-xs text-gray-400 ml-2">
            Predicted: {sensor.prediction.toFixed(1)}
          </span>
        )}
      </div>
      
      <Progress 
        value={(sensor.value / sensor.threshold.critical) * 100} 
        className={`h-1 mb-2 ${
          sensor.status === 'normal' ? '[&>div]:bg-green-500' : 
          sensor.status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
        }`}
      />
      
      <div className="text-xs text-gray-500 flex justify-between">
        <span>⚠️ Warning: {sensor.threshold.warning}{sensor.unit}</span>
        <span>🔴 Critical: {sensor.threshold.critical}{sensor.unit}</span>
      </div>
      
      {/* Mini Chart */}
      <div className="h-16 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={latestHistory}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={sensor.status === 'normal' ? '#10b981' : sensor.status === 'warning' ? '#f59e0b' : '#ef4444'} 
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function DigitalTwinViewer() {
  const [assets, setAssets] = useState<AssetNode[]>(mockAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [contextTokens, setContextTokens] = useState(0);
  const [aiPredictions, setAiPredictions] = useState<AIPrediction[]>([]);
  const [activeTab, setActiveTab] = useState('3d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date(CURRENT_DATE));
  const [showAlerts, setShowAlerts] = useState(true);
  
  const selectedAsset = useMemo(() => 
    assets.find(a => a.id === selectedAssetId), 
    [assets, selectedAssetId]
  );
  
  // Initialize AI predictions
  useEffect(() => {
    setAiPredictions(generateAIPredictions(assets));
  }, []);
  
  // Simulate real-time data streaming
  const updateSensorData = useCallback(() => {
    if (!isStreaming) return;
    
    setAssets(prevAssets => prevAssets.map(asset => ({
      ...asset,
      sensors: asset.sensors.map(sensor => {
        const trendDelta = sensor.trend === 'up' ? 0.3 : sensor.trend === 'down' ? -0.3 : 0;
        const delta = (Math.random() - 0.5) * 2 + trendDelta;
        const newValue = Math.max(0, Math.min(100, sensor.value + delta));
        const newStatus = newValue > sensor.threshold.critical ? 'critical' : 
                         newValue > sensor.threshold.warning ? 'warning' : 'normal';
        
        return {
          ...sensor,
          value: newValue,
          status: newStatus,
          timestamp: Date.now(),
          history: [...sensor.history.slice(-71), { timestamp: Date.now(), value: newValue }]
        };
      }),
      healthScore: Math.max(0, Math.min(100, asset.healthScore + (Math.random() - 0.5) * 0.3)),
      temperature: asset.sensors.find(s => s.id === 'temp')?.value || asset.temperature,
      vibration: asset.sensors.find(s => s.id === 'vib')?.value || asset.vibration,
    })));
    
    setLastUpdate(new Date(CURRENT_DATE));
    
    // Update AI predictions
    setAiPredictions(generateAIPredictions(assets));
    
    // Update terminal with alerts
    const alertAssets = assets.filter(a => a.healthScore < 70 || a.vibration > 4 || a.temperature > 80);
    if (alertAssets.length > 0) {
      const newAlerts = alertAssets.map(a => {
        const reason = a.vibration > 5 ? 'Critical vibration' : 
                      a.temperature > 85 ? 'Overheating' :
                      a.healthScore < 65 ? 'Severe degradation' : 'Performance issue';
        return `[${new Date(CURRENT_DATE).toLocaleTimeString()}] ⚠️ ALERT: ${a.name} - ${reason} (Health: ${a.healthScore.toFixed(1)}%)`;
      }).join('\n');
      
      setTerminalOutput(prev => {
        const combined = prev + newAlerts + '\n';
        // Keep only last 50 lines
        const lines = combined.split('\n');
        if (lines.length > 50) return lines.slice(-50).join('\n');
        return combined;
      });
    }
  }, [isStreaming, assets]);
  
  // Auto-update loop
  useEffect(() => {
    const interval = setInterval(updateSensorData, 3000);
    return () => clearInterval(interval);
  }, [updateSensorData]);
  
  // Simulate AI token usage
  useEffect(() => {
    const tokenInterval = setInterval(() => {
      setContextTokens(prev => Math.min(8192, prev + Math.floor(Math.random() * 50)));
    }, 5000);
    return () => clearInterval(tokenInterval);
  }, []);
  
  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Calculate global metrics
  const globalMetrics = useMemo(() => {
    const avgHealth = assets.reduce((sum, a) => sum + a.healthScore, 0) / assets.length;
    const criticalAssets = assets.filter(a => a.healthScore < 50).length;
    const warningAssets = assets.filter(a => a.healthScore >= 50 && a.healthScore < 70).length;
    const onlineAssets = assets.filter(a => a.status === 'online').length;
    const avgEfficiency = assets.reduce((sum, a) => sum + a.efficiency, 0) / assets.length;
    const totalEnergySaved = assets.reduce((sum, a) => sum + a.co2Saved, 0);
    const totalUptime = assets.reduce((sum, a) => sum + a.uptime, 0);
    
    return { 
      avgHealth, 
      criticalAssets, 
      warningAssets, 
      onlineAssets, 
      avgEfficiency,
      totalEnergySaved,
      totalUptime,
      totalAssets: assets.length
    };
  }, [assets]);
  
  // Critical alerts count
  const criticalAlertsCount = assets.reduce((sum, a) => sum + a.alerts.filter(al => !al.resolved && al.severity === 'critical').length, 0);
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 to-slate-800", isFullscreen && "fixed inset-0 z-50")}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Current Date */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Digital Twin Control Center
              </h1>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                LIVE
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-400">Real-time industrial asset monitoring with AI-powered predictive maintenance</p>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
                <Calendar className="w-3 h-3 mr-1" />
                {CURRENT_MONTH} {CURRENT_DAY}, {CURRENT_YEAR}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Wifi className="w-4 h-4 text-green-400" />
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            {criticalAlertsCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                {criticalAlertsCount} Critical Alerts
              </Badge>
            )}
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Avg. Health Score</p>
                  <p className="text-2xl font-bold text-white">{globalMetrics.avgHealth.toFixed(1)}%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
              <Progress value={globalMetrics.avgHealth} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Assets at Risk</p>
                  <p className="text-2xl font-bold text-white">{globalMetrics.criticalAssets + globalMetrics.warningAssets}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {globalMetrics.criticalAssets} critical, {globalMetrics.warningAssets} warning
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Avg. Efficiency</p>
                  <p className="text-2xl font-bold text-white">{globalMetrics.avgEfficiency.toFixed(1)}%</p>
                </div>
                                <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-white">{(globalMetrics.totalEnergySaved / 1000).toFixed(1)}t</p>
                </div>
                <Battery className="w-8 h-8 text-green-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">YTD carbon reduction</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Online Assets</p>
                  <p className="text-2xl font-bold text-white">{globalMetrics.onlineAssets}/{globalMetrics.totalAssets}</p>
                </div>
                <Wifi className="w-8 h-8 text-green-400 opacity-50" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Connected & operational</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="3d">3D Visualization</TabsTrigger>
            <TabsTrigger value="sensors">Sensor Analytics</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
          </TabsList>
          
          {/* 3D Visualization Tab */}
          <TabsContent value="3d" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Interactive 3D Factory Layout</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      <Play className="w-3 h-3 mr-1" />
                      Live Streaming
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsStreaming(!isStreaming)}
                    >
                      {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Click on any asset to view detailed information. Assets are color-coded by health status.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full rounded-xl overflow-hidden">
                  <Canvas
                    camera={{ position: [0, 5, 12], fov: 50 }}
                    shadows
                  >
                    <DigitalTwin3DScene 
                      assets={assets} 
                      selectedAsset={selectedAssetId}
                      onAssetSelect={setSelectedAssetId}
                    />
                  </Canvas>
                </div>
              </CardContent>
            </Card>
            
            {/* Selected Asset Details */}
            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {selectedAsset.name}
                      <Badge className={cn(
                        selectedAsset.status === 'online' ? 'bg-green-500' :
                        selectedAsset.status === 'degraded' ? 'bg-yellow-500' :
                        selectedAsset.status === 'offline' ? 'bg-gray-500' : 'bg-red-500'
                      )}>
                        {selectedAsset.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Health Score</p>
                        <p className="text-2xl font-bold text-white">{selectedAsset.healthScore}%</p>
                        <Progress value={selectedAsset.healthScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Efficiency</p>
                        <p className="text-2xl font-bold text-white">{selectedAsset.efficiency}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Load</p>
                        <p className="text-2xl font-bold text-white">{selectedAsset.load}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Temperature</p>
                        <p className="text-2xl font-bold text-white">{selectedAsset.temperature}°C</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Vibration</p>
                        <p className="text-2xl font-bold text-white">{selectedAsset.vibration} mm/s</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Last Maintenance</p>
                        <p className="text-lg font-bold text-white">{selectedAsset.lastMaintenance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
          
          {/* Sensor Analytics Tab */}
          <TabsContent value="sensors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedAsset || assets[0])?.sensors.map((sensor, idx) => (
                <SensorCard 
                  key={idx} 
                  sensor={sensor} 
                  assetName={selectedAsset?.name || assets[0]?.name || 'Asset'} 
                />
              ))}
            </div>
          </TabsContent>
          
          {/* AI Predictions Tab */}
          <TabsContent value="predictions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPredictions.filter(p => p.failureProbability > 0.3).map((prediction) => (
                <motion.div
                  key={prediction.assetId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className={cn(
                    "border-l-4",
                    prediction.failureProbability > 0.7 ? "border-l-red-500 bg-red-950/20" :
                    prediction.failureProbability > 0.4 ? "border-l-yellow-500 bg-yellow-950/20" :
                    "border-l-green-500 bg-green-950/20"
                  )}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <BrainIcon className="w-5 h-5" />
                          {prediction.assetName}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          v{prediction.modelVersion}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-400">Failure Probability</p>
                          <p className="text-xl font-bold text-white">{(prediction.failureProbability * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">RUL</p>
                          <p className="text-xl font-bold text-white">{prediction.rulDays} days</p>
                          <p className="text-xs text-gray-500">({prediction.rulHours} hours)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Confidence</p>
                          <p className="text-xl font-bold text-white">{prediction.confidence.toFixed(0)}%</p>
                        </div>
                      </div>
                      
                      {prediction.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-white/5 rounded-lg">
                          <p className="text-sm font-semibold text-gray-300 mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {prediction.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-400">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {prediction.anomalyDetected && (
                        <div className="flex items-center gap-2 text-yellow-500 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          Anomaly detected - Immediate attention recommended
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Upcoming Maintenance Schedule</CardTitle>
                <p className="text-sm text-gray-400">
                  AI-generated maintenance recommendations based on real-time asset health
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">{schedule.assetName}</p>
                          <Badge className={cn(
                            schedule.priority === 'critical' ? 'bg-red-500' :
                            schedule.priority === 'high' ? 'bg-orange-500' :
                            schedule.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          )}>
                            {schedule.priority}
                          </Badge>
                          <Badge variant="outline">{schedule.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Team: {schedule.assignedTeam} • Duration: {schedule.estimatedDuration} hours
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Scheduled</p>
                        <p className="text-white font-medium">
                          {new Date(schedule.scheduledDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Terminal Tab */}
          <TabsContent value="terminal">
            <Card className="bg-black/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">System Terminal</CardTitle>
                  <Context usedTokens={contextTokens} maxTokens={8192} />
                </div>
              </CardHeader>
              <CardContent>
                <Terminal
                  output={terminalOutput || `[${new Date(CURRENT_DATE).toLocaleTimeString()}] System initialized - Digital Twin v3.2.1\n[${new Date(CURRENT_DATE).toLocaleTimeString()}] Connected to ${assets.length} assets\n[${new Date(CURRENT_DATE).toLocaleTimeString()}] AI model loaded - Monitoring active\n`}
                  isStreaming={isStreaming}
                  autoScroll
                  onClear={() => setTerminalOutput('')}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}