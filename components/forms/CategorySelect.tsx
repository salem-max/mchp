"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  suggestedCategory?: string;
  className?: string;
}

const categories = [
  "Maintenance",
  "Plumbing",
  "Electrical",
  "AC Repair",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Appliance Repair",
  "Landscaping",
  "Other",
];

export default function CategorySelect({
  value,
  onChange,
  suggestedCategory,
  className,
}: CategorySelectProps) {
  return (
    <div className={className}>
      <Label htmlFor="category">Category</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              <div className="flex items-center gap-2">
                {category}
                {suggestedCategory === category && (
                  <Badge variant="secondary" className="text-xs">
                    AI Suggested
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
