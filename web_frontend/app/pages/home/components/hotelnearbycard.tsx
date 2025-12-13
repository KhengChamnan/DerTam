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
}

export default function HotelNearbyCard({ hotel }: HotelNearbyCardProps) {
  return (
    <Link to={`/hotel/${hotel.place_id}`}>
      <div className="flex space-x-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
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