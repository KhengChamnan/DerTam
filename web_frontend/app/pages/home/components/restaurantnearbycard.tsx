import { Star, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router';

interface RestaurantNearbyCardProps {
  restaurant: {
    id: number;
    name: string;
    cuisine: string;
    price: string;
    rating: number;
    image: string;
  };
}

export default function RestaurantNearbyCard({ restaurant }: RestaurantNearbyCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <div className="flex space-x-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{restaurant.name}</h4>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <UtensilsCrossed className="w-4 h-4 mr-1" />
          <span>{restaurant.cuisine}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="font-semibold">{restaurant.rating}</span>
          </div>
          <span className="text-gray-600 font-semibold">{restaurant.price}</span>
        </div>
      </div>
    </div>
    </Link>
  );
}