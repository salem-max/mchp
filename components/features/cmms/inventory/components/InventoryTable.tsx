"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  partName: string;
  description?: string;
  quantity: number;
  threshold: number;
  supplier?: string;
  cost?: number;
  location?: string;
}

export default function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  const load = () => {
    setLoading(true);
    fetch("/api/inventory", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? data))
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (item: InventoryItem) => {
    setEditId(item.id);
    setEditData({ quantity: item.quantity, threshold: item.threshold, cost: item.cost });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated");
      setEditId(null);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE", credentials: "include" });
      setItems((prev) => prev.filter((i: any) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = items.filter((i: any) =>
    i.partName.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter((i: any) => i.quantity <= i.threshold).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search parts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" /> {lowStockCount} low stock
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Cost (RM)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><td colSpan={7} className="text-center py-10 text-gray-500">No items found.</td></TableRow>
              ) : filtered.map((item) => {
                const isLow = item.quantity <= item.threshold;
                const isEditing = editId === item.id;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b transition-colors ${isLow ? "bg-red-50/50" : ""}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        {item.partName}
                      </div>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{item.supplier ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{item.location ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" className="w-20 h-7 text-right text-sm" value={editData.quantity ?? ""} onChange={(e) => setEditData(p => ({ ...p, quantity: Number(e.target.value) }))} min={0} />
                      ) : (
                        <span className={isLow ? "text-red-600 font-semibold" : ""}>{item.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" className="w-20 h-7 text-right text-sm" value={editData.threshold ?? ""} onChange={(e) => setEditData(p => ({ ...p, threshold: Number(e.target.value) }))} min={0} />
                      ) : item.threshold}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" className="w-24 h-7 text-right text-sm" value={editData.cost ?? ""} onChange={(e) => setEditData(p => ({ ...p, cost: Number(e.target.value) }))} min={0} step="0.01" />
                      ) : item.cost != null ? item.cost.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => saveEdit(item.id)}><Check className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400" onClick={() => setEditId(null)}><X className="w-3.5 h-3.5" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
