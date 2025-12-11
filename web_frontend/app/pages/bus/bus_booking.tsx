import { useState } from 'react';
import { Calendar, Search, MapPin, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import Navigation from '../../components/navigation';

export default function BusBookingPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [searchType, setSearchType] = useState<'today' | 'tomorrow' | 'other'>('today');

  const popularRoutes = [
    { from: 'Kelaniya', to: 'Colombo', distance: '15 km' },
    { from: 'Colombo', to: 'Kandy', distance: '115 km' },
    { from: 'Colombo', to: 'Galle', distance: '119 km' },
    { from: 'Kandy', to: 'Nuwara Eliya', distance: '77 km' },
  ];

  const upcomingJourneys = [
    {
      id: 1,
      terminal: 'Bus terminal 1',
      from: 'Kelaniya',
      to: 'Colombo',
      departureTime: '9 AM',
      date: 'Sun 2024.12.08',
    },
    {
      id: 2,
      terminal: 'Bus terminal 2',
      from: 'Biyagama',
      to: 'Kaduriya',
      departureTime: '2 PM',
      date: 'Sun 2024.12.08',
    },
    {
      id: 3,
      terminal: 'Bus terminal 3',
      from: 'Kelaniya',
      to: 'Colombo',
      departureTime: '9 AM',
      date: 'Sun 2024.12.08',
    },
  ];

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (!from || !to) {
      alert('Please enter both departure and destination locations');
      return;
    }

    let searchDate = date;
    if (searchType === 'today') {
      searchDate = new Date().toISOString().split('T')[0];
    } else if (searchType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      searchDate = tomorrow.toISOString().split('T')[0];
    }

    navigate(`/bus/select?from=${from}&to=${to}&date=${searchDate}`);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#01005B' }}>
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium">SS</span>
                </div>
                <div className="text-white">
                  <p className="font-medium">Hello Saduni Silva!</p>
                  <p className="text-sm text-gray-300">Where you want go</p>
                </div>
              </div>

              {/* From Location */}
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">Boarding From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Enter departure location"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white"
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapLocations}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowLeftRight size={20} style={{ color: '#01005B' }} />
                </button>
              </div>

              {/* To Location */}
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">Where are you going?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Enter destination"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/10 text-white"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSearchType('today')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      searchType === 'today'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSearchType('tomorrow')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      searchType === 'tomorrow'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => setSearchType('other')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      searchType === 'other'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Calendar size={16} />
                    Other
                  </button>
                </div>
                {searchType === 'other' && (
  <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    min={getTodayDate()}
    className="w-full mt-2 px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/10 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-200"
    style={{
      colorScheme: 'dark'
    }}
  />
)}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full py-3 bg-white rounded-lg font-medium text-[#01005B] hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Find Buses
              </button>
            </div>
          </div>

          {/* Right Side Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Journeys */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Journey</h2>
              <div className="space-y-4">
                {upcomingJourneys.map((journey) => (
                  <div
                    key={journey.id}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                          style={{ backgroundColor: '#FF6B35' }}
                        >
                          {journey.id}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{journey.terminal}</p>
                          <p className="font-bold text-lg">
                            From: <span className="text-[#01005B]">{journey.from}</span>
                          </p>
                          <p className="font-bold text-lg">
                            to: <span className="text-[#01005B]">{journey.to}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium mb-2"
                          style={{ backgroundColor: '#01005B' }}
                        >
                          departure time
                        </div>
                        <p className="text-2xl font-bold">{journey.departureTime}</p>
                        <p className="text-sm text-gray-600">{journey.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Routes */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Popular Routes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularRoutes.map((route, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFrom(route.from);
                      setTo(route.to);
                    }}
                    className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{route.from}</span>
                      <ArrowLeftRight size={20} className="text-gray-400" />
                      <span className="font-bold text-lg">{route.to}</span>
                    </div>
                    <p className="text-sm text-gray-600">{route.distance}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}