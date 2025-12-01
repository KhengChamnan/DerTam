import { useState } from "react";
import { Link } from "react-router";
import { Star, MapPin, Wifi, Coffee, Dumbbell, Heart } from "lucide-react";
import Navigation from "~/components/navigation";

// Mock hotels data
const mockHotels = [
  {
    id: 1,
    name: "Raffles Hotel Le Royal",
    location: "Phnom Penh, Cambodia",
    rating: 4.8,
    reviews: 1234,
    pricePerNight: 250,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    category: "Luxury",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
  },
  {
    id: 2,
    name: "Sokha Phnom Penh Hotel",
    location: "Phnom Penh, Cambodia",
    rating: 4.6,
    reviews: 856,
    pricePerNight: 180,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    category: "Luxury",
    amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
  },
  {
    id: 3,
    name: "Sofitel Angkor Phokeethra",
    location: "Siem Reap, Cambodia",
    rating: 4.7,
    reviews: 2156,
    pricePerNight: 220,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    category: "Luxury",
    amenities: ["WiFi", "Pool", "Spa", "Bar"],
  },
  {
    id: 4,
    name: "Hotel Cambodia",
    location: "Phnom Penh, Cambodia",
    rating: 4.3,
    reviews: 543,
    pricePerNight: 120,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    category: "Mid-Range",
    amenities: ["WiFi", "Restaurant", "Bar"],
  },
  {
    id: 5,
    name: "Angkor Palace Resort",
    location: "Siem Reap, Cambodia",
    rating: 4.5,
    reviews: 1089,
    pricePerNight: 150,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    category: "Mid-Range",
    amenities: ["WiFi", "Pool", "Restaurant"],
  },
  {
    id: 6,
    name: "Preah Vihear Hotel",
    location: "Preah Vihear, Cambodia",
    rating: 4.2,
    reviews: 342,
    pricePerNight: 80,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    category: "Budget",
    amenities: ["WiFi", "Restaurant"],
  },
  {
    id: 7,
    name: "Kampot River Lodge",
    location: "Kampot, Cambodia",
    rating: 4.4,
    reviews: 678,
    pricePerNight: 95,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    category: "Budget",
    amenities: ["WiFi", "Pool", "Restaurant"],
  },
  {
    id: 8,
    name: "Sihanoukville Beach Resort",
    location: "Sihanoukville, Cambodia",
    rating: 4.6,
    reviews: 1432,
    pricePerNight: 175,
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    category: "Beach",
    amenities: ["WiFi", "Pool", "Beach", "Spa"],
  },
];

const categories = ["All", "Luxury", "Mid-Range", "Budget", "Beach"];

export default function HotelListPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const filteredHotels = mockHotels.filter((hotel) => {
    const matchesCategory = selectedCategory === "All" || hotel.category === selectedCategory;
    const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];
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

      {/* Hero Section */}
      <section className="text-white py-16" style={{ background: 'linear-gradient(to right, #01005B, #000047)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-blue-100">Discover amazing hotels across Cambodia</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full text-left px-4 py-2 rounded-lg transition-all"
                      style={{
                        backgroundColor: selectedCategory === cat ? '#01005B' : '#f9fafb',
                        color: selectedCategory === cat ? 'white' : '#374151'
                      }}
                      onMouseEnter={(e) => selectedCategory !== cat && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      onMouseLeave={(e) => selectedCategory !== cat && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full"
                    style={{ accentColor: '#01005B' }}
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredHotels.length}</span> hotels found
                </p>
              </div>
            </div>
          </aside>

          {/* Hotel Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "All" ? "All Hotels" : `${selectedCategory} Hotels`}
              </h2>
              <p className="text-gray-600 mt-1">Browse our selection of quality accommodations</p>
            </div>

            {filteredHotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(hotel.id);
                          }}
                          className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-50 transition-all shadow-lg"
                        >
                          <Heart
                            size={20}
                            color="#ef4444"
                            fill={favorites.includes(hotel.id) ? "#ef4444" : "none"}
                          />
                        </button>
                        <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#01005B' }}>
                          {hotel.category}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                          {hotel.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" style={{ color: '#01005B' }} />
                          <span className="line-clamp-1">{hotel.location}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-sm">{hotel.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">({hotel.reviews} reviews)</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <span className="text-2xl font-bold" style={{ color: '#01005B' }}>
                              ${hotel.pricePerNight}
                            </span>
                            <span className="text-sm text-gray-600"> /night</span>
                          </div>
                          {/* <button 
                            className="px-4 py-2 text-white rounded-lg font-semibold transition-colors text-sm"
                            style={{ backgroundColor: '#01005B' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000047'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#01005B'}
                          >
                            View Details
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500 text-lg">
                  No hotels found matching your criteria. Try adjusting the filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
