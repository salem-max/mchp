"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function CustomerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();

  const jobId = params.id as string;

  const { data: job, isLoading } = trpc.jobs.byId.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  );

  const acceptBidMutation = trpc.jobs.acceptBid.useMutation({
    onSuccess: () => {
      toast.success("Bid accepted! The technician has been notified.");
      utils.jobs.byId.invalidate({ id: jobId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept bid");
    },
  });

  const updateStatusMutation = trpc.jobs.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      if (variables.status === "COMPLETED") {
        toast.success("Job marked as completed!");
      } else if (variables.status === "DISPUTED") {
        toast.success("Job cancelled successfully");
      }
      utils.jobs.byId.invalidate({ id: jobId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job");
    },
  });

  const handleAcceptBid = (technicianId: string, amount: number) => {
    acceptBidMutation.mutate({
      jobId,
      technicianId,
      agreedAmount: amount,
    });
  };

  const handleCancelJob = () => {
    if (!confirm("Are you sure you want to cancel this job?")) return;
    updateStatusMutation.mutate({ jobId, status: "DISPUTED" });
  };

  const handleMarkCompleted = () => {
    if (!confirm("Mark this job as completed?")) return;
    updateStatusMutation.mutate({ jobId, status: "COMPLETED" });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      OPEN: { variant: "default", label: "Open" },
      ASSIGNED: { variant: "secondary", label: "Assigned" },
      IN_PROGRESS: { variant: "secondary", label: "In Progress" },
      COMPLETED: { variant: "outline", label: "Completed" },
      DISPUTED: { variant: "destructive", label: "Disputed" },
    };
    const { variant, label } = config[status] || { variant: "default", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const location = job.location as { address?: string; lat?: number; lng?: number } | null;
  const isActionLoading = acceptBidMutation.isPending || updateStatusMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => router.push("/dashboard/customer/jobs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            {getStatusBadge(job.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{job.description}</p>

              <div className="grid grid-cols-2 gap-4">
                {location?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{location.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    RM {(job.budget / 100).toFixed(0)}
                  </span>
                </div>
                {job.scheduledTime && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(job.scheduledTime).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{job.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bids Section - Only show for open jobs */}
          {job.status === "OPEN" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Technician Bids</span>
                  <Badge variant="secondary">Waiting for bids</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No bids yet. Technicians will start bidding soon!</p>
                  <p className="text-sm mt-2">
                    When a technician bids, you can accept their offer here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Technician - Show when job is accepted/in progress */}
          {job.technician && job.status !== "OPEN" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Technician
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {job.technician.name?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{job.technician.name || 'Technician'}</p>
                      {job.technician.phone && (
                        <p className="text-sm text-muted-foreground">{job.technician.phone}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === "OPEN" && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelJob}
                  disabled={isActionLoading}
                >
                  {isActionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Job
                </Button>
              )}

              {(job.status === "ASSIGNED" || job.status === "IN_PROGRESS") && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleMarkCompleted}
                    disabled={isActionLoading}
                  >
                    {isActionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isActionLoading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </>
              )}

              {job.status === "COMPLETED" && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Job Completed</p>
                  <p className="text-sm text-muted-foreground">Thank you for using Malaysia Co (Maintenance Services)!</p>
                </div>
              )}

              {job.status === "DISPUTED" && (
                <div className="text-center py-4">
                  <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <p className="font-medium">Job Cancelled/Disputed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-lg">
                <span>Budget</span>
                <span className="font-bold">RM {(job.budget / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
