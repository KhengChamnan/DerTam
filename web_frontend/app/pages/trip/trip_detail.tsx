import { useState, useEffect } from 'react';
import { Calendar, MapPin, Edit2, Map as MapIcon, Share2, DollarSign, ArrowLeft, Users } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';
import PlaceCard from './components/place_card';
import { getTripById, getPlacesForTripDay, addPlacesToTripDay } from '../../api/trips';

interface Place {
  placeID: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  google_maps_link: string;
  ratings: number;
  reviews_count: number;
  images_url: string[];
  entry_free: boolean;
  operating_hours?: Record<string, any>;
  best_season_to_visit?: string;
  province_id: number;
  province_categoryName: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
}

interface TripDay {
  dayNumber: number;
  date: string;
  places: Place[];
  trip_day_id?: number;

}

interface Trip {
  trip_id: number;
  user_id?: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  days: TripDay[];
  budget_id?: number;
  province?: string;
}

interface TripDetailPageProps {
  tripId: string;
}

const mockUsers = [
  {
    id: 'current_user',
    name: 'You',
    initial: 'Y',
    color: '#01005B',
    isCurrentUser: true,
    imageUrl: null,
  },
  {
    id: 'user_2',
    name: 'Alice',
    initial: 'A',
    color: '#9333EA',
    isCurrentUser: false,
    imageUrl: null,
  },
  {
    id: 'user_3',
    name: 'Bob',
    initial: 'B',
    color: '#EC4899',
    isCurrentUser: false,
    imageUrl: null,
  },
];

export default function TripDetailPage({ tripId }: TripDetailPageProps) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch trip from API
        const tripData = await getTripById(tripId);
        
        console.log('Trip data received:', tripData); // Debug log
        
        // Validate response structure
        if (!tripData || !tripData.trip) {
          throw new Error('Invalid trip data received');
        }

        // Convert days object to array if needed
        let daysArray: any[] = [];
        if (Array.isArray(tripData.days)) {
          daysArray = tripData.days;
        } else if (typeof tripData.days === 'object' && tripData.days !== null) {
          daysArray = Object.values(tripData.days);
        } else {
          throw new Error('Invalid trip days data');
        }

        // Fetch places for each day
        const daysWithPlaces = await Promise.all(
          daysArray.map(async (day) => {
            if (day.places_count === 0) {
              // No places, skip API call
              return {
                dayNumber: day.day_number,
                date: day.date,
                places: [],
                trip_day_id: day.trip_day_id,
              };
            }
            try {
              const dayPlaces = await getPlacesForTripDay(day.trip_day_id);
              return {
                dayNumber: day.day_number,
                date: day.date,
                places: dayPlaces.places.map(p => ({
                  placeID: p.place_id,
                  name: p.place_name,
                  description: p.place_description,
                  category_id: p.category_id,
                  category_name: p.category_name,
                  google_maps_link: p.google_maps_link,
                  ratings: p.ratings,
                  reviews_count: p.reviews_count,
                  images_url: p.images_url,
                  entry_free: p.entry_free,
                  operating_hours: p.operating_hours,
                  province_id: p.province_id,
                  province_categoryName: p.province_categoryName,
                  latitude: p.latitude,
                  longitude: p.longitude,
                })),
                trip_day_id: day.trip_day_id,
              };
            } catch (err) {
              console.error(`Failed to load places for day ${day.day_number}:`, err);
              return {
                dayNumber: day.day_number,
                date: day.date,
                places: [],
                trip_day_id: day.trip_day_id,
              };
            }
          })
        );
        
        setTrip({
          trip_id: tripData.trip.trip_id,
          user_id: tripData.trip.user_id,
          trip_name: tripData.trip.trip_name,
          start_date: tripData.trip.start_date,
          end_date: tripData.trip.end_date,
          days: daysWithPlaces,
        });
      } catch (err) {
        console.error('Error loading trip:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  };

  const handleShareTrip = () => {
    // Implement share functionality
    alert('Share functionality coming soon!');
  };

  const handleSetBudget = () => {
    // Navigate to budget setting
    navigate(`/budget/${tripId}`);
  };

  const handleOpenMap = () => {
    // Open map view
    alert('Map view coming soon!');
  };

  const handleEditTrip = () => {
    // Navigate back to trip planning with this trip data
    navigate('/trip_plan', { state: { editTrip: trip } });
  };

  const handleViewPlaceDetails = (placeId: string) => {
    // Navigate to place detail page or open modal
    console.log('View place details:', placeId);
    // navigate(`/place/${placeId}`);
    alert('Place details coming soon!');
  };

  // Sync places with trip day on mount
  useEffect(() => {
    const syncPlacesWithTripDay = async () => {
      if (!trip) return;

      try {
        // For each day in the trip
        for (let i = 0; i < trip.days.length; i++) {
          const day = trip.days[i];
          // Use day.trip_day_id if available
          if (day.places.length > 0 && day.trip_day_id) {
            const placeIds = day.places.map(p => p.placeID);
            await addPlacesToTripDay(day.trip_day_id, {
              place_ids: placeIds,
            });
          }
        }
      } catch (err) {
        console.error('Error syncing places with trip day:', err);
      }
    };

    syncPlacesWithTripDay();
  }, [trip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Plan Trip" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01005B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Plan Trip" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-600">
              {error || 'Trip not found'}
            </p>
            <button
              onClick={() => navigate('/trip_plan')}
              className="mt-4 px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: '#01005B' }}
            >
              Back to Trip Planning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {/* <Navigation activeNav="Plan Trip" /> */}

      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="/images/poster.jpg"
          alt="Trip Banner"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-gray-900/50" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
      </div>

      {/* Sticky Trip Info Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{trip.trip_name}</h1>
              <p className="text-sm text-gray-600 mt-1">{formatDateRange(trip.start_date, trip.end_date)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Avatars */}
              <div className="flex -space-x-2">
                {mockUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.initial}
                  </div>
                ))}
                {mockUsers.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    +{mockUsers.length - 3}
                  </div>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShareTrip}
                className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all"
                style={{ backgroundColor: '#01005B' }}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Day by Day Itinerary */}
        <div className="space-y-6">
          {trip.days.map((day) => (
            <div key={day.dayNumber} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Day {day.dayNumber}</h2>
                <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
              </div>

              {day.places.length === 0 ? (
                <p className="text-gray-500 text-center py-8 italic">No activities planned for this day</p>
              ) : (
                <div className="space-y-4">
                  {day.places.map((place, index) => (
                    <PlaceCard
                      key={place.placeID}
                      place={place}
                      index={index}
                      onViewDetails={() => handleViewPlaceDetails(String(place.placeID))}
                      showDelete={false}
                      showViewDetails={true}
                      showOrderNumber={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        {/* Budget Button */}
        <button
          onClick={handleSetBudget}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all group"
          title="Set Budget"
        >
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#01005B' }}>
            <DollarSign size={16} className="text-white" />
          </div>
        </button>

        {/* Edit Trip Button */}
        <button
          onClick={handleEditTrip}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          title="Edit Trip"
        >
          <Edit2 size={24} style={{ color: '#01005B' }} />
        </button>

        {/* Map Button */}
        <button
          onClick={handleOpenMap}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          style={{ backgroundColor: '#01005B' }}
          title="View Map"
        >
          <MapIcon size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}