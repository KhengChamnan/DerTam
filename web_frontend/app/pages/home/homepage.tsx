import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router'; 
import { Heart, Star, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import Carousel from '../../components/carousel';
import Navigation from '../../components/navigation';
import { useFavorites } from '../profile/hooks/usefavorites';

// Hero carousel images
const heroImages = [
  "/images/poster.jpg",
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
  "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200",
];

// Mock data
const mockDestinations = [
  {
    id: 1,
    name: "Angkor Wat",
    location: "Siem Reap, Cambodia",
    rating: 5,
    price: 120,
    image: "https://images.unsplash.com/photo-1598616264509-edd7f9312b3c?w=400",
    category: "Historical",
  },
  {
    id: 2,
    name: "Bou Sra",
    location: "Mondulkiri, Cambodia",
    rating: 5,
    price: 80,
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
    category: "Standard",
  },
  {
    id: 3,
    name: "Monument",
    location: "Phnom Penh, Cambodia",
    rating: 5,
    price: 50,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
    category: "Historical",
  },
  {
    id: 4,
    name: "Beach Villa",
    location: "Sihanoukville, Cambodia",
    rating: 4,
    price: 200,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400",
    category: "Villa",
  },
  {
    id: 5,
    name: "Mountain Cottage",
    location: "Mondulkiri, Cambodia",
    rating: 4,
    price: 90,
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400",
    category: "Cottages",
  },
  {
    id: 6,
    name: "City Townhouse",
    location: "Phnom Penh, Cambodia",
    rating: 4,
    price: 70,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    category: "Townhouses",
  },
];

const mockEvents = [
  {
    id: 1,
    name: "Angkor Songkran",
    location: "Siem Reap, Cambodia",
    rating: 5,
    price: 150,
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400",
  },
  {
    id: 2,
    name: "Water Festival",
    location: "Phnom Penh, Cambodia",
    rating: 5,
    price: 80,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
  },
  {
    id: 3,
    name: "Pchum Ben",
    location: "Battambang, Cambodia",
    rating: 4,
    price: 50,
    image: "https://images.unsplash.com/photo-1514984879728-be0aff75a6e8?w=400",
  },
];

const categories = [
  "All",
  "Historical",
  "Standard",
  "Villa",
  "Cottages",
  "Townhouses",
  "Shared Space",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isFavorite, toggleFavorite: toggleFavoriteHook } = useFavorites();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [eventFavorites, setEventFavorites] = useState<number[]>([]);
  const [currentEventPage, setCurrentEventPage] = useState(0);

  // Filter destinations based on category and search
  const filteredDestinations = mockDestinations.filter(dest => {
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle favorite toggle with complete data
  const handleToggleFavorite = (dest: any) => {
    toggleFavoriteHook({
      id: dest.id.toString(),
      name: dest.name,
      location: dest.location,
      type: 'destination',
      image: dest.image,
      description: `${dest.name} in ${dest.location}`,
      price: dest.price,
      rating: dest.rating,
      category: dest.category,
    });
  };



  // Toggle event favorite
  const toggleEventFavorite = (id: number) => {
    setEventFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Event pagination
  const eventsPerPage = 3;
  const totalEventPages = Math.ceil(mockEvents.length / eventsPerPage);
  const currentEvents = mockEvents.slice(
    currentEventPage * eventsPerPage,
    (currentEventPage + 1) * eventsPerPage
  );

  const nextEventPage = () => {
    setCurrentEventPage((prev) => (prev + 1) % totalEventPages);
  };

  const prevEventPage = () => {
    setCurrentEventPage(
      (prev) => (prev - 1 + totalEventPages) % totalEventPages
    );
  };

  return (
    <div className="font-sans min-h-screen bg-white">

      {/* Navigation - Enable search on homepage */}
      <Navigation 
        activeNav="Home" 
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <Carousel 
          images={heroImages} 
          autoPlay={true}
          autoPlayInterval={5000}
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        />
      </section>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        {/* Popular Nearby Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          {!searchQuery && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Popular Nearby</h2>
              <p className="text-sm sm:text-base text-gray-600">Quality as judged user preference</p>
            </div>
          )}

          {/* Categories */}
          <div className="flex gap-2 sm:gap-3 lg:gap-5 mb-6 sm:mb-8 flex-wrap overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`${
                  selectedCategory === cat
                    ? "text-white border-none"
                    : "bg-transparent text-gray-600 border border-gray-300 hover:border-[#01005B]"
                } px-4 sm:px-6 py-2 rounded-full cursor-pointer text-xs sm:text-sm whitespace-nowrap transition-all`}
                style={
                  selectedCategory === cat ? { backgroundColor: "#01005B" } : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Destination Cards */}
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredDestinations.map((dest) => (
                <Link key={dest.id} to={`/place/${dest.id}`}>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all">
                    <div className="relative">
                      <img src={dest.image} alt={dest.name} className="w-full h-48 sm:h-56 lg:h-64 object-cover" />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFavorite(dest);
                        }}
                        className="absolute top-4 right-4 bg-white border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-red-50 transition-all"
                      >
                        <Heart 
                          size={20} 
                          color="#ef4444" 
                          fill={isFavorite(dest.id.toString()) ? "#ef4444" : "none"}
                        />
                      </button>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base sm:text-lg font-bold">{dest.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={16} fill="#fbbf24" color="#fbbf24" />
                          <span className="text-sm font-bold">{dest.rating}</span>
                        </div>
                      </div>
                      <p className="mb-3 text-gray-600 text-sm flex items-center gap-1">
                        <MapPin size={16} color="#ef4444" />
                        {dest.location}
                      </p>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} color="#666" />
                        <span className="text-base font-bold" style={{ color: '#01005B' }}>${dest.price}</span>
                        <span className="text-sm text-gray-600">/Person</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No destinations found. Try a different category or search term.
              </p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link to="/hotels">
              <button
                className="text-white border-none px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg cursor-pointer text-sm sm:text-base font-medium transition-all"
                style={{ backgroundColor: "#01005B" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#000047";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#01005B";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                View more
              </button>
            </Link>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Upcoming event</h2>
            <p className="text-sm sm:text-base text-gray-600">Quality as judged user preference</p>
          </div>

          {/* Event Cards with Navigation */}
          <div className="relative">
            {totalEventPages > 1 && (
              <>
                <button
                  onClick={prevEventPage}
                  className="hidden sm:flex absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-10 h-10 cursor-pointer z-10 items-center justify-center hover:border-[#01005B] transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextEventPage}
                  className="hidden sm:flex absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-10 h-10 cursor-pointer z-10 items-center justify-center hover:border-[#01005B] transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {currentEvents.map((event) => (
                <div key={event.id} className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all">
                  <div className="relative">
                    <img src={event.image} alt={event.name} className="w-full h-48 sm:h-56 lg:h-64 object-cover" />
                    <button 
                      onClick={() => toggleEventFavorite(event.id)}
                      className="absolute top-4 right-4 bg-white border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-red-50 transition-all"
                    >
                      <Heart
                        size={20}
                        color="#ef4444"
                        fill={eventFavorites.includes(event.id) ? "#ef4444" : "none"}
                      />
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base sm:text-lg font-bold">{event.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <span className="text-sm font-bold">
                          {event.rating}
                        </span>
                      </div>
                    </div>
                    <p className="mb-3 text-gray-600 text-sm flex items-center gap-1">
                      <MapPin size={16} color="#ef4444" />
                      {event.location}
                    </p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} color="#666" />
                      <span
                        className="text-base font-bold"
                        style={{ color: "#01005B" }}
                      >
                        ${event.price}
                      </span>
                      <span className="text-sm text-gray-600">/Person</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            {totalEventPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalEventPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentEventPage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentEventPage ? "w-8" : "w-2"
                    }`}
                    style={{
                      backgroundColor:
                        idx === currentEventPage ? "#01005B" : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 px-4 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-16 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-5">DerTam</h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Explore Cambodia's hidden gems and popular destinations with us.
            </p>
          </div>
          <div>
            <h4 className="text-base font-bold mb-4">Route</h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <a
                  href="#"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/trip_plan"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Plan Trip
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/bus_booking"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Bus Booking
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/hotels"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Hotel
                </a>
              </li>
            </ul>
          </div>
          {/* <div>
            <h4 className="text-base font-bold mb-4">Tools</h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <a
                  href="#"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Payment Options
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Booking Policy
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-gray-600 no-underline text-sm hover:text-[#01005B]"
                >
                  Privacy Policies
                </a>
              </li>
            </ul>
          </div> */}
          {/* <div className="sm:col-span-2 lg:col-span-1"> */}
            {/* <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4">Newsletter</h4>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              Enter your email address
            </p> */}
            {/* <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#01005B]"
              />
              <button
                className="text-white border-none px-5 py-2 rounded cursor-pointer text-sm hover:opacity-90"
                style={{ backgroundColor: "#01005B" }}
              >
                Subscribe
              </button>
            </div> */}
          {/* </div> */}
        </div>
        <div className="border-t border-gray-200 pt-5 text-center text-gray-600 text-sm">
          2025 DerTam. All rights reserved
        </div>
      </footer>
    </div>
  );
}
