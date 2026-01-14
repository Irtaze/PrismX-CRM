import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { performanceAPI, Performance } from '../services/api';
import { FaChartLine, FaTrophy, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PerformancePage: React.FC = () => {
  const { isLoading } = useAuth();
  const [performanceData, setPerformanceData] = useState<Performance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async (): Promise<void> => {
    try {
      const response = await performanceAPI.getAll();
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
      // Set demo data
      setPerformanceData([
        { _id: '1', userId: 'user1', salesCount: 45, revenue: 52000, rating: 4.8, period: 'monthly', createdAt: new Date().toISOString() },
        { _id: '2', userId: 'user2', salesCount: 38, revenue: 43500, rating: 4.5, period: 'monthly', createdAt: new Date().toISOString() },
        { _id: '3', userId: 'user3', salesCount: 52, revenue: 61000, rating: 4.9, period: 'monthly', createdAt: new Date().toISOString() },
        { _id: '4', userId: 'user4', salesCount: 29, revenue: 32000, rating: 4.2, period: 'monthly', createdAt: new Date().toISOString() },
        { _id: '5', userId: 'user5', salesCount: 41, revenue: 48000, rating: 4.6, period: 'monthly', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = performanceData.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = performanceData.reduce((sum, p) => sum + p.salesCount, 0);
  const avgRating = performanceData.length > 0
    ? (performanceData.reduce((sum, p) => sum + p.rating, 0) / performanceData.length).toFixed(1)
    : '0';

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-500';
    if (rating >= 4.0) return 'text-blue-500';
    if (rating >= 3.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRankBadge = (index: number): React.ReactNode => {
    if (index === 0) return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-bold">🥇 1st</span>;
    if (index === 1) return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">🥈 2nd</span>;
    if (index === 2) return <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold">🥉 3rd</span>;
    return <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">#{index + 1}</span>;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Sort by revenue for ranking
  const sortedPerformance = [...performanceData].sort((a, b) => b.revenue - a.revenue);

  return (
    <>
      <Head>
        <title>Performance - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Performance" />

          <main className="p-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaChartLine className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaTrophy className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-800">{totalSales}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaStar className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg Rating</p>
                    <p className="text-2xl font-bold text-slate-800">{avgRating}/5</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaArrowUp className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Team Members</p>
                    <p className="text-2xl font-bold text-slate-800">{performanceData.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Performance Leaderboard</h2>
                <p className="text-sm text-slate-500">Monthly performance rankings</p>
              </div>

              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rank</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Agent</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Sales</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Revenue</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rating</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPerformance.map((performance, index) => (
                    <tr key={performance._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {getRankBadge(index)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400' :
                            'bg-gradient-to-br from-blue-400 to-purple-500'
                          }`}>
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Agent {index + 1}</p>
                            <p className="text-xs text-slate-500">Sales Rep</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{performance.salesCount}</span>
                        <span className="text-slate-500 text-sm ml-1">deals</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">${performance.revenue.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FaStar className={`${getRatingColor(performance.rating)}`} />
                          <span className={`font-semibold ${getRatingColor(performance.rating)}`}>
                            {performance.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {Math.random() > 0.3 ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <FaArrowUp className="text-xs" />
                            <span className="text-sm font-medium">+{(Math.random() * 15 + 5).toFixed(1)}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <FaArrowDown className="text-xs" />
                            <span className="text-sm font-medium">-{(Math.random() * 10 + 2).toFixed(1)}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PerformancePage;
