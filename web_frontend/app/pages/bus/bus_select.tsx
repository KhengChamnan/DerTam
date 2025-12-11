import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Users, Wifi, Coffee, ArrowLeftRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import Navigation from '../../components/navigation';

interface Bus {
  id: string;
  companyName: string;
  busType: 'mini-van' | 'sleeping-bus' | 'regular-bus';
  busTypeName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  totalSeats: number;
  rating: number;
  amenities: string[];
}

export default function BusSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    loadBuses();
  }, [from, to, date]);

  const loadBuses = () => {
    // Mock data - replace with API call
    const mockBuses: Bus[] = [
      {
        id: 'bus1',
        companyName: 'Perera Travels',
        busType: 'mini-van',
        busTypeName: 'Mini Van (15 seats)',
        from,
        to,
        departureTime: '9:00 AM',
        arrivalTime: '9:45 AM',
        duration: '45 Min',
        price: 200,
        currency: '$',
        availableSeats: 15,
        totalSeats: 15,
        rating: 4.5,
        amenities: ['WiFi', 'AC', 'Charging Port'],
      },
      {
        id: 'bus2',
        companyName: 'Gayan Express',
        busType: 'sleeping-bus',
        busTypeName: 'Sleeping Bus (34 seats)',
        from,
        to,
        departureTime: '10:00 AM',
        arrivalTime: '10:20 AM',
        duration: '20 Min',
        price: 250,
        currency: '$',
        availableSeats: 20,
        totalSeats: 34,
        rating: 4.8,
        amenities: ['WiFi', 'AC', 'Snacks', 'Blanket'],
      },
      {
        id: 'bus3',
        companyName: 'Lanka Transport',
        busType: 'regular-bus',
        busTypeName: 'Regular Bus (45 seats)',
        from,
        to,
        departureTime: '11:00 AM',
        arrivalTime: '11:45 AM',
        duration: '45 Min',
        price: 180,
        currency: '$',
        availableSeats: 30,
        totalSeats: 45,
        rating: 4.3,
        amenities: ['WiFi', 'AC'],
      },
      {
        id: 'bus4',
        companyName: 'Comfort Express',
        busType: 'sleeping-bus',
        busTypeName: 'Sleeping Bus (34 seats)',
        from,
        to,
        departureTime: '1:00 PM',
        arrivalTime: '1:20 PM',
        duration: '20 Min',
        price: 280,
        currency: '$',
        availableSeats: 10,
        totalSeats: 34,
        rating: 4.9,
        amenities: ['WiFi', 'AC', 'Snacks', 'Charging Port', 'Entertainment'],
      },
      {
        id: 'bus5',
        companyName: 'Quick Shuttle',
        busType: 'mini-van',
        busTypeName: 'Mini Van (15 seats)',
        from,
        to,
        departureTime: '2:00 PM',
        arrivalTime: '2:45 PM',
        duration: '45 Min',
        price: 220,
        currency: '$',
        availableSeats: 8,
        totalSeats: 15,
        rating: 4.6,
        amenities: ['WiFi', 'AC'],
      },
    ];

    setTimeout(() => {
      setBuses(mockBuses);
      setLoading(false);
    }, 500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${date.getDate()}th - ${months[date.getMonth()]} - ${date.getFullYear()} | ${days[date.getDay()]}`;
  };

  const handleSelectBus = (bus: Bus) => {
    navigate(`/bus/seats?busId=${bus.id}&busType=${bus.busType}&from=${from}&to=${to}&date=${date}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Bus Booking" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01005B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for buses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium">SS</span>
            </div>
            <div>
              <p className="font-medium">Hello Saduni Silva!</p>
              <p className="text-sm text-gray-600">Where you want go</p>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#01005B' }}>
            <div className="flex items-center justify-center gap-6 text-white">
              <div className="text-center">
                <p className="text-2xl font-bold">{from}</p>
              </div>
              <div className="flex flex-col items-center">
                <ArrowLeftRight size={24} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{to}</p>
              </div>
            </div>
            <p className="text-center text-white/80 mt-3">{formatDate(date)}</p>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select bus</h2>
          
          {buses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No buses available for this route</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#01005B' }}
              >
                Try Another Search
              </button>
            </div>
          ) : (
            buses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{bus.companyName}</h3>
                    <p className="text-sm text-gray-600">{bus.busTypeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                      {bus.currency} {bus.price}
                    </p>
                    <p className="text-sm text-gray-600">{bus.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm">{bus.departureTime}</span>
                    <ArrowLeftRight size={14} className="text-gray-400" />
                    <span className="text-sm">{bus.arrivalTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm">
                      {bus.availableSeats} Seats left
                    </span>
                  </div>
                </div>

                {bus.availableSeats <= 5 && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      Only {bus.availableSeats} seats left!
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {bus.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSelectBus(bus)}
                    className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#01005B' }}
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}