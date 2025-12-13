import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Heart, ArrowLeft } from "lucide-react";
import { getEventById, type Event } from "~/api/event";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Loading event with ID:', id);
      loadEventDetails(id);
      checkFavoriteStatus(id);
    }
  }, [id]);

  async function loadEventDetails(eventId: string) {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching event details for ID:', eventId);
      const data = await getEventById(eventId);
      console.log('Event data received:', data);
      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }

  function checkFavoriteStatus(eventId: string) {
    const savedFavorites = localStorage.getItem('eventFavorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setIsFavorite(favorites.includes(parseInt(eventId)));
    }
  }

  function toggleFavorite() {
    if (!event) return;
    
    const savedFavorites = localStorage.getItem('eventFavorites');
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (isFavorite) {
      favorites = favorites.filter((fav: number) => fav !== event.id);
    } else {
      favorites.push(event.id);
    }
    
    localStorage.setItem('eventFavorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  }

  // Format date range
  const formatDateRange = () => {
    if (!event?.start_at) return 'Date TBA';
    
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'long', 
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

  // Calculate days until event
  const getDaysUntil = () => {
    if (!event?.start_at) return null;
    
    const today = new Date();
    const startDate = new Date(event.start_at);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Event has passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
     
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01005B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
     
        <div className="max-w-[1400px] mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#01005B] text-white rounded-lg hover:bg-[#000047] transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[#01005B] hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-200">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-[400px] object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', event.image_url);
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-300">
                  <div className="text-center text-gray-500">
                    <Calendar size={48} className="mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-red-50 transition-all"
              >
                <Heart
                  size={24}
                  color="#ef4444"
                  fill={isFavorite ? "#ef4444" : "none"}
                />
              </button>
            </div>

            {/* Event Title & Description */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {event.title || 'Untitled Event'}
              </h1>
              
              <div className="prose max-w-none">
                {event.description ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                ) : (
                  <div className="text-gray-500 italic py-8 text-center">
                    <p>No description available for this event.</p>
                  </div>
                )}
              </div>
            </div>

         
          </div>

          {/* Sidebar - Event Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              
              <div className="space-y-6">
                {/* Date */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#01005B]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Date</h3>
                    <p className="text-sm text-gray-600">{formatDateRange()}</p>
                    {getDaysUntil() && (
                      <p className="text-xs text-[#01005B] font-medium mt-1">
                        {getDaysUntil()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#01005B] mb-1">Location</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      {event.placeName && (
                        <p className="text-xs text-gray-500 mt-1">{event.placeName}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration */}
                {event.start_at && event.end_at && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-[#01005B]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-sm text-gray-600">
                        {Math.max(1, Math.ceil((new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / (1000 * 60 * 60 * 24)))} days
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}