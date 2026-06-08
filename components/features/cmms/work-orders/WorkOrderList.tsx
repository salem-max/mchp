"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow } from "date-fns";

type WorkOrderStatus = "open" | "assigned" | "in_progress" | "completed" | "on_hold" | "cancelled";
type WorkOrderPriority = "low" | "medium" | "high" | "emergency";

interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  assetName: string;
  assetId: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assignedTo?: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
}

interface WorkOrderListProps {
  onSelect?: (id: string) => void;
  showCreate?: boolean;
}

const statusConfig = {
  open: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  assigned: { color: "bg-purple-100 text-purple-800", icon: Clock },
  in_progress: { color: "bg-orange-100 text-orange-800", icon: Clock },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  on_hold: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  cancelled: { color: "bg-gray-100 text-gray-800", icon: AlertTriangle }
};

const priorityConfig = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800"
};

export default function WorkOrderList({ onSelect, showCreate = true }: WorkOrderListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Get work orders
  const { data: workOrders, isLoading, error } = trpc.cmms.getWorkOrders.useQuery({
    search,
    status: statusFilter !== "ALL" ? (statusFilter as WorkOrderStatus) : undefined,
    priority: priorityFilter !== "ALL" ? (priorityFilter as WorkOrderPriority) : undefined
  });

  const woList = workOrders || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        {showCreate && (
          <Button className="gap-2" onClick={() => router.push("/dashboard/cmms/work-orders/new")}>
            <Plus className="h-4 w-4" />
            New Work Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search work orders..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i: any) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : woList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No work orders found</p>
          {showCreate && (
            <Button onClick={() => router.push("/dashboard/cmms/work-orders/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Work Order
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {woList.map((wo) => {
            const StatusIcon = statusConfig[wo.status].icon;
            return (
              <motion.div
                key={wo.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (onSelect) {
                      onSelect(wo.id);
                    } else {
                      router.push(`/dashboard/cmms/work-orders/${wo.id}`);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{wo.title}</h3>
                          <StatusIcon className={`h-4 w-4 shrink-0 ${statusConfig[wo.status].color.split(' ')[1]}`} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Asset: <span className="text-gray-700">{wo.assetName}</span>
                        </p>
                        {wo.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{wo.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>#{wo.id}</span>
                          {wo.assignedTo && <span>Assigned to {wo.assignedTo}</span>}
                          <span>Created {formatDistanceToNow(new Date(wo.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Badge className={statusConfig[wo.status].color}>
                          {wo.status.replace("_", " ")}
                        </Badge>
                        <Badge className={priorityConfig[wo.priority]}>
                          {wo.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
