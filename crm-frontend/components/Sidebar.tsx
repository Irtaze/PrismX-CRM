import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/useAuth';
import { 
  FaHome, 
  FaUsers, 
  FaUserTie, 
  FaShoppingCart, 
  FaBullseye, 
  FaChartLine,
  FaSignOutAlt,
  FaCog,
  FaUserCircle,
  FaUserShield
} from 'react-icons/fa';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { isAdmin, user } = useAuth();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'Customers', path: '/customers', icon: <FaUsers /> },
    { name: 'Agents', path: '/agents', icon: <FaUserTie />, adminOnly: true },
    { name: 'Sales', path: '/sales', icon: <FaShoppingCart /> },
    { name: 'Targets', path: '/targets', icon: <FaBullseye /> },
    { name: 'Performance', path: '/performance', icon: <FaChartLine /> },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CRM Pro
            </h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
        {/* Role Badge */}
        <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
        }`}>
          <FaUserShield className="text-[10px]" />
          {user?.role?.toUpperCase() || 'USER'}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            router.pathname === '/profile'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <FaUserCircle className="text-lg" />
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mt-1 ${
            router.pathname === '/settings'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <FaCog className="text-lg" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 mt-1"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
