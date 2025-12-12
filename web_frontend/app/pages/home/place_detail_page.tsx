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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#01005B] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-red-600 text-5xl mb-4">⚠</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Place</h3>
          <p className="text-gray-600 mb-6">{error || 'Place not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#01005B] text-white rounded-lg font-medium hover:bg-[#000047] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <Navigation activeNav="Destinations" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PlaceHeader 
          name={place.name}
          location={place.location}
          rating={place.rating}
          reviews={place.reviews} 
          isFavorite={false} 
          onToggleFavorite={() => {
            console.log('Toggle favorite');
          }} 
          onStartPlanning={() => {
            console.log('Start planning');
          }}        
        />

        <ImageGallery 
          images={place.images} 
          placeName={place.name}
          onImageClick={handleImageClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gray-300 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📍</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-0.5">Nearby Places</h3>
                        <p className="text-xs text-gray-500">Locations within 5km radius</p>
                        {/* <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-[#01005B] bg-[#01005B]/10 px-2 py-0.5 rounded font-medium">Updated</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-[#01005B] leading-none">{place.nearbyPlaces.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyPlaces.length > 2 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#01005B] rounded-full"></div>
                        <span className="text-sm text-gray-700">Showing <span className="font-bold text-[#01005B]">{showAllPlaces ? place.nearbyPlaces.length : 2}</span> of {place.nearbyPlaces.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{place.nearbyPlaces.length - 2} more items</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {(showAllPlaces ? place.nearbyPlaces : place.nearbyPlaces.slice(0, 2)).map((nearby) => (
                    <NearbyPlaceCard key={nearby.id} place={nearby} />
                  ))}
                </div>
                {place.nearbyPlaces.length > 2 && (
                  <button
                    onClick={() => setShowAllPlaces(!showAllPlaces)}
                    className="w-full mt-5 py-3 px-5 bg-[#01005B] text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    {showAllPlaces ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <span>View {place.nearbyPlaces.length - 2} More Places</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Nearby Hotels */}
            {place.nearbyHotels && place.nearbyHotels.length > 0 && (
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-2xl">🏨</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-0.5">Nearby Hotels</h3>
                        <p className="text-xs text-gray-500">Accommodations nearby</p>
                        {/* <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-[#01005B] bg-[#01005B]/10 px-2 py-0.5 rounded font-medium">Updated</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-[#01005B] leading-none">{place.nearbyHotels.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyHotels.length > 3 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#01005B] rounded-full"></div>
                        <span className="text-sm text-gray-700">Showing <span className="font-bold text-[#01005B]">{showAllHotels ? place.nearbyHotels.length : 3}</span> of {place.nearbyHotels.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{place.nearbyHotels.length - 3} more items</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {(showAllHotels ? place.nearbyHotels : place.nearbyHotels.slice(0, 3)).map((hotel) => (
                    <HotelNearbyCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
                {place.nearbyHotels.length > 3 && (
                  <button
                    onClick={() => setShowAllHotels(!showAllHotels)}
                    className="w-full mt-5 py-3 px-5 bg-[#01005B] text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    {showAllHotels ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <span>View {place.nearbyHotels.length - 3} More Hotels</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Nearby Restaurants */}
            {place.nearbyRestaurants && place.nearbyRestaurants.length > 0 && (
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-6 border-2 border-gray-100">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-0.5">Nearby Restaurants</h3>
                        <p className="text-xs text-gray-500">Dining options available</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-[#01005B] leading-none">{place.nearbyRestaurants.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyRestaurants.length > 3 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#01005B] rounded-full"></div>
                        <span className="text-sm text-gray-700">Showing <span className="font-bold text-[#01005B]">{showAllRestaurants ? place.nearbyRestaurants.length : 3}</span> of {place.nearbyRestaurants.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{place.nearbyRestaurants.length - 3} more items</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {(showAllRestaurants ? place.nearbyRestaurants : place.nearbyRestaurants.slice(0, 3)).map((restaurant) => (
                    <RestaurantNearbyCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
                {place.nearbyRestaurants.length > 3 && (
                  <button
                    onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                    className="w-full mt-5 py-3 px-5 bg-[#01005B] text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    {showAllRestaurants ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <span>View {place.nearbyRestaurants.length - 3} More Restaurants</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
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