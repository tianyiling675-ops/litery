import { create } from 'zustand';
import { Algorithm, AlgorithmFilter, AlgorithmCategory, Task } from '@/types/algorithm';

interface AlgorithmStore {
  algorithms: Algorithm[];
  categories: AlgorithmCategory[];
  featuredAlgorithms: Algorithm[];
  trendingAlgorithms: Algorithm[];
  recentTasks: Task[];
  loading: boolean;
  error: string | null;
  filter: AlgorithmFilter;
  currentPage: number;
  totalPages: number;
  totalAlgorithms: number;
  
  // Actions
  setAlgorithms: (algorithms: Algorithm[]) => void;
  setCategories: (categories: AlgorithmCategory[]) => void;
  setFeaturedAlgorithms: (algorithms: Algorithm[]) => void;
  setTrendingAlgorithms: (algorithms: Algorithm[]) => void;
  setRecentTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: AlgorithmFilter) => void;
  setPagination: (page: number, totalPages: number, total: number) => void;
  
  // Filter actions
  updateFilter: (updates: Partial<AlgorithmFilter>) => void;
  resetFilter: () => void;
  
  // Algorithm actions
  addAlgorithm: (algorithm: Algorithm) => void;
  updateAlgorithm: (id: string, updates: Partial<Algorithm>) => void;
  removeAlgorithm: (id: string) => void;
  subscribeAlgorithm: (algorithmId: string, subscriptionEndDate: string) => void;
  
  // Async actions
  fetchAlgorithms: (page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFeaturedAlgorithms: () => Promise<void>;
  fetchTrendingAlgorithms: () => Promise<void>;
  fetchRecentTasks: () => Promise<void>;
  searchAlgorithms: (query: string) => Promise<void>;
  createTask: (algorithmId: string, inputData: any, isTrial: boolean) => Promise<Task>;
}

const initialFilter: AlgorithmFilter = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
};

export const useAlgorithmStore = create<AlgorithmStore>((set, get) => ({
  algorithms: [],
  categories: [],
  featuredAlgorithms: [],
  trendingAlgorithms: [],
  recentTasks: [],
  loading: false,
  error: null,
  filter: initialFilter,
  currentPage: 1,
  totalPages: 1,
  totalAlgorithms: 0,

  setAlgorithms: (algorithms) => set({ algorithms }),
  setCategories: (categories) => set({ categories }),
  setFeaturedAlgorithms: (algorithms) => set({ featuredAlgorithms: algorithms }),
  setTrendingAlgorithms: (algorithms) => set({ trendingAlgorithms: algorithms }),
  setRecentTasks: (tasks) => set({ recentTasks: tasks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),
  setPagination: (currentPage, totalPages, totalAlgorithms) => set({ currentPage, totalPages, totalAlgorithms }),

  updateFilter: (updates) => set((state) => ({
    filter: { ...state.filter, ...updates },
    currentPage: 1, // Reset to first page when filter changes
  })),

  resetFilter: () => set({ filter: initialFilter, currentPage: 1 }),

  addAlgorithm: (algorithm) => set((state) => ({
    algorithms: [algorithm, ...state.algorithms],
    totalAlgorithms: state.totalAlgorithms + 1,
  })),

  updateAlgorithm: (id, updates) => set((state) => ({
    algorithms: state.algorithms.map(alg => 
      alg.id === id ? { ...alg, ...updates } : alg
    ),
  })),

  removeAlgorithm: (id) => set((state) => ({
    algorithms: state.algorithms.filter(alg => alg.id !== id),
    totalAlgorithms: state.totalAlgorithms - 1,
  })),

  subscribeAlgorithm: (algorithmId, subscriptionEndDate) => set((state) => ({
    algorithms: state.algorithms.map(alg =>
      alg.id === algorithmId
        ? { ...alg, isSubscribed: true, subscriptionEndDate }
        : alg
    ),
  })),

  fetchAlgorithms: async (page = 1) => {
    const { filter } = get();
    set({ loading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filter.search && { search: filter.search }),
        ...(filter.category && { category: filter.category }),
        ...(filter.tags?.length && { tags: filter.tags.join(',') }),
        ...(filter.priceRange && { 
          minPrice: filter.priceRange[0].toString(),
          maxPrice: filter.priceRange[1].toString() 
        }),
        ...(filter.rating && { minRating: filter.rating.toString() }),
        ...(filter.language?.length && { languages: filter.language.join(',') }),
        ...(filter.isFree !== undefined && { isFree: filter.isFree.toString() }),
        ...(filter.isFeatured !== undefined && { isFeatured: filter.isFeatured.toString() }),
        ...(filter.sortBy && { sortBy: filter.sortBy }),
        ...(filter.sortOrder && { sortOrder: filter.sortOrder }),
      });

      const response = await fetch(`/api/algorithms?${params}`);
      if (!response.ok) throw new Error('Failed to fetch algorithms');
      
      const data = await response.json();
      set({
        algorithms: data.algorithms,
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalAlgorithms: data.pagination.total,
        loading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch algorithms',
        loading: false 
      });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/algorithms/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      set({ categories: data.categories, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        loading: false 
      });
    }
  },

  fetchFeaturedAlgorithms: async () => {
    try {
      const response = await fetch('/api/algorithms/featured');
      if (!response.ok) throw new Error('Failed to fetch featured algorithms');
      
      const data = await response.json();
      set({ featuredAlgorithms: data.algorithms });
    } catch (error) {
      console.error('Failed to fetch featured algorithms:', error);
    }
  },

  fetchTrendingAlgorithms: async () => {
    try {
      const response = await fetch('/api/algorithms/trending');
      if (!response.ok) throw new Error('Failed to fetch trending algorithms');
      
      const data = await response.json();
      set({ trendingAlgorithms: data.algorithms });
    } catch (error) {
      console.error('Failed to fetch trending algorithms:', error);
    }
  },

  fetchRecentTasks: async () => {
    try {
      const response = await fetch('/api/tasks/recent');
      if (!response.ok) throw new Error('Failed to fetch recent tasks');
      
      const data = await response.json();
      set({ recentTasks: data.tasks });
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error);
    }
  },

  searchAlgorithms: async (query: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/algorithms/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      set({
        algorithms: data.algorithms,
        currentPage: 1,
        totalPages: data.pagination?.pages || 1,
        totalAlgorithms: data.pagination?.total || data.algorithms.length,
        loading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false 
      });
    }
  },

  createTask: async (algorithmId: string, inputData: any, isTrial: boolean) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithmId,
        inputData,
        isTrial,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    const data = await response.json();
    return data.task;
  },
}));