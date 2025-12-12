import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowLeftRight } from 'lucide-react';
import Navigation from '../../components/navigation';
import { searchBuses, type Bus } from '../../api/bus';

export default function BusSelectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const fromName = searchParams.get('fromName') || from;
  const toName = searchParams.get('toName') || to;
  const date = searchParams.get('date') || '';

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const data = await searchBuses({ from, to, date });
        setBuses(data);
      } catch (err) {
        setError('Failed to load buses. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (from && to && date) {
      fetchBuses();
    }
  }, [from, to, date]);

  const getBusTypeColor = (type: string) => {
    switch (type) {
      case 'sleeping-bus':
        return 'bg-purple-100 text-purple-800';
      case 'mini-van':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusTypeLabel = (type: string) => {
    switch (type) {
      case 'sleeping-bus':
        return 'Sleeping Bus';
      case 'mini-van':
        return 'Mini Van';
      default:
        return 'Regular Bus';
    }
  };

  const getSeatAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${date.getDate()}th - ${months[date.getMonth()]} - ${date.getFullYear()} | ${days[date.getDay()]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Bus Booking" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for buses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Bus Booking" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/bus_booking')}
              className="mt-4 px-6 py-2 bg-[#01005B] text-white rounded-lg hover:bg-[#000442]"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-6xl mx-auto px-6 py-8">
         {/* Route Info */}
              <div className="bg-[#01005B] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-6 text-white">
                  <div className="text-center">
                    <p className="text-xl font-bold">{fromName}</p>
                  </div>
                  <ArrowLeftRight size={20} />
                  <div className="text-center">
                    <p className="text-xl font-bold">{toName}</p>
                  </div>
                </div>
                <p className="text-center text-white/80 mt-2 text-sm">{formatDate(date)}</p>
              </div>

        {/* Results Header */}
        <h1 className="text-2xl font-bold mb-6">
          Available Buses ({buses.length})
        </h1>

        {/* Bus List */}
        {buses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No buses found for this route.</p>
            <button
              onClick={() => navigate('/bus_booking')}
              className="mt-4 px-6 py-2 bg-[#01005B] text-white rounded-lg hover:bg-[#000442]"
            >
              Try Another Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{bus.company}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBusTypeColor(bus.type)}`}>
                        {getBusTypeLabel(bus.type)}
                      </span>
                    </div>
                    <p className="text-gray-600">{bus.busNumber}</p>
                    {/* <div className="flex items-center gap-1 mt-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{bus.rating}</span>
                    </div> */}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#FA9A47]"> ${bus.price} /Seat</div>
                    <div className="text-sm text-gray-500">per seat</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Departure</div>
                    <div className="font-semibold text-lg">{bus.departureTime}</div>
                    <div className="text-sm text-gray-600">{fromName}</div>
                  </div>
                  <div className="text-center flex flex-col items-center justify-center">
                    <Clock size={20} className="text-gray-400 mb-1" />
                    <div className="text-sm text-gray-600">{bus.duration}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Arrival</div>
                    <div className="font-semibold text-lg">{bus.arrivalTime}</div>
                    <div className="text-sm text-gray-600">{toName}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-400" />
                      <span className={`font-semibold ${getSeatAvailabilityColor(bus.availableSeats, bus.totalSeats)}`}>
                        {bus.availableSeats}/{bus.totalSeats} seats available
                      </span>
                    </div>
                    {bus.amenities && bus.amenities.length > 0 && (
                      <div className="flex gap-2">
                        {bus.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Map bus type correctly
                      const mappedType = bus.type === 'mini-van' ? 'mini-van' : 
                                       bus.type === 'sleeping-bus' ? 'sleeping-bus' : 'regular-bus';
                      navigate(`/bus/seats?busId=${bus.id}&date=${date}&busType=${mappedType}&from=${fromName}&to=${toName}&company=${bus.company}&departureTime=${bus.departureTime}&price=${bus.price}`);
                    }}
                    disabled={bus.availableSeats === 0}
                    className="px-6 py-2 bg-[#01005B] text-white rounded-lg hover:bg-[#000442] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {bus.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}