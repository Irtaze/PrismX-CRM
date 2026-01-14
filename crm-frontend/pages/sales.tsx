import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { salesAPI, customerAPI, Sale, SaleInput, Customer } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaShoppingCart, FaDollarSign, FaCalendar } from 'react-icons/fa';

const Sales: React.FC = () => {
  const { isLoading, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
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
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchSales = async (): Promise<void> => {
    try {
      const response = await salesAPI.getAll();
      setSales(response.data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
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
        await salesAPI.update(editingSale._id, formData);
      } else {
        await salesAPI.create(formData);
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
        await salesAPI.delete(id);
        fetchSales();
      } catch (error) {
        console.error('Failed to delete sale:', error);
      }
    }
  };

  const openModal = (sale?: Sale): void => {
    setError('');
    if (sale) {
      setEditingSale(sale);
      setFormData({
        customerID: sale.customerID,
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

  const getCustomerName = (customerID: string): string => {
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
