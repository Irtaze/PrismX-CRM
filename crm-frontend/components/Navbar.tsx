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
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 sm:px-6 md:px-8 py-3 sm:py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        {/* Page Title & Search */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8 min-w-0 flex-1 md:flex-initial">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">Welcome back, {user?.name || 'User'}!</p>
          </div>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center bg-slate-100 rounded-lg md:rounded-xl px-3 md:px-4 py-2 w-64 md:w-80 flex-shrink-0">
            <FaSearch className="text-slate-400 mr-2 md:mr-3 text-sm md:text-base" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none w-full text-sm md:text-base text-slate-600 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Notifications */}
          <button className="relative p-2 sm:p-2.5 md:p-3 bg-slate-100 rounded-lg md:rounded-xl hover:bg-slate-200 transition-colors active:scale-95 duration-200">
            <FaBell className="text-slate-600 text-sm sm:text-base md:text-lg" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 sm:w-5 h-4 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                {notifications}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-slate-100 rounded-lg md:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2 hover:bg-slate-200 transition-all duration-200 active:scale-95"
            >
              <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <FaUserCircle className="text-white text-lg sm:text-xl md:text-xl" />
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="font-semibold text-slate-800 text-xs md:text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize truncate">{user?.role || 'Member'}</p>
              </div>
              <FaChevronDown className={`text-slate-400 text-xs md:text-sm transition-transform duration-200 flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg md:rounded-xl shadow-xl border border-slate-200 py-1 md:py-2 z-50">
                <a href="/profile" className="block px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                  Profile
                </a>
                <a href="/settings" className="block px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                  Settings
                </a>
                <hr className="my-1 md:my-2 border-slate-200" />
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-red-500 hover:bg-red-50 transition-colors"
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
