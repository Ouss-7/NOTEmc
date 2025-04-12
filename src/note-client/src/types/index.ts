export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'processing' | 'processed';
  analysis?: {
    grammar?: any;
    sentiment?: any;
    summary?: any;
  };
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'grammar' | 'summary' | 'sentiment' | 'semantic';
  status: 'active' | 'inactive' | 'deprecated';
  parameters: Record<string, {
    type: string;
    required: boolean;
    default?: any;
  }>;
}

export interface ProcessingJob {
  id: string;
  noteId: string;
  toolIds: string[];
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  results?: Record<string, any>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// API response and error types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data: any;
  friendlyMessage?: string;
}

// User and authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserData extends Partial<User> {
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: ApiErrorResponse | null;
}
