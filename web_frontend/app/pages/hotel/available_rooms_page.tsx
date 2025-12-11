import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Users, Bed, Maximize, Wifi, Tv, Coffee, Wind, MapPin, Star, Calendar, Check } from "lucide-react";

// Mock rooms data for different hotels
const mockRoomsData: Record<number, any> = {
  1: {
    hotelId: 1,
    hotelName: "Raffles Hotel Le Royal",
    location: "Phnom Penh, Cambodia",
    rooms: [
      {
        id: 1,
        type: "Deluxe Room",
        price: 250,
        capacity: 2,
        beds: "1 King Bed",
        size: "35 m²",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600",
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "City View", "Work Desk"],
        description: "Spacious room with modern amenities and stunning city views.",
        available: 5,
      },
      {
        id: 2,
        type: "Executive Suite",
        price: 450,
        capacity: 4,
        beds: "1 King Bed + Sofa Bed",
        size: "65 m²",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Balcony", "Living Room", "Coffee Maker"],
        description: "Luxurious suite with separate living area and premium amenities.",
        available: 3,
      },
      {
        id: 3,
        type: "Presidential Suite",
        price: 800,
        capacity: 6,
        beds: "2 King Beds",
        size: "120 m²",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
        amenities: ["Free WiFi", "Smart TV", "Kitchen", "Balcony", "Jacuzzi", "Butler Service", "Dining Area"],
        description: "Ultimate luxury with stunning views, private kitchen, and personalized service.",
        available: 2,
      },
      {
        id: 4,
        type: "Junior Suite",
        price: 350,
        capacity: 3,
        beds: "1 King Bed",
        size: "50 m²",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Sitting Area", "Garden View"],
        description: "Comfortable suite with cozy sitting area and garden views.",
        available: 4,
      },
    ],
  },
  2: {
    hotelId: 2,
    hotelName: "Sokha Phnom Penh Hotel",
    location: "Phnom Penh, Cambodia",
    rooms: [
      {
        id: 1,
        type: "Superior Room",
        price: 180,
        capacity: 2,
        beds: "1 Queen Bed",
        size: "30 m²",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Work Desk"],
        description: "Modern room with comfortable amenities for a pleasant stay.",
        available: 8,
      },
      {
        id: 2,
        type: "Family Suite",
        price: 320,
        capacity: 4,
        beds: "2 Queen Beds",
        size: "55 m²",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600",
        amenities: ["Free WiFi", "Smart TV", "Kitchenette", "Balcony", "Dining Table"],
        description: "Perfect for families with spacious layout and kitchenette.",
        available: 6,
      },
      {
        id: 3,
        type: "Deluxe Twin Room",
        price: 200,
        capacity: 2,
        beds: "2 Twin Beds",
        size: "32 m²",
        image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600",
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Pool View"],
        description: "Comfortable twin beds with views of the swimming pool.",
        available: 7,
      },
    ],
  },
};

export default function AvailableRoomsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [selectedRoomType, setSelectedRoomType] = useState("All");

  const hotelId = id ? parseInt(id) : 1;
  const hotelData = mockRoomsData[hotelId];

  if (!hotelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h2>
          <button
            onClick={() => navigate("/hotels")}
            style={{ color: '#01005B' }}
            className="hover:underline font-semibold"
          >
            Go to Hotels
          </button>
        </div>
      </div>
    );
  }

  const roomTypes = ["All", ...new Set(hotelData.rooms.map((r: any) => r.type))] as string[];
  const filteredRooms = selectedRoomType === "All" 
    ? hotelData.rooms 
    : hotelData.rooms.filter((r: any) => r.type === selectedRoomType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 transition-colors group"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#01005B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#374151';
            }}
          >
            <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Hotel Details</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(to right, #01005B, #000047)' }} className="text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" style={{ color: '#fbbf24' }} />
            <p className="text-white/90 text-lg">{hotelData.location}</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{hotelData.hotelName}</h1>
          <p className="text-white/80 text-lg max-w-2xl">Discover your perfect room from our selection of elegantly designed accommodations</p>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.8</span>
            </div>
            <div className="text-white/80">
              <span className="font-semibold text-white">{hotelData.rooms.length}</span> room types available
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Search</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-transparent outline-none text-sm"
                      style={{ accentColor: '#01005B' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#01005B';
                        e.target.style.boxShadow = '0 0 0 3px rgba(1, 0, 91, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-transparent outline-none text-sm"
                      style={{ accentColor: '#01005B' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#01005B';
                        e.target.style.boxShadow = '0 0 0 3px rgba(1, 0, 91, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-transparent outline-none text-sm"
                      style={{ accentColor: '#01005B' }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#01005B';
                        e.target.style.boxShadow = '0 0 0 3px rgba(1, 0, 91, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Room Type</h3>
                <div className="space-y-2">
                  {roomTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedRoomType(type)}
                      style={{
                        backgroundColor: selectedRoomType === type ? '#01005B' : '#f9fafb',
                        color: selectedRoomType === type ? 'white' : '#374151'
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
                      onMouseEnter={(e) => {
                        if (selectedRoomType !== type) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedRoomType !== type) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{type}</span>
                        {selectedRoomType === type && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredRooms.length}</span> rooms available
                </p>
              </div>
            </div>
          </aside>

          {/* Rooms List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRoomType === "All" ? "All Rooms" : selectedRoomType}
              </h2>
              <p className="text-gray-600 mt-1">Select the perfect room for your stay</p>
            </div>

            <div className="space-y-6">
              {filteredRooms.map((room: any) => (
                <div 
                  key={room.id}
                  onClick={() => navigate(`/hotel/${hotelId}/room/${room.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                  style={{
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    {/* Room Image */}
                    <div className="md:col-span-2 h-72 md:h-auto overflow-hidden relative">
                      <img
                        src={room.image}
                        alt={room.type}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <div style={{ backgroundColor: '#01005B' }} className="px-3 py-1.5 rounded-full text-white text-xs font-bold">
                          Best Value
                        </div>
                      </div>
                      {room.available <= 3 && (
                        <div className="absolute bottom-4 left-4">
                          <div className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            Only {room.available} left!
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="md:col-span-3 p-8">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-1">{room.type}</h3>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">(4.9)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold" style={{ color: '#01005B' }}>${room.price}</span>
                              </div>
                              <span className="text-gray-500 text-sm">per night</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-5 leading-relaxed">{room.description}</p>
                          
                          {/* Room Info Grid */}
                          <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg">
                                <Users className="w-5 h-5" style={{ color: '#01005B' }} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Capacity</p>
                                <p className="text-sm font-semibold text-gray-900">{room.capacity} guests</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg">
                                <Bed className="w-5 h-5" style={{ color: '#01005B' }} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Bed Type</p>
                                <p className="text-sm font-semibold text-gray-900">{room.beds}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div style={{ backgroundColor: 'rgba(1, 0, 91, 0.1)' }} className="p-2 rounded-lg">
                                <Maximize className="w-5 h-5" style={{ color: '#01005B' }} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Room Size</p>
                                <p className="text-sm font-semibold text-gray-900">{room.size}</p>
                              </div>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="mb-5">
                            <p className="text-sm font-bold text-gray-900 mb-3">Room Amenities</p>
                            <div className="grid grid-cols-2 gap-2">
                              {room.amenities.slice(0, 6).map((amenity: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Check className="w-4 h-4" style={{ color: '#01005B' }} />
                                  <span className="text-sm text-gray-700">{amenity}</span>
                                </div>
                              ))}
                            </div>
                            {room.amenities.length > 6 && (
                              <button className="text-sm mt-2" style={{ color: '#01005B' }}>
                                +{room.amenities.length - 6} more amenities
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-auto pt-5 border-t border-gray-100">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hotel/${hotelId}/room/${room.id}`);
                            }}
                            style={{ backgroundColor: '#01005B' }}
                            className="flex-1 px-6 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#000047';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#01005B';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            Select Room
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hotel/${hotelId}/room/${room.id}`);
                            }}
                            className="px-6 py-3.5 border-2 rounded-xl font-bold transition-all"
                            style={{ 
                              borderColor: '#01005B',
                              color: '#01005B'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#01005B';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#01005B';
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500 text-lg">
                  No rooms available for the selected criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
