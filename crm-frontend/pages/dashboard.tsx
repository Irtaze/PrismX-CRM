import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../utils/useAuth';
import { FaUsers, FaShoppingCart, FaDollarSign, FaChartLine, FaUserTie, FaBullseye } from 'react-icons/fa';

interface Stats {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalAgents: number;
  conversionRate: number;
  targetProgress: number;
}

const Dashboard: React.FC = () => {
  const { isLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalAgents: 0,
    conversionRate: 0,
    targetProgress: 0,
  });

  useEffect(() => {
    // Simulated stats - replace with actual API calls
    setStats({
      totalCustomers: 1234,
      totalSales: 567,
      totalRevenue: 89450,
      totalAgents: 24,
      conversionRate: 68.5,
      targetProgress: 78,
    });
  }, []);

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
        <title>Dashboard - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Dashboard" />
          
          <main className="p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DashboardCard
                title="Total Customers"
                value={stats.totalCustomers.toLocaleString()}
                icon={<FaUsers />}
                trend={12.5}
                color="blue"
              />
              <DashboardCard
                title="Total Sales"
                value={stats.totalSales.toLocaleString()}
                icon={<FaShoppingCart />}
                trend={8.2}
                color="green"
              />
              <DashboardCard
                title="Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                icon={<FaDollarSign />}
                trend={15.3}
                color="purple"
              />
              <DashboardCard
                title="Active Agents"
                value={stats.totalAgents.toString()}
                icon={<FaUserTie />}
                trend={5.1}
                color="orange"
              />
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
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Sales</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FaShoppingCart className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Product Sale #{i}</p>
                          <p className="text-sm text-slate-500">Customer {i}</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-500">+${(Math.random() * 1000).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <FaUserTie className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{name}</p>
                          <p className="text-sm text-slate-500">{20 - i * 2} sales this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">${((5 - i) * 5000 + Math.random() * 1000).toFixed(0)}</p>
                        <p className="text-xs text-green-500">+{((5 - i) * 5 + Math.random() * 10).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
