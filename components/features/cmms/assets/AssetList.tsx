"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

type AssetStatus = "operational" | "maintenance" | "failed" | "retired";

interface Asset {
  id: string;
  name: string;
  assetType: string;
  status: AssetStatus;
  location?: string;
  manufacturer?: string;
  serialNumber?: string;
  installDate?: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  criticality: "low" | "medium" | "high" | "critical";
}

interface AssetListProps {
  onSelect?: (id: string) => void;
  showCreate?: boolean;
}

const statusConfig = {
  operational: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  maintenance: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  failed: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  retired: { color: "bg-gray-100 text-gray-800", icon: CheckCircle }
};

const criticalityConfig = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

export default function AssetList({ onSelect, showCreate = true }: AssetListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Get assets
  const { data: assets, isLoading, error } = trpc.cmms.getAssets.useQuery({
    search,
    status: statusFilter !== "ALL" ? (statusFilter as AssetStatus) : undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined
  });

  const assetList = assets || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        {showCreate && (
          <Button className="gap-2" onClick={() => router.push("/dashboard/cmms/assets/new")}>
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
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
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="machinery">Machinery</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i: any) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : assetList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No assets found</p>
          {showCreate && (
            <Button onClick={() => router.push("/dashboard/cmms/assets/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Asset
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {assetList.map((asset) => {
            const StatusIcon = statusConfig[asset.status].icon;
            return (
              <motion.div
                key={asset.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  onClick={() => {
                    if (onSelect) {
                      onSelect(asset.id);
                    } else {
                      router.push(`/dashboard/cmms/assets/${asset.id}`);
                    }
                  }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{asset.name}</h3>
                        <p className="text-xs text-muted-foreground">{asset.assetType}</p>
                      </div>
                      <StatusIcon className={`h-5 w-5 shrink-0 ${statusConfig[asset.status].color.split(' ')[1]}`} />
                    </div>

                    <div className="space-y-1 text-sm py-2 border-t border-b">
                      {asset.serialNumber && (
                        <p className="text-xs text-muted-foreground">
                          S/N: <span className="font-mono text-gray-700">{asset.serialNumber}</span>
                        </p>
                      )}
                      {asset.location && (
                        <p className="text-xs text-muted-foreground">
                          Location: <span className="text-gray-700">{asset.location}</span>
                        </p>
                      )}
                      {asset.manufacturer && (
                        <p className="text-xs text-muted-foreground">
                          Mfg: <span className="text-gray-700">{asset.manufacturer}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className={statusConfig[asset.status].color}>
                        {asset.status}
                      </Badge>
                      <Badge className={criticalityConfig[asset.criticality]}>
                        {asset.criticality}
                      </Badge>
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
