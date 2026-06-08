import type { Priority, WorkOrderStatus, AssetStatus, ScheduleType } from '@/types/cmms';

// ============================================================================
// CONSTANTS
// ============================================================================

export const ASSET_TYPES = [
  'Pump', 'Motor', 'Generator', 'HVAC', 'Compressor',
  'Conveyor', 'Boiler', 'Transformer', 'Valve', 'Sensor', 'Other',
] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  OPEN: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  RETIRED: 'bg-red-100 text-red-800',
};

export const WORK_ORDER_STATUS_FLOW: WorkOrderStatus[] = [
  'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED',
];

// ============================================================================
// FORMATTERS
// ============================================================================

export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  return date.toLocaleDateString();
}

export function formatScheduleInterval(interval: number, type: ScheduleType): string {
  if (type === 'TIME_BASED') {
    if (interval === 1) return 'Daily';
    if (interval === 7) return 'Weekly';
    if (interval === 30) return 'Monthly';
    if (interval === 90) return 'Quarterly';
    if (interval === 365) return 'Yearly';
    return `Every ${interval} days`;
  }
  return `Every ${interval} hours`;
}

// ============================================================================
// VALIDATORS
// ============================================================================

export function validateAsset(data: Record<string, unknown>): string | null {
  if (!data.name || String(data.name).trim().length < 2) return 'Name must be at least 2 characters';
  if (!data.type) return 'Type is required';
  if (!data.location || String(data.location).trim().length < 2) return 'Location is required';
  return null;
}

export function validateWorkOrder(data: Record<string, unknown>): string | null {
  if (!data.title || String(data.title).trim().length < 3) return 'Title must be at least 3 characters';
  if (!data.assetId) return 'Asset is required';
  if (!data.description || String(data.description).trim().length < 10) return 'Description must be at least 10 characters';
  return null;
}

export function validateInventoryItem(data: Record<string, unknown>): string | null {
  if (!data.partName || String(data.partName).trim().length < 2) return 'Part name is required';
  if (typeof data.quantity !== 'number' || data.quantity < 0) return 'Quantity must be 0 or more';
  if (typeof data.threshold !== 'number' || data.threshold < 0) return 'Threshold must be 0 or more';
  return null;
}

export function validatePMSchedule(data: Record<string, unknown>): string | null {
  if (!data.assetId) return 'Asset is required';
  if (!data.description || String(data.description).trim().length < 5) return 'Description is required';
  if (!data.interval || Number(data.interval) < 1) return 'Interval must be at least 1';
  return null;
}

// ============================================================================
// HELPERS
// ============================================================================

export function getPMStatus(nextDue: string, isActive: boolean): 'overdue' | 'due-soon' | 'scheduled' | 'inactive' {
  if (!isActive) return 'inactive';
  const due = new Date(nextDue);
  const now = new Date();
  if (due <= now) return 'overdue';
  if (due <= new Date(now.getTime() + 7 * 86400000)) return 'due-soon';
  return 'scheduled';
}

export function getNextStatus(current: WorkOrderStatus): WorkOrderStatus | null {
  const idx = WORK_ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= WORK_ORDER_STATUS_FLOW.length - 1) return null;
  return WORK_ORDER_STATUS_FLOW[idx + 1];
}

export function isLowStock(quantity: number, threshold: number): boolean {
  return quantity <= threshold;
}

export function calcCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
