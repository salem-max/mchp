"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/features/dashboard/Technician/components/jobcard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

type JobStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";

interface Job {
  id: string;
  title: string;
  description: string;
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
  };
  category: string;
  skills: string[];
  attachments?: string[];
}

interface JobListProps {
  role?: "CUSTOMER" | "TECHNICIAN";
  showCreate?: boolean;
  filters?: {
    category?: string;
    location?: string;
    budgetRange?: [number, number];
    urgency?: string;
  };
}

export default function JobList({ role = "CUSTOMER", showCreate = false, filters }: JobListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Get jobs based on role
  const { data: jobsData, isLoading } = role === "TECHNICIAN"
    ? trpc.technician.availableJobs.useQuery({
        search,
        status: statusFilter !== "ALL" ? statusFilter as JobStatus : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        ...filters
      })
    : trpc.customer.myJobs.useQuery({
        search,
        status: statusFilter !== "ALL" ? statusFilter as JobStatus : undefined,
        ...filters
      });

  const jobs = jobsData || [];

  const filtered = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                       job.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || job.status === statusFilter;
    const matchCategory = categoryFilter === "ALL" || job.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="carpentry">Carpentry</SelectItem>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="landscaping">Landscaping</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {showCreate && role === "CUSTOMER" && (
          <Button onClick={() => router.push("/dashboard/customer/jobs/new")} className="gap-2">
            <Plus className="w-4 h-4" /> New Job
          </Button>
        )}
      </div>

      {/* Job List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i: any) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-500 mb-4">
            {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
              ? "No jobs match your filters."
              : role === "TECHNICIAN"
                ? "No available jobs in your area."
                : "You haven't posted any jobs yet."
            }
          </div>
          {role === "CUSTOMER" && showCreate && (
            <Button onClick={() => router.push("/dashboard/customer/jobs/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
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
          {filtered.map((job) => (
            <motion.div
              key={job.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <JobCard
                job={job}
                showActions={role === "TECHNICIAN"}
                compact={false}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
