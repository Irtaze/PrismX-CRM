import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../utils/useAuth';
import dataService from '../services/dataService';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartLine, FaUserTie, FaBullseye, FaUserShield } from 'react-icons/fa';
import { Sale, Performance, Customer } from '../services/api';

interface Stats {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalAgents: number;
  conversionRate: number;
  targetProgress: number;
}

interface RecentSale {
  _id: string;
  customerName: string;
  amount: number;
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
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalAgents: 0,
    conversionRate: 0,
    targetProgress: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dataService.fetchDashboardData();
      const users = await dataService.fetchAllUsers();
      const allSales = await dataService.fetchAllSales();
      const performances = await dataService.fetchAllPerformance();
      
      // Calculate conversion rate
      const completedSales = data.sales.filter(s => s.status === 'completed').length;
      const conversionRate = data.customers.length > 0 
        ? Math.round((completedSales / data.customers.length) * 100 * 10) / 10
        : 0;

      // Calculate target progress
      const activeTargets = data.targets.filter(t => t.status === 'in_progress');
      const avgProgress = activeTargets.length > 0
        ? Math.round(activeTargets.reduce((sum, t) => sum + ((t.achieved / t.targetAmount) * 100), 0) / activeTargets.length)
        : 0;

      setStats({
        totalCustomers: data.stats.totalCustomers,
        totalSales: data.stats.totalSales,
        totalRevenue: data.stats.totalRevenue,
        totalAgents: users.filter(u => u.role === 'agent').length,
        conversionRate,
        targetProgress: avgProgress,
      });

      // Get recent sales (last 5)
      const salesWithCustomers = await Promise.all(
        allSales.slice(0, 5).map(async (sale) => {
          const customer = data.customers.find(c => c._id === sale.customerID);
          return {
            _id: sale._id,
            customerName: customer?.name || 'Unknown Customer',
            amount: sale.amount,
            date: sale.date,
          };
        })
      );
      setRecentSales(salesWithCustomers);

      // Get top performers (sorted by revenue)
      const topPerfs = performances
        .sort((a: Performance, b: Performance) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
        .slice(0, 5)
        .map((perf: Performance) => {
          const user = users.find(u => u._id === perf.userID);
          return {
            _id: perf._id,
            name: user?.name || 'Unknown User',
            totalSales: perf.totalSales || 0,
            totalRevenue: perf.totalRevenue || 0,
            conversionRate: perf.conversionRate || 0,
          };
        });
      setTopPerformers(topPerfs);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
            {/* Role Badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <FaUserShield />
                {isAdmin ? 'Admin Dashboard' : 'Agent Dashboard'} - Welcome, {user?.name}!
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DashboardCard
                title={isAdmin ? "Total Customers" : "My Customers"}
                value={stats.totalCustomers.toLocaleString()}
                icon={<FaUsers />}
                trend={12.5}
                color="blue"
              />
              <DashboardCard
                title={isAdmin ? "Total Sales" : "My Sales"}
                value={stats.totalSales.toLocaleString()}
                icon={<FaShoppingCart />}
                trend={8.2}
                color="green"
              />
              <DashboardCard
                title={isAdmin ? "Total Revenue" : "My Revenue"}
                value={`$${stats.totalRevenue.toLocaleString()}`}
                icon={<FaDollarSign />}
                trend={15.3}
                color="purple"
              />
              {isAdmin && (
                <DashboardCard
                  title="Active Agents"
                  value={stats.totalAgents.toString()}
                  icon={<FaUserTie />}
                  trend={5.1}
                  color="orange"
                />
              )}
              <DashboardCard
                title="Conversion Rate"
                value={`${stats.conversionRate}%`}
                icon={<FaChartLine />}
                trend={-2.4}
                color="cyan"
              />
              <DashboardCard
                title="Target Progress"
                value={`${stats.targetProgress}%`}
                icon={<FaBullseye />}
                trend={10.8}
                color="red"
              />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {isAdmin ? 'Recent Sales (All)' : 'My Recent Sales'}
                </h3>
                <div className="space-y-4">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <div key={sale._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FaShoppingCart className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Sale Order</p>
                            <p className="text-sm text-slate-500">{sale.customerName}</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-500">+${sale.amount.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No recent sales data</p>
                  )}
                </div>
              </div>

              {/* Top Performers - Admin only */}
              {isAdmin ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Top Performers</h3>
                  <div className="space-y-4">
                    {topPerformers.length > 0 ? (
                      topPerformers.map((performer) => (
                        <div key={performer._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <FaUserTie className="text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{performer.name}</p>
                              <p className="text-sm text-slate-500">{performer.totalSales} sales this month</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">${performer.totalRevenue.toLocaleString()}</p>
                            <p className="text-xs text-green-500">+{performer.conversionRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-8">No performance data</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">My Performance</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                          <p className="text-sm text-slate-600">My Customers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.totalSales}</p>
                          <p className="text-sm text-slate-600">My Sales</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
                          <p className="text-sm text-slate-600">My Revenue</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</p>
                          <p className="text-sm text-slate-600">Conversion Rate</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 text-center">
                      Keep up the great work! You&apos;re on track to meet your targets.
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
