"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

interface Customer {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  totalSpent: number;
  status: "active" | "inactive";
}

interface CustomerListProps {
  onSelect?: (id: string) => void;
}

export default function CustomerList({ onSelect }: CustomerListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Get customers (for technicians)
  const { data: customers, isLoading, error } = trpc.technician.getCustomers.useQuery({
    search
  });

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium mb-2">Unable to Load Customers</h3>
        <p className="text-muted-foreground mb-4">Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const customerList = customers || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search customers by name..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i: any) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : customerList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No customers found</p>
          <p className="text-sm">
            {search ? "Try adjusting your search" : "Start accepting jobs to build your customer base"}
          </p>
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
          {customerList.map((customer) => (
            <motion.div
              key={customer.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback>
                        {customer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge
                      variant={
                        customer.status === "active" ? "default" : "outline"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.email}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm py-2 border-t border-b">
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold">
                        {customer.rating.toFixed(1)} ⭐
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jobs</p>
                      <p className="font-semibold">{customer.completedJobs}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">RM {customer.totalSpent}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (onSelect) {
                        onSelect(customer.id);
                      } else {
                        router.push(`/dashboard/technician/customers/${customer.id}`);
                      }
                    }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
