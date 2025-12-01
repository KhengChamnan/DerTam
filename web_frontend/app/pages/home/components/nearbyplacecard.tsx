import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router';

interface NearbyPlaceCardProps {
  place: {
    id: number;
    name: string;
    distance: string;
    image: string;
    rating: number;
  };
}

export default function NearbyPlaceCard({ place }: NearbyPlaceCardProps) {
  return (
    <Link to={`/place/${place.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
        <div className="relative h-40">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{place.name}</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{place.distance}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{place.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}