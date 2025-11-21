import React, { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, Download, TrendingUp, Star, ShoppingCart } from 'lucide-react';
import AlgorithmCard from '@/components/AlgorithmCard';
import AlgorithmFilterPanel from '@/components/AlgorithmFilterPanel';
import AlgorithmCategories from '@/components/AlgorithmCategories';
import { useAlgorithmStore } from '@/stores/algorithmStore';
import { Algorithm } from '@/types/algorithm';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function AlgorithmMarketplace() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    algorithms,
    categories,
    featuredAlgorithms,
    trendingAlgorithms,
    loading,
    error,
    filter,
    currentPage,
    totalPages,
    fetchAlgorithms,
    fetchCategories,
    fetchFeaturedAlgorithms,
    fetchTrendingAlgorithms,
    updateFilter,
    searchAlgorithms,
  } = useAlgorithmStore();

  useEffect(() => {
    fetchAlgorithms();
    fetchCategories();
    fetchFeaturedAlgorithms();
    fetchTrendingAlgorithms();
  }, []);

  useEffect(() => {
    fetchAlgorithms(currentPage);
  }, [currentPage, filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchAlgorithms(searchQuery);
    } else {
      fetchAlgorithms();
    }
  };

  const handleTryNow = (algorithm: Algorithm) => {
    navigate(`/algorithms/${algorithm.id}/run`);
  };

  const handleSubscribe = (algorithm: Algorithm) => {
    navigate(`/algorithms/${algorithm.id}/subscribe`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchAlgorithms(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                算法市场
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                发现、试用和订阅高质量的算法解决方案
              </p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索算法..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </form>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Filter className="w-4 h-4" />
                筛选
              </button>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <AlgorithmCategories 
              categories={categories}
              selectedCategory={filter.category}
              onCategorySelect={(category) => updateFilter({ category })}
            />
            
            {showFilters && (
              <div className="mt-6">
                <AlgorithmFilterPanel 
                  filter={filter}
                  onFilterChange={updateFilter}
                  onReset={() => updateFilter({})}
                />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Section */}
            {featuredAlgorithms.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    精选算法
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredAlgorithms.slice(0, 3).map((algorithm) => (
                    <AlgorithmCard
                      key={algorithm.id}
                      algorithm={algorithm}
                      onTryNow={handleTryNow}
                      onSubscribe={handleSubscribe}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Section */}
            {trendingAlgorithms.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    热门算法
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingAlgorithms.slice(0, 3).map((algorithm) => (
                    <AlgorithmCard
                      key={algorithm.id}
                      algorithm={algorithm}
                      onTryNow={handleTryNow}
                      onSubscribe={handleSubscribe}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Algorithms */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  所有算法
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  共 {useAlgorithmStore.getState().totalAlgorithms} 个算法
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
                  <button
                    onClick={() => fetchAlgorithms(currentPage)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    重试
                  </button>
                </div>
              ) : algorithms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">没有找到匹配的算法</div>
                  <button
                    onClick={() => updateFilter({})}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    清除筛选条件
                  </button>
                </div>
              ) : (
                <div className={cn(
                  "gap-6",
                  viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
                )}>
                  {algorithms.map((algorithm) => (
                    <AlgorithmCard
                      key={algorithm.id}
                      algorithm={algorithm}
                      onTryNow={handleTryNow}
                      onSubscribe={handleSubscribe}
                      className={viewMode === 'list' ? 'flex' : ''}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-md",
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}