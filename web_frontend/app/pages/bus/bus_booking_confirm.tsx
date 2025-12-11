import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import Navigation from '../../components/navigation';

export default function BookingConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const busId = searchParams.get('busId') || '';
  const seats = searchParams.get('seats')?.split(',') || [];
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  // Form states
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  // Mock bus data
  const busData = {
    companyName: 'Perera Travels',
    busType: 'A/C Sleeper (2+2)',
    departureTime: '9:00 AM',
    arrivalTime: '9:45 AM',
    duration: '45 Min',
    price: 200,
    currency: '$',
  };

  const getTotalPrice = () => {
    return seats.length * busData.price;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleConfirmBooking = async () => {
    if (!passengerName || !passengerEmail || !passengerPhone) {
      alert('Please fill in all passenger details');
      return;
    }

    setLoading(true);

    const booking = {
      id: `booking_${Date.now()}`,
      userId: 'current_user',
      busId,
      seats,
      from,
      to,
      date,
      passengerName,
      passengerEmail,
      passengerPhone,
      totalPrice: getTotalPrice(),
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED',
      busDetails: busData,
    };

    try {
      // Save to localStorage (replace with API call)
      const existingBookings = localStorage.getItem('busBookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      bookings.push(booking);
      localStorage.setItem('busBookings', JSON.stringify(bookings));

      setTimeout(() => {
        setLoading(false);
        alert('Booking confirmed successfully! 🎉');
        navigate('/bus_booking');
      }, 1500);
    } catch (error) {
      console.error('Error confirming booking:', error);
      setLoading(false);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Bus Booking" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+94 XX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Booking confirmation will be sent to your email and phone number.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                {/* Route */}
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">{from} → {to}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Travel Date</p>
                    <p className="font-medium">{formatDate(date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-medium">{busData.departureTime}</p>
                  </div>
                </div>

                {/* Seats */}
                <div className="flex items-start gap-3">
                  <Users size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Seats</p>
                    <p className="font-medium">{seats.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bus Company</span>
                    <span className="font-medium">{busData.companyName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bus Type</span>
                    <span className="font-medium">{busData.busType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per seat</span>
                    <span className="font-medium">{busData.currency} {busData.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of seats</span>
                    <span className="font-medium">{seats.length}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                    {busData.currency} {getTotalPrice()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#01005B' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}