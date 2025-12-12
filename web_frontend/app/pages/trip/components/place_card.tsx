import { MapPin, Trash2, Eye } from 'lucide-react';

interface Place {
  placeID: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  google_maps_link: string;
  ratings: number;
  reviews_count: number;
  images_url: string[];
  entry_free: boolean;
  operating_hours?: Record<string, any>;
  best_season_to_visit?: string;
  province_id: number;
  province_categoryName: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
}

interface PlaceCardProps {
  place: Place;
  index: number;
  onDelete?: () => void;
  onViewDetails?: () => void;
  showDelete?: boolean;
  showViewDetails?: boolean;
  showOrderNumber?: boolean;
}

export default function PlaceCard({
  place,
  index,
  onDelete,
  onViewDetails,
  showDelete = false,
  showViewDetails = true,
  showOrderNumber = true,
}: PlaceCardProps) {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Remove "${place.name}" from your itinerary?`)) {
      onDelete?.();
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.();
  };

  // Safely get image URL
  const getImageUrl = (): string => {
    try {
      // If images_url is a string, try to parse it as JSON
      if (typeof place.images_url === 'string') {
        const parsed = JSON.parse(place.images_url as any);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
      // If it's already an array
      if (Array.isArray(place.images_url) && place.images_url.length > 0) {
        return place.images_url[0];
      }
    } catch (e) {
      console.error('Error parsing images_url:', e);
    }
    return 'https://via.placeholder.com/80?text=No+Image';
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group">
      {/* Order Number */}
      {showOrderNumber && (
        <div 
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" 
          style={{ backgroundColor: '#01005B' }}
        >
          {index + 1}
        </div>
      )}

      {/* Place Image */}
      <img
        src={getImageUrl()}
        alt={place.name}
        className="w-20 h-20 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/80?text=Image+Not+Found';
        }}
      />

      {/* Place Info */}
      <div className="flex-1">
        <h3 className="font-bold text-lg">{place.name}</h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin size={14} />
          {place.province_categoryName}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm">{place.ratings}</span>
          </div>
          {place.entry_free && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Free Entry
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">

         {/* View Details Button */}
        {showViewDetails && (
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition-all flex items-center gap-2"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View Details</span>
          </button>
        )}
        
        {/* Delete Button */}
        {showDelete && onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Remove from itinerary"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}