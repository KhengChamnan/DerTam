import { useState, useEffect } from "react";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { usePlaceData } from "./hooks/usePlaceData";
import { getPlacesByCategory, type Place } from "~/api/place";
import Navigation from "~/components/navigation";
import { Link, useNavigate } from "react-router";
import EventCard from "./components/eventcard";

// Hero carousel images
const heroImages = [
  "/images/poster.jpg",
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
  "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200",
];

export default function HomePage() {
  const navigate = useNavigate();

  const { 
    categories, 
    destinations, 
    events, 
    loading, 
    error,
    search 
  } = usePlaceData();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredDestinations, setFilteredDestinations] = useState<Place[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  
  // Favorites from localStorage
  const [destinationFavorites, setDestinationFavorites] = useState<number[]>([]);
  const [eventFavorites, setEventFavorites] = useState<number[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedDestFavorites = localStorage.getItem('destinationFavorites');
    const savedEventFavorites = localStorage.getItem('eventFavorites');
    
    if (savedDestFavorites) {
      setDestinationFavorites(JSON.parse(savedDestFavorites));
    }
    if (savedEventFavorites) {
      setEventFavorites(JSON.parse(savedEventFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('destinationFavorites', JSON.stringify(destinationFavorites));
  }, [destinationFavorites]);

  useEffect(() => {
    localStorage.setItem('eventFavorites', JSON.stringify(eventFavorites));
  }, [eventFavorites]);

  // Hero carousel auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        search(searchQuery);
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery]);

  // Load places by category or show all destinations
  useEffect(() => {
    async function loadPlaces() {
      if (selectedCategory) {
        try {
          setLoadingCategory(true);
          const places = await getPlacesByCategory(selectedCategory);
          setFilteredDestinations(places);
        } catch (err) {
          console.error('Error loading category places:', err);
          setFilteredDestinations([]);
        } finally {
          setLoadingCategory(false);
        }
      } else {
        setFilteredDestinations(destinations);
      }
    }
    
    loadPlaces();
  }, [selectedCategory, destinations]);

  // Toggle destination favorite
  const toggleDestinationFavorite = (id: number) => {
    setDestinationFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Toggle event favorite
  const toggleEventFavorite = (id: number) => {
    setEventFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Pagination for destinations
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const currentDestinations = filteredDestinations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  // Pagination for events
  const [eventPage, setEventPage] = useState(0);
  const eventsPerPage = 3;
  const totalEventPages = Math.ceil(events.length / eventsPerPage);
  const currentEvents = events.slice(
    eventPage * eventsPerPage,
    (eventPage + 1) * eventsPerPage
  );

  // Loading state
  if (loading && !destinations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing destinations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !destinations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000047] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-white">
      <Navigation 
        activeNav="Home" 
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Slideshow */}
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
            {/* <div className="absolute inset-0 bg-black/30" /> */}
          </div>
        ))}
        
        {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
            Explore Cambodia
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md max-w-2xl">
            Discover amazing places and create unforgettable memories
          </p>
        </div> */}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImage ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                disabled={loadingCategory}
                className={`p-4 rounded-xl transition-all cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCategory === category.id
                    ? 'bg-[#01005B] text-white shadow-lg'
                    : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <p className="text-sm font-medium">{category.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Filtered'} Destinations` 
                : 'Popular Destinations'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[#01005B] hover:underline text-sm font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
          
          <div className="relative">
            {loadingCategory ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading destinations...</p>
              </div>
            ) : currentDestinations.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No places available
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory 
                    ? `No destinations found for "${categories.find(c => c.id === selectedCategory)?.name || 'this category'}". Try another category or clear the filter.`
                    : 'No destinations available at the moment.'}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000047] transition-colors"
                  >
                    View All Destinations
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {currentDestinations.map((destination) => (
                    <Link 
                      key={destination.id} 
                      to={`/place/${destination.id}`}
                      className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="relative">
                        <img 
                          src={destination.images?.[0] || '/images/placeholder.jpg'} 
                          alt={destination.name || 'Destination'} 
                          className="w-full h-48 sm:h-56 lg:h-64 object-cover" 
                        />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDestinationFavorite(destination.id);
                          }}
                          className="absolute top-4 right-4 bg-white border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-red-50 transition-all"
                        >
                          <Heart
                            size={20}
                            color="#ef4444"
                            fill={destinationFavorites.includes(destination.id) ? "#ef4444" : "none"}
                          />
                        </button>
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {destination.name || 'Unknown Place'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{destination.location || 'Location not available'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {destination.rating ? destination.rating.toFixed(1) : '0.0'}
                            </span>
                            {/* <span className="text-xs text-gray-500">
                              ({destination.reviews || 0} reviews)
                            </span> */}
                          </div>
            
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Upcoming Events
            </h2>
            
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorite={eventFavorites.includes(event.id)}
                    onToggleFavorite={toggleEventFavorite}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))}
              </div>

              {/* Event Pagination */}
              {totalEventPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setEventPage(prev => Math.max(0, prev - 1))}
                    disabled={eventPage === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {eventPage + 1} of {totalEventPages}
                  </span>
                  <button
                    onClick={() => setEventPage(prev => Math.min(totalEventPages - 1, prev + 1))}
                    disabled={eventPage === totalEventPages - 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
