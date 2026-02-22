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
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) => 
    api.put('/users/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) => 
    api.put('/users/change-password', data),
};

// Customer APIs
export interface Customer {
  _id: string;
  agentID?: string | { _id: string; name: string; email: string; role: string };
  name: string;
  email: string;
  phoneNumber: string;
  cardReference?: string;
  dateAdded: string;
  createdAt?: string;
}

export interface CustomerInput {
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
  agentID: string | { _id: string; name: string; email: string; role: string };
  customerID: string | { _id: string; name: string; email: string };
  amount: number;
  status: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface SaleInput {
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
  getAll: () => api.get<Revenue[]>('/revenues'),
  getById: (id: string) => api.get<Revenue>(`/revenues/${id}`),
  create: (data: RevenueInput) => api.post<Revenue>('/revenues', data),
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
  getAll: () => api.get<Performance[]>('/performances'),
  getMyPerformance: () => api.get<Performance>('/performances/me'),
};

// User/Agent APIs
export interface User {
  _id: string;
  name?: string; // For backwards compatibility
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
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

// Notification APIs
export interface Notification {
  _id: string;
  userID: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'sale' | 'target' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const notificationAPI = {
  getAll: () => api.get<Notification[]>('/notifications'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  create: (data: { title: string; message: string; type?: string; link?: string; userID?: string }) => 
    api.post<Notification>('/notifications', data),
  markAsRead: (id: string) => api.put<Notification>(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};

// Settings APIs
export interface SettingsData {
  notifications?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    salesAlerts?: boolean;
    targetAlerts?: boolean;
    systemUpdates?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showPerformance?: boolean;
  };
  display?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    currency?: string;
    dateFormat?: string;
  };
}

export interface Settings {
  _id: string;
  userID: string;
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    salesAlerts: boolean;
    targetAlerts: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showPerformance: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    dateFormat: string;
  };
  updatedAt: string;
}

export const settingsAPI = {
  get: () => api.get<Settings>('/settings'),
  update: (data: Partial<SettingsData>) => api.put<Settings>('/settings', data),
  reset: () => api.post<Settings>('/settings/reset'),
};

// Service APIs
export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceInput {
  name: string;
  description?: string;
  price: number;
  category: string;
}

export const serviceAPI = {
  getAll: () => api.get<Service[]>('/services'),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: ServiceInput) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<ServiceInput>) => api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Customer Service APIs
export interface CustomerService {
  _id: string;
  customerID: Customer;
  serviceID: Service;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerServiceInput {
  customerID: string;
  serviceID: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export const customerServiceAPI = {
  getAll: () => api.get<CustomerService[]>('/customer-services'),
  getByCustomer: (customerId: string) => api.get<CustomerService[]>(`/customer-services/customer/${customerId}`),
  create: (data: CustomerServiceInput) => api.post<CustomerService>('/customer-services', data),
  update: (id: string, data: Partial<CustomerServiceInput>) => api.put<CustomerService>(`/customer-services/${id}`, data),
  delete: (id: string) => api.delete(`/customer-services/${id}`),
};

// Admin APIs (Admin only)
export interface Agent {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role: 'agent' | 'manager' | 'admin';
  createdAt: string;
}

export interface AgentInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UserInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'admin' | 'manager' | 'agent';
}

export interface AgentStats {
  agent: Agent;
  stats: {
    totalCustomers: number;
    totalSales: number;
    totalRevenue: number;
    completedSales: number;
  };
}

export const adminAPI = {
  // User management (all roles)
  createUser: (data: UserInput) => api.post<{ message: string; user: Agent }>('/admin/users', data),
  getAllUsers: () => api.get<Agent[]>('/admin/users'),
  updateUser: (id: string, data: Partial<UserInput>) => api.put<{ message: string; user: Agent }>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // Agent management (backward compatibility)
  createAgent: (data: AgentInput) => api.post<{ message: string; agent: Agent }>('/admin/agents', data),
  getAgents: () => api.get<Agent[]>('/admin/agents'),
  getAgentById: (id: string) => api.get<Agent>(`/admin/agents/${id}`),
  updateAgent: (id: string, data: Partial<AgentInput>) => api.put<{ message: string; agent: Agent }>(`/admin/agents/${id}`, data),
  deleteAgent: (id: string) => api.delete(`/admin/agents/${id}`),
  getAgentStats: (id: string) => api.get<AgentStats>(`/admin/agents/${id}/stats`),
};

// Dashboard APIs
export interface DashboardStats {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalAgents?: number;
  activeAgents?: number;
  conversionRate: number;
  targetProgress: number;
}

export interface DashboardTrends {
  customersTrend?: number;
  salesTrend: number;
  revenueTrend: number;
  agentsTrend?: number;
  conversionTrend: number;
  targetTrend: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  trends: DashboardTrends;
  recentSales: Array<{
    _id: string;
    customerName: string;
    agentName?: string;
    amount: number;
    status: string;
    date: string;
  }>;
  topPerformers?: Array<{
    _id: string;
    name: string;
    totalSales: number;
    totalRevenue: number;
    conversionRate: number;
  }>;
  period: string;
  userInfo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const dashboardAPI = {
  getAdminDashboard: (period?: string) => api.get<DashboardResponse>('/dashboard/admin', { params: { period } }),
  getAgentDashboard: (period?: string) => api.get<DashboardResponse>('/dashboard/agent', { params: { period } }),
  getDashboardSummary: () => api.get<{
    totalCustomers: number;
    totalSales: number;
    totalRevenue: number;
    totalAgents: number;
    activeTargets: number;
    lastUpdated: string;
  }>('/dashboard/summary'),
};

export default api;
