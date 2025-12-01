import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Star, MapPin, Phone, Mail, Clock, CheckCircle, Award, Shield } from "lucide-react";
import { useHotelData } from "./hooks/useHotelData";
import HotelImageGallery from "./components/hotelimagegallery";
import HotelHeader from "./components/hotelheader";
import HotelRoomCard from "./components/hotelroomcard";
import HotelAmenities from "./components/hotelamenities";
import HotelReviews from "./components/hotelreviews";

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hotel, loading } = useHotelData(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#e5e7eb', borderTopColor: '#01005B' }}></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h2>
          <button
            onClick={() => navigate(-1)}
            style={{ color: '#01005B' }}
            className="hover:underline font-semibold"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 transition-colors group"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#01005B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#374151';
            }}
          >
            <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <HotelImageGallery
        images={hotel.images}
        hotelName={hotel.name}
        onImageClick={handleImageClick}
      />

      {/* Hotel Header */}
      <HotelHeader
        name={hotel.name}
        rating={hotel.rating}
        reviews={hotel.reviews}
        location={hotel.location}
        // pricePerNight={hotel.pricePerNight}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Info */}
          <section className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this hotel</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <HotelAmenities amenities={hotel.amenities} />

            {/* Available Rooms */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
                <Link to={`/hotel/${hotel.id}/rooms`}>
                  <button 
                    className="px-4 py-2 border-2 rounded-lg font-semibold transition-all text-sm"
                    style={{ 
                      borderColor: '#01005B',
                      color: '#01005B'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#01005B';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#01005B';
                    }}
                  >
                    View All Rooms
                  </button>
                </Link>
              </div>
              <div className="space-y-4">
                {hotel.rooms.map((room: any) => (
                  <HotelRoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <HotelReviews reviews={hotel.reviewsList} rating={hotel.rating} totalReviews={hotel.reviews} />
          </section>

          {/* Right Column - Hotel Info Card */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              {/* <div className="mb-6 pb-6 border-b border-gray-100"> */}
                {/* <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-sm text-gray-600">Starting from</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold" style={{ color: '#01005B' }}>${hotel.pricePerNight}</span>
                  <span className="text-gray-600">/ night</span>
                </div> */}
                {/* <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">{hotel.rating}</span>
                  <span className="text-gray-600">({hotel.reviews} reviews)</span>
                </div>
              </div> */}
              

              {/* Hotel Highlights */}
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Hotel Highlights</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg flex-shrink-0">
                      <Award className="w-5 h-5" style={{ color: '#01005B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Top Rated</p>
                      <p className="text-xs text-gray-600">Highly rated by guests</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg flex-shrink-0">
                      <MapPin className="w-5 h-5" style={{ color: '#01005B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Prime Location</p>
                      <p className="text-xs text-gray-600">{hotel.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-5 h-5" style={{ color: '#01005B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Free Cancellation</p>
                      <p className="text-xs text-gray-600">Cancel up to 24 hours before</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg flex-shrink-0">
                      <Shield className="w-5 h-5" style={{ color: '#01005B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Secure Booking</p>
                      <p className="text-xs text-gray-600">Your information is protected</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg flex-shrink-0">
                      <Clock className="w-5 h-5" style={{ color: '#01005B' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">24/7 Support</p>
                      <p className="text-xs text-gray-600">Available anytime you need</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Contact Information</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" style={{ color: '#01005B' }} />
                  <span>+855 23 981 888</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" style={{ color: '#01005B' }} />
                  <span>info@{hotel.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>

              {/* View Rooms CTA */}
              <button
                onClick={() => navigate(`/hotel/${hotel.id}/rooms`)}
                style={{ backgroundColor: '#01005B' }}
                className="w-full text-white py-4 rounded-xl font-bold shadow-lg transition-all"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#000047';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#01005B';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Available Rooms
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Select your preferred room to book
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
