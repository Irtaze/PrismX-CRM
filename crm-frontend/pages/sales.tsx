import { useState, useEffect, FormEvent, useMemo } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { Sale, SaleInput, Customer } from '../services/api';
import dataService from '../services/dataService';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaShoppingCart, FaDollarSign, FaCalendar, FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

const Sales: React.FC = () => {
  const { isLoading, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [showGraphs, setShowGraphs] = useState<boolean>(true);
  const [formData, setFormData] = useState<SaleInput>({
    customerID: '',
    amount: 0,
    status: 'pending',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, []);

  const fetchCustomers = async (): Promise<void> => {
    try {
      const customers = await dataService.fetchAllCustomers();
      setCustomers(customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError('Failed to load customers. Please refresh the page.');
    }
  };

  const fetchSales = async (): Promise<void> => {
    try {
      const sales = await dataService.fetchAllSales();
      setSales(sales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setError('Failed to load sales data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (!formData.customerID) {
      setError('Please select a customer');
      return;
    }
    
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      if (editingSale) {
        await dataService.updateSale(editingSale._id, formData);
      } else {
        await dataService.createSale(formData);
      }
      fetchSales();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save sale:', error);
      setError(error.response?.data?.message || 'Failed to save sale. Please check all required fields.');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await dataService.deleteSale(id);
        fetchSales();
      } catch (error) {
        console.error('Failed to delete sale:', error);
        setError('Failed to delete sale. Please try again.');
      }
    }
  };

  const openModal = (sale?: Sale): void => {
    setError('');
    if (sale) {
      setEditingSale(sale);
      // Handle customerID which can be string or object
      const customerId = typeof sale.customerID === 'object' ? sale.customerID._id : sale.customerID;
      setFormData({
        customerID: customerId,
        amount: sale.amount,
        status: sale.status,
        description: sale.description || '',
        date: sale.date.split('T')[0],
      });
    } else {
      setEditingSale(null);
      setFormData({
        customerID: '',
        amount: 0,
        status: 'pending',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditingSale(null);
    setError('');
  };

  const getCustomerName = (customerID: string | { _id: string; name: string; email: string }): string => {
    if (typeof customerID === 'object') {
      return customerID.name || 'Unknown';
    }
    const customer = customers.find(c => c._id === customerID);
    return customer ? customer.name : 'Unknown';
  };

  const filteredSales = sales.filter(
    (sale) =>
      getCustomerName(sale.customerID).toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.description && sale.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = sales.filter((s) => s.status === 'completed').length;

  // Chart data calculations
  const chartData = useMemo(() => {
    const now = new Date();
    let labels: string[] = [];
    let salesData: number[] = [];
    let revenueData: number[] = [];

    if (timePeriod === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        labels.push(dateStr);
        
        const daySales = sales.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate.toDateString() === date.toDateString();
        });
        salesData.push(daySales.length);
        revenueData.push(daySales.reduce((sum, s) => sum + s.amount, 0));
      }
    } else if (timePeriod === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        labels.push(monthStr);
        
        const monthSales = sales.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear();
        });
        salesData.push(monthSales.length);
        revenueData.push(monthSales.reduce((sum, s) => sum + s.amount, 0));
      }
    } else {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        labels.push(year.toString());
        
        const yearSales = sales.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate.getFullYear() === year;
        });
        salesData.push(yearSales.length);
        revenueData.push(yearSales.reduce((sum, s) => sum + s.amount, 0));
      }
    }

    return { labels, salesData, revenueData };
  }, [sales, timePeriod]);

  // Status distribution for doughnut chart
  const statusData = useMemo(() => {
    const pending = sales.filter(s => s.status === 'pending').length;
    const completed = sales.filter(s => s.status === 'completed').length;
    const cancelled = sales.filter(s => s.status === 'cancelled').length;
    return { pending, completed, cancelled };
  }, [sales]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales & Revenue Trend',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Number of Sales',
        data: chartData.salesData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Breakdown',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const barChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: chartData.revenueData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(244, 63, 94, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [statusData.pending, statusData.completed, statusData.cancelled],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Sales Status Distribution',
        font: { size: 16 },
      },
    },
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sales - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Sales" />

          <main className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaShoppingCart className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaCalendar className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Completed</p>
                    <p className="text-2xl font-bold text-slate-800">{completedSales}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Toggle and Time Period Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setShowGraphs(!showGraphs)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  showGraphs
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <FaChartLine />
                {showGraphs ? 'Hide Charts' : 'Show Charts'}
              </button>

              {showGraphs && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
                  {(['weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        timePeriod === period
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Charts Section */}
            {showGraphs && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {/* Line Chart - Sales Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 xl:col-span-2">
                  <div className="h-80">
                    <Line options={lineChartOptions} data={lineChartData} />
                  </div>
                </div>

                {/* Doughnut Chart - Status Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="h-80">
                    <Doughnut options={doughnutOptions} data={doughnutChartData} />
                  </div>
                </div>

                {/* Bar Chart - Revenue Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2 xl:col-span-3">
                  <div className="h-80">
                    <Bar options={barChartOptions} data={barChartData} />
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="sales-search-input"
                />
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                data-testid="add-sale-button"
              >
                <FaPlus />
                Add Sale
              </button>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        No sales found
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <FaShoppingCart className="text-white" />
                            </div>
                            <span className="font-semibold text-slate-800">{getCustomerName(sale.customerID)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{sale.description || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-800 font-semibold">${sale.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sale.status === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : sale.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(sale)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              data-testid={`edit-sale-${sale._id}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(sale._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              data-testid={`delete-sale-${sale._id}`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingSale ? 'Edit Sale' : 'Add Sale'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600" data-testid="close-modal-button">
                  <FaTimes size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl" data-testid="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customerID}
                    onChange={(e) => setFormData({ ...formData, customerID: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    data-testid="customer-select"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    data-testid="amount-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CRM License, Support Package"
                    data-testid="description-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    data-testid="date-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  data-testid="submit-sale-button"
                >
                  {editingSale ? 'Update Sale' : 'Add Sale'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sales;
