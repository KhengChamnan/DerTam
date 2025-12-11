import { useState, useEffect } from 'react';
import { Calendar, MapPin, Edit2, Map as MapIcon, Share2, DollarSign, ArrowLeft, Users } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';
import PlaceCard from './components/place_card';

interface Place {
  placeId: string;
  name: string;
  description: string;
  categoryId: number;
  googleMapsLink: string;
  ratings: number;
  reviewsCount: number;
  imagesUrl: string;
  imagePublicIds: string;
  entryFree: boolean;
  operatingHours: Record<string, any>;
  bestSeasonToVisit: string;
  provinceId: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  locationName: string;
}

interface TripDay {
  dayNumber: number;
  date: string;
  places: Place[];
}

interface Trip {
  id: string;
  userId?: string;
  tripName: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
  budgetId?: string;
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

  useEffect(() => {
    // Load trip from localStorage or API
    const loadTrip = () => {
      try {
        const savedTrips = localStorage.getItem('trips');
        if (savedTrips) {
          const trips = JSON.parse(savedTrips);
          const foundTrip = trips.find((t: Trip) => t.id === tripId);
          if (foundTrip) {
            setTrip(foundTrip);
          }
        }
      } catch (error) {
        console.error('Error loading trip:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeNav="Plan Trip" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-600">Trip not found</p>
            <button
              onClick={() => navigate('/trip-plan')}
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50" />
        
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
              <h1 className="text-2xl font-bold text-gray-900">{trip.tripName}</h1>
              <p className="text-sm text-gray-600 mt-1">{formatDateRange(trip.startDate, trip.endDate)}</p>
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
                      key={place.placeId}
                      place={place}
                      index={index}
                      onViewDetails={() => handleViewPlaceDetails(place.placeId)}
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