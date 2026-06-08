"use client"

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import TechnicianCard from "./TechnicianCard";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

interface Technician {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  skills: string[];
  verified: boolean;
  isAvailable: boolean;
  hourlyRate?: number;
  location?: string;
  completedJobs: number;
}

interface TechnicianListProps {
  onSelect?: (id: string) => void;
  filterBySkills?: string[];
  showFilters?: boolean;
}

export default function TechnicianList({ onSelect, filterBySkills = [], showFilters = true }: TechnicianListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  // Get technicians list
  const { data: techniciansData, isLoading, error } = trpc.customer.searchTechnicians.useQuery({
    search,
    availableOnly,
    skills: filterBySkills,
  });

  const technicians = techniciansData || [];

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Unable to Load Technicians</h3>
        <p className="text-muted-foreground mb-4">Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-muted/50 p-4 rounded-lg"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or skill..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Switch
              id="avail"
              checked={availableOnly}
              onCheckedChange={setAvailableOnly}
            />
            <Label htmlFor="avail" className="text-sm cursor-pointer">
              Available only
            </Label>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i: any) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No technicians found</p>
          <p className="text-sm">
            {search || availableOnly
              ? "Try adjusting your filters"
              : "No technicians are currently available"}
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {technicians.map((technician) => (
            <motion.div
              key={technician.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <TechnicianCard
                id={technician.id}
                name={technician.name}
                email={technician.email}
                avatarUrl={technician.avatar}
                skills={technician.skills}
                avgRating={technician.rating}
                isAvailable={technician.isAvailable}
                verified={technician.verified}
                hourlyRate={technician.hourlyRate}
                location={technician.location}
                onSelect={onSelect}
                onMessage={() =>
                  router.push(
                    `/dashboard/customer/messages/${technician.id}`
                  )
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
