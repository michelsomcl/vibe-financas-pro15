
import React from 'react';
import { Input } from "@/components/ui/input";

interface FilterConfig {
  key: string;
  placeholder: string;
  value: string;
}

interface TableFiltersProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
}

export default function TableFilters({ filters, filterConfigs, onFilterChange }: TableFiltersProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {filterConfigs.map((config) => (
        <Input
          key={config.key}
          placeholder={config.placeholder}
          value={filters[config.key]}
          onChange={(e) => onFilterChange(config.key, e.target.value)}
        />
      ))}
    </div>
  );
}
