import { useState, useEffect } from 'react';
import { Search, Globe, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';

interface NavigationProps {
  activeNav: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Navigation({
  activeNav,
  showSearch = false,
  searchQuery = '',
  onSearchChange
}: NavigationProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated');
    const user = localStorage.getItem('user');

    if (authStatus === 'true' && user) {
      setIsAuthenticated(true);
      const userData = JSON.parse(user);
      setUserName(userData.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
    setUserName('');
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Plan Trip', path: '/trip_plan' },
    { name: 'Bus Booking', path: '/bus_booking' },
    { name: 'Hotel', path: '/hotels' },
  ];

  return (
    <header className="flex justify-between items-center px-4 sm:px-8 lg:px-16 py-4 border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        <a href="/" className="flex-shrink-0">
          <img src="/images/logo.png" alt="DerTam Logo" className="h-10 sm:h-12 cursor-pointer" />
        </a>

        
        {/* Navigation Links - Desktop Only */}
        <nav className="hidden lg:flex gap-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group whitespace-nowrap
                ${activeNav === item.name
                  ? 'text-[#01005B]'
                  : 'text-gray-600 hover:text-[#01005B]'
                }`}
            >
              {item.name}
              {/* Animated underline */}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#01005B] transition-all duration-300
                  ${activeNav === item.name
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                  }`}
              />
            </a>
          ))}
        </nav>

        {/* Search Container - Desktop & Mobile */}
        {showSearch && (
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search destinations, events, hotels..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#01005B] focus:ring-2 focus:ring-[#01005B]/20 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}
        
      </div>

      {/* Right side actions - Desktop */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Language selector */}
        <button className="bg-transparent border-none cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#01005B] transition-all">
          <Globe size={18} />
          <span className="text-sm font-medium">EN</span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Conditional rendering based on authentication */}
        {isAuthenticated ? (
          // User Profile Section
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer bg-transparent border-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#01005B] flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-none bg-transparent cursor-pointer"
                >
                  <User size={18} />
                  <span>My Profile</span>
                </button>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-none bg-transparent cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Auth buttons for non-authenticated users
          <>
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border-none text-gray-700 px-5 py-2 rounded-lg cursor-pointer font-medium hover:bg-gray-100 hover:text-[#01005B] transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-white border-none px-6 py-2.5 rounded-lg cursor-pointer font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#01005B' }}
            >
              Get Started
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="lg:hidden bg-transparent border-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-all ml-2"
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setShowMobileMenu(false)}
                className={`px-6 py-4 text-sm font-medium border-b border-gray-100 transition-all
                  ${activeNav === item.name
                    ? 'text-[#01005B] bg-gray-50'
                    : 'text-gray-600 hover:text-[#01005B] hover:bg-gray-50'
                  }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile Auth/Profile */}
          <div className="px-6 py-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-[#01005B] flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{userName}</span>
                </div>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border border-gray-200 rounded-lg bg-transparent cursor-pointer"
                >
                  <User size={18} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border border-red-200 rounded-lg bg-transparent cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-transparent border border-gray-300 text-gray-700 px-5 py-3 rounded-lg cursor-pointer font-medium hover:bg-gray-100 hover:text-[#01005B] transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-white border-none px-6 py-3 rounded-lg cursor-pointer font-medium transition-all shadow-md"
                  style={{ backgroundColor: '#01005B' }}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}