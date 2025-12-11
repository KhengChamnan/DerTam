import { useState } from 'react';
import { ArrowLeft, Search, Heart, MapPin, Hotel, UtensilsCrossed, Coffee, Building2, Bus, Star, Grid3x3, List, Trash2, Eye, DollarSign } from 'lucide-react';
import Navigation from '../../components/navigation';
import { useNavigate } from 'react-router';
import { useFavorites } from './hooks/usefavorites';

export default function FavoritesPage() {
  const navigate = useNavigate();
  
  const { favorites, removeFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'destination' | 'event' | 'hotel' | 'restaurant' | 'cafe' | 'museum' | 'bus-route'>('all');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fav.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || fav.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel size={20} />;
      case 'restaurant': return <UtensilsCrossed size={20} />;
      case 'cafe': return <Coffee size={20} />;
      case 'museum': return <Building2 size={20} />;
      case 'bus-route': return <Bus size={20} />;
      case 'destination': return <MapPin size={20} />;
      case 'event': return <Star size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      hotel: 'bg-blue-500',
      restaurant: 'bg-orange-500',
      cafe: 'bg-amber-500',
      museum: 'bg-purple-500',
      'bus-route': 'bg-green-500',
      destination: 'bg-indigo-500',
      event: 'bg-pink-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(id);
    setTimeout(() => {
      removeFavorite(id);
      setRemovingId(null);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardClick = (favorite: any) => {
    const route = favorite.type === 'destination' || favorite.type === 'event' 
      ? `/place/${favorite.id}` 
      : `/${favorite.type}/${favorite.id}`;
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeNav="Profile" />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#01005B] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Profile</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
              <p className="text-lg text-gray-600">
                {favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}
              </p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#01005B] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#01005B] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent"
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01005B] focus:border-transparent bg-white cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="destination">Destinations</option>
              <option value="event">Events</option>
              <option value="restaurant">Restaurants</option>
              <option value="cafe">Cafes</option>
              <option value="hotel">Hotels</option>
              <option value="bus-route">Bus Routes</option>
            </select>
          </div>
        </div>

        {/* Favorites Content */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || activeFilter !== 'all' ? 'No matches found' : 'No favorites yet'}
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Start exploring and save your favorite places by clicking the heart icon'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-[#01005B] text-white rounded-xl font-semibold hover:bg-[#000047] transition-all shadow-md hover:shadow-lg"
              >
                Explore Places
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    onClick={() => handleCardClick(favorite)}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group ${
                      removingId === favorite.id ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                    }`}
                    style={{ transition: 'all 0.3s ease-out' }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={favorite.image} 
                        alt={favorite.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Type Badge */}
                      <div className={`absolute top-3 left-3 ${getTypeColor(favorite.type)} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md`}>
                        {getTypeIcon(favorite.type)}
                        <span>{favorite.type.replace('-', ' ')}</span>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-md opacity-0 group-hover:opacity-100"
                        title="Remove from favorites"
                      >
                        <Heart size={20} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{favorite.name}</h3>
                        {favorite.rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                            <Star size={14} fill="#fbbf24" color="#fbbf24" />
                            <span className="text-sm font-bold">{favorite.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{favorite.location}</span>
                      </div>

                      {favorite.category && (
                        <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-3">
                          {favorite.category}
                        </span>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        {favorite.price ? (
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} className="text-[#01005B]" />
                            <span className="text-lg font-bold text-[#01005B]">{favorite.price}</span>
                            <span className="text-xs text-gray-500">/person</span>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(favorite);
                          }}
                          className="text-[#01005B] hover:text-[#000047] font-semibold text-sm flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        Saved {formatDate(favorite.addedDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    onClick={() => handleCardClick(favorite)}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group ${
                      removingId === favorite.id ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'
                    }`}
                    style={{ transition: 'all 0.3s ease-out' }}
                  >
                    <div className="flex items-center p-5 gap-5">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <img 
                          src={favorite.image} 
                          alt={favorite.name}
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                        {/* Type Badge */}
                        <div className={`absolute bottom-2 left-2 ${getTypeColor(favorite.type)} text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md`}>
                          {getTypeIcon(favorite.type)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{favorite.name}</h3>
                            <div className="flex items-center gap-2 text-gray-600 flex-wrap">
                              <MapPin size={16} className="flex-shrink-0" />
                              <span className="text-sm">{favorite.location}</span>
                              {favorite.category && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {favorite.category}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {favorite.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                              <Star size={16} fill="#fbbf24" color="#fbbf24" />
                              <span className="text-sm font-bold">{favorite.rating}</span>
                            </div>
                          )}
                        </div>

                        {favorite.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{favorite.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {favorite.price && (
                              <div className="flex items-center gap-1">
                                <DollarSign size={18} className="text-[#01005B]" />
                                <span className="text-xl font-bold text-[#01005B]">{favorite.price}</span>
                                <span className="text-sm text-gray-500">/person</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              Saved {formatDate(favorite.addedDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center justify-center gap-3 p-5 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                        <button
                          onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-red rounded-xl font-semibold hover:bg-[#000047] transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                          title="Remove from favorites"
                        >
                          <Heart size={16} fill="#ef4444" color="#ef4444" />
                          remove
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(favorite);
                          }}
                          className="px-4 py-2 bg-[#01005B] text-white rounded-xl font-semibold hover:bg-[#000047] transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}