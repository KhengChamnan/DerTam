import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { getPlaceById, type Place } from "~/api/place";
import Navigation from "~/components/navigation";
import PlaceHeader from "./components/placeheader";
import ImageGallery from "./components/imagegallery";
import DetailInfo from "./components/detailinfo";
import GuideSection from "./components/guidesection";
import NearbyPlaceCard from "./components/nearbyplacecard";
import HotelNearbyCard from "./components/hotelnearbycard";
import RestaurantNearbyCard from "./components/restaurantnearbycard";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlaceDetails(id);
    }
  }, [id]);

  async function loadPlaceDetails(placeId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlaceById(placeId);
      setPlace(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load place details');
      console.error('Error loading place details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
  };

  const nextImage = () => {
    if (place?.images) {
      setSelectedImageIndex((prev) => (prev + 1) % place.images.length);
    }
  };

  const prevImage = () => {
    if (place?.images) {
      setSelectedImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Place not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000047] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Destinations" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PlaceHeader 
          name={place.name}
          location={place.location}
          rating={place.rating}
          reviews={place.reviews} 
          isFavorite={false} 
          onToggleFavorite={() => {
            // TODO: Implement favorite toggle
            console.log('Toggle favorite');
          }} 
          onStartPlanning={() => {
            // TODO: Implement planning
            console.log('Start planning');
          }}        
        />

        <ImageGallery 
          images={place.images} 
          placeName={place.name}
          onImageClick={handleImageClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          <div className="lg:col-span-2 space-y-6">
            <DetailInfo
              description={place.description}
              openingHours={place.openingHours}
              entryFee={place.entryFee}
              highlights={place.highlights}
            />

            <GuideSection tips={place.tips || []} />
          </div>

          <div className="space-y-6">
            {/* Nearby Places */}
            {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Nearby Places</h3>
                  {place.nearbyPlaces.length > 2 && (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {showAllPlaces ? place.nearbyPlaces.length : '2'} of {place.nearbyPlaces.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(showAllPlaces ? place.nearbyPlaces : place.nearbyPlaces.slice(0, 2)).map((nearby) => (
                    <NearbyPlaceCard key={nearby.id} place={nearby} />
                  ))}
                </div>
                {place.nearbyPlaces.length > 2 && (
                  <button
                    onClick={() => setShowAllPlaces(!showAllPlaces)}
                    className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-300 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-2 text-blue-900 font-semibold">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>{showAllPlaces ? 'Show Less' : `Discover ${place.nearbyPlaces.length - 2} More Places`}</span>
                      {showAllPlaces ? <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Nearby Hotels */}
            {place.nearbyHotels && place.nearbyHotels.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Nearby Hotels</h3>
                  {place.nearbyHotels.length > 3 && (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {showAllHotels ? place.nearbyHotels.length : '3'} of {place.nearbyHotels.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(showAllHotels ? place.nearbyHotels : place.nearbyHotels.slice(0, 3)).map((hotel) => (
                    <HotelNearbyCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
                {place.nearbyHotels.length > 3 && (
                  <button
                    onClick={() => setShowAllHotels(!showAllHotels)}
                    className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-300 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-2 text-purple-900 font-semibold">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>{showAllHotels ? 'Show Less' : `View ${place.nearbyHotels.length - 3} More Hotels`}</span>
                      {showAllHotels ? <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Nearby Restaurants */}
            {place.nearbyRestaurants && place.nearbyRestaurants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Nearby Restaurants</h3>
                  {place.nearbyRestaurants.length > 3 && (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {showAllRestaurants ? place.nearbyRestaurants.length : '3'} of {place.nearbyRestaurants.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(showAllRestaurants ? place.nearbyRestaurants : place.nearbyRestaurants.slice(0, 3)).map((restaurant) => (
                    <RestaurantNearbyCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
                {place.nearbyRestaurants.length > 3 && (
                  <button
                    onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                    className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border-2 border-dashed border-amber-200 hover:border-amber-300 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-2 text-amber-900 font-semibold">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>{showAllRestaurants ? 'Show Less' : `Explore ${place.nearbyRestaurants.length - 3} More Restaurants`}</span>
                      {showAllRestaurants ? <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Image Gallery Modal */}
      {showGalleryModal && place?.images && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeGallery}
        >
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={32} />
          </button>

          {/* Image Counter */}
          {place.images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-base sm:text-lg font-medium bg-black/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              {selectedImageIndex + 1} / {place.images.length}
            </div>
          )}

          {/* Previous Button */}
          {place.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 sm:left-4 text-white hover:text-gray-300 transition-colors bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>
          )}

          {/* Main Image */}
          <img
            src={place.images[selectedImageIndex]}
            alt={`${place.name} - Image ${selectedImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {place.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 sm:right-4 text-white hover:text-gray-300 transition-colors bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {place.images.length > 1 && (
            <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 gap-2 overflow-x-auto max-w-[90vw] px-4 scrollbar-hide">
            {place.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(idx);
                }}
                className={`w-16 h-16 sm:w-20 sm:h-20 object-cover cursor-pointer rounded transition-all ${
                  idx === selectedImageIndex 
                    ? 'ring-4 ring-white opacity-100' 
                    : 'opacity-50 hover:opacity-75'
                }`}
              />
            ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}