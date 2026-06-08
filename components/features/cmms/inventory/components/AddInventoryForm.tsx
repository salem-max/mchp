"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AddInventoryFormProps {
  onSuccess?: () => void;
}

export default function AddInventoryForm({ onSuccess }: AddInventoryFormProps) {
  const [form, setForm] = useState({ partName: "", description: "", quantity: "", threshold: "", supplier: "", cost: "", location: "" });
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partName || !form.quantity || !form.threshold) {
      toast.error("Part name, quantity and threshold are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          partName: form.partName,
          description: form.description || undefined,
          quantity: Number(form.quantity),
          threshold: Number(form.threshold),
          supplier: form.supplier || undefined,
          cost: form.cost ? Number(form.cost) : undefined,
          location: form.location || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item added!");
      setForm({ partName: "", description: "", quantity: "", threshold: "", supplier: "", cost: "", location: "" });
      onSuccess?.();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Add Inventory Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Part Name *</Label>
              <Input placeholder="e.g. Filter Cartridge" value={form.partName} onChange={set("partName")} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Optional description..." value={form.description} onChange={set("description")} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity *</Label>
              <Input type="number" placeholder="0" value={form.quantity} onChange={set("quantity")} min={0} required />
            </div>
            <div className="space-y-1.5">
              <Label>Low Stock Threshold *</Label>
              <Input type="number" placeholder="5" value={form.threshold} onChange={set("threshold")} min={0} required />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input placeholder="Supplier name" value={form.supplier} onChange={set("supplier")} />
            </div>
            <div className="space-y-1.5">
              <Label>Cost per unit (RM)</Label>
              <Input type="number" placeholder="0.00" value={form.cost} onChange={set("cost")} min={0} step="0.01" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Storage Location</Label>
              <Input placeholder="e.g. Warehouse A, Shelf 3" value={form.location} onChange={set("location")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
