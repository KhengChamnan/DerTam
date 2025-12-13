import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, MapPin, Users, Maximize } from "lucide-react";
import { getHotelPropertyById, type HotelPropertyDetail } from "~/api/hotel";

export default function HotelDetailPage() {
  const { id } = useParams(); // This is now place_id
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<HotelPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getHotelPropertyById(id) // Now using place_id
        .then((data) => {
          console.log('Hotel data loaded:', data);
          setHotel(data);
        })
        .catch((error) => {
          console.error('Error loading hotel:', error);
          setHotel(null);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
   
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#e5e7eb', borderTopColor: '#01005B' }}></div>
            <p className="text-gray-600">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
       
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h2>
            <button
              onClick={() => navigate('/hotels')}
              style={{ color: '#01005B' }}
              className="hover:underline font-semibold"
            >
              Back to hotels
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allImages = hotel.place.images_url || [];

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center gap-2 text-gray-700 hover:text-[#01005B] transition-colors group"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Hotels</span>
          </button>
        </div>
      </header>

      {/* Image Gallery - Hero Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {allImages.length > 0 ? (
          <div>
            {/* Main Hero Image */}
            <div
              className="w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden relative cursor-pointer group"
              onClick={() => handleImageClick(0)}
            >
              <img
                src={allImages[0]}
                alt={hotel.place.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-2xl flex items-center justify-center">
                <Maximize className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={40} />
              </div>
            </div>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {allImages.slice(1, 6).map((img, idx) => (
                  <div
                    key={idx}
                    className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
                    onClick={() => handleImageClick(idx + 1)}
                  >
                    <img
                      src={img}
                      alt={`${hotel.place.name} ${idx + 2}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[350px] md:h-[450px] bg-gray-200 rounded-2xl flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{hotel.place.name}</h1>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold text-xl">{hotel.place.ratings}</span>
              <span className="text-gray-600">({hotel.place.reviews_count} reviews)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" style={{ color: '#01005B' }} />
            <span>{hotel.place.province_category.province_categoryName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <section className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.place.description}</p>
            </div>

            {/* Facilities */}
            {hotel.facilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Facilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.facilities.map((facility) => (
                    <div key={facility.facility_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img src={facility.image_url} alt={facility.facility_name} className="w-8 h-8 object-contain" />
                      <span className="text-gray-700 text-sm font-medium">{facility.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.room_properties.map((room) => (
                  <div key={room.room_properties_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img 
                        src={room.images_url[0] || "https://placehold.co/200x150/e5e7eb/6b7280?text=Room"} 
                        alt={room.room_type} 
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/200x150/e5e7eb/6b7280?text=Room";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold">{room.room_type}</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: '#01005B' }}>
                              ${room.price_per_night}
                            </div>
                            <div className="text-sm text-gray-600">per night</div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.room_description}</p>
                        
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Max {room.max_guests} guests</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            <span>{room.room_size}m²</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <span key={amenity.amenity_id} className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center gap-1">
                              <img src={amenity.image_url} alt={amenity.amenity_name} className="w-3 h-3" />
                              {amenity.amenity_name}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                              +{room.amenities.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {room.available_rooms_count} rooms available
                          </span>
                          <button
                            onClick={() => navigate(`/hotel/${hotel.property_id}/room/${room.room_properties_id}`)}
                            className="px-4 py-2 rounded-lg font-semibold text-white transition-all"
                            style={{ backgroundColor: '#01005B' }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Hotel Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{hotel.place.province_category.province_categoryName}</p>
                  <p className="text-sm text-gray-600">{hotel.place.province_category.category_description}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-bold text-lg">{hotel.place.ratings}</span>
                    <span className="text-gray-600 text-sm">({hotel.place.reviews_count} reviews)</span>
                  </div>
                </div>

                {hotel.place.operating_hours && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Operating Hours</p>
                    <div className="text-sm space-y-1">
                      {Object.entries(hotel.place.operating_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}:</span>
                          <span className="text-gray-600">{hours as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hotel.place.google_maps_link && (
                <a
                  href={hotel.place.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 py-3 rounded-xl font-bold text-white text-center block transition-all"
                  style={{ backgroundColor: '#01005B' }}
                >
                  View on Google Maps
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Image Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>
          <img
            src={allImages[selectedImageIndex]}
            alt={`${hotel.place.name} ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-3 h-3 rounded-full ${idx === selectedImageIndex ? 'bg-white' : 'bg-gray-500'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
