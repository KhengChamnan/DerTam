import { useState } from 'react';
import { ArrowLeft, Search, Heart, MapPin, Hotel, UtensilsCrossed, Coffee, Building2, Bus } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';

interface Favorite {
  id: string;
  name: string;
  location: string;
  type: 'hotel' | 'restaurant' | 'cafe' | 'museum' | 'bus-route';
  image: string;
  addedDate: string;
  description?: string;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'hotel' | 'restaurant' | 'cafe' | 'museum' | 'bus-route'>('all');
  const [favorites, setFavorites] = useState<Favorite[]>([
    {
      id: '1',
      name: 'Grand Majestic Hotel',
      location: 'Paris, France',
      type: 'hotel',
      image: '/hotel1.jpg',
      addedDate: '2024-11-15',
      description: '5-star luxury hotel in the heart of Paris',
    },
    {
      id: '2',
      name: 'The Secret Garden Cafe',
      location: 'Kyoto, Japan',
      type: 'cafe',
      image: '/cafe1.jpg',
      addedDate: '2024-11-18',
      description: 'Peaceful garden cafe with traditional tea',
    },
    {
      id: '3',
      name: 'The Louvre',
      location: 'Paris, France',
      type: 'museum',
      image: '/museum1.jpg',
      addedDate: '2024-11-20',
      description: 'World-famous art museum',
    },
    {
      id: '4',
      name: 'Colombo → Kandy Route',
      location: 'Sri Lanka',
      type: 'bus-route',
      image: '/bus1.jpg',
      addedDate: '2024-11-22',
      description: 'Scenic route through the hill country',
    },
    {
      id: '5',
      name: 'La Belle Restaurant',
      location: 'Paris, France',
      type: 'restaurant',
      image: '/restaurant1.jpg',
      addedDate: '2024-11-10',
      description: 'Fine French dining experience',
    },
  ]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fav.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || fav.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Hotel size={28} />;
      case 'restaurant':
        return <UtensilsCrossed size={28} />;
      case 'cafe':
        return <Coffee size={28} />;
      case 'museum':
        return <Building2 size={28} />;
      case 'bus-route':
        return <Bus size={28} />;
      default:
        return <MapPin size={28} />;
    }
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      hotel: 'bg-blue-50 text-blue-600',
      restaurant: 'bg-orange-50 text-orange-600',
      cafe: 'bg-amber-50 text-amber-600',
      museum: 'bg-purple-50 text-purple-600',
      'bus-route': 'bg-green-50 text-green-600',
    };
    return colorMap[type] || 'bg-gray-50 text-gray-600';
  };

  const handleRemoveFavorite = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Profile" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-base font-medium"
          >
            <ArrowLeft size={22} />
            Back to Profile
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Favorites</h1>
          <p className="text-lg text-gray-600 mt-2">Your saved places and routes</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('restaurant')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'restaurant'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setActiveFilter('cafe')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'cafe'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cafes
            </button>
            <button
              onClick={() => setActiveFilter('museum')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'museum'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Museums
            </button>
            <button
              onClick={() => setActiveFilter('hotel')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'hotel'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveFilter('bus-route')}
              className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'bus-route'
                  ? 'bg-[#01005B] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bus Routes
            </button>
          </div>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {filteredFavorites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Heart size={72} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No favorites found</h3>
              <p className="text-lg text-gray-600 mb-8">
                {searchQuery ? 'Try adjusting your search' : 'Start adding your favorite places!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 text-base font-bold bg-[#01005B] text-white rounded-xl hover:bg-[#000047] transition-colors"
                >
                  Explore Places
                </button>
              )}
            </div>
          ) : (
            filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                  removingId === favorite.id 
                    ? 'opacity-0 scale-95 -translate-x-full' 
                    : 'opacity-100 scale-100 translate-x-0'
                }`}
                style={{ transition: 'all 0.3s ease-out' }}
              >
                <div className="flex items-center p-6 gap-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getTypeColor(favorite.type)}`}>
                    {getTypeIcon(favorite.type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{favorite.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin size={16} />
                      <span className="text-base">{favorite.location}</span>
                    </div>
                    {favorite.description && (
                      <p className="text-sm text-gray-500">{favorite.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Added on {formatDate(favorite.addedDate)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      disabled={removingId === favorite.id}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from favorites"
                    >
                      <Heart size={24} fill="currentColor" />
                    </button>
                    <button
                      onClick={() => navigate(`/${favorite.type}/${favorite.id}`)}
                      className="px-6 py-3 bg-[#01005B] text-white rounded-xl font-semibold hover:bg-[#000047] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}