import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { customerAPI, Customer, CustomerInput } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUser, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';

const Customers: React.FC = () => {
  const { isLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phoneNumber: '',
    cardReference: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, formData);
      } else {
        await customerAPI.create(formData);
      }
      fetchCustomers();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      setError(error.response?.data?.message || 'Failed to save customer. Please check all required fields.');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const openModal = (customer?: Customer): void => {
    setError('');
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber || '',
        cardReference: customer.cardReference || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phoneNumber: '', cardReference: '' });
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phoneNumber: '', cardReference: '' });
    setError('');
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.cardReference && customer.cardReference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <title>Customers - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Customers" />

          <main className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="customers-search-input"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                data-testid="add-customer-button"
              >
                <FaPlus />
                Add Customer
              </button>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Card Ref</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date Added</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <FaUser className="text-white" />
                            </div>
                            <span className="font-semibold text-slate-800">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                        <td className="px-6 py-4 text-slate-600">{customer.phoneNumber || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">{customer.cardReference || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(customer.dateAdded).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(customer)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              data-testid={`edit-customer-${customer._id}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              data-testid={`delete-customer-${customer._id}`}
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
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      data-testid="name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="phone-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Card Reference</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.cardReference}
                      onChange={(e) => setFormData({ ...formData, cardReference: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                      data-testid="cardreference-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  data-testid="submit-customer-button"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Customers;
