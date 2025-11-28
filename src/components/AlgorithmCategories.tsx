import React from 'react';
import { ChevronRight, Code, Brain, BarChart3, Image, Music, FileText, Database, Network, Cpu } from 'lucide-react';
import { AlgorithmCategory } from '@/types/algorithm';
import { cn } from '@/lib/utils';

interface AlgorithmCategoriesProps {
  categories: AlgorithmCategory[];
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'machine-learning': <Brain className="w-5 h-5" />,
  'data-analysis': <BarChart3 className="w-5 h-5" />,
  'computer-vision': <Image className="w-5 h-5" />,
  'natural-language': <FileText className="w-5 h-5" />,
  'audio-processing': <Music className="w-5 h-5" />,
  'database': <Database className="w-5 h-5" />,
  'network': <Network className="w-5 h-5" />,
  'optimization': <Cpu className="w-5 h-5" />,
  'general': <Code className="w-5 h-5" />,
};

export default function AlgorithmCategories({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  className 
}: AlgorithmCategoriesProps) {
  const getIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || <Code className="w-5 h-5" />;
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          算法分类
        </h3>
      </div>
      
      <div className="p-2">
        <button
          onClick={() => onCategorySelect('')}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
            selectedCategory === ''
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <span className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            全部算法
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {categories.reduce((sum, cat) => sum + cat.algorithmCount, 0)}
          </span>
        </button>

        {categories.map((category) => (
          <div key={category.id} className="mt-1">
            <button
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                selectedCategory === category.id
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <span className="flex items-center gap-2">
                {getIcon(category.id)}
                {category.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {category.algorithmCount}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {category.children.map((subCategory) => (
                  <button
                    key={subCategory.id}
                    onClick={() => onCategorySelect(subCategory.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors",
                      selectedCategory === subCategory.id
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {getIcon(subCategory.id)}
                      {subCategory.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {subCategory.algorithmCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>总算法数:</span>
            <span className="font-medium">{categories.reduce((sum, cat) => sum + cat.algorithmCount, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>分类数:</span>
            <span className="font-medium">{categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span>免费算法:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {categories.reduce((sum, cat) => sum + Math.floor(cat.algorithmCount * 0.3), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}