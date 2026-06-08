"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suggestedBudget?: number;
  className?: string;
}

export default function BudgetSlider({
  value,
  onChange,
  min = 10,
  max = 200,
  suggestedBudget,
  className,
}: BudgetSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="budget">Budget (RM)</Label>
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={5}
          className="flex-1"
        />
        <Input
          id="budget"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-20"
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>RM {min}</span>
        {suggestedBudget && (
          <span className="text-primary">Suggested: RM {suggestedBudget}</span>
        )}
        <span>RM {max}</span>
      </div>
    </div>
  );
}