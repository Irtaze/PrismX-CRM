import { 
  salesAPI, 
  customerAPI, 
  targetAPI, 
  performanceAPI, 
  userAPI,
  paymentAPI,
  revenueAPI,
  commentAPI,
  Sale,
  Customer,
  Target,
  Performance,
  User,
  Payment,
  Revenue,
  Comment
} from './api';

/**
 * Data Service - Centralized data fetching with error handling
 * All database queries go through this service
 */

// ==================== SALES QUERIES ====================

export const fetchAllSales = async (): Promise<Sale[]> => {
  try {
    const response = await salesAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw new Error('Failed to fetch sales data');
  }
};

export const fetchSaleById = async (id: string): Promise<Sale> => {
  try {
    const response = await salesAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sale ${id}:`, error);
    throw new Error('Failed to fetch sale details');
  }
};

export const createSale = async (data: any): Promise<Sale> => {
  try {
    const response = await salesAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

export const updateSale = async (id: string, data: any): Promise<Sale> => {
  try {
    const response = await salesAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating sale ${id}:`, error);
    throw error;
  }
};

export const deleteSale = async (id: string): Promise<void> => {
  try {
    await salesAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting sale ${id}:`, error);
    throw new Error('Failed to delete sale');
  }
};

// ==================== CUSTOMER QUERIES ====================

export const fetchAllCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await customerAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('Failed to fetch customers data');
  }
};

export const fetchCustomerById = async (id: string): Promise<Customer> => {
  try {
    const response = await customerAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw new Error('Failed to fetch customer details');
  }
};

export const createCustomer = async (data: any): Promise<Customer> => {
  try {
    const response = await customerAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, data: any): Promise<Customer> => {
  try {
    const response = await customerAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await customerAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw new Error('Failed to delete customer');
  }
};

// ==================== TARGET QUERIES ====================

export const fetchAllTargets = async (): Promise<Target[]> => {
  try {
    const response = await targetAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching targets:', error);
    throw new Error('Failed to fetch targets data');
  }
};

export const fetchTargetById = async (id: string): Promise<Target> => {
  try {
    const response = await targetAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching target ${id}:`, error);
    throw new Error('Failed to fetch target details');
  }
};

export const createTarget = async (data: any): Promise<Target> => {
  try {
    const response = await targetAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating target:', error);
    throw error;
  }
};

export const updateTarget = async (id: string, data: any): Promise<Target> => {
  try {
    const response = await targetAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating target ${id}:`, error);
    throw error;
  }
};

export const deleteTarget = async (id: string): Promise<void> => {
  try {
    await targetAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting target ${id}:`, error);
    throw new Error('Failed to delete target');
  }
};

// ==================== PERFORMANCE QUERIES ====================

export const fetchAllPerformance = async (): Promise<Performance[]> => {
  try {
    const response = await performanceAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw new Error('Failed to fetch performance data');
  }
};

export const fetchMyPerformance = async (): Promise<Performance> => {
  try {
    const response = await performanceAPI.getMyPerformance();
    return response.data;
  } catch (error) {
    console.error('Error fetching user performance:', error);
    throw new Error('Failed to fetch your performance data');
  }
};

// ==================== USER QUERIES ====================

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const response = await userAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users data');
  }
};

export const fetchUserById = async (id: string): Promise<User> => {
  try {
    const response = await userAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw new Error('Failed to fetch user details');
  }
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await userAPI.update(id, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await userAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// ==================== PAYMENT QUERIES ====================

export const fetchAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await paymentAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to fetch payments data');
  }
};

export const fetchPaymentById = async (id: string): Promise<Payment> => {
  try {
    const response = await paymentAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw new Error('Failed to fetch payment details');
  }
};

export const createPayment = async (data: any): Promise<Payment> => {
  try {
    const response = await paymentAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const updatePayment = async (id: string, data: any): Promise<Payment> => {
  try {
    const response = await paymentAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating payment ${id}:`, error);
    throw error;
  }
};

export const deletePayment = async (id: string): Promise<void> => {
  try {
    await paymentAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting payment ${id}:`, error);
    throw new Error('Failed to delete payment');
  }
};

// ==================== REVENUE QUERIES ====================

export const fetchAllRevenue = async (): Promise<Revenue[]> => {
  try {
    const response = await revenueAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue:', error);
    throw new Error('Failed to fetch revenue data');
  }
};

export const fetchRevenueById = async (id: string): Promise<Revenue> => {
  try {
    const response = await revenueAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revenue ${id}:`, error);
    throw new Error('Failed to fetch revenue details');
  }
};

export const createRevenue = async (data: any): Promise<Revenue> => {
  try {
    const response = await revenueAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating revenue:', error);
    throw error;
  }
};

export const updateRevenue = async (id: string, data: any): Promise<Revenue> => {
  try {
    const response = await revenueAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating revenue ${id}:`, error);
    throw error;
  }
};

export const deleteRevenue = async (id: string): Promise<void> => {
  try {
    await revenueAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting revenue ${id}:`, error);
    throw new Error('Failed to delete revenue');
  }
};

// ==================== COMMENT QUERIES ====================

export const fetchAllComments = async (): Promise<Comment[]> => {
  try {
    const response = await commentAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments data');
  }
};

export const fetchCommentById = async (id: string): Promise<Comment> => {
  try {
    const response = await commentAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    throw new Error('Failed to fetch comment details');
  }
};

export const createComment = async (data: any): Promise<Comment> => {
  try {
    const response = await commentAPI.create(data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const updateComment = async (id: string, data: any): Promise<Comment> => {
  try {
    const response = await commentAPI.update(id, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating comment ${id}:`, error);
    throw error;
  }
};

export const deleteComment = async (id: string): Promise<void> => {
  try {
    await commentAPI.delete(id);
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw new Error('Failed to delete comment');
  }
};

// ==================== DASHBOARD ANALYTICS ====================

export const fetchDashboardData = async () => {
  try {
    const [sales, customers, targets, performance] = await Promise.all([
      fetchAllSales(),
      fetchAllCustomers(),
      fetchAllTargets(),
      fetchAllPerformance()
    ]);

    return {
      sales,
      customers,
      targets,
      performance,
      stats: {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
        totalCustomers: customers.length,
        activeTargets: targets.filter(t => t.status === 'in_progress').length,
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
};

// ==================== EXPORT DEFAULT ====================

const dataService = {
  // Sales
  fetchAllSales,
  fetchSaleById,
  createSale,
  updateSale,
  deleteSale,
  
  // Customers
  fetchAllCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Targets
  fetchAllTargets,
  fetchTargetById,
  createTarget,
  updateTarget,
  deleteTarget,
  
  // Performance
  fetchAllPerformance,
  fetchMyPerformance,
  
  // Users
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
  
  // Payments
  fetchAllPayments,
  fetchPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  
  // Revenue
  fetchAllRevenue,
  fetchRevenueById,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  
  // Comments
  fetchAllComments,
  fetchCommentById,
  createComment,
  updateComment,
  deleteComment,
  
  // Dashboard
  fetchDashboardData,
};

export default dataService;
