/**
 * CMMS Type Definitions
 * Centralized TypeScript interfaces for the Computerized Maintenance Management System
 */

// ============================================================================
// ENUMS
// ============================================================================

export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
export type WorkOrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ScheduleType = 'TIME_BASED' | 'USAGE_BASED';
export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'CUSTOMER' | 'BOTH';

// ============================================================================
// BASE MODELS
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  model?: string | null;
  serialNumber?: string | null;
  status: AssetStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  digitalTwin?: DigitalTwin | null;
  workOrders?: WorkOrder[];
  preventiveMaintenances?: PreventiveMaintenance[];
}

export interface WorkOrder {
  id: string;
  assetId: string | null;
  asset?: Pick<Asset, 'id' | 'name' | 'location' | 'type'> | null;
  technicianId?: string | null;
  customerId?: string | null;

  status: WorkOrderStatus;
  priority: Priority;

  title?: string | null;
  description?: string | null;

  createdAt: string;
  updatedAt: string;
  scheduledTime?: string | null;
  completedAt?: string | null;

  assignedToUserId?: string | null;
  assignedToUser?: Pick<User, 'id' | 'name'> | null;
}


export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  inventoryId: string;
  inventory?: Pick<InventoryItem, 'id' | 'partName' | 'cost'>;
  quantity: number;
}

export interface PreventiveMaintenance {
  id: string;
  assetId: string;
  asset?: Pick<Asset, 'id' | 'name' | 'type' | 'location'>;
  scheduleType: ScheduleType;
  interval: number;
  lastDone?: string | null;
  nextDue: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  partName: string;
  description?: string | null;
  quantity: number;
  threshold: number;
  supplier?: string | null;
  cost?: number | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  workOrderParts?: WorkOrderPart[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  isSuperAdmin?: boolean;
  createdAt: string;
  technicianProfile?: TechnicianProfile | null;
}

export interface TechnicianProfile {
  userId: string;
  skills: string[];
  verified: boolean;
  hourlyRate?: number | null;
  isAvailable: boolean;
}

export interface DigitalTwin {
  id: string;
  assetId: string | null;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  sensorData?: SensorData[];
}


export interface SensorData {
  id: string;
  digitalTwinId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}


// ============================================================================
// ANALYTICS
// ============================================================================

export interface KPIs {
  mttr: number;
  mtbf: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  pendingWorkOrders: number;
  totalAssets: number;
  activeAssets: number;
  assetAvailability: string;
  totalMaintenanceCost: number;
  averageCostPerWO: number | string;
}

export interface WorkOrderTrend {
  open: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

export interface AssetDowntime {
  assetId: string;
  assetName: string;
  downtime: number;
}

export interface Analytics {
  kpis: KPIs;
  workOrderTrend: WorkOrderTrend;
  assetDowntime: AssetDowntime[];
  maintenanceCosts?: { workOrderId: string; cost: number }[];
}

export interface PMSummary {
  total: number;
  active: number;
  upcoming: number;
  overdue: number;
  items: PreventiveMaintenance[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  assetName: string;
  timestamp: string;
}

export interface AlertSummary {
  criticalAlerts: WorkOrder[];
  highAlerts: WorkOrder[];
  overdueMaintenance: PreventiveMaintenance[];
  lowStockAlerts: InventoryItem[];
}

export interface Prediction {
  assetId: string;
  assetName: string;
  prediction: string;
  confidence: number;
  nextMaintenance: string | null;
  currentTrend: 'deteriorating' | 'improving' | 'stable';
  predictedValue: number;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateAssetRequest {
  name: string;
  type: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  model?: string | null;
  serialNumber?: string | null;
  status?: AssetStatus;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  id: string;
}

export interface CreateWorkOrderRequest {
  assetId: string;
  title: string;
  description: string;
  priority?: Priority;
  status?: WorkOrderStatus;
  assignedTo?: string | null;
  dueDate?: string | null;
  notes?: string | null;
}

export interface UpdateWorkOrderRequest extends Partial<Omit<CreateWorkOrderRequest, 'assetId'>> {
  id: string;
  status?: WorkOrderStatus;
  notes?: string | null;
  completedAt?: string | null;
}

export interface CreateInventoryRequest {
  partName: string;
  description?: string | null;
  quantity: number;
  threshold: number;
  supplier?: string | null;
  cost?: number | null;
  location?: string | null;
}

export interface UpdateInventoryRequest extends Partial<CreateInventoryRequest> {
  id: string;
}

export interface CreatePMRequest {
  assetId: string;
  scheduleType: ScheduleType;
  interval: number;
  description: string;
  isActive?: boolean;
  lastDone?: string | null;
}

export interface UpdatePMRequest extends Partial<CreatePMRequest> {
  id: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string | null;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  role?: UserRole;
  phone?: string | null;
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface AssetFilters extends ListFilters {
  status?: AssetStatus;
  type?: string;
}

export interface WorkOrderFilters extends ListFilters {
  status?: WorkOrderStatus;
  priority?: Priority;
  assetId?: string;
  assignedTo?: string;
}

export interface InventoryFilters extends ListFilters {
  lowStockOnly?: boolean;
  supplier?: string;
}

// ============================================================================
// STORE STATE SHAPES
// ============================================================================

export interface AssetsState {
  assets: Asset[];
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
  filters: AssetFilters;
}

export interface WorkOrdersState {
  workOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder | null;
  loading: boolean;
  error: string | null;
  filters: WorkOrderFilters;
}

export interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
  lowStockCount: number;
}

export interface PMState {
  schedules: PreventiveMaintenance[];
  loading: boolean;
  error: string | null;
  summary: Omit<PMSummary, 'items'> | null;
}

export interface AnalyticsState {
  analytics: Analytics | null;
  predictions: Prediction[];
  alerts: AlertSummary | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}
