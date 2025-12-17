import { Star, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router';

interface HotelNearbyCardProps {
  hotel: {
    id: number; // property_id
    place_id: number; // <-- add this if available
    name: string;
    price: number;
    distance: string;
    rating: number;
    image: string;
  };
  referringPlaceId?: number;
}

export default function HotelNearbyCard({ hotel, referringPlaceId }: HotelNearbyCardProps) {
  return (
    <Link 
      to={`/hotel/${hotel.place_id}`}
      className="block group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
    >
      <div className="flex space-x-3 p-2">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{hotel.name}</h4>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{hotel.distance}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}