import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authAPI = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/users/login', credentials),
  register: (data: RegisterData) => api.post<AuthResponse>('/users/register', data),
  getProfile: () => api.get('/users/profile'),
};

// Customer APIs
export interface Customer {
  _id: string;
  userID?: string;
  name: string;
  email: string;
  phoneNumber: string;
  cardReference?: string;
  dateAdded: string;
}

export interface CustomerInput {
  userID?: string;
  name: string;
  email: string;
  phoneNumber: string;
  cardReference?: string;
}

export const customerAPI = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: CustomerInput) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<CustomerInput>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Sales APIs
export interface Sale {
  _id: string;
  userID: string;
  customerID: string;
  amount: number;
  status: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface SaleInput {
  userID?: string; // Optional in input as it can be auto-filled from auth
  customerID: string;
  amount: number;
  status?: string;
  description?: string;
  date?: string;
}

export const salesAPI = {
  getAll: () => api.get<Sale[]>('/sales'),
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (data: SaleInput) => api.post<Sale>('/sales', data),
  update: (id: string, data: Partial<SaleInput>) => api.put<Sale>(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`),
};

// Target APIs
export interface Target {
  _id: string;
  userID: string;
  targetAmount: number;
  achieved: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface TargetInput {
  userID?: string; // Optional in input as it can be auto-filled from auth
  targetAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  achieved?: number;
  status?: string;
}

export const targetAPI = {
  getAll: () => api.get<Target[]>('/targets'),
  getById: (id: string) => api.get<Target>(`/targets/${id}`),
  create: (data: TargetInput) => api.post<Target>('/targets', data),
  update: (id: string, data: Partial<TargetInput>) => api.put<Target>(`/targets/${id}`, data),
  delete: (id: string) => api.delete(`/targets/${id}`),
};

// Payment APIs
export interface Payment {
  _id: string;
  saleID: string;
  customerID: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

export interface PaymentInput {
  saleID: string;
  customerID: string;
  amount: number;
  paymentMethod: string;
  status?: string;
}

export const paymentAPI = {
  getAll: () => api.get<Payment[]>('/payments'),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
  create: (data: PaymentInput) => api.post<Payment>('/payments', data),
  update: (id: string, data: Partial<PaymentInput>) => api.put<Payment>(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

// Revenue APIs
export interface Revenue {
  _id: string;
  saleID: string;
  amount: number;
  date: string;
  source: string;
  category?: string;
}

export interface RevenueInput {
  saleID: string;
  amount: number;
  source: string;
  category?: string;
  date?: string;
}

export const revenueAPI = {
  getAll: () => api.get<Revenue[]>('/revenue'),
  getById: (id: string) => api.get<Revenue>(`/revenue/${id}`),
  create: (data: RevenueInput) => api.post<Revenue>('/revenue', data),
  update: (id: string, data: Partial<RevenueInput>) => api.put<Revenue>(`/revenue/${id}`, data),
  delete: (id: string) => api.delete(`/revenue/${id}`),
};

// Performance APIs
export interface Performance {
  _id: string;
  userID: string;
  totalSales: number;
  totalRevenue: number;
  targetAchievement: number;
  conversionRate: number;
  date: string;
  period: string;
  createdAt?: string;
}

export const performanceAPI = {
  getAll: () => api.get<Performance[]>('/performance'),
  getMyPerformance: () => api.get<Performance>('/performance/me'),
};

// User/Agent APIs
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
};

// Comment APIs
export interface Comment {
  _id: string;
  userID: string;
  entityType: string;
  entityID: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentInput {
  userID?: string;
  entityType: string;
  entityID: string;
  content: string;
}

export const commentAPI = {
  getAll: () => api.get<Comment[]>('/comments'),
  getById: (id: string) => api.get<Comment>(`/comments/${id}`),
  create: (data: CommentInput) => api.post<Comment>('/comments', data),
  update: (id: string, data: Partial<CommentInput>) => api.put<Comment>(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
