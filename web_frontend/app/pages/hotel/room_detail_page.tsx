import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Users, Bed, Maximize, Check, X, Calendar, CreditCard } from "lucide-react";

// Mock rooms data (same as available_rooms_page)
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
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "City View", "Work Desk"],
        description: "Spacious room with modern amenities and stunning city views.",
        detailedDescription: "Our Deluxe Room offers 35 square meters of contemporary comfort. Featuring a plush king-size bed, modern bathroom with premium amenities, and floor-to-ceiling windows showcasing stunning city views. Perfect for couples or business travelers seeking luxury and convenience.",
        features: [
          "Complimentary high-speed WiFi",
          "55-inch Smart TV with streaming services",
          "Premium mini bar with local and international selections",
          "Nespresso coffee machine",
          "Spacious work desk with ergonomic chair",
          "Premium bedding and pillows",
          "Luxury bathroom with rain shower",
          "24/7 room service",
          "Daily housekeeping",
        ],
        available: 5,
      },
      {
        id: 2,
        type: "Executive Suite",
        price: 450,
        capacity: 4,
        beds: "1 King Bed + Sofa Bed",
        size: "65 m²",
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Balcony", "Living Room", "Coffee Maker"],
        description: "Luxurious suite with separate living area and premium amenities.",
        detailedDescription: "Experience luxury in our 65 square meter Executive Suite. Featuring a separate living room, private balcony, and premium amenities throughout. Ideal for families or extended stays.",
        features: [
          "Separate living room with sofa bed",
          "Private balcony with city views",
          "King-size bedroom with premium bedding",
          "Two 55-inch Smart TVs",
          "Full kitchenette with coffee maker",
          "Dining area for 4 guests",
          "Two luxury bathrooms",
          "Walk-in closet",
          "Executive lounge access",
        ],
        available: 3,
      },
      {
        id: 3,
        type: "Presidential Suite",
        price: 800,
        capacity: 6,
        beds: "2 King Beds",
        size: "120 m²",
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Kitchen", "Balcony", "Jacuzzi", "Butler Service", "Dining Area"],
        description: "Ultimate luxury with stunning views, private kitchen, and personalized service.",
        detailedDescription: "The pinnacle of luxury living. Our Presidential Suite spans 120 square meters of pure elegance with two king bedrooms, full kitchen, jacuzzi, and dedicated butler service.",
        features: [
          "Two master bedrooms with king beds",
          "Full gourmet kitchen",
          "Private jacuzzi with city views",
          "Spacious living and dining area",
          "Private terrace",
          "Three luxury bathrooms",
          "Personal butler service 24/7",
          "Complimentary airport transfer",
          "In-suite spa services available",
        ],
        available: 2,
      },
      {
        id: 4,
        type: "Junior Suite",
        price: 350,
        capacity: 3,
        beds: "1 King Bed",
        size: "50 m²",
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Sitting Area", "Garden View"],
        description: "Comfortable suite with cozy sitting area and garden views.",
        detailedDescription: "Perfect balance of space and comfort. Our Junior Suite offers 50 square meters with a king bedroom, separate sitting area, and beautiful garden views.",
        features: [
          "King-size bed with premium linens",
          "Separate sitting area",
          "Garden view balcony",
          "Smart TV with streaming",
          "Mini bar and coffee station",
          "Luxury bathroom with bathtub",
          "Work desk",
          "Complimentary breakfast",
        ],
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
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Work Desk"],
        description: "Modern room with comfortable amenities for a pleasant stay.",
        detailedDescription: "Our Superior Room combines modern design with comfort. Perfect for business or leisure travelers.",
        features: [
          "Queen-size bed",
          "Free WiFi throughout",
          "Smart TV",
          "Mini bar",
          "Work desk",
          "Private bathroom",
          "Daily housekeeping",
        ],
        available: 8,
      },
      {
        id: 2,
        type: "Family Suite",
        price: 320,
        capacity: 4,
        beds: "2 Queen Beds",
        size: "55 m²",
        images: [
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Kitchenette", "Balcony", "Dining Table"],
        description: "Perfect for families with spacious layout and kitchenette.",
        detailedDescription: "Designed for families, this suite offers space and convenience with two queen beds and a kitchenette.",
        features: [
          "Two queen beds",
          "Kitchenette with dining table",
          "Balcony",
          "Two bathrooms",
          "Living area",
          "Free WiFi",
          "Smart TV",
        ],
        available: 6,
      },
      {
        id: 3,
        type: "Deluxe Twin Room",
        price: 200,
        capacity: 2,
        beds: "2 Twin Beds",
        size: "32 m²",
        images: [
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        ],
        amenities: ["Free WiFi", "Smart TV", "Mini Bar", "Pool View"],
        description: "Comfortable twin beds with views of the swimming pool.",
        detailedDescription: "Twin beds with pool views, perfect for friends or colleagues traveling together.",
        features: [
          "Two twin beds",
          "Pool view",
          "Free WiFi",
          "Smart TV",
          "Mini bar",
          "Modern bathroom",
        ],
        available: 7,
      },
    ],
  },
};

export default function RoomDetailPage() {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const hotelId = id ? parseInt(id) : 1;
  const roomIdNum = roomId ? parseInt(roomId) : 1;
  const hotelData = mockRoomsData[hotelId];
  const room = hotelData?.rooms.find((r: any) => r.id === roomIdNum);

  if (!hotelData || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h2>
          <button
            onClick={() => navigate(`/hotel/${hotelId}/rooms`)}
            className="text-blue-900 hover:underline"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    // Here you would integrate with your booking API
    alert(`Booking confirmed!\nRoom: ${room.type}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}`);
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-900 transition-colors group"
          >
            <div className="p-1.5 rounded-full group-hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px]">
          <div className="md:col-span-3 rounded-2xl overflow-hidden">
            <img
              src={room.images[selectedImage]}
              alt={room.type}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-2">
            {room.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`rounded-xl overflow-hidden h-full ${
                  selectedImage === idx ? "ring-4 ring-blue-900" : "opacity-70 hover:opacity-100"
                } transition-all`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.type}</h1>
                  <p className="text-gray-600">{hotelData.hotelName} • {hotelData.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">${room.price}</div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-900" />
                  <span>{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-900" />
                  <span>{room.beds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-blue-900" />
                  <span>{room.size}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this room</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{room.detailedDescription}</p>
              <p className="text-sm text-green-600 font-semibold">
                Only {room.available} rooms left at this price!
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-50 text-blue-900 rounded-full font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book this room</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per night</span>
                    <span className="font-semibold">${room.price}</span>
                  </div>
                  {checkIn && checkOut && (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Number of nights</span>
                        <span className="font-semibold">
                          {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 mt-4">
                        <span>Total</span>
                        <span className="text-blue-900">
                          ${room.price * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!checkIn || !checkOut}
                  className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-all hover:scale-105 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Book Now
                </button>

                <p className="text-center text-sm text-gray-500">
                  Free cancellation up to 24 hours before check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Booking</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{room.type}</h4>
                <p className="text-sm text-gray-600">{hotelData.hotelName}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-semibold">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-semibold">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-semibold">{guests}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-900">
                    ${room.price * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Proceed to Payment
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
