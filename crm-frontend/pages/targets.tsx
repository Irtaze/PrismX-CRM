import { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { targetAPI, Target, TargetInput } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBullseye, FaCalendar, FaChartLine } from 'react-icons/fa';

const Targets: React.FC = () => {
  const { isLoading } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<TargetInput>({
    targetAmount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async (): Promise<void> => {
    try {
      const response = await targetAPI.getAll();
      setTargets(response.data);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (formData.targetAmount <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }
    
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      if (editingTarget) {
        await targetAPI.update(editingTarget._id, formData);
      } else {
        await targetAPI.create(formData);
      }
      fetchTargets();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save target:', error);
      setError(error.response?.data?.message || 'Failed to save target. Please check all required fields.');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this target?')) {
      try {
        await targetAPI.delete(id);
        fetchTargets();
      } catch (error) {
        console.error('Failed to delete target:', error);
      }
    }
  };

  const openModal = (target?: Target): void => {
    setError('');
    if (target) {
      setEditingTarget(target);
      setFormData({
        targetAmount: target.targetAmount,
        period: target.period,
        startDate: target.startDate.split('T')[0],
        endDate: target.endDate.split('T')[0],
      });
    } else {
      setEditingTarget(null);
      setFormData({
        targetAmount: 0,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-500">Track and manage your sales targets</p>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
              >
                <FaPlus />
                Add Target
              </button>
            </div>

            {/* Targets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {targets.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No targets found
                </div>
              ) : (
                targets.map((target) => {
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
                            data-testid={`edit-target-${target._id}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(target._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            data-testid={`delete-target-${target._id}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full capitalize">
                          {target.period}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingTarget ? 'Edit Target' : 'Add Target'}
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
                    data-testid="targetamount-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="period-select"
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
                    data-testid="startdate-input"
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
                    data-testid="enddate-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  data-testid="submit-target-button"
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
