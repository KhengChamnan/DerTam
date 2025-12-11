import { useState, useEffect } from 'react';

export interface Favorite {
  id: string;
  name: string;
  location: string;
  type: 'destination' | 'event' | 'hotel' | 'restaurant' | 'cafe' | 'museum' | 'bus-route';
  image: string;
  addedDate: string;
  description?: string;
  price?: number;
  rating?: number;
  category?: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    console.log('Loading from localStorage:', savedFavorites); // Debug log
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        console.log('Loaded favorites:', parsed); // Debug log
        setFavorites(parsed);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving favorites to localStorage:', favorites); // Debug log
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addFavorite = (item: Omit<Favorite, 'addedDate'>) => {
    console.log('Adding favorite:', item); // Debug log
    const newFavorite: Favorite = {
      ...item,
      addedDate: new Date().toISOString(),
    };
    setFavorites(prev => {
      const updated = [...prev, newFavorite];
      console.log('Updated favorites:', updated); // Debug log
      return updated;
    });
  };

  const removeFavorite = (id: string) => {
    console.log('Removing favorite:', id); // Debug log
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  const toggleFavorite = (item: Omit<Favorite, 'addedDate'>) => {
    const exists = favorites.some(fav => fav.id === item.id);
    console.log('Toggle favorite:', item.id, 'exists:', exists); // Debug log
    if (exists) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const isFavorite = (id: string) => {
    const result = favorites.some(fav => fav.id === id);
    return result;
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}