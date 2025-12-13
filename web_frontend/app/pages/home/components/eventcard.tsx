import { Heart, Calendar, MapPin } from "lucide-react";
import type { Event } from "~/api/event";

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClick?: () => void;
}

export default function EventCard({ 
  event, 
  isFavorite, 
  onToggleFavorite,
  onClick 
}: EventCardProps) {
  
  // Format date range
  const formatDateRange = () => {
    if (!event.start_at) return 'Date TBA';
    
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    const startStr = startDate.toLocaleDateString('en-US', options);
    
    if (endDate && endDate.getTime() !== startDate.getTime()) {
      const endStr = endDate.toLocaleDateString('en-US', options);
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  };

  return (
    <div 
      onClick={onClick}
      className="rounded-xl sm:rounded-2xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all bg-white"
    >
      {/* Event Image */}
      <div className="relative">
        <img 
          src={event.image_url || '/images/placeholder.jpg'} 
          alt={event.title || 'Event'} 
          className="w-full h-48 sm:h-56 lg:h-64 object-cover" 
        />
        
        {/* Favorite Button */}
        {/* <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(event.id);
          }}
          className="absolute top-4 right-4 bg-white border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-red-50 transition-all shadow-md"
        >
          <Heart
            size={20}
            color="#ef4444"
            fill={isFavorite ? "#ef4444" : "none"}
          />
        </button> */}
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#01005B]" />
            <span className="text-xs font-semibold text-[#01005B]">
              {formatDateRange()}
            </span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title || 'Untitled Event'}
        </h3>
        
        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin size={16} className="flex-shrink-0" />
            <p className="text-sm line-clamp-1">{event.location}</p>
          </div>
        )}
        
        {/* Description */}
        {/* <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {event.description || 'No description available'}
        </p> */}

        {/* Optional: Event Type/Status Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
            Upcoming Event
          </span>
        </div>
      </div>
    </div>
  );
}