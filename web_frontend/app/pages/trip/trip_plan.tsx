import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, X, ChevronRight, Edit2 } from 'lucide-react';
import Navigation from '../../components/navigation';

interface Place {
  id: number;
  name: string;
  location: string;
  image: string;
  category: string;
  duration: string;
}

interface TripDay {
  date: string;
  places: Place[];
}

interface TripPlan {
  name: string;
  startDate: string;
  endDate: string;
  travelers: number;
  days: TripDay[];
}

const mockPlaces: Place[] = [
  { id: 1, name: "Angkor Wat", location: "Siem Reap", image: "https://images.unsplash.com/photo-1598616264509-edd7f9312b3c?w=400", category: "Temple", duration: "3 hours" },
  { id: 2, name: "Bayon Temple", location: "Siem Reap", image: "https://images.unsplash.com/photo-1563931138-a7a5d4be4f0a?w=400", category: "Temple", duration: "2 hours" },
  { id: 3, name: "Ta Prohm", location: "Siem Reap", image: "https://images.unsplash.com/photo-1547534208-b9a1cf0e5de0?w=400", category: "Temple", duration: "2 hours" },
  { id: 4, name: "Tonle Sap Lake", location: "Siem Reap", image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400", category: "Nature", duration: "4 hours" },
  { id: 5, name: "Royal Palace", location: "Phnom Penh", image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400", category: "Palace", duration: "2 hours" },
  { id: 6, name: "Central Market", location: "Phnom Penh", image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400", category: "Market", duration: "1.5 hours" },
];

export default function TripPlanningPage() {
  const [step, setStep] = useState<'setup' | 'places' | 'review'>('setup');
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    name: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    days: []
  });
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Temple', 'Nature', 'Palace', 'Market', 'Beach'];

  // Calculate number of days
  const calculateDays = () => {
    if (!tripPlan.startDate || !tripPlan.endDate) return 0;
    const start = new Date(tripPlan.startDate);
    const end = new Date(tripPlan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Initialize days when dates are set
  const initializeDays = () => {
    const numDays = calculateDays();
    const days: TripDay[] = [];
    const start = new Date(tripPlan.startDate);
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        places: []
      });
    }
    
    setTripPlan(prev => ({ ...prev, days }));
    setStep('places');
  };

  // Filter places
  const filteredPlaces = mockPlaces.filter(place => {
    const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add place to trip
  const addPlaceToDay = (place: Place) => {
    setTripPlan(prev => {
      const newDays = [...prev.days];
      newDays[selectedDay].places.push(place);
      return { ...prev, days: newDays };
    });
  };

  // Remove place from trip
  const removePlaceFromDay = (dayIndex: number, placeId: number) => {
    setTripPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex].places = newDays[dayIndex].places.filter(p => p.id !== placeId);
      return { ...prev, days: newDays };
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation activeNav="Plan Trip" />

      {/* Progress Steps */}
      {step !== 'setup' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#01005B' }}>1</div>
                <span className="text-sm font-medium">Trip Details</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step === 'places' || step === 'review' ? 'text-white' : 'text-gray-400 border-2 border-gray-300'}`}
                     style={step === 'places' || step === 'review' ? { backgroundColor: '#01005B' } : {}}>2</div>
                <span className="text-sm font-medium">Select Places</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step === 'review' ? 'text-white' : 'text-gray-400 border-2 border-gray-300'}`}
                     style={step === 'review' ? { backgroundColor: '#01005B' } : {}}>3</div>
                <span className="text-sm font-medium">Review & Confirm</span>
              </div>
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
                  value={tripPlan.name}
                  onChange={(e) => setTripPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Cambodia Adventure"
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
                      value={tripPlan.startDate}
                      onChange={(e) => setTripPlan(prev => ({ ...prev, startDate: e.target.value }))}
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
                      value={tripPlan.endDate}
                      onChange={(e) => setTripPlan(prev => ({ ...prev, endDate: e.target.value }))}
                      min={tripPlan.startDate}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                    />
                  </div>
                </div>
              </div>

              {/* Number of Travelers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Travelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    min="1"
                    value={tripPlan.travelers}
                    onChange={(e) => setTripPlan(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                  />
                </div>
              </div>

              {/* Trip Summary */}
              {tripPlan.startDate && tripPlan.endDate && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium mb-2">Trip Summary</h3>
                  <p className="text-sm text-gray-600">Duration: {calculateDays()} days</p>
                  <p className="text-sm text-gray-600">Travelers: {tripPlan.travelers} {tripPlan.travelers === 1 ? 'person' : 'people'}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={initializeDays}
                disabled={!tripPlan.name || !tripPlan.startDate || !tripPlan.endDate}
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
                <h2 className="text-xl font-bold mb-4">Select Places to Visit</h2>
                
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
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={selectedCategory === cat ? { backgroundColor: '#01005B' } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Places Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
                    <div key={place.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <img src={place.image} alt={place.name} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{place.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {place.location}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{place.category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock size={14} />
                            {place.duration}
                          </p>
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
                  {tripPlan.days.map((day, index) => (
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
                      Day {index + 1}
                    </button>
                  ))}
                </div>

                {/* Day Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">{formatDate(tripPlan.days[selectedDay].date)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {tripPlan.days[selectedDay].places.length} {tripPlan.days[selectedDay].places.length === 1 ? 'place' : 'places'} added
                  </p>
                </div>

                {/* Places for Selected Day */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tripPlan.days[selectedDay].places.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No places added yet</p>
                  ) : (
                    tripPlan.days[selectedDay].places.map((place, placeIndex) => (
                      <div key={placeIndex} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <img src={place.image} alt={place.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{place.name}</h4>
                          <p className="text-xs text-gray-600">{place.location}</p>
                          <p className="text-xs text-gray-500">{place.duration}</p>
                        </div>
                        <button
                          onClick={() => removePlaceFromDay(selectedDay, place.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
                <h2 className="text-3xl font-bold mb-2">{tripPlan.name}</h2>
                <div className="flex items-center gap-6 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar size={18} />
                    {formatDate(tripPlan.startDate)} - {formatDate(tripPlan.endDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={18} />
                    {tripPlan.travelers} {tripPlan.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep('places')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit2 size={16} />
                Edit Trip
              </button>
            </div>

            {/* Day by Day Itinerary */}
            <div className="space-y-6">
              {tripPlan.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Day {dayIndex + 1}</h3>
                    <span className="text-sm text-gray-600">{formatDate(day.date)}</span>
                  </div>
                  
                  {day.places.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No places planned for this day</p>
                  ) : (
                    <div className="space-y-4">
                      {day.places.map((place, placeIndex) => (
                        <div key={placeIndex} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#01005B' }}>
                            {placeIndex + 1}
                          </div>
                          <img src={place.image} alt={place.name} className="w-20 h-20 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold">{place.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              {place.location}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock size={14} />
                              {place.duration}
                            </p>
                          </div>
                          <span className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full">
                            {place.category}
                          </span>
                        </div>
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
                onClick={() => alert('Trip saved! (Connect to backend)')}
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