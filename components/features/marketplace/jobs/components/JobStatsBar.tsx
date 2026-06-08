"use client"

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "text-yellow-600 bg-yellow-50",
  ASSIGNED: "text-blue-600 bg-blue-50",
  IN_PROGRESS: "text-purple-600 bg-purple-50",
  COMPLETED: "text-green-600 bg-green-50",
  DISPUTED: "text-red-600 bg-red-50",
};

export default function JobStatsBar() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const jobs: { status: string }[] = data.jobs ?? data;
        const counts: Record<string, number> = {};
        jobs.forEach((j) => { counts[j.status] = (counts[j.status] ?? 0) + 1; });
        setStats(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {Object.entries(STATUS_COLORS).map(([status, cls]) => (
        <Card key={status}>
          <CardContent className={`p-4 rounded-xl ${cls}`}>
            <p className="text-2xl font-bold">{stats[status] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5">{status.replace("_", " ")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
