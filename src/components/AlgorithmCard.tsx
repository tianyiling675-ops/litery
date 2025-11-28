import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Download, Clock, DollarSign, Users, Code, Play, ShoppingCart } from 'lucide-react';
import { Algorithm } from '@/types/algorithm';
import { cn } from '@/lib/utils';

interface AlgorithmCardProps {
  algorithm: Algorithm;
  onTryNow?: (algorithm: Algorithm) => void;
  onSubscribe?: (algorithm: Algorithm) => void;
  className?: string;
}

export default function AlgorithmCard({ 
  algorithm, 
  onTryNow, 
  onSubscribe, 
  className 
}: AlgorithmCardProps) {
  const handleTryNow = (e: React.MouseEvent) => {
    e.preventDefault();
    onTryNow?.(algorithm);
  };

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubscribe?.(algorithm);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency || 'CNY',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700",
      className
    )}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {algorithm.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by {algorithm.author.name}
            </p>
          </div>
          {algorithm.isFeatured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              精选
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(algorithm.rating)
                    ? "text-yellow-400 fill-current"
                    : i < algorithm.rating
                    ? "text-yellow-400 fill-current opacity-50"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {algorithm.rating.toFixed(1)} ({formatNumber(algorithm.reviewCount)})
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {algorithm.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {algorithm.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
          {algorithm.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{algorithm.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{formatNumber(algorithm.downloadCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{algorithm.executionTime}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{formatNumber(algorithm.reviewCount)}</span>
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-1 mb-4">
          {algorithm.supportedLanguages.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              <Code className="w-3 h-3 mr-1" />
              {lang}
            </span>
          ))}
          {algorithm.supportedLanguages.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{algorithm.supportedLanguages.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center">
            {algorithm.isFree ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                免费
              </span>
            ) : algorithm.isSubscribed ? (
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                已订阅
              </span>
            ) : (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(algorithm.price, algorithm.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {algorithm.isFree || algorithm.isSubscribed ? (
              <button
                onClick={handleTryNow}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Play className="w-4 h-4 mr-1" />
                运行
              </button>
            ) : (
              <>
                <button
                  onClick={handleTryNow}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Play className="w-4 h-4 mr-1" />
                  试用
                </button>
                <button
                  onClick={handleSubscribe}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  订阅
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}