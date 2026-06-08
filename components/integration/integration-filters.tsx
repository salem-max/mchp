'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import type { IntegrationCategory } from '@/lib/integrations';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'payment', label: 'Payment' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'banking', label: 'Banking' },
  { value: 'business', label: 'Business' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'crm', label: 'CRM' },
  { value: 'erp', label: 'ERP' },
  { value: 'development', label: 'Dev Tools' },
] as const;

type CategoryValue = (typeof categories)[number]['value'];
type ActiveCategory = IntegrationCategory | 'all';

export function IntegrationFilters({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: ActiveCategory;
  onCategoryChange: (category: ActiveCategory) => void;
}) {
  const handleTabChange = (value: string) => {
    // Ensure the value is a valid ActiveCategory
    if (categories.some((cat) => cat.value === value)) {
      onCategoryChange(value as ActiveCategory);
    } else {
      console.warn(`Invalid category value: ${value}`);
      onCategoryChange('all');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search integrations..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search integrations"
        />
      </div>

      <Tabs value={activeCategory} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start bg-transparent">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}