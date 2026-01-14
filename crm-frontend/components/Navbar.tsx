import { useState, useEffect } from 'react';
import { FaBell, FaSearch, FaUserCircle, FaChevronDown } from 'react-icons/fa';

interface User {
  name: string;
  email: string;
  role: string;
}

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Dashboard' }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [notifications] = useState<number>(3);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser({ name: 'User', email: 'user@example.com', role: 'user' });
      }
    }
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Page Title & Search */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name || 'User'}!</p>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-80">
            <FaSearch className="text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent outline-none w-full text-slate-600 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <FaBell className="text-slate-600 text-lg" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {notifications}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 hover:bg-slate-200 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaUserCircle className="text-white text-xl" />
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold text-slate-800 text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Member'}</p>
              </div>
              <FaChevronDown className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <a href="/profile" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors">
                  Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors">
                  Settings
                </a>
                <hr className="my-2 border-slate-200" />
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
