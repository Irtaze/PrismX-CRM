import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { Customer, CustomerInput, CustomerService, Service, customerServiceAPI, serviceAPI } from '../services/api';
import dataService from '../services/dataService';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaUser, FaEnvelope, FaPhone, FaCreditCard, FaEye, FaEyeSlash, FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Customers: React.FC = () => {
  const { isLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerServices, setCustomerServices] = useState<{[key: string]: CustomerService[]}>({});
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phoneNumber: '',
    cardReference: '',
  });

  const [serviceFormData, setServiceFormData] = useState({
    serviceID: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [customersData, servicesData] = await Promise.all([
        dataService.fetchAllCustomers(),
        serviceAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setCustomers(customersData);
      setServices(servicesData.data);
      
      // Fetch customer services
      const csData: {[key: string]: CustomerService[]} = {};
      for (const customer of customersData) {
        try {
          const response = await customerServiceAPI.getByCustomer(customer._id);
          csData[customer._id] = response.data;
        } catch (e) {
          csData[customer._id] = [];
        }
      }
      setCustomerServices(csData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please refresh the page.');
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
        await dataService.updateCustomer(editingCustomer._id, formData);
      } else {
        await dataService.createCustomer(formData);
      }
      fetchData();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save customer:', error);
      setError(error.response?.data?.message || 'Failed to save customer. Please check all required fields.');
    }
  };

  const handleAddService = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedCustomer || !serviceFormData.serviceID) return;
    
    try {
      await customerServiceAPI.create({
        customerID: selectedCustomer._id,
        serviceID: serviceFormData.serviceID,
        amount: parseFloat(serviceFormData.amount) || 0,
        notes: serviceFormData.notes,
      });
      fetchData();
      setShowServiceModal(false);
      setServiceFormData({ serviceID: '', amount: '', notes: '' });
    } catch (error: any) {
      console.error('Failed to add service:', error);
      setError(error.response?.data?.message || 'Failed to add service.');
    }
  };

  const handleRemoveService = async (csId: string): Promise<void> => {
    if (confirm('Remove this service from customer?')) {
      try {
        await customerServiceAPI.delete(csId);
        fetchData();
      } catch (error) {
        console.error('Failed to remove service:', error);
      }
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await dataService.deleteCustomer(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        setError('Failed to delete customer. Please try again.');
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

  const toggleCardVisibility = (customerId: string) => {
    setVisibleCards(prev => ({ ...prev, [customerId]: !prev[customerId] }));
  };

  const maskCardReference = (cardRef: string) => {
    if (!cardRef || cardRef.length < 4) return '****';
    return '*'.repeat(cardRef.length - 4) + cardRef.slice(-4);
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomer(prev => prev === customerId ? null : customerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
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

            {/* Customers List */}
            <div className="space-y-4">
              {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-500">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div key={customer._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Customer Header */}
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-white text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800">{customer.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <FaEnvelope className="text-slate-400" />
                                {customer.email}
                              </span>
                              {customer.phoneNumber && (
                                <span className="flex items-center gap-1">
                                  <FaPhone className="text-slate-400" />
                                  {customer.phoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Card Reference with Eye Toggle */}
                          {customer.cardReference && (
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                              <FaCreditCard className="text-slate-400" />
                              <span className="text-sm font-mono text-slate-600">
                                {visibleCards[customer._id] 
                                  ? customer.cardReference 
                                  : maskCardReference(customer.cardReference)}
                              </span>
                              <button
                                onClick={() => toggleCardVisibility(customer._id)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                title={visibleCards[customer._id] ? 'Hide card' : 'Show card'}
                              >
                                {visibleCards[customer._id] ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          )}

                          {/* Actions */}
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowServiceModal(true);
                            }}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Add Service"
                          >
                            <FaBox />
                          </button>
                          <button
                            onClick={() => openModal(customer)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => toggleExpand(customer._id)}
                            className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            {expandedCustomer === customer._id ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Services Section (Expandable) */}
                    {expandedCustomer === customer._id && (
                      <div className="border-t border-slate-100 bg-slate-50 p-4 md:p-6">
                        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <FaBox className="text-blue-500" />
                          Services ({customerServices[customer._id]?.length || 0})
                        </h4>
                        
                        {customerServices[customer._id]?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customerServices[customer._id].map((cs) => (
                              <div key={cs._id} className="bg-white p-4 rounded-xl border border-slate-100">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {typeof cs.serviceID === 'object' ? cs.serviceID.name : 'Service'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                      ${cs.amount.toFixed(2)}
                                    </p>
                                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusColor(cs.status)}`}>
                                      {cs.status}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveService(cs._id)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                                {cs.notes && (
                                  <p className="text-xs text-slate-400 mt-2">{cs.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">No services assigned to this customer</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
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
                    <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.cardReference}
                      onChange={(e) => setFormData({ ...formData, cardReference: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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

        {/* Add Service Modal */}
        {showServiceModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Add Service to {selectedCustomer.name}
                </h2>
                <button 
                  onClick={() => {
                    setShowServiceModal(false);
                    setSelectedCustomer(null);
                    setServiceFormData({ serviceID: '', amount: '', notes: '' });
                  }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={serviceFormData.serviceID}
                    onChange={(e) => {
                      const service = services.find(s => s._id === e.target.value);
                      setServiceFormData({ 
                        ...serviceFormData, 
                        serviceID: e.target.value,
                        amount: service ? service.price.toString() : '',
                      });
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name} - ${service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={serviceFormData.amount}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={serviceFormData.notes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, notes: e.target.value })}
                    placeholder="Add any notes (optional)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
                >
                  Add Service
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
