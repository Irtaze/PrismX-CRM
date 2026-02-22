import { useState, useEffect, useMemo, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { Agent, adminAPI } from '../services/api';
import { FaSearch, FaUserTie, FaEnvelope, FaSync, FaTrophy, FaDollarSign, FaPlus, FaEdit, FaTrash, FaTimes, FaUsers, FaLock, FaUserShield, FaCrown, FaUserCog } from 'react-icons/fa';

interface AgentStats {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  completedSales: number;
}

interface AgentFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'agent';
}

const Agents: React.FC = () => {
  const { isLoading, isAdmin, user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentStats, setAgentStats] = useState<{ [key: string]: AgentStats }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'agent',
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchData = async (): Promise<void> => {
    try {
      const usersResponse = await adminAPI.getAllUsers();
      const usersData = usersResponse.data;
      setAgents(usersData);

      const statsPromises = usersData.map(async (agent) => {
        try {
          const statsResponse = await adminAPI.getAgentStats(agent._id);
          return { id: agent._id, stats: statsResponse.data.stats };
        } catch {
          return { id: agent._id, stats: { totalCustomers: 0, totalSales: 0, totalRevenue: 0, completedSales: 0 } };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: { [key: string]: AgentStats } = {};
      statsResults.forEach((result) => {
        statsMap[result.id] = result.stats;
      });
      setAgentStats(statsMap);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const openModal = (agent?: Agent): void => {
    setError('');
    setSuccess('');
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
        email: agent.email,
        password: '',
        phoneNumber: agent.phoneNumber || '',
        role: agent.role,
      });
    } else {
      setEditingAgent(null);
      setFormData({ name: '', email: '', password: '', phoneNumber: '', role: 'agent' });
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditingAgent(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (!editingAgent && !formData.password) {
      setError('Password is required for new agents');
      return;
    }

    if (!editingAgent && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      if (editingAgent) {
        const updateData: Partial<AgentFormData> = {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminAPI.updateUser(editingAgent._id, updateData);
        setSuccess('User updated successfully!');
      } else {
        await adminAPI.createUser(formData);
        setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully!`);
      }
      fetchData();
      setTimeout(closeModal, 1500);
    } catch (error: unknown) {
      console.error('Error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (agentId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(agentId);
      setSuccess('User deleted successfully');
      fetchData();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to delete user');
    }
  };

  const overallStats = useMemo(() => {
    const totalRevenue = Object.values(agentStats).reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalSales = Object.values(agentStats).reduce((sum, s) => sum + (s.totalSales || 0), 0);
    const totalCustomers = Object.values(agentStats).reduce((sum, s) => sum + (s.totalCustomers || 0), 0);
    return { totalRevenue, totalSales, totalCustomers };
  }, [agentStats]);

  const filteredAgents = agents.filter(
    (agent) =>
      (agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <FaLock className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500">Only administrators can access agent management.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Management - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="User Management" />

          <main className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                <FaUserShield />
                Admin Only - Create & Manage Users
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    refreshing
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                  }`}
                >
                  <FaSync className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
                <span className="text-sm text-slate-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaUserTie className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Agents</p>
                    <p className="text-2xl font-bold text-slate-800">{agents.length}</p>
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
                    <p className="text-2xl font-bold text-slate-800">${overallStats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaTrophy className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-800">{overallStats.totalSales}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaUsers className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-800">{overallStats.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                />
              </div>

              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
              >
                <FaPlus /> Add New User
              </button>
            </div>

            {success && !showModal && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-xl">{success}</div>
            )}
            {error && !showModal && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-600">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-600">Contact</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-600">Customers</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-600">Sales</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-600">Revenue</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          <FaUserTie className="text-4xl mb-2 mx-auto text-slate-300" />
                          <p>No agents found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAgents.map((agent) => {
                        const stats = agentStats[agent._id] || { totalCustomers: 0, totalSales: 0, totalRevenue: 0 };
                        return (
                          <tr key={agent._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  agent.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                                  agent.role === 'manager' ? 'bg-gradient-to-br from-green-500 to-teal-500' :
                                  'bg-gradient-to-br from-blue-500 to-purple-500'
                                }`}>
                                  {agent.role === 'admin' ? <FaCrown /> :
                                   agent.role === 'manager' ? <FaUserCog /> :
                                   (agent.name || `${agent.firstName}`)?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`.trim()}
                                  </p>
                                  <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                    {agent.role === 'admin' && <FaCrown className="text-yellow-500" />}
                                    {agent.role === 'manager' && <FaUserCog className="text-green-500" />}
                                    {agent.role}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-slate-600">
                                <FaEnvelope className="text-slate-400" />
                                {agent.email}
                              </div>
                              {agent.phoneNumber && (
                                <p className="text-sm text-slate-500 mt-1">{agent.phoneNumber}</p>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                {stats.totalCustomers}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                {stats.totalSales}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="font-bold text-slate-800">${stats.totalRevenue.toLocaleString()}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openModal(agent)}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(agent._id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingAgent ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
              {success && <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Enter user's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {editingAgent ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder={editingAgent ? '••••••••' : 'Min 6 characters'}
                  required={!editingAgent}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'agent' })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                  required
                >
                  <option value="agent">Agent - Regular User</option>
                  <option value="manager">Manager - Team Manager</option>
                  <option value="admin">Admin - Full Access</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.role === 'admin' && 'Full system access and user management'}
                  {formData.role === 'manager' && 'Can manage team and view reports'}
                  {formData.role === 'agent' && 'Standard user access'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold"
                >
                  {editingAgent ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Agents;
