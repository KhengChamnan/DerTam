import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router";
import { ChevronLeft, Users, Bed, Maximize, Check, X, Calendar, CreditCard, ZoomIn } from "lucide-react";
import Navigation from "~/components/navigation";
import { getHotelPropertyById, getHotelProperties, type HotelPropertyDetail } from "~/api/hotel";
import HotelImageGallery from "./components/hotelimagegallery";
import InstallAppModal from "~/components/install_app_modal";

export default function RoomDetailPage() {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [hotel, setHotel] = useState<HotelPropertyDetail | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || "");
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || "");
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInstallAppModal, setShowInstallAppModal] = useState(false);

  // Load hotel and room data from API
  useEffect(() => {
    loadHotelAndRoom();
  }, [id, roomId]);

  const loadHotelAndRoom = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      let hotelData: HotelPropertyDetail | null = null;
      
      try {
        // Try fetching by the provided ID first (might be property_id or placeID)
        hotelData = await getHotelPropertyById(id);
      } catch (err: any) {
        // Silently try alternative approach: fetch all hotels and match by ID
        const allHotels = await getHotelProperties();
        
        const matchedHotel = allHotels.find(h => 
          h.property_id.toString() === id || 
          h.place.placeID.toString() === id
        );
                
        if (matchedHotel) {
          // Retry with the correct placeID
          hotelData = await getHotelPropertyById(matchedHotel.place.placeID.toString());
        } else {
          throw new Error('Hotel not found. Please return to the hotel list and try again.');
        }
      }
      
      if (!hotelData) {
        throw new Error('Failed to load hotel data');
      }
      
      setHotel(hotelData);
      
      // Find the specific room by room_properties_id
      const room = hotelData.room_properties.find(
        (r) => r.room_properties_id.toString() === roomId
      );
      
      if (room) {
        setSelectedRoom(room);
      } else {
        setError(`Room #${roomId} not found in ${hotelData.place.name}. This room may no longer be available.`);
      }
    } catch (err: any) {
      console.error('Failed to load room details:', err);
      setError(err.message || 'Unable to load room details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const getTotalPrice = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price_per_night * calculateNights();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Hotel" />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#01005B] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !hotel || !selectedRoom) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Hotel" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || 'Room not found'}
              </h2>
              <p className="text-gray-600 text-sm">
                We couldn't load this room. It may have been removed or is no longer available.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#01005B' }}
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/hotel')}
                className="px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:bg-gray-50"
                style={{ borderColor: '#01005B', color: '#01005B' }}
              >
                Browse Hotels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    // Close booking modal and show install app modal
    setShowBookingModal(false);
    setShowInstallAppModal(true);
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    if (selectedRoom) {
      setSelectedImage((prev) => (prev + 1) % selectedRoom.images_url.length);
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      setSelectedImage((prev) => 
        prev === 0 ? selectedRoom.images_url.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Hotel" />
      
      {/* Header with Back Button */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <button
            onClick={() => {
              // Always use browser back for natural navigation
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate('/');
              }
            }}
            className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#01005B] hover:to-[#000047] text-gray-700 hover:text-white rounded-xl border border-gray-200 hover:border-[#01005B] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-white/50 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="font-semibold text-sm sm:text-base tracking-wide">Back</span>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <section>
        <HotelImageGallery
          images={selectedRoom.images_url}
          hotelName={`${selectedRoom.room_type} - ${hotel.place.name}`}
          onImageClick={handleImageClick}
        />
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {selectedRoom.room_type}
                  </h1>
                  <p className="text-gray-600">
                    {hotel.place.name} • {hotel.place.province_category.province_categoryName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#01005B' }}>
                    ${selectedRoom.price_per_night}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: '#01005B' }} />
                  <span>{selectedRoom.max_guests || 2} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5" style={{ color: '#01005B' }} />
                  <span>{selectedRoom.room_size || 35} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" style={{ color: '#01005B' }} />
                  <span>{selectedRoom.available_rooms_count} available</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this room</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {selectedRoom.room_description || 
                  `Experience luxury and comfort in our ${selectedRoom.room_type}. This beautifully appointed room offers modern amenities and stunning views.`}
              </p>
              {selectedRoom.available_rooms_count > 0 && selectedRoom.available_rooms_count <= 5 && (
                <p className="text-sm text-green-600 font-semibold">
                  Only {selectedRoom.available_rooms_count} rooms left at this price!
                </p>
              )}
            </div>

            {/* Amenities */}
            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Room Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRoom.amenities.map((amenity: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-gray-700">{amenity.amenity_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotel Facilities */}
            {hotel.facilities && hotel.facilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hotel Facilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {hotel.facilities.map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-gray-700">{facility.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book this room</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                    style={{ '--tw-ring-color': '#01005B' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                    style={{ '--tw-ring-color': '#01005B' } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none"
                    style={{ '--tw-ring-color': '#01005B' } as any}
                  >
                    {[...Array(selectedRoom.max_guests || 4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-semibold">${selectedRoom.price_per_night}</span>
                  </div>
                  {checkIn && checkOut && (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Number of nights</span>
                        <span className="font-semibold">{calculateNights()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 pt-4 border-t">
                        <span>Total</span>
                        <span style={{ color: '#01005B' }}>
                          ${getTotalPrice()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!checkIn || !checkOut || selectedRoom.available_rooms_count === 0}
                  className="w-full text-white py-3.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: '#01005B' }}
                >
                  {selectedRoom.available_rooms_count === 0 ? 'Sold Out' : 'Book Now'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Free cancellation up to 24 hours before check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Image Modal */}
      {showImageModal && selectedRoom && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-10 bg-black/70 px-4 py-2 rounded-full">
            <span className="text-white font-semibold">
              {selectedImage + 1} / {selectedRoom.images_url.length}
            </span>
          </div>

          {/* Previous Button */}
          {selectedRoom.images_url.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Main Image */}
          <div className="max-w-7xl max-h-[90vh] px-4">
            <img
              src={selectedRoom.images_url[selectedImage]}
              alt={`${selectedRoom.room_type} - Image ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* Next Button */}
          {selectedRoom.images_url.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-white rotate-180" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {selectedRoom.images_url.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-4xl overflow-x-auto">
              <div className="flex gap-2 px-4">
                {selectedRoom.images_url.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === idx
                        ? "ring-4 ring-white"
                        : "opacity-60 hover:opacity-100"
                    } transition-all`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Booking</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedRoom.room_type}</h4>
                <p className="text-sm text-gray-600">{hotel.place.name}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-semibold">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-semibold">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-semibold">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-semibold">{calculateNights()}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold">
                  <span>Total</span>
                  <span style={{ color: '#01005B' }}>
                    ${getTotalPrice()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmBooking}
                className="w-full text-white py-3 rounded-xl font-bold transition-all"
                style={{ backgroundColor: '#01005B' }}
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Proceed to Payment
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={showInstallAppModal}
        onClose={() => setShowInstallAppModal(false)}
        feature="hotel booking"
      />
    </div>
  );
}
