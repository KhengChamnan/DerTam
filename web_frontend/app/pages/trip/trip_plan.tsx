import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, MapPin, Clock, Plus, X, ChevronRight, Edit2, DollarSign } from 'lucide-react';
import Navigation from '../../components/navigation';
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
  id?: string;
  userId?: string;
  tripName: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
  budgetId?: string;
  province?: string;
}

const mockPlaces: Place[] = [
  { 
    placeId: '1',
    name: "Angkor Wat", 
    description: "Ancient temple complex",
    locationName: "Siem Reap",
    imagesUrl: "https://images.unsplash.com/photo-1598616264509-edd7f9312b3c?w=400",
    categoryId: 1,
    googleMapsLink: "",
    ratings: 4.8,
    reviewsCount: 1250,
    imagePublicIds: "",
    entryFree: false,
    operatingHours: { open: "05:00", close: "18:00" },
    bestSeasonToVisit: "November to March",
    provinceId: 1,
    latitude: 13.4125,
    longitude: 103.8670,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    placeId: '2',
    name: "Bayon Temple", 
    description: "Famous for its smiling stone faces",
    locationName: "Siem Reap",
    imagesUrl: "https://images.unsplash.com/photo-1563931138-a7a5d4be4f0a?w=400",
    categoryId: 1,
    googleMapsLink: "",
    ratings: 4.7,
    reviewsCount: 980,
    imagePublicIds: "",
    entryFree: false,
    operatingHours: { open: "05:00", close: "18:00" },
    bestSeasonToVisit: "November to March",
    provinceId: 1,
    latitude: 13.4412,
    longitude: 103.8589,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    placeId: '3',
    name: "Ta Prohm", 
    description: "Temple embraced by giant tree roots",
    locationName: "Siem Reap",
    imagesUrl: "https://images.unsplash.com/photo-1547534208-b9a1cf0e5de0?w=400",
    categoryId: 1,
    googleMapsLink: "",
    ratings: 4.9,
    reviewsCount: 1100,
    imagePublicIds: "",
    entryFree: false,
    operatingHours: { open: "07:00", close: "17:30" },
    bestSeasonToVisit: "November to March",
    provinceId: 1,
    latitude: 13.4350,
    longitude: 103.8892,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    placeId: '4',
    name: "Tonle Sap Lake", 
    description: "Southeast Asia's largest freshwater lake",
    locationName: "Siem Reap",
    imagesUrl: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
    categoryId: 2,
    googleMapsLink: "",
    ratings: 4.5,
    reviewsCount: 750,
    imagePublicIds: "",
    entryFree: true,
    operatingHours: { open: "06:00", close: "18:00" },
    bestSeasonToVisit: "August to October",
    provinceId: 1,
    latitude: 12.9667,
    longitude: 104.1333,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    placeId: '5',
    name: "Royal Palace", 
    description: "Official residence of the King of Cambodia",
    locationName: "Phnom Penh",
    imagesUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
    categoryId: 3,
    googleMapsLink: "",
    ratings: 4.6,
    reviewsCount: 890,
    imagePublicIds: "",
    entryFree: false,
    operatingHours: { open: "08:00", close: "17:00" },
    bestSeasonToVisit: "November to March",
    provinceId: 2,
    latitude: 11.5639,
    longitude: 104.9282,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    placeId: '6',
    name: "Central Market", 
    description: "Historic art deco market",
    locationName: "Phnom Penh",
    imagesUrl: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400",
    categoryId: 4,
    googleMapsLink: "",
    ratings: 4.3,
    reviewsCount: 650,
    imagePublicIds: "",
    entryFree: true,
    operatingHours: { open: "07:00", close: "17:00" },
    bestSeasonToVisit: "Year-round",
    provinceId: 2,
    latitude: 11.5696,
    longitude: 104.9200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

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
    tripName: '',
    startDate: '',
    endDate: '',
    days: [],
    province: '',
    budgetId: undefined
  });
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Calculate number of days
  const calculateDays = () => {
    if (!trip.startDate || !trip.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Initialize days when dates are set
  const initializeDays = () => {
    const numDays = calculateDays();
    const days: TripDay[] = [];
    const start = new Date(trip.startDate);
    
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

  // Filter places
  const filteredPlaces = mockPlaces.filter(place => {
    const matchesCategory = selectedCategory === 0 || place.categoryId === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add place to trip
  const addPlaceToDay = (place: Place) => {
    setTrip(prev => {
      const newDays = [...prev.days];
      // Check if place already exists in the day
      const placeExists = newDays[selectedDay].places.some(p => p.placeId === place.placeId);
      if (!placeExists) {
        newDays[selectedDay].places.push(place);
      }
      return { ...prev, days: newDays };
    });
  };

  // Remove place from trip
  const removePlaceFromDay = (dayIndex: number, placeId: string) => {
    setTrip(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex].places = newDays[dayIndex].places.filter(p => p.placeId !== placeId);
      return { ...prev, days: newDays };
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
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
      if (!trip.tripName || !trip.startDate || !trip.endDate) {
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
      return trip.tripName && trip.startDate && trip.endDate;
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
  const handleSaveTrip = () => {
    // Generate unique trip ID
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create complete trip object with ID
    const completedTrip: Trip = {
      ...trip,
      id: tripId,
      userId: 'current_user', // Replace with actual user ID from auth later
    };

    try {
      // Save to localStorage (replace with API call later)
      const existingTrips = localStorage.getItem('trips');
      const trips = existingTrips ? JSON.parse(existingTrips) : [];
      trips.push(completedTrip);
      localStorage.setItem('trips', JSON.stringify(trips));

      console.log('Trip saved:', completedTrip);

      // Navigate to trip detail page
      navigate(`/trip_detail/${tripId}`);
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
    }
  };

  const handleRemovePlace = (dayIndex: number, placeId: string) => {
    removePlaceFromDay(dayIndex, placeId);
  };

  const handleViewPlaceDetails = (placeId: string) => {
    // Navigate to place detail page or open modal
    console.log('View place details:', placeId);
    alert('Place details coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation activeNav="Plan Trip" />

      {/* Progress Steps - Interactive */}
      {step !== 'setup' && (
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
                    step === 'setup'
                      ? 'text-white scale-110'
                      : isStepCompleted('setup')
                      ? 'text-white'
                      : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={step === 'setup' || isStepCompleted('setup') ? { backgroundColor: '#01005B' } : {}}
                >
                  1
                </div>
                <span className={`text-sm font-medium ${step === 'setup' ? 'text-[#01005B]' : 'text-gray-600'}`}>
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
                  value={trip.tripName}
                  onChange={(e) => setTrip(prev => ({ ...prev, tripName: e.target.value }))}
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
                      value={trip.startDate}
                      onChange={(e) => setTrip(prev => ({ ...prev, startDate: e.target.value }))}
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
                      value={trip.endDate}
                      onChange={(e) => setTrip(prev => ({ ...prev, endDate: e.target.value }))}
                      min={trip.startDate}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Summary */}
              {trip.startDate && trip.endDate && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium mb-2">Trip Summary</h3>
                  <p className="text-sm text-gray-600">Duration: {calculateDays()} days</p>
                  {trip.province && <p className="text-sm text-gray-600">Province: {trip.province}</p>}
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => handleStepClick('places')}
                disabled={!trip.tripName || !trip.startDate || !trip.endDate}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlaces.map((place) => (
                    <div key={place.placeId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <img src={place.imagesUrl} alt={place.name} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{place.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {place.locationName}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full ml-2">
                            {getCategoryName(place.categoryId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium">{place.ratings}</span>
                          </div>
                          <span className="text-xs text-gray-500">({place.reviewsCount} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {place.entryFree ? (
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
                        <img src={place.imagesUrl} alt={place.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{place.name}</h4>
                          <p className="text-xs text-gray-600">{place.locationName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs">{place.ratings}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removePlaceFromDay(selectedDay, place.placeId)}
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
                <h2 className="text-3xl font-bold mb-2">{trip.tripName}</h2>
                <div className="flex items-center gap-6 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar size={18} />
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
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
                          key={place.placeId}
                          place={place}
                          index={placeIndex}
                          onDelete={() => handleRemovePlace(dayIndex, place.placeId)}
                          onViewDetails={() => handleViewPlaceDetails(place.placeId)}
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
                className="flex-1 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#01005B' }}
                onClick={handleSaveTrip}
              >
                Save Trip Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}