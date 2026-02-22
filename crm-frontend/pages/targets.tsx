import { useState, useEffect, FormEvent, useMemo } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { Target, TargetInput, User } from '../services/api';
import dataService from '../services/dataService';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBullseye, FaCalendar, FaChartLine, FaChartBar, FaUser } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TargetFormData {
  targetAmount: number;
  achieved: number;
  period: string;
  startDate: string;
  endDate: string;
  userID?: string;
  status?: string;
}

const Targets: React.FC = () => {
  const { isLoading, user } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showGraphs, setShowGraphs] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [formData, setFormData] = useState<TargetFormData>({
    targetAmount: 0,
    achieved: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    userID: '',
    status: 'in_progress',
  });

  useEffect(() => {
    if (!isLoading && user) {
      fetchData();
    }
  }, [isLoading, user]);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Always fetch targets
      const targetsData = await dataService.fetchAllTargets();
      setTargets(targetsData);
      
      // Only fetch agents if user is admin (for the dropdown in form)
      if (user?.role === 'admin') {
        try {
          const agentsData = await dataService.fetchAllAgents();
          setAgents(agentsData.filter(a => a.role === 'agent'));
        } catch (agentError) {
          console.error('Failed to fetch agents:', agentError);
          // Continue without agents list, they can still view targets
          setAgents([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      setError('Failed to load targets data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async (): Promise<void> => {
    try {
      const targets = await dataService.fetchAllTargets();
      setTargets(targets);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      setError('Failed to load targets data. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Frontend validation
    if (formData.targetAmount <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    if (formData.achieved < 0) {
      setError('Achieved amount cannot be negative');
      return;
    }
    
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    if (!formData.userID && user?.role === 'admin') {
      setError('Please select an agent');
      return;
    }

    try {
      const submitData: any = {
        targetAmount: formData.targetAmount,
        achieved: formData.achieved,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };

      // Add userID if admin is creating/editing, otherwise use current user
      if (user?.role === 'admin' && formData.userID) {
        submitData.userID = formData.userID;
      } else if (user?.role === 'agent' && editingTarget) {
        submitData.userID = editingTarget.userID;
      } else if (user?.role === 'admin' && !editingTarget && formData.userID) {
        submitData.userID = formData.userID;
      }

      if (editingTarget) {
        await dataService.updateTarget(editingTarget._id, submitData);
        setSuccessMessage('Target updated successfully!');
      } else {
        await dataService.createTarget(submitData);
        setSuccessMessage('Target created successfully!');
      }

      setTimeout(() => {
        fetchTargets();
        closeModal();
        setSuccessMessage('');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to save target:', error);
      setError(error.response?.data?.message || 'Failed to save target. Please check all required fields.');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this target?')) {
      try {
        await dataService.deleteTarget(id);
        setSuccessMessage('Target deleted successfully!');
        setTimeout(() => {
          fetchTargets();
          setSuccessMessage('');
        }, 1000);
      } catch (error) {
        console.error('Failed to delete target:', error);
        setError('Failed to delete target. Please try again.');
      }
    }
  };

  const openModal = (target?: Target): void => {
    setError('');
    setSuccessMessage('');
    if (target) {
      setEditingTarget(target);
      setFormData({
        targetAmount: target.targetAmount,
        achieved: target.achieved,
        period: target.period,
        startDate: target.startDate.split('T')[0],
        endDate: target.endDate.split('T')[0],
        userID: typeof target.userID === 'string' ? target.userID : (target.userID as any)._id,
        status: target.status,
      });
    } else {
      setEditingTarget(null);
      setFormData({
        targetAmount: 0,
        achieved: 0,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        userID: user?.role === 'admin' ? '' : user?._id,
        status: 'in_progress',
      });
    }
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditingTarget(null);
    setError('');
  };

  const calculateProgress = (achieved: number, target: number): number => {
    return Math.min(Math.round((achieved / target) * 100), 100);
  };

  const getAgentName = (userID: string | any): string => {
    let agentId = userID;
    if (typeof userID === 'object' && userID._id) {
      agentId = userID._id;
    }
    const agent = agents.find(a => a._id === agentId);
    if (agent) {
      return agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : agent.name || 'Unknown Agent';
    }
    return 'Unknown Agent';
  };

  // Filter targets: admins see all, agents see only their own
  const visibleTargets = useMemo(() => {
    if (user?.role === 'admin') {
      return targets;
    } else {
      return targets.filter(t => {
        const targetUserId = typeof t.userID === 'object' ? t.userID._id : t.userID;
        return targetUserId === user?._id;
      });
    }
  }, [targets, user]);

  // Filter targets by period
  const filteredTargets = useMemo(() => {
    if (selectedPeriod === 'all') return visibleTargets;
    return visibleTargets.filter(t => t.period === selectedPeriod);
  }, [visibleTargets, selectedPeriod]);

  // Chart data: Per-agent target vs achieved
  const agentChartData = useMemo(() => {
    const agentMap = new Map<string, { target: number; achieved: number; name: string }>();
    
    filteredTargets.forEach(target => {
      const agentName = getAgentName(target.userID);
      const agentId = typeof target.userID === 'object' ? target.userID._id : target.userID;
      if (agentMap.has(agentId)) {
        const existing = agentMap.get(agentId)!;
        existing.target += target.targetAmount;
        existing.achieved += target.achieved;
      } else {
        agentMap.set(agentId, {
          target: target.targetAmount,
          achieved: target.achieved,
          name: agentName,
        });
      }
    });

    const labels = Array.from(agentMap.values()).map(a => a.name);
    const targetData = Array.from(agentMap.values()).map(a => a.target);
    const achievedData = Array.from(agentMap.values()).map(a => a.achieved);

    return { labels, targetData, achievedData };
  }, [filteredTargets, agents]);

  // Status distribution
  const statusData = useMemo(() => {
    const inProgress = filteredTargets.filter(t => t.status === 'in_progress').length;
    const completed = filteredTargets.filter(t => t.status === 'completed').length;
    const failed = filteredTargets.filter(t => t.status === 'failed').length;
    return { inProgress, completed, failed };
  }, [filteredTargets]);

  // Overall stats
  const stats = useMemo(() => {
    const totalTarget = filteredTargets.reduce((sum, t) => sum + t.targetAmount, 0);
    const totalAchieved = filteredTargets.reduce((sum, t) => sum + t.achieved, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
    return { totalTarget, totalAchieved, overallProgress };
  }, [filteredTargets]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Agent Target Progress',
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
    labels: agentChartData.labels,
    datasets: [
      {
        label: 'Target ($)',
        data: agentChartData.targetData,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Achieved ($)',
        data: agentChartData.achievedData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ['In Progress', 'Completed', 'Failed'],
    datasets: [
      {
        data: [statusData.inProgress, statusData.completed, statusData.failed],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
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
        text: 'Target Status Distribution',
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
        <title>Targets - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Targets" />

          <main className="p-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center justify-between">
                {successMessage}
                <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-700">
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaBullseye className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Targets</p>
                    <p className="text-2xl font-bold text-slate-800">{filteredTargets.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <FaChartBar className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Target Amount</p>
                    <p className="text-2xl font-bold text-slate-800">${stats.totalTarget.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaChartLine className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Achieved</p>
                    <p className="text-2xl font-bold text-slate-800">${stats.totalAchieved.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaCalendar className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Overall Progress</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.overallProgress}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowGraphs(!showGraphs)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    showGraphs
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FaChartBar />
                  {showGraphs ? 'Hide Charts' : 'Show Charts'}
                </button>

                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
                  {['all', 'monthly', 'quarterly', 'yearly'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        selectedPeriod === period
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
              >
                <FaPlus />
                Add Target
              </button>
            </div>

            {/* Charts Section */}
            {showGraphs && agentChartData.labels.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Bar Chart - Agent Progress */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                  <div className="h-80">
                    <Bar options={barChartOptions} data={barChartData} />
                  </div>
                </div>

                {/* Doughnut Chart - Status Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="h-80">
                    <Doughnut options={doughnutOptions} data={doughnutData} />
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-500">Track and manage your sales targets</p>
              </div>
            </div>

            {/* Targets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTargets.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  {user?.role === 'admin' ? 'No targets found' : 'No targets assigned to you'}
                </div>
              ) : (
                filteredTargets.map((target) => {
                  const progress = calculateProgress(target.achieved, target.targetAmount);
                  const isAchieved = target.achieved >= target.targetAmount;

                  return (
                    <div
                      key={target._id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${isAchieved ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <FaBullseye className={`text-xl ${isAchieved ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(target)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit target"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(target._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete target"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Agent Name */}
                      <div className="flex items-center gap-2 mb-3">
                        <FaUser className="text-slate-400 text-sm" />
                        <span className="text-sm font-medium text-slate-600">{getAgentName(target.userID)}</span>
                      </div>

                      <div className="mb-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full capitalize">
                          {target.period}
                        </span>
                        <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                          target.status === 'completed' ? 'bg-green-100 text-green-600' :
                          target.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {target.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Target</span>
                          <span className="font-bold text-slate-800">${target.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Achieved</span>
                          <span className={`font-bold ${isAchieved ? 'text-green-600' : 'text-blue-600'}`}>
                            ${target.achieved.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className={`font-bold ${isAchieved ? 'text-green-600' : 'text-blue-600'}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              isAchieved ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <FaCalendar />
                        <span>
                          {new Date(target.startDate).toLocaleDateString()} - {new Date(target.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingTarget ? 'Edit Target' : 'Add Target'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                  <FaTimes size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Agent Selection (Admin only) */}
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Agent <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.userID || ''}
                      onChange={(e) => setFormData({ ...formData, userID: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!editingTarget}
                    >
                      <option value="">-- Select Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Achieved Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.achieved}
                    onChange={(e) => setFormData({ ...formData, achieved: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  {editingTarget ? 'Update Target' : 'Add Target'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Targets;
