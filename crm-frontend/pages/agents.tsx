import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { userAPI, User } from '../services/api';
import { FaSearch, FaUserTie, FaEnvelope, FaCalendar } from 'react-icons/fa';

const Agents: React.FC = () => {
  const { isLoading } = useAuth();
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async (): Promise<void> => {
    try {
      const response = await userAPI.getAll();
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      // Set some demo data if API fails
      setAgents([
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date().toISOString() },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager', createdAt: new Date().toISOString() },
        { _id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase())
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
        <title>Agents - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Agents" />

          <main className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-sm">Total Agents:</span>
                  <span className="ml-2 font-bold text-slate-800">{agents.length}</span>
                </div>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No agents found
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaUserTie className="text-white text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-lg truncate">{agent.name}</h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                            agent.role === 'admin'
                              ? 'bg-red-100 text-red-600'
                              : agent.role === 'manager'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {agent.role}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaEnvelope className="text-slate-400" />
                        <span className="text-sm truncate">{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FaCalendar className="text-slate-400" />
                        <span className="text-sm">
                          Joined {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-slate-800">{Math.floor(Math.random() * 50) + 10}</p>
                          <p className="text-xs text-slate-500">Sales</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-800">${(Math.random() * 10000).toFixed(0)}</p>
                          <p className="text-xs text-slate-500">Revenue</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-500">{(Math.random() * 30 + 70).toFixed(0)}%</p>
                          <p className="text-xs text-slate-500">Target</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Agents;
