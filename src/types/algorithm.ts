export interface Algorithm {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  currency: string;
  version: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isFree: boolean;
  requirements: string[];
  documentation: string;
  sampleInput: string;
  sampleOutput: string;
  executionTime: number;
  memoryUsage: number;
  inputFormat: string;
  outputFormat: string;
  supportedLanguages: string[];
  dockerImage: string;
  entryPoint: string;
  parameters: AlgorithmParameter[];
  isSubscribed?: boolean;
  subscriptionEndDate?: string;
}

export interface AlgorithmParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface AlgorithmVersion {
  id: string;
  algorithmId: string;
  version: string;
  description: string;
  changes: string[];
  fileUrl: string;
  size: number;
  checksum: string;
  createdAt: string;
  isStable: boolean;
  isDeprecated: boolean;
}

export interface AlgorithmReview {
  id: string;
  algorithmId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  helpfulCount: number;
}

export interface AlgorithmCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  algorithmCount: number;
  parentId?: string;
  children?: AlgorithmCategory[];
}

export interface AlgorithmFilter {
  category?: string;
  tags?: string[];
  priceRange?: [number, number];
  rating?: number;
  language?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'downloads' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isFree?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface Task {
  id: string;
  algorithmId: string;
  algorithmName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputData: any;
  outputData?: any;
  errorMessage?: string;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  userId: string;
  isTrial: boolean;
  cost: number;
}

export interface Subscription {
  id: string;
  algorithmId: string;
  userId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
  currency: string;
  usageLimit?: number;
  usageCount: number;
}