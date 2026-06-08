"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  Wrench,
  MapPin,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AssetDetailProps {
  assetId: string;
}

export default function AssetDetail({ assetId }: AssetDetailProps) {
  const router = useRouter();

  // Get asset details
  const { data: asset, isLoading, error } = trpc.cmms.getAssetDetail.useQuery({
    assetId
  });

  // Get maintenance history
  const { data: maintenanceHistory } = trpc.cmms.getAssetMaintenanceHistory.useQuery({
    assetId
  });

  // Get work orders for asset
  const { data: workOrders } = trpc.cmms.getAssetWorkOrders.useQuery({
    assetId
  });

  // Delete asset mutation
  const deleteAsset = trpc.cmms.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      router.push("/dashboard/cmms/assets");
    },
    onError: () => {
      toast.error("Failed to delete asset");
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Asset Not Found</h3>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const statusColors = {
    operational: "bg-green-100 text-green-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    retired: "bg-gray-100 text-gray-800"
  };

  const criticalityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Title and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{asset.name}</h1>
          <p className="text-muted-foreground">{asset.assetType}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/cmms/assets/${assetId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this asset?")) {
                deleteAsset.mutate({ assetId });
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {asset.status !== "operational" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This asset is currently in <strong>{asset.status}</strong> status.
            {asset.status === "maintenance" && " Maintenance is required."}
            {asset.status === "failed" && " Action required immediately."}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge className={statusColors[asset.status]}>
              {asset.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Criticality</p>
            <Badge className={criticalityColors[asset.criticality]}>
              {asset.criticality}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Last Maintenance</p>
            <p className="font-semibold text-sm">
              {asset.lastMaintenance
                ? formatDistanceToNow(new Date(asset.lastMaintenance), { addSuffix: true })
                : "Never"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Next Maintenance</p>
            <p className="font-semibold text-sm">
              {asset.nextMaintenance
                ? format(new Date(asset.nextMaintenance), "MMM d, yyyy")
                : "Not scheduled"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {asset.serialNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-mono text-sm">{asset.serialNumber}</p>
                  </div>
                )}
                {asset.manufacturer && (
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="text-sm">{asset.manufacturer}</p>
                  </div>
                )}
                {asset.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="text-sm">{asset.model}</p>
                  </div>
                )}
                {asset.installDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Install Date</p>
                    <p className="text-sm">{format(new Date(asset.installDate), "MMM d, yyyy")}</p>
                  </div>
                )}
                {asset.location && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="text-sm">{asset.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance History Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                {maintenanceHistory?.length || 0} maintenance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceHistory && maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceHistory.map((record) => (
                    <div key={record.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{record.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(record.date), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge>{record.status}</Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No maintenance history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders">
          <Card>
            <CardHeader>
              <CardTitle>Related Work Orders</CardTitle>
              <CardDescription>
                {workOrders?.length || 0} work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workOrders && workOrders.length > 0 ? (
                <div className="space-y-2">
                  {workOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => router.push(`/dashboard/cmms/work-orders/${wo.id}`)}
                    >
                      <div>
                        <p className="font-medium text-sm">{wo.title}</p>
                        <p className="text-xs text-muted-foreground">#{wo.id}</p>
                      </div>
                      <Badge>{wo.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No work orders</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
