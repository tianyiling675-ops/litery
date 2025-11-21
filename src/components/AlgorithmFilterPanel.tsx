import React from 'react';
import { Filter, X, DollarSign, Star, Code, RefreshCw } from 'lucide-react';
import { AlgorithmFilter } from '@/types/algorithm';
import { cn } from '@/lib/utils';

interface AlgorithmFilterPanelProps {
  filter: AlgorithmFilter;
  onFilterChange: (updates: Partial<AlgorithmFilter>) => void;
  onReset: () => void;
  className?: string;
}

export default function AlgorithmFilterPanel({ 
  filter, 
  onFilterChange, 
  onReset, 
  className 
}: AlgorithmFilterPanelProps) {
  const priceRanges = [
    { label: '免费', min: 0, max: 0 },
    { label: '¥0 - ¥100', min: 0, max: 100 },
    { label: '¥100 - ¥500', min: 100, max: 500 },
    { label: '¥500 - ¥1000', min: 500, max: 1000 },
    { label: '¥1000+', min: 1000, max: Infinity },
  ];

  const ratings = [
    { label: '4星以上', value: 4 },
    { label: '3星以上', value: 3 },
    { label: '2星以上', value: 2 },
    { label: '1星以上', value: 1 },
  ];

  const languages = [
    'Python', 'JavaScript', 'Java', 'C++', 'R', 'Go', 'Rust', 'TypeScript'
  ];

  const sortOptions = [
    { label: '最新发布', value: 'createdAt' },
    { label: '名称', value: 'name' },
    { label: '价格', value: 'price' },
    { label: '评分', value: 'rating' },
    { label: '下载量', value: 'downloads' },
  ];

  const handlePriceRangeChange = (range: typeof priceRanges[0]) => {
    if (range.min === 0 && range.max === 0) {
      onFilterChange({ isFree: true, priceRange: undefined });
    } else {
      onFilterChange({ 
        priceRange: [range.min, range.max === Infinity ? 999999 : range.max] as [number, number], 
        isFree: false 
      });
    }
  };

  const isPriceRangeActive = (range: typeof priceRanges[0]) => {
    if (range.min === 0 && range.max === 0) {
      return filter.isFree === true;
    }
    return filter.priceRange?.[0] === range.min && 
           (filter.priceRange?.[1] === (range.max === Infinity ? 999999 : range.max));
  };

  const hasActiveFilters = Object.keys(filter).some(key => {
    if (key === 'sortBy' || key === 'sortOrder') return false;
    const value = filter[key as keyof AlgorithmFilter];
    return value !== undefined && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              筛选条件
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            价格范围
          </h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePriceRangeChange(range)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  isPriceRangeActive(range)
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            最低评分
          </h4>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                onClick={() => onFilterChange({ rating: filter.rating === rating.value ? undefined : rating.value })}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  filter.rating === rating.value
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < rating.value
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span>{rating.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Programming Languages */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" />
            编程语言
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {languages.map((language) => (
              <label key={language} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.language?.includes(language) || false}
                  onChange={(e) => {
                    const currentLanguages = filter.language || [];
                    if (e.target.checked) {
                      onFilterChange({ language: [...currentLanguages, language] });
                    } else {
                      onFilterChange({ 
                        language: currentLanguages.filter(lang => lang !== language) 
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{language}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            排序方式
          </h4>
          <select
            value={filter.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onFilterChange({ sortOrder: 'asc' })}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs rounded-md transition-colors",
                filter.sortOrder === 'asc'
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              )}
            >
              升序
            </button>
            <button
              onClick={() => onFilterChange({ sortOrder: 'desc' })}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs rounded-md transition-colors",
                filter.sortOrder === 'desc' || !filter.sortOrder
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              )}
            >
              降序
            </button>
          </div>
        </div>

        {/* Free Only */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.isFree === true}
              onChange={(e) => onFilterChange({ isFree: e.target.checked ? true : undefined })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">仅显示免费算法</span>
          </label>
        </div>

        {/* Featured Only */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.isFeatured === true}
              onChange={(e) => onFilterChange({ isFeatured: e.target.checked ? true : undefined })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">仅显示精选算法</span>
          </label>
        </div>
      </div>
    </div>
  );
}