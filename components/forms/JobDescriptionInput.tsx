"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestion?: (category: string, budget: number) => void;
  className?: string;
}

export default function JobDescriptionInput({
  value,
  onChange,
  onSuggestion,
  className,
}: JobDescriptionInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ category: string; budget: number } | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length > 10) {
        setIsLoading(true);
        try {
          const res = await fetch("/api/ai/suggest-budget", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: value }),
          });

          if (res.ok) {
            const data = await res.json();
            setSuggestion(data);
            onSuggestion?.(data.category, data.budget);
          }
        } catch (error) {
          console.error("Failed to get AI suggestion:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestion(null);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [value, onSuggestion]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="description">Job Description</Label>
      <Textarea
        id="description"
        placeholder="Describe the job you need done..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Getting AI suggestions...
        </div>
      )}
      {suggestion && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Suggested: {suggestion.category}</Badge>
          <Badge variant="outline">Budget: RM {suggestion.budget}</Badge>
        </div>
      )}
    </div>
  );
}