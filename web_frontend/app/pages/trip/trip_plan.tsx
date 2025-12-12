import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, MapPin, Clock, Plus, X, ChevronRight, Edit2, DollarSign } from 'lucide-react';
import Navigation from '../../components/navigation';
import PlaceCard from './components/place_card';
import { createTrip, getPlacesForTripPlanning, addPlacesToTripDay, type PlaceForPlanning, type CreateTripData } from '../../api/trips';

// Using PlaceForPlanning from API
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
  operating_hours?: any;
  best_season_to_visit?: string;
  province_id: number;
  province_categoryName: string;
  latitude: number;
  longitude: number;
}

interface TripDay {
  dayNumber: number;
  date: string;
  places: Place[];
  trip_day_id?: number; // Will be populated after trip creation
}

interface Trip {
  trip_id?: number;
  user_id?: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  days: TripDay[];
  province?: string;
}

// Removed mock places - will fetch from API

const categories = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Temple' },
  { id: 2, name: 'Nature' },
  { id: 3, name: 'Palace' },
  { id: 4, name: 'Market' },
  { id: 5, name: 'Beach' }
];

export default function TripPlanningPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'places' | 'review'>('setup');
  const [trip, setTrip] = useState<Trip>({
    trip_name: '',
    start_date: '',
    end_date: '',
    days: [],
    province: ''
  });
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch places from API when in places step
  useEffect(() => {
    if (step === 'places') {
      fetchPlaces();
    }
  }, [step, selectedCategory, searchQuery, currentPage]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPlacesForTripPlanning({
        page: currentPage,
        per_page: 20,
        ...(selectedCategory !== 0 && { category_id: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });
      setPlaces(result.data);
      setTotalPages(result.pagination.last_page);
    } catch (err) {
      console.error('Failed to fetch places:', err);
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  // Calculate number of days
  const calculateDays = () => {
    if (!trip.start_date || !trip.end_date) return 0;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Initialize days when dates are set
  const initializeDays = () => {
    const numDays = calculateDays();
    const days: TripDay[] = [];
    const start = new Date(trip.start_date);
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        dayNumber: i + 1,
        date: date.toISOString().split('T')[0],
        places: []
      });
    }
    
    setTrip(prev => ({ ...prev, days }));
    setStep('places');
  };

  // Places are already filtered by API, just use them
  const filteredPlaces = places;

  // Add place to trip
  const addPlaceToDay = (place: Place) => {
    setTrip(prev => {
      const newDays = [...prev.days];
      // Check if place already exists in the day
      const placeExists = newDays[selectedDay].places.some(p => p.placeID === place.placeID);
      if (!placeExists) {
        newDays[selectedDay].places.push(place);
      }
      return { ...prev, days: newDays };
    });
  };

  // Remove place from trip
  const removePlaceFromDay = (dayIndex: number, placeId: number) => {
    setTrip(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex].places = newDays[dayIndex].places.filter(p => p.placeID !== placeId);
      return { ...prev, days: newDays };
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Get category name (from place data)
  const getCategoryName = (place: Place) => {
    return place.category_name || 'Unknown';
  };

  // Safely get image URL from place
  const getPlaceImage = (place: Place): string => {
    try {
      // If images_url is a string, try to parse it as JSON
      if (typeof place.images_url === 'string') {
        const parsed = JSON.parse(place.images_url as any);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
      // If it's already an array
      if (Array.isArray(place.images_url) && place.images_url.length > 0) {
        return place.images_url[0];
      }
    } catch (e) {
      console.error('Error parsing images_url:', e);
    }
    return 'https://via.placeholder.com/400?text=No+Image';
  };

  // Handle step navigation
  const handleStepClick = (targetStep: 'setup' | 'places' | 'review') => {
    // Allow going back to any previous step
    if (targetStep === 'setup') {
      setStep('setup');
      return;
    }
    
    // Validate before allowing navigation forward
    if (targetStep === 'places') {
      if (!trip.trip_name || !trip.start_date || !trip.end_date) {
        alert('Please complete trip details first');
        return;
      }
      if (trip.days.length === 0) {
        initializeDays();
      } else {
        setStep('places');
      }
    } else if (targetStep === 'review') {
      if (trip.days.length === 0 || trip.days.every(day => day.places.length === 0)) {
        alert('Please add at least one place to your trip');
        return;
      }
      setStep('review');
    }
  };

  // Check if a step is accessible (completed)
  const isStepCompleted = (stepName: 'setup' | 'places' | 'review') => {
    if (stepName === 'setup') {
      return trip.trip_name && trip.start_date && trip.end_date;
    }
    if (stepName === 'places') {
      return trip.days.length > 0;
    }
    if (stepName === 'review') {
      return trip.days.some(day => day.places.length > 0);
    }
    return false;
  };

  // Save trip and navigate to detail page
  const handleSaveTrip = async () => {
    try {
      setSaving(true);
      setError(null);

      // Create trip via API
      const tripData: CreateTripData = {
        trip_name: trip.trip_name,
        start_date: trip.start_date,
        end_date: trip.end_date,
      };

      const result = await createTrip(tripData);
      console.log('Trip created:', result);

      // Convert days object to array
      const daysArray = Object.values(result.days);
      console.log('Days array:', daysArray);

      // Now add places to each day
      for (let i = 0; i < trip.days.length; i++) {
        const day = trip.days[i];
        const correspondingTripDay = daysArray[i];
        
        console.log(`Processing day ${i + 1}:`, {
          localDay: day,
          backendDay: correspondingTripDay,
          placesCount: day.places.length,
          placeIds: day.places.map(p => p.placeID)
        });
        
        if (day.places.length > 0 && correspondingTripDay) {
          const placeIds = day.places.map(p => p.placeID);
          try {
            const addResult = await addPlacesToTripDay(correspondingTripDay.trip_day_id, {
              place_ids: placeIds,
            });
            console.log(`Places added to day ${i + 1}:`, addResult);
          } catch (err) {
            console.error(`Failed to add places to day ${i + 1}:`, err);
            // Continue with other days even if one fails
          }
        } else {
          console.log(`Skipping day ${i + 1} - no places or no corresponding trip day`);
        }
      }

      console.log('All places added, navigating to trip detail...');
      // Navigate to trip detail page
      navigate(`/trip_detail/${result.trip.trip_id}`);
    } catch (error) {
      console.error('Error saving trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to save trip. Please try again.');
      setSaving(false);
    }
  };

  const handleRemovePlace = (dayIndex: number, placeId: number) => {
    removePlaceFromDay(dayIndex, placeId);
  };

  const handleViewPlaceDetails = (placeId: number) => {
    // Navigate to place detail page or open modal
    console.log('View place details:', placeId);
    alert('Place details coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation activeNav="Plan Trip" />

      {/* Progress Steps - Interactive */}
      {(step === 'places' || step === 'review') && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-4">
              {/* Step 1: Trip Details */}
              <button
                onClick={() => handleStepClick('setup')}
                className="flex items-center gap-2 transition-all cursor-pointer hover:opacity-80"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                    isStepCompleted('setup')
                      ? 'text-white'
                      : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={isStepCompleted('setup') ? { backgroundColor: '#01005B' } : {}}
                >
                  1
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Trip Details
                </span>
              </button>

              <ChevronRight size={20} className="text-gray-400" />

              {/* Step 2: Select Places */}
              <button
                onClick={() => handleStepClick('places')}
                className={`flex items-center gap-2 transition-all ${
                  isStepCompleted('setup') ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!isStepCompleted('setup')}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                    step === 'places'
                      ? 'text-white scale-110'
                      : isStepCompleted('places')
                      ? 'text-white'
                      : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={step === 'places' || isStepCompleted('places') ? { backgroundColor: '#01005B' } : {}}
                >
                  2
                </div>
                <span className={`text-sm font-medium ${step === 'places' ? 'text-[#01005B]' : 'text-gray-600'}`}>
                  Select Places
                </span>
              </button>

              <ChevronRight size={20} className="text-gray-400" />

              {/* Step 3: Review */}
              <button
                onClick={() => handleStepClick('review')}
                className={`flex items-center gap-2 transition-all ${
                  isStepCompleted('review') ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!isStepCompleted('review')}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                    step === 'review'
                      ? 'text-white scale-110'
                      : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={step === 'review' ? { backgroundColor: '#01005B' } : {}}
                >
                  3
                </div>
                <span className={`text-sm font-medium ${step === 'review' ? 'text-[#01005B]' : 'text-gray-600'}`}>
                  Review & Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Trip Setup */}
      {step === 'setup' && (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Trip Details</h2>
            
            <div className="space-y-6">
              {/* Trip Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={trip.trip_name}
                  onChange={(e) => setTrip(prev => ({ ...prev, trip_name: e.target.value }))}
                  placeholder="My Cambodia Adventure"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province (Optional)</label>
                <input
                  type="text"
                  value={trip.province || ''}
                  onChange={(e) => setTrip(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="Siem Reap"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={trip.start_date}
                      onChange={(e) => setTrip(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={trip.end_date}
                      onChange={(e) => setTrip(prev => ({ ...prev, end_date: e.target.value }))}
                      min={trip.start_date}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Summary */}
              {trip.start_date && trip.end_date && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium mb-2">Trip Summary</h3>
                  <p className="text-sm text-gray-600">Duration: {calculateDays()} days</p>
                  {trip.province && <p className="text-sm text-gray-600">Province: {trip.province}</p>}
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => handleStepClick('places')}
                disabled={!trip.trip_name || !trip.start_date || !trip.end_date}
                className="w-full py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#01005B' }}
              >
                Continue to Places
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Places */}
      {step === 'places' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Available Places */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Select Places to Visit</h2>
                  <button
                    onClick={() => setStep('setup')}
                    className="text-sm text-gray-600 hover:text-[#01005B] flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to Details
                  </button>
                </div>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                />

                {/* Categories */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={selectedCategory === cat.id ? { backgroundColor: '#01005B' } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Places Grid */}
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B]"></div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlaces.map((place) => (
                    <div key={place.placeID} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <img 
                        src={getPlaceImage(place)} 
                        alt={place.name} 
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                        }}
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{place.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {place.province_categoryName}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full ml-2">
                            {place.category_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{place.ratings}</span>
                          </div>
                          <span className="text-xs text-gray-500">({place.reviews_count} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {place.entry_free ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Free Entry</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                <DollarSign size={12} />
                                Paid
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addPlaceToDay(place)}
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: '#01005B' }}
                          >
                            <Plus size={16} className="inline mr-1" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                {/* Pagination Controls */}
                {!loading && !error && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Trip Itinerary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Your Itinerary</h2>
                
                {/* Day Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {trip.days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        selectedDay === index
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={selectedDay === index ? { backgroundColor: '#01005B' } : {}}
                    >
                      Day {day.dayNumber}
                    </button>
                  ))}
                </div>

                {/* Day Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{formatDate(trip.days[selectedDay].date)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {trip.days[selectedDay].places.length} {trip.days[selectedDay].places.length === 1 ? 'place' : 'places'} added
                  </p>
                </div>

                {/* Places for Selected Day */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trip.days[selectedDay].places.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No places added yet</p>
                  ) : (
                    trip.days[selectedDay].places.map((place, placeIndex) => (
                      <div key={placeIndex} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <img 
                          src={getPlaceImage(place)} 
                          alt={place.name} 
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{place.name}</h4>
                          <p className="text-xs text-gray-600">{place.province_categoryName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs">{place.ratings}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removePlaceFromDay(selectedDay, place.placeID)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Review Button */}
                <button
                  onClick={() => handleStepClick('review')}
                  disabled={trip.days.every(day => day.places.length === 0)}
                  className="w-full mt-4 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#01005B' }}
                >
                  Review Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review Trip */}
      {step === 'review' && (
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">{trip.trip_name}</h2>
                <div className="flex items-center gap-6 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar size={18} />
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </p>
                  {trip.province && (
                    <p className="flex items-center gap-2">
                      <MapPin size={18} />
                      {trip.province}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setStep('places')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Edit2 size={16} />
                Edit Trip
              </button>
            </div>

            {/* Day by Day Itinerary */}
            <div className="space-y-6">
              {trip.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Day {day.dayNumber}</h3>
                    <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                  </div>
                  
                  {day.places.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No places planned for this day</p>
                  ) : (
                    <div className="space-y-4">
                      {day.places.map((place, placeIndex) => (
                        <PlaceCard
                          key={place.placeID}
                          place={place}
                          index={placeIndex}
                          onDelete={() => handleRemovePlace(dayIndex, place.placeID)}
                          onViewDetails={() => handleViewPlaceDetails(place.placeID)}
                          showDelete={true}
                          showViewDetails={true}
                          showOrderNumber={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep('places')}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Back to Edit
              </button>
              <button
                className="flex-1 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#01005B' }}
                onClick={handleSaveTrip}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Trip Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}