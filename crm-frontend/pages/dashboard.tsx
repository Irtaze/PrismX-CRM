import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../utils/useAuth';
import dataService from '../services/dataService';
import { DashboardResponse } from '../services/api';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartLine, FaUserTie, FaBullseye, FaUserShield } from 'react-icons/fa';

interface Stats {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalAgents?: number;
  activeAgents?: number;
  conversionRate: number;
  targetProgress: number;
}

interface Trends {
  customersTrend?: number;
  salesTrend: number;
  revenueTrend: number;
  agentsTrend?: number;
  conversionTrend: number;
  targetTrend: number;
}

interface RecentSale {
  _id: string;
  customerName: string;
  agentName?: string;
  amount: number;
  status: string;
  date: string;
}

interface TopPerformer {
  _id: string;
  name: string;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
}

const Dashboard: React.FC = () => {
  const { isLoading, user, isAdmin, isAgent } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('current_month');
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalAgents: 0,
    activeAgents: 0,
    conversionRate: 0,
    targetProgress: 0,
  });
  const [trends, setTrends] = useState<Trends>({
    customersTrend: 0,
    salesTrend: 0,
    revenueTrend: 0,
    agentsTrend: 0,
    conversionTrend: 0,
    targetTrend: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);

  useEffect(() => {
    if (!isLoading && user) {
      fetchDashboardData();
    }
  }, [period, user, isLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let dashboardData: DashboardResponse;

      // Fetch appropriate dashboard based on user role
      // Check user?.role directly from the user object for better reliability
      const userRole = user?.role || 'agent';
      if (userRole === 'admin' || userRole === 'manager') {
        dashboardData = await dataService.fetchAdminDashboard(period);
      } else {
        // Default to agent dashboard for agents
        dashboardData = await dataService.fetchAgentDashboard(period);
      }

      // Set stats from the API response
      setStats(dashboardData.stats as Stats);

      // Set trends from the API response
      setTrends(dashboardData.trends as Trends);

      // Set recent sales
      setRecentSales(dashboardData.recentSales || []);

      // Set top performers (admin only)
      setTopPerformers(dashboardData.topPerformers || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Dashboard" />
          <main className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-semibold">Error loading dashboard</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Dashboard" />

          <main className="p-8">
            {/* Header with Period Selector */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                <FaUserShield />
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Agent Dashboard'} - Welcome, {user?.name}!
              </div>

              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:border-slate-400 transition"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="current_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
              </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DashboardCard
                title={user?.role === 'admin' ? "Total Customers" : "My Customers"}
                value={stats.totalCustomers.toLocaleString()}
                icon={<FaUsers />}
                trend={trends.customersTrend || 12.5}
                color="blue"
              />
              <DashboardCard
                title={user?.role === 'admin' ? "Total Sales" : "My Sales"}
                value={stats.totalSales.toLocaleString()}
                icon={<FaShoppingCart />}
                trend={trends.salesTrend}
                color="green"
              />
              <DashboardCard
                title={user?.role === 'admin' ? "Total Revenue" : "My Revenue"}
                value={`$${stats.totalRevenue.toLocaleString()}`}
                icon={<FaDollarSign />}
                trend={trends.revenueTrend}
                color="purple"
              />
              {user?.role === 'admin' && (
                <DashboardCard
                  title="Active Agents"
                  value={(stats.activeAgents || stats.totalAgents || 0).toString()}
                  icon={<FaUserTie />}
                  trend={trends.agentsTrend || 5.1}
                  color="orange"
                />
              )}
              <DashboardCard
                title="Conversion Rate"
                value={`${stats.conversionRate.toFixed(1)}%`}
                icon={<FaChartLine />}
                trend={trends.conversionTrend}
                color="cyan"
              />
              <DashboardCard
                title="Target Progress"
                value={`${stats.targetProgress.toFixed(1)}%`}
                icon={<FaBullseye />}
                trend={trends.targetTrend}
                color="red"
              />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {user?.role === 'admin' ? 'Recent Sales (All)' : 'My Recent Sales'}
                </h3>
                <div className="space-y-4">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <div
                        key={sale._id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FaShoppingCart className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{sale.customerName}</p>
                            <p className="text-xs text-slate-500">
                              {sale.agentName ? `by ${sale.agentName}` : ''}
                              {sale.status && ` • ${sale.status}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-500">+${sale.amount.toFixed(2)}</span>
                          <p className="text-xs text-slate-400">
                            {new Date(sale.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No recent sales data</p>
                  )}
                </div>
              </div>

              {/* Top Performers or Personal Performance */}
              {user?.role === 'admin' ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Top Performers</h3>
                  <div className="space-y-4">
                    {topPerformers.length > 0 ? (
                      topPerformers.map((performer, index) => (
                        <div
                          key={performer._id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{performer.name}</p>
                              <p className="text-xs text-slate-500">
                                {performer.totalSales} sales • {performer.conversionRate.toFixed(1)}% conversion
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">${performer.totalRevenue.toLocaleString()}</p>
                            <p className="text-xs text-green-500 font-medium">Revenue</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-8">No performance data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">My Performance Summary</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                          <p className="text-sm text-slate-600 mt-1">My Customers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.totalSales}</p>
                          <p className="text-sm text-slate-600 mt-1">My Sales</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            ${stats.totalRevenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">My Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {stats.conversionRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-slate-600 mt-1">Conversion</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 text-center">
                      {stats.targetProgress >= 80
                        ? "🎉 Excellent! You're exceeding targets!"
                        : stats.targetProgress >= 60
                          ? "📈 Great progress! Keep it up!"
                          : "💪 Keep working towards your targets!"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
