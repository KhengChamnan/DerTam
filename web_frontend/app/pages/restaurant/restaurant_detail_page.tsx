import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ChevronLeft, Star, Phone, MapPin, Heart, Navigation, Calendar, Users, X } from "lucide-react";
import { useRestaurantData } from "./hooks/useRestaurantData";
import RestaurantImageGallery from "./components/restaurantimagegallery";
import MenuCategoryTabs from "./components/menucategorytabs";
import MenuItemCard from "./components/menuitemcard";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant, loading } = useRestaurantData(id);
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [partySize, setPartySize] = useState(2);

  const handleGetDirections = () => {
    const address = encodeURIComponent(restaurant?.location || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
  };

  const handleReservation = () => {
    if (!reservationDate || !reservationTime) {
      alert("Please select date and time for your reservation");
      return;
    }
    alert(`Reservation Confirmed!\n\nRestaurant: ${restaurant?.name}\nDate: ${new Date(reservationDate).toLocaleDateString()}\nTime: ${reservationTime}\nParty Size: ${partySize} guests\n\nWe look forward to serving you!`);
    setShowReservationModal(false);
    setReservationDate("");
    setReservationTime("");
    setPartySize(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-900 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const filteredMenu = restaurant.menu[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <button
            onClick={() => {
              // Always use browser back for natural navigation
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate('/');
              }
            }}
            className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#01005B] hover:to-[#000047] text-gray-700 hover:text-white rounded-xl border border-gray-200 hover:border-[#01005B] transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-white/50 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="font-semibold text-sm sm:text-base tracking-wide">Back</span>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <RestaurantImageGallery
        images={restaurant.images}
        restaurantName={restaurant.name}
      />

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-7 lg:p-9 mb-6 sm:mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {restaurant.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-5 h-5 ${
                        idx < Math.floor(restaurant.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">{restaurant.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">
                {restaurant.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-[#01005B]" />
                  <span className="font-medium">{restaurant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-[#01005B]" />
                  <span className="font-medium">{restaurant.location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-200 transition-all hover:scale-110 shadow-md"
              >
                <Heart
                  size={24}
                  className="transition-transform"
                  color="#ef4444"
                  fill={isFavorite ? "#ef4444" : "none"}
                  strokeWidth={2.5}
                />
              </button>
              {/* <button 
                onClick={() => setShowReservationModal(true)}
                className="flex items-center gap-2 px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                <Calendar className="w-5 h-5" />
                <span>Reserve Table</span>
              </button> */}
              <button 
                onClick={handleGetDirections}
                className="flex items-center gap-2 px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg text-sm sm:text-base"
                style={{ backgroundColor: '#01005B' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000047'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#01005B'}
              >
                <Navigation className="w-5 h-5" />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Menu Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

          {/* Category Tabs */}
          <MenuCategoryTabs
            categories={Object.keys(restaurant.menu)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Menu Items Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenu.map((item: any) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items available in this category</p>
            </div>
          )}
        </div>
      </main>

      {/* Reservation Modal */}
      {/* {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Reserve a Table</h3>
              <button
                onClick={() => setShowReservationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#01005B] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time
                </label>
                <select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#01005B] focus:outline-none transition-colors"
                >
                  <option value="">Select time</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="7:30 PM">7:30 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="8:30 PM">8:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Party Size
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-900">{partySize}</span>
                  </div>
                  <button
                    onClick={() => setPartySize(Math.min(20, partySize + 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReservation}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
