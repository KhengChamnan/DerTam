import { Star, MapPin, Calendar, Heart } from "lucide-react";

interface PlaceHeaderProps {
  name: string;
  rating: number;
  reviews: number;
  location: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onStartPlanning: () => void;
}

export default function PlaceHeader({
  name,
  rating,
  reviews,
  location,
  isFavorite,
  onToggleFavorite,
  onStartPlanning,
}: PlaceHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 lg:-mt-16 relative z-10">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-7 lg:p-9 mb-6 sm:mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 w-fit">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg text-gray-900">{rating}</span>
                <span className="text-gray-600">({reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-full border border-gray-200 w-fit">
                <MapPin className="w-5 h-5" style={{ color: '#01005B' }} />
                <span className="font-semibold text-gray-800">{location}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onStartPlanning}
              className="flex items-center gap-2 px-5 sm:px-6 lg:px-8 py-3 sm:py-3.5 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg text-sm sm:text-base group"
              style={{ backgroundColor: '#01005B' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000047'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#01005B'}
            >
              <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Start planning</span>
              <span className="sm:hidden">Plan</span>
            </button>
            <button
              onClick={onToggleFavorite}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-200 transition-all hover:scale-110 shadow-md"
            >
              <Heart
                size={28}
                className="sm:w-8 sm:h-8 transition-transform"
                color="#ef4444"
                fill={isFavorite ? "#ef4444" : "none"}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
