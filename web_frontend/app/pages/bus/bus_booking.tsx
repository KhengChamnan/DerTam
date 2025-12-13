import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Calendar, Search, MapPin, RefreshCw, ArrowLeftRight } from 'lucide-react';
import Navigation from '../../components/navigation';
import { getProvinces, getUpcomingJourneys, type Province, type UpcomingJourney } from '../../api/bus';

export default function BusBookingPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [searchType, setSearchType] = useState<'today' | 'tomorrow' | 'other'>('today');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [upcomingJourneys, setUpcomingJourneys] = useState<UpcomingJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [provincesData, journeysData] = await Promise.all([
          getProvinces(),
          getUpcomingJourneys(10)
        ]);
        setProvinces(provincesData);
        setUpcomingJourneys(journeysData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    // Find province names from IDs
    const fromProvince = provinces.find(p => p.id.toString() === from);
    const toProvince = provinces.find(p => p.id.toString() === to);

    navigate(`/bus/select?from=${from}&to=${to}&fromName=${fromProvince?.name || ''}&toName=${toProvince?.name || ''}&date=${searchDate}`);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getBusTypeColor = (type?: string) => {
    switch (type) {
      case 'sleeping-bus':
        return 'bg-purple-100 text-purple-800';
      case 'mini-van':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusTypeLabel = (type?: string) => {
    switch (type) {
      case 'sleeping-bus':
        return 'Sleeping Bus';
      case 'mini-van':
        return 'Mini Van';
      default:
        return 'Regular Bus';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      return 'Date unavailable';
    }
  };

  const getDayAbbreviation = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#01005B' }}>
              <div className="flex items-center gap-3 mb-6">
                <Bus className="text-white" size={28} />
                <h2 className="text-2xl font-bold text-white">Find Your Bus</h2>
              </div>

              {/* From Location */}
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">From</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={`w-full px-4 py-3 bg-white rounded-lg border-none focus:ring-2 focus:ring-[#01005B] ${!from ? 'text-gray-400' : 'text-gray-900'}`}
                >
                  <option value="" className="text-gray-400">Select departure</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id} className="text-gray-900">
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapLocations}
                  className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <RefreshCw size={20} className="text-[#01005B]" />
                </button>
              </div>

              {/* To Location */}
              <div className="mb-4">
                <label className="block text-white text-sm mb-2">To</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={`w-full px-4 py-3 bg-white rounded-lg border-none focus:ring-2 focus:ring-[#01005B] ${!to ? 'text-gray-400' : 'text-gray-900'}`}
                >
                  <option value="" className="text-gray-400">Select destination</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id} className="text-gray-900">
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-white text-sm mb-2">Travel Date</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => setSearchType('today')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      searchType === 'today'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSearchType('tomorrow')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      searchType === 'tomorrow'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => setSearchType('other')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      searchType === 'other'
                        ? 'bg-white text-[#01005B]'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Other
                  </button>
                </div>
                {searchType === 'other' && (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getTodayDate()}
                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-white"
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01005B] mx-auto"></div>
                </div>
              ) : upcomingJourneys.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
                  No upcoming journeys available
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingJourneys.map((journey, index) => (
                    <button
                      key={journey.id}
                      onClick={() => {
                        // Format date to YYYY-MM-DD
                        const formattedDate = journey.date.includes('T') ? journey.date.split('T')[0] : journey.date;
                        // Map bus type correctly
                        const mappedType = journey.type === 'mini-van' ? 'mini-van' : 
                                         journey.type === 'sleeping-bus' ? 'sleeping-bus' : 'regular-bus';
                        // Use actual price from journey data
                        const price = journey.price;
                        navigate(`/bus/seats?busId=${journey.id}&date=${formattedDate}&busType=${mappedType}&from=${journey.from}&to=${journey.to}&company=${journey.company || journey.terminal}&departureTime=${journey.departureTime}&price=${price}`);
                      }}
                      className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between overflow-hidden h-20"
                    >
                      <div className="flex items-center h-full">
                        <div
                          className="w-12 h-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                          style={{ 
                            backgroundColor: '#FA9A47',
                            borderTopLeftRadius: '1rem',
                            borderBottomLeftRadius: '1rem',
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="px-4 py-3">
                          <h3 className="font-semibold text-base mb-1 text-gray-900">
                            {journey.company || journey.terminal || `Bus terminal ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-900 mb-0">
                            <span className="text-gray-400">From :</span> {journey.from}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="text-gray-400">to :</span> {journey.to}
                          </p>
                        </div>
                      </div>
                      <div
                        className="px-4 py-2.5 rounded-xl text-white text-center min-w-[125px] mr-3 self-center"
                        style={{ backgroundColor: '#01005B' }}
                      >
                        <p className="text-[10px] font-normal mb-0">departure time</p>
                        <p className="text-xl font-bold leading-tight my-0.5">{journey.departureTime} ,{getDayAbbreviation(journey.date)}</p>
                        <p className="text-[10px]">{formatDate(journey.date)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}