import { useState } from 'react';
import { Search, Globe } from 'lucide-react';

interface NavigationProps {
  activeNav: string;
}

export default function Navigation({ activeNav }: NavigationProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Plan Trip', path: '/trip_plan' },
    { name: 'Bus Booking', path: '/bus_booking' },
    { name: 'Hotel', path: '/hotel' },
  ];

  return (
    <header className="flex justify-between items-center px-16 py-4 border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-12">
        <a href="/">
          <img src="/images/logo.png" alt="DerTam Logo" className="h-12 cursor-pointer" />
        </a>
        
        {/* Navigation Links */}
        <nav className="flex gap-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group
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
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search with dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`bg-transparent border-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all
              ${showSearch ? 'bg-gray-100 text-[#01005B]' : 'hover:bg-gray-100 hover:text-[#01005B]'}`}
          >
            <Search size={20} />
          </button>
          {showSearch && (
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="absolute right-0 top-12 px-4 py-3 border border-gray-300 rounded-lg shadow-lg w-72 focus:outline-none focus:border-[#01005B] focus:ring-2 focus:ring-[#01005B]/20"
              autoFocus
            />
          )}
        </div>

        {/* Language selector */}
        <button className="bg-transparent border-none cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-[#01005B] transition-all">
          <Globe size={18} />
          <span className="text-sm font-medium">EN</span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Auth buttons */}
        <button className="bg-transparent border-none text-gray-700 px-5 py-2 rounded-lg cursor-pointer font-medium hover:bg-gray-100 hover:text-[#01005B] transition-all">
          Sign In
        </button>
        <button 
          className="text-white border-none px-6 py-2.5 rounded-lg cursor-pointer font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
          style={{ backgroundColor: '#01005B' }}
        >
          Get Started
        </button>
      </div>
    </header>
  );
}