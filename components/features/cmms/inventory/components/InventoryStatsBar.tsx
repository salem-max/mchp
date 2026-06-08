"use client"

import { useEffect, useState } from "react";
import { Package, AlertTriangle, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total: number;
  lowStock: number;
  totalValue: number;
  outOfStock: number;
}

export default function InventoryStatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/inventory", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const items: { quantity: number; threshold: number; cost?: number }[] = data.items ?? data;
        setStats({
          total: items.length,
          lowStock: items.filter((i: any) => i.quantity > 0 && i.quantity <= i.threshold).length,
          outOfStock: items.filter((i: any) => i.quantity === 0).length,
          totalValue: items.reduce((sum, i) => sum + (i.quantity * (i.cost ?? 0)), 0),
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Items", value: stats?.total ?? 0, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Low Stock", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50" },
    { label: "Out of Stock", value: stats?.outOfStock ?? 0, icon: TrendingDown, color: "text-red-600 bg-red-50" },
    { label: "Total Value (RM)", value: stats ? `${stats.totalValue.toFixed(2)}` : "0.00", icon: DollarSign, color: "text-green-600 bg-green-50" },
  ];

  if (!stats) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className={`p-4 flex items-center gap-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 shrink-0" />
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs font-medium mt-1">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
