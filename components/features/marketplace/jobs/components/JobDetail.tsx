"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  MessageSquare,
  Phone,
  Star,
  Clock,
  Wrench,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import JobStatusBadge from "@/components/features/dashboard/Technician/components/jobstatusbadge";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow, format } from "date-fns";

type JobStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";

interface JobDetailProps {
  jobId: string;
  role?: "CUSTOMER" | "TECHNICIAN";
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: JobStatus;
  createdAt: Date;
  scheduledDate?: Date;
  customer: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    phone?: string;
    email?: string;
  };
  technician?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    phone?: string;
    email?: string;
  };
  skills: string[];
  attachments: string[];
  notes?: string;
}

export default function JobDetail({ jobId, role = "CUSTOMER" }: JobDetailProps) {
  const router = useRouter();
  const [acting, setActing] = useState(false);

  // Get job details
  const { data: job, isLoading, error } = trpc.job.details.useQuery({ jobId });

  // Mutations for job actions
  const startJob = trpc.technician.startJob.useMutation({
    onSuccess: () => {
      toast.success("Job started successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to start job");
    }
  });

  const completeJob = trpc.technician.completeJob.useMutation({
    onSuccess: () => {
      toast.success("Job completed successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to complete job");
    }
  });

  const cancelJob = trpc.customer.cancelJob.useMutation({
    onSuccess: () => {
      toast.success("Job cancelled successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to cancel job");
    }
  });

  const handleStartJob = async () => {
    if (!job) return;
    setActing(true);
    try {
      await startJob.mutateAsync({ jobId: job.id });
    } finally {
      setActing(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!job) return;
    setActing(true);
    try {
      await completeJob.mutateAsync({ jobId: job.id });
    } finally {
      setActing(false);
    }
  };

  const handleCancelJob = async () => {
    if (!job) return;
    setActing(true);
    try {
      await cancelJob.mutateAsync({ jobId: job.id });
    } finally {
      setActing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Job Not Found</h3>
        <p className="text-muted-foreground mb-4">
          The job you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const budgetRange = job.budget.min === job.budget.max
    ? `$${job.budget.min}`
    : `$${job.budget.min} - $${job.budget.max}`;

  const otherParty = role === "CUSTOMER" ? job.technician : job.customer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">
            Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>{job.category} • {job.urgency} priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{job.description}</p>

              {job.notes && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {job.notes}
                  </p>
                </div>
              )}

              {/* Skills Required */}
              {job.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Images */}
          {job.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {job.attachments.map((attachment, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(attachment, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule Information */}
          {job.scheduledDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(job.scheduledDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(job.scheduledDate), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{budgetRange}</p>
                  <p className="text-sm text-muted-foreground">{job.budget.currency}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{job.location.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Party Info */}
          {otherParty && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {role === "CUSTOMER" ? "Assigned Technician" : "Customer"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherParty.avatar} />
                    <AvatarFallback>
                      {otherParty.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{otherParty.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {otherParty.rating} ({otherParty.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  {otherParty.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {role === "TECHNICIAN" && job.status === "assigned" && (
                  <Button
                    className="w-full"
                    onClick={handleStartJob}
                    disabled={acting || startJob.isPending}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {startJob.isPending ? "Starting..." : "Start Job"}
                  </Button>
                )}

                {role === "TECHNICIAN" && job.status === "in_progress" && (
                  <Button
                    className="w-full"
                    onClick={handleCompleteJob}
                    disabled={acting || completeJob.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {completeJob.isPending ? "Completing..." : "Complete Job"}
                  </Button>
                )}

                {role === "CUSTOMER" && job.status === "open" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelJob}
                    disabled={acting || cancelJob.isPending}
                  >
                    {cancelJob.isPending ? "Cancelling..." : "Cancel Job"}
                  </Button>
                )}

                {role === "CUSTOMER" && job.status === "completed" && (
                  <Button className="w-full" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    Leave Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
