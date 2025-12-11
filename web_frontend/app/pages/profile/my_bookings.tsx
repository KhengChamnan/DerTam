import { useState } from 'react';
import { ArrowLeft, Calendar, Bus, MapPin, Clock, User, Hotel } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';

interface Booking {
  id: string;
  type: 'bus' | 'hotel';
  from?: string;
  to?: string;
  hotelName?: string;
  location?: string;
  date: string;
  departureTime?: string;
  arrivalTime?: string;
  checkInDate?: string;
  checkOutDate?: string;
  seats?: string[];
  rooms?: number;
  guests?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  busCompany?: string;
  busType?: string;
  passengerName: string;
  bookingDate: string;
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'bus' | 'hotel'>('all');

  // Mock bookings data
  const allBookings: Booking[] = [
    {
      id: 'BK001',
      type: 'bus',
      from: 'Colombo',
      to: 'Kandy',
      date: '2024-12-01',
      departureTime: '09:00 AM',
      arrivalTime: '12:30 PM',
      seats: ['A1', 'A2'],
      status: 'upcoming',
      price: 400,
      busCompany: 'Perera Travels',
      busType: 'Regular Bus - AC',
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-20',
    },
    {
      id: 'HT001',
      type: 'hotel',
      hotelName: 'Grand Hotel Kandy',
      location: 'Kandy',
      date: '2024-12-01',
      checkInDate: '2024-12-01',
      checkOutDate: '2024-12-03',
      rooms: 1,
      guests: 2,
      status: 'upcoming',
      price: 250,
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-21',
    },
    {
      id: 'BK002',
      type: 'bus',
      from: 'Galle',
      to: 'Matara',
      date: '2024-11-20',
      departureTime: '02:00 PM',
      arrivalTime: '03:30 PM',
      seats: ['B3'],
      status: 'completed',
      price: 150,
      busCompany: 'Express Bus',
      busType: 'Mini Van',
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-15',
    },
    {
      id: 'HT002',
      type: 'hotel',
      hotelName: 'Beach Resort Galle',
      location: 'Galle',
      date: '2024-11-18',
      checkInDate: '2024-11-18',
      checkOutDate: '2024-11-20',
      rooms: 1,
      guests: 2,
      status: 'completed',
      price: 180,
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-10',
    },
    {
      id: 'BK003',
      type: 'bus',
      from: 'Colombo',
      to: 'Jaffna',
      date: '2024-11-15',
      departureTime: '08:00 PM',
      arrivalTime: '05:00 AM',
      seats: ['C5'],
      status: 'cancelled',
      price: 800,
      busCompany: 'Northern Express',
      busType: 'Sleeping Bus',
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-10',
    },
    {
      id: 'BK004',
      type: 'bus',
      from: 'Kandy',
      to: 'Nuwara Eliya',
      date: '2024-12-05',
      departureTime: '10:00 AM',
      arrivalTime: '01:00 PM',
      seats: ['D2', 'D3'],
      status: 'upcoming',
      price: 350,
      busCompany: 'Hill Country Express',
      busType: 'Regular Bus - AC',
      passengerName: 'Saduni Silva',
      bookingDate: '2024-11-22',
    },
  ];

  const filteredBookings = filter === 'all' 
    ? allBookings 
    : allBookings.filter(b => b.type === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getBookingCount = (type: 'all' | 'bus' | 'hotel') => {
    if (type === 'all') return allBookings.length;
    return allBookings.filter(b => b.type === type).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation activeNav="Profile" /> */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage your bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All ({getBookingCount('all')})
            </button>
            <button
              onClick={() => setFilter('bus')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                filter === 'bus'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bus Booking ({getBookingCount('bus')})
            </button>
            <button
              onClick={() => setFilter('hotel')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                filter === 'hotel'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Hotel Booking ({getBookingCount('hotel')})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">Start planning your next trip!</p>
              <button
                onClick={() => navigate('/bus')}
                className="px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000047] transition-colors"
              >
                Book Now
              </button>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Bus Booking Card */}
                {booking.type === 'bus' && (
                  <>
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#01005B] flex items-center justify-center">
                          <Bus size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">{booking.busCompany}</h3>
                          <p className="text-sm text-gray-600">{booking.busType}</p>
                          <p className="text-xs text-gray-500 mt-1">Booking ID: {booking.id}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    {/* Route Information */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">From</span>
                          </div>
                          <p className="font-bold text-lg">{booking.from}</p>
                          <p className="text-sm text-gray-600">{booking.departureTime}</p>
                        </div>

                        <div className="px-4">
                          <div className="w-12 h-0.5 bg-gray-300"></div>
                        </div>

                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-sm text-gray-600">To</span>
                            <MapPin size={16} className="text-gray-500" />
                          </div>
                          <p className="font-bold text-lg">{booking.to}</p>
                          <p className="text-sm text-gray-600">{booking.arrivalTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Travel Date</span>
                        </div>
                        <p className="font-semibold">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Seats</span>
                        </div>
                        <p className="font-semibold">{booking.seats?.join(', ')}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Booked On</span>
                        </div>
                        <p className="font-semibold">{formatDate(booking.bookingDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Price</span>
                        <p className="font-bold text-xl text-[#01005B]">${booking.price}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Hotel Booking Card */}
                {booking.type === 'hotel' && (
                  <>
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center">
                          <Hotel size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">{booking.hotelName}</h3>
                          <p className="text-sm text-gray-600">{booking.location}</p>
                          <p className="text-xs text-gray-500 mt-1">Booking ID: {booking.id}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    {/* Stay Information */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">Check-in</span>
                          </div>
                          <p className="font-bold">{formatDate(booking.checkInDate!)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-sm text-gray-600">Check-out</span>
                          </div>
                          <p className="font-bold">{formatDate(booking.checkOutDate!)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Hotel size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Rooms</span>
                        </div>
                        <p className="font-semibold">{booking.rooms}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Guests</span>
                        </div>
                        <p className="font-semibold">{booking.guests}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Booked On</span>
                        </div>
                        <p className="font-semibold">{formatDate(booking.bookingDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Price</span>
                        <p className="font-bold text-xl text-amber-600">${booking.price}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/booking/details/${booking.id}`)}
                    className="flex-1 py-2.5 border-2 border-[#01005B] text-[#01005B] rounded-lg font-semibold hover:bg-[#01005B] hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                  {booking.status === 'upcoming' && (
                    <>
                      <button className="flex-1 py-2.5 bg-[#01005B] text-white rounded-lg font-semibold hover:bg-[#000047] transition-colors">
                        Download {booking.type === 'bus' ? 'Ticket' : 'Voucher'}
                      </button>
                      <button className="px-6 py-2.5 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                      Book Again
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}