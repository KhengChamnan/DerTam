import { useEffect, useState } from "react";
import { useParams } from "react-router";
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
    // TODO: Open gallery modal if you have one
    console.log('Image clicked:', index);
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
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
              <div>
                <h3 className="text-xl font-bold mb-4">Nearby Places</h3>
                <div className="space-y-4">
                  {place.nearbyPlaces.map((nearby) => (
                    <NearbyPlaceCard key={nearby.id} place={nearby} />
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Hotels */}
            {place.nearbyHotels && place.nearbyHotels.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Nearby Hotels</h3>
                <div className="space-y-4">
                  {place.nearbyHotels.map((hotel) => (
                    <HotelNearbyCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Restaurants */}
            {place.nearbyRestaurants && place.nearbyRestaurants.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Nearby Restaurants</h3>
                <div className="space-y-4">
                  {place.nearbyRestaurants.map((restaurant) => (
                    <RestaurantNearbyCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}