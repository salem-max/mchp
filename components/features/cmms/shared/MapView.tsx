"use client"

import { MapContainer, TileLayer, useMap, ZoomControl, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useCallback, useRef } from "react";
import AssetLayer from "./AssetLayer";
import TechnicianLayer from "./TechnicianLayer";
import WorkOrderLayer from "./WorkOrderLayer";
import { LatLngExpression, Map as LeafletMap } from "leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  MapPin, 
  Users, 
  ClipboardList, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
  Navigation,
  Sun,
  Moon,
  Thermometer,
  Wind,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ==================== TYPES ====================

interface MapViewProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  center?: LatLngExpression;
  zoom?: number;
  showAssetLayer?: boolean;
  showTechnicianLayer?: boolean;
  showWorkOrderLayer?: boolean;
  onAssetSelect?: (assetId: string) => void;
  onTechnicianSelect?: (technicianId: string) => void;
  onWorkOrderSelect?: (workOrderId: string) => void;
  enableClustering?: boolean;
  enableHeatmap?: boolean;
  theme?: 'light' | 'dark' | 'satellite';
  showControls?: boolean;
  showLegend?: boolean;
  refreshInterval?: number;
}

interface MapControlsProps {
  map: LeafletMap | null;
  onRefresh: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  layers: { id: string; name: string; visible: boolean }[];
  onToggleLayer: (layerId: string) => void;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

// ==================== CURRENT DATE ====================
const CURRENT_DATE = new Date('2026-04-23');
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 'April';
const CURRENT_DAY = 23;

// ==================== MAP CONTROLS COMPONENT ====================

function MapControls({ 
  map, 
  onRefresh, 
  isFullscreen, 
  onToggleFullscreen,
  layers,
  onToggleLayer 
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };
  
  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };
  
  const handleLocate = () => {
    if (map) {
      map.locate({ setView: true, maxZoom: 16 });
    }
  };
  
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Main Controls */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            -
          </Button>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleLocate}
            title="My Location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFullscreen}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
      
      {/* Layer Controls */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm">Layers</span>
        </Button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border",
                    layer.visible ? "bg-blue-500 border-blue-500" : "bg-transparent border-gray-400"
                  )}>
                    {layer.visible && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                  </div>
                  <span>{layer.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

// ==================== MAP LEGEND COMPONENT ====================

function MapLegend() {
  return (
    <Card className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Healthy Asset (80-100%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Warning Asset (50-79%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Critical Asset (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Available Technician</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-400">Active Work Order</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ==================== WEATHER OVERLAY COMPONENT ====================

function WeatherOverlay({ weather }: { weather: WeatherData }) {
  return (
    <Card className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-3">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{weather.icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{weather.temperature}°C</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{weather.condition}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" /> {weather.windSpeed} km/h
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ==================== STATS OVERLAY ====================

function StatsOverlay() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeTechnicians: 0,
    openWorkOrders: 0,
    criticalAlerts: 0
  });
  
  useEffect(() => {
    // Simulate fetching stats
    setStats({
      totalAssets: 24,
      activeTechnicians: 8,
      openWorkOrders: 12,
      criticalAlerts: 3
    });
  }, []);
  
  return (
    <Card className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-3">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalAssets}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Assets</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activeTechnicians}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Technicians</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.openWorkOrders}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Work Orders</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.criticalAlerts}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Alerts</p>
        </div>
      </div>
    </Card>
  );
}

// ==================== DATE BADGE ====================

function DateBadge() {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg px-3 py-1">
        <Activity className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
        <span className="text-xs">
          {CURRENT_MONTH} {CURRENT_DAY}, {CURRENT_YEAR} • Live Monitoring
        </span>
      </Badge>
    </div>
  );
}

// ==================== MAIN MAPVIEW COMPONENT ====================

export default function MapView({ 
  className = "h-[500px] w-full",
  height = "500px",
  width = "100%",
  center = [1.553, 110.359] as LatLngExpression,
  zoom = 14,
  showAssetLayer = true,
  showTechnicianLayer = true,
  showWorkOrderLayer = true,
  onAssetSelect,
  onTechnicianSelect,
  onWorkOrderSelect,
  enableClustering = false,
  enableHeatmap = false,
  theme = 'light',
  showControls = true,
  showLegend = true,
  refreshInterval = 5000
}: MapViewProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    assets: showAssetLayer,
    technicians: showTechnicianLayer,
    workOrders: showWorkOrderLayer
  });
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28.5,
    condition: 'Partly Cloudy',
    humidity: 72,
    windSpeed: 12,
    icon: '⛅'
  });
  const [lastRefresh, setLastRefresh] = useState(new Date(CURRENT_DATE));
  
  // Ref to get map instance from MapContainer
  const mapRef = useRef<LeafletMap | null>(null);
  
  // Tile layer URLs based on theme
  const tileLayers = {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };
  
  const tileAttributions = {
    light: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    satellite: '&copy; <a href="https://www.esri.com">Esri</a>'
  };
  
  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = document.getElementById('map-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date(CURRENT_DATE));
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof L.LayerGroup) {
          // Refresh layer data
        }
      });
    }
  }, [map]);
  
  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId as keyof typeof prev]
    }));
  }, []);
  
  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 1,
        humidity: Math.min(100, Math.max(0, prev.humidity + (Math.random() - 0.5) * 5)),
        windSpeed: Math.min(50, Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 2))
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Prepare layers for control panel
  const layers = [
    { id: 'assets', name: 'Assets', visible: visibleLayers.assets },
    { id: 'technicians', name: 'Technicians', visible: visibleLayers.technicians },
    { id: 'workOrders', name: 'Work Orders', visible: visibleLayers.workOrders }
  ];
  
  return (
    <div 
      id="map-container"
      className={cn("relative rounded-xl overflow-hidden shadow-lg", className)}
      style={{ height, width }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        ref={mapRef}
      >
        {/* Base Tile Layer */}
        <TileLayer
          url={tileLayers[theme]}
          attribution={tileAttributions[theme]}
        />
        
        {/* Scale Control */}
        <ScaleControl position="bottomleft" />
        
        {/* Custom Layers */}
        {visibleLayers.assets && (
          <AssetLayer 
            onAssetClick={(asset) => onAssetSelect?.(asset.id)}
            clusterEnabled={enableClustering}
            showHeatmap={enableHeatmap}
          />
        )}
        
        {visibleLayers.technicians && (
          <TechnicianLayer 
            onTechnicianSelect={(technician) => onTechnicianSelect?.(technician.id)}
            showLiveTracking={true}
          />
        )}
        
        {visibleLayers.workOrders && (
          <WorkOrderLayer 
            onWorkOrderSelect={(workOrder) => onWorkOrderSelect?.(workOrder.id)}
            showActiveOnly={true}
          />
        )}
        
        {/* Controls and Overlays */}
        {showControls && map && (
          <MapControls
            map={map}
            onRefresh={handleRefresh}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            layers={layers}
            onToggleLayer={toggleLayer}
          />
        )}
        
        {showLegend && <MapLegend />}
        
        <WeatherOverlay weather={weather} />
        
        <StatsOverlay />
        
        <DateBadge />
        
        {/* Refresh Indicator */}
        <AnimatePresence>
          {lastRefresh && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]"
            >
              <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-xs">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </MapContainer>
    </div>
  );
}

// ==================== EXPORT CONFIGURATION ====================

export { AssetLayer, TechnicianLayer, WorkOrderLayer };