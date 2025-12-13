import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Heart, Calendar, Users } from "lucide-react";
import Navigation from "~/components/navigation";
import { getHotelProperties, searchHotels, type HotelProperty } from "~/api/hotel";


export default function HotelListPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [hotels, setHotels] = useState<HotelProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search filters
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Load all hotels on initial mount
  useEffect(() => {
    loadAllHotels();
  }, []);

  const loadAllHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await getHotelProperties();
      console.log('Loaded hotels:', results);
      setHotels(results);
    } catch (error) {
      console.error('Error loading hotels:', error);
      setError('Failed to load hotels. Please try again.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Validate dates if provided
    if (checkIn && checkOut && checkIn >= checkOut) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const searchParams: any = {};
      
      // Only add parameters if they have valid values
      if (checkIn) searchParams.check_in = checkIn;
      if (checkOut) searchParams.check_out = checkOut;
      if (guests > 0) searchParams.guests = guests;
      if (priceRange[0] > 0) searchParams.min_price = priceRange[0];
      if (priceRange[1] < 5000) searchParams.max_price = priceRange[1];

      // If no search params, just load all hotels
      if (Object.keys(searchParams).length === 0) {
        await loadAllHotels();
      } else {
        const results = await searchHotels(searchParams);
        console.log('Search results:', results);
        setHotels(results);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search hotels. Please try again.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const minPrice = hotel.room_properties[0]?.price_per_night || 0;
    const matchesCategory =
      selectedCategory === "All" ||
      hotel.place.province_category.category_description
        .toLowerCase()
        .includes(selectedCategory.toLowerCase());
    const matchesPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Hotel" />

      {/* Hero Section with Search */}
      <section className="text-white py-16" style={{ background: 'linear-gradient(to right, #01005B, #000047)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-blue-100 mb-8">Discover amazing hotels across Cambodia</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: '#01005B' }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Hotel Grid - same as before */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "All" ? "All Hotels" : `${selectedCategory} Hotels`}
              </h2>
              <p className="text-gray-600 mt-1">Browse our selection of quality accommodations</p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#01005B] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading hotels...</p>
              </div>
            ) : filteredHotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <Link key={hotel.property_id} to={`/hotel/${hotel.place.placeID}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={hotel.place.images_url[0] || "https://via.placeholder.com/400x250?text=No+Image"}
                          alt={hotel.place.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(hotel.property_id);
                          }}
                          className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-50 transition-all shadow-lg"
                        >
                          <Heart
                            size={20}
                            color="#ef4444"
                            fill={favorites.includes(hotel.property_id) ? "#ef4444" : "none"}
                          />
                        </button>
                        <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#01005B' }}>
                          {hotel.place.province_category.province_categoryName}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                          {hotel.place.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" style={{ color: '#01005B' }} />
                          <span className="line-clamp-1">{hotel.place.province_category.category_description}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-sm">{hotel.place.ratings || 0}</span>
                          </div>
                          <span className="text-sm text-gray-600">({hotel.place.reviews_count || 0} reviews)</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.facilities.slice(0, 3).map((facility, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {facility.facility_name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <span className="text-2xl font-bold" style={{ color: '#01005B' }}>
                              ${hotel.room_properties[0]?.price_per_night || 0}
                            </span>
                            <span className="text-sm text-gray-600"> /night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500 text-lg mb-4">
                  No hotels found matching your criteria.
                </p>
                <button
                  onClick={loadAllHotels}
                  className="px-6 py-2 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: '#01005B' }}
                >
                  View All Hotels
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
