"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Calendar, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery(
    { customerId: user?.id },
    { enabled: !!user?.id }
  );

  const filteredJobs = jobs.filter((job: { status: string }) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return job.status === "OPEN";
    if (activeTab === "in_progress") return ["ASSIGNED", "IN_PROGRESS"].includes(job.status);
    if (activeTab === "completed") return job.status === "COMPLETED";
    return true;
  });

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your posted jobs and track progress
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/customer/post-job")}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Open ({jobs.filter((j: { status: string }) => j.status === "OPEN").length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({jobs.filter((j: { status: string }) => ["ASSIGNED", "IN_PROGRESS"].includes(j.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({jobs.filter((j: { status: string }) => j.status === "COMPLETED").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === "all" 
                    ? "You haven't posted any jobs yet."
                    : "No jobs found in this category."}
                </p>
                <Button onClick={() => router.push("/dashboard/customer/post-job")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job: { 
                id: string; 
                title: string; 
                description: string; 
                category: string; 
                budget: number; 
                status: string; 
                location: { address?: string } | null;
                createdAt: string | Date; 
                scheduledTime?: string | Date | null;
                technician?: { name?: string } | null;
              }) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/customer/jobs/${job.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{job.category}</Badge>
                          {getStatusBadge(job.status)}
                        </div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {job.location?.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location.address}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        RM {(job.budget / 100).toFixed(0)}
                      </span>
                      {job.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.scheduledTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    {job.technician ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium">{job.technician.name || 'Technician'}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Waiting for technician bids...
                      </span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
