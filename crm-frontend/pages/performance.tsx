import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { Performance, User } from '../services/api';
import dataService from '../services/dataService';
import { FaChartLine, FaTrophy, FaStar, FaArrowUp, FaArrowDown, FaSync, FaChartBar, FaUser } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformancePage: React.FC = () => {
  const { isLoading } = useAuth();
  const [performanceData, setPerformanceData] = useState<Performance[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGraphs, setShowGraphs] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [performance, agentsData] = await Promise.all([
        dataService.fetchAllPerformance(),
        dataService.fetchAllUsers(),
      ]);
      setPerformanceData(performance);
      setAgents(agentsData);
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

  const getAgentName = (userID: string): string => {
    const agent = agents.find(a => a._id === userID);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown Agent';
  };

  // Filter by period
  const filteredPerformance = useMemo(() => {
    if (selectedPeriod === 'all') return performanceData;
    return performanceData.filter(p => p.period === selectedPeriod);
  }, [performanceData, selectedPeriod]);

  const totalRevenue = filteredPerformance.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalSales = filteredPerformance.reduce((sum, p) => sum + p.totalSales, 0);
  const avgConversion = filteredPerformance.length > 0
    ? (filteredPerformance.reduce((sum, p) => sum + p.conversionRate, 0) / filteredPerformance.length).toFixed(1)
    : '0';
  const avgTargetAchievement = filteredPerformance.length > 0
    ? (filteredPerformance.reduce((sum, p) => sum + p.targetAchievement, 0) / filteredPerformance.length).toFixed(1)
    : '0';

  // Chart data
  const revenueByAgentData = useMemo(() => {
    const agentMap = new Map<string, { revenue: number; sales: number; name: string }>();
    
    filteredPerformance.forEach(p => {
      const agentName = getAgentName(p.userID);
      if (agentMap.has(p.userID)) {
        const existing = agentMap.get(p.userID)!;
        existing.revenue += p.totalRevenue;
        existing.sales += p.totalSales;
      } else {
        agentMap.set(p.userID, {
          revenue: p.totalRevenue,
          sales: p.totalSales,
          name: agentName,
        });
      }
    });

    return {
      labels: Array.from(agentMap.values()).map(a => a.name),
      revenue: Array.from(agentMap.values()).map(a => a.revenue),
      sales: Array.from(agentMap.values()).map(a => a.sales),
    };
  }, [filteredPerformance, agents]);

  const conversionRateData = useMemo(() => {
    const agentMap = new Map<string, { rate: number; count: number; name: string }>();
    
    filteredPerformance.forEach(p => {
      const agentName = getAgentName(p.userID);
      if (agentMap.has(p.userID)) {
        const existing = agentMap.get(p.userID)!;
        existing.rate += p.conversionRate;
        existing.count += 1;
      } else {
        agentMap.set(p.userID, {
          rate: p.conversionRate,
          count: 1,
          name: agentName,
        });
      }
    });

    return {
      labels: Array.from(agentMap.values()).map(a => a.name),
      rates: Array.from(agentMap.values()).map(a => a.rate / a.count),
    };
  }, [filteredPerformance, agents]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Revenue by Agent', font: { size: 16 } },
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
    labels: revenueByAgentData.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueByAgentData.revenue,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Conversion Rates', font: { size: 16 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const lineChartData = {
    labels: conversionRateData.labels,
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: conversionRateData.rates,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const salesDistributionData = {
    labels: revenueByAgentData.labels,
    datasets: [
      {
        data: revenueByAgentData.sales,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Sales Distribution', font: { size: 16 } },
    },
  };

  const getRatingColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-blue-500';
    if (rate >= 40) return 'text-yellow-500';
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
  const sortedPerformance = [...filteredPerformance].sort((a, b) => b.totalRevenue - a.totalRevenue);

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
            {/* Real-time indicator and controls */}
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

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowGraphs(!showGraphs)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    showGraphs
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FaChartBar />
                  {showGraphs ? 'Hide Charts' : 'Show Charts'}
                </button>

                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
                  {['all', 'daily', 'weekly', 'monthly'].map((period) => (
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
            </div>

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
                    <p className="text-sm text-slate-500">Avg Conversion</p>
                    <p className="text-2xl font-bold text-slate-800">{avgConversion}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaArrowUp className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg Target %</p>
                    <p className="text-2xl font-bold text-slate-800">{avgTargetAchievement}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {showGraphs && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Bar Chart - Revenue by Agent */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
                  <div className="h-80">
                    <Bar options={barChartOptions} data={barChartData} />
                  </div>
                </div>

                {/* Doughnut Chart - Sales Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="h-80">
                    <Doughnut options={doughnutOptions} data={salesDistributionData} />
                  </div>
                </div>

                {/* Line Chart - Conversion Rates */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-3">
                  <div className="h-80">
                    <Line options={lineChartOptions} data={lineChartData} />
                  </div>
                </div>
              </div>
            )}

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
                            <FaUser className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{getAgentName(performance.userID)}</p>
                            <p className="text-xs text-slate-500">{performance.period} report</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{performance.totalSales}</span>
                        <span className="text-slate-500 text-sm ml-1">deals</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">${performance.totalRevenue.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FaStar className={`${getRatingColor(performance.conversionRate)}`} />
                          <span className={`font-semibold ${getRatingColor(performance.conversionRate)}`}>
                            {performance.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {performance.targetAchievement > 0 ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <FaArrowUp className="text-xs" />
                            <span className="text-sm font-medium">+{performance.targetAchievement.toFixed(1)}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="text-sm font-medium">N/A</span>
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
