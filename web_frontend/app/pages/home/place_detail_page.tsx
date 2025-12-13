import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles , MapPinHouse, LucideHotel, Utensils} from "lucide-react";
import { getPlaceById, type Place } from "~/api/place";
import Navigation from "~/components/navigation";
import PlaceHeader from "./components/placeheader";
import ImageGallery from "./components/imagegallery";
import DetailInfo from "./components/detailinfo";
import NearbyPlaceCard from "./components/nearbyplacecard";
import HotelNearbyCard from "./components/hotelnearbycard";
import RestaurantNearbyCard from "./components/restaurantnearbycard";
import InstallAppModal from "~/components/install_app_modal";

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
  const [showInstallModal, setShowInstallModal] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 overflow-x-hidden">
      <Navigation activeNav="Destinations" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        <PlaceHeader 
          name={place.name}
          location={place.location}
          rating={place.rating}
          reviews={place.reviews} 
          isFavorite={false} 
          onToggleFavorite={() => {
            console.log('Toggle favorite');
          }} 
          onStartPlanning={() => setShowInstallModal(true)}
        />

        <ImageGallery 
          images={place.images} 
          placeName={place.name}
          onImageClick={handleImageClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <DetailInfo
              description={place.description}
              openingHours={place.openingHours}
              entryFee={place.entryFee}
              highlights={place.highlights}
            />
          </div>

          <div className="space-y-6 pb-6">
            {/* Nearby Places */}
            {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-4 sm:p-6 border-2 border-gray-100 overflow-hidden">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2 overflow-hidden">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xl sm:text-2xl">
                          <MapPinHouse className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 truncate">Nearby Places</h3>
                        <p className="text-xs text-gray-500 truncate">Locations within 5km radius</p>
                        {/* <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-[#01005B] bg-[#01005B]/10 px-2 py-0.5 rounded font-medium">Updated</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl sm:text-4xl font-black text-[#01005B] leading-none">{place.nearbyPlaces.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyPlaces.length > 2 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-xs sm:text-sm text-gray-700 break-words">Showing <span className="font-bold text-[#01005B]">{showAllPlaces ? place.nearbyPlaces.length : 2}</span> of {place.nearbyPlaces.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{place.nearbyPlaces.length - 2} more items</span>
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
                    className="w-full mt-4 sm:mt-5 py-2.5 sm:py-3 px-4 sm:px-5 bg-[#01005B] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
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
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-4 sm:p-6 border-2 border-gray-100 overflow-hidden">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2 overflow-hidden">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-xl sm:text-2xl">
                          <LucideHotel className="w-5 h-5 sm:w-6 sm:h-6" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 truncate">Nearby Hotels</h3>
                        <p className="text-xs text-gray-500 truncate">Accommodations nearby</p>
                        {/* <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-[#01005B] bg-[#01005B]/10 px-2 py-0.5 rounded font-medium">Updated</span>
                        </div> */}
                      </div>
                    </div>
                    <div className="text-right shrink-0 min-w-[60px] max-w-[80px]">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#01005B] leading-none break-words">{place.nearbyHotels.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyHotels.length > 3 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 bg-[#01005B] rounded-full shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700 break-words">Showing <span className="font-bold text-[#01005B]">{showAllHotels ? place.nearbyHotels.length : 3}</span> of {place.nearbyHotels.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{place.nearbyHotels.length - 3} more items</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {(showAllHotels ? place.nearbyHotels : place.nearbyHotels.slice(0, 3)).map((hotel) => {
                    const hotelCardData = {
                      ...hotel,
                      place_id: hotel.place_id ?? place.id,
                    };
                    console.log('Hotel card data:', hotelCardData);
                    return (
                      <HotelNearbyCard
                        key={hotel.id}
                        hotel={hotelCardData}
                      />
                    );
                  })}
                </div>
                {place.nearbyHotels.length > 3 && (
                  <button
                    onClick={() => setShowAllHotels(!showAllHotels)}
                    className="w-full mt-4 sm:mt-5 py-2.5 sm:py-3 px-4 sm:px-5 bg-[#01005B] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
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
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-md p-4 sm:p-6 border-2 border-gray-100 overflow-hidden">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2 overflow-hidden">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-300 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-xl sm:text-2xl">
                          <Utensils className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 truncate">Nearby Restaurants</h3>
                        <p className="text-xs text-gray-500 truncate">Dining options available</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 min-w-[60px] max-w-[80px]">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#01005B] leading-none break-words">{place.nearbyRestaurants.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Total</div>
                    </div>
                  </div>
                  
                  {place.nearbyRestaurants.length > 3 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 bg-[#01005B] rounded-full shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700 break-words">Showing <span className="font-bold text-[#01005B]">{showAllRestaurants ? place.nearbyRestaurants.length : 3}</span> of {place.nearbyRestaurants.length}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{place.nearbyRestaurants.length - 3} more items</span>
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
                    className="w-full mt-4 sm:mt-5 py-2.5 sm:py-3 px-4 sm:px-5 bg-[#01005B] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2"
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

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        feature="planning"
      />
    </div>
  );
}