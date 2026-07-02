import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { adminAPI } from '../services/api';
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaPhone, FaUserTie, FaCheck, FaTimes } from 'react-icons/fa';

interface AgentFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'agent';
}

const AddAgent: React.FC = () => {
  const router = useRouter();
  const { isLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'agent',
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isAdmin, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      };

      await adminAPI.createAgent(submitData);
      setSuccess('Agent created successfully!');
      
      setTimeout(() => {
        router.push('/agents');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating agent:', error);
      setError(error.response?.data?.message || 'Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Add Agent - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-0 md:ml-64 transition-all duration-300">
          <Navbar title="Add Agent" />
          
          <main className="p-4 sm:p-6 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
              {/* Back Button */}
              <button
                onClick={() => router.push('/agents')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 font-medium text-sm sm:text-base hover:opacity-75 transition-opacity"
              >
                <FaArrowLeft /> Back to Agents
              </button>

              {/* Card */}
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUserTie className="text-white text-xl sm:text-2xl" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Create New Agent</h1>
                      <p className="text-blue-100 text-xs sm:text-sm">Add a new agent to your CRM system</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter agent's full name"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter agent's email"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Enter agent's phone number"
                          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter a strong password"
                          className="w-full pl-10 sm:pl-12 pr-12 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm sm:text-base hover:opacity-75 transition-opacity"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Re-enter password"
                          className="w-full pl-10 sm:pl-12 pr-12 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm sm:text-base hover:opacity-75 transition-opacity"
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:outline-none transition appearance-none bg-white"
                      >
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Messages - Below Form Before Buttons */}
                    {error && (
                      <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-3 text-xs sm:text-sm text-red-700">
                        <FaTimes className="text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-3 text-xs sm:text-sm text-green-700">
                        <FaCheck className="text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span>{success}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg sm:rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Creating Agent...</span>
                            <span className="sm:hidden">Creating...</span>
                          </div>
                        ) : (
                          'Create Agent'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/agents')}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-slate-200 transition hover:opacity-90 active:scale-95 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AddAgent;
