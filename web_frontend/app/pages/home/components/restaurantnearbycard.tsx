import { Star, UtensilsCrossed, MapPin } from 'lucide-react';
import { Link } from 'react-router';

interface RestaurantNearbyCardProps {
  restaurant: {
    id: number;
    name: string;
    cuisine: string;
    distance: string;
    rating: number;
    image: string;
  };
  referringPlaceId?: number;
}


export default function RestaurantNearbyCard({ restaurant, referringPlaceId }: RestaurantNearbyCardProps) {
  return (
    <Link 
      to={`/restaurant/${restaurant.id}`}
      className="block group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
    >
      <div className="flex space-x-3 p-2 sm:p-3">
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate mb-1">{restaurant.name}</h4>
          <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-600">
            <UtensilsCrossed className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{restaurant.cuisine}</span>
          </div>
          <div className="flex items-center justify-between mt-2 sm:mt-3">
            <div className="flex items-center text-xs sm:text-sm bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current mr-1" />
              <span className="font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="font-medium">{restaurant.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}