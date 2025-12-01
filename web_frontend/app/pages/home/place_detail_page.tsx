import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { ChevronLeft, Navigation } from "lucide-react";

// Import components
import ImageGallery from "./components/imagegallery";
import GalleryModal from "./components/gallerymodal";
import PlaceHeader from "./components/placeheader";
import DetailInfo from "./components/detailinfo";
import GuideSection from "./components/guidesection";
import NearbyPlaceCard from "./components/nearbyplacecard";
import HotelNearbyCard from "./components/hotalnearbycard";
import RestaurantNearbyCard from "./components/restaurantnearbycard";

// Import custom hook
import { usePlaceData } from "./hooks/usePlaceData";

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { place, loading } = usePlaceData(id);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsGalleryOpen(true);
  };

  const handlePreviousImage = () => {
    setSelectedImage((prev) => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => Math.min(place.images.length - 1, prev + 1));
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(place?.location || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
  };

  const handleStartPlanning = () => {
    navigate("/trip_plan");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#01005B' }}></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Place not found</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 hover:underline"
            style={{ color: '#01005B' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Clean Design */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 transition-colors group"
            style={{ '--hover-color': '#01005B' } as any}
            onMouseEnter={(e) => e.currentTarget.style.color = '#01005B'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <ImageGallery
        images={place.images}
        placeName={place.name}
        onImageClick={handleImageClick}
      />

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <GalleryModal
          images={place.images}
          placeName={place.name}
          selectedImage={selectedImage}
          onClose={() => setIsGalleryOpen(false)}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          onSelectImage={setSelectedImage}
        />
      )}

      {/* Place Header */}
      <PlaceHeader
        name={place.name}
        rating={place.rating}
        reviews={place.reviews}
        location={place.location}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onStartPlanning={handleStartPlanning}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Info */}
          <section className="lg:col-span-2 space-y-6">
            <DetailInfo
              openingHours={place.openingHours}
              entryFee={place.entryFee}
              weather={place.weather}
              description={place.description}
              highlights={place.highlights}
            />

            <GuideSection tips={place.tips} />

            {place.nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: '#01005B' }}></div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nearby Places
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.nearbyPlaces.map((nearbyPlace: any) => (
                    <NearbyPlaceCard key={nearbyPlace.id} place={nearbyPlace} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Column - Recommendations */}
          <aside className="space-y-6">
            {/* Nearby Hotels */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#01005B' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Nearby Hotels
                </h2>
              </div>
              <div className="space-y-4">
                {place.nearbyHotels.map((hotel: any) => (
                  <HotelNearbyCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </div>

            {/* Nearby Restaurants */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#01005B' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Nearby Restaurants
                </h2>
              </div>
              <div className="space-y-4">
                {place.nearbyRestaurants.map((restaurant: any) => (
                  <RestaurantNearbyCard
                    key={restaurant.id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
} 
