import { useState, useEffect } from 'react';

interface Destination {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  category: string;
}

export function useSearch(destinations: Destination[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<Destination[]>(destinations);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults(destinations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = destinations.filter(dest => 
      dest.name.toLowerCase().includes(query) ||
      dest.location.toLowerCase().includes(query) ||
      dest.category.toLowerCase().includes(query)
    );

    setFilteredResults(filtered);
  }, [searchQuery, destinations]);

  return {
    searchQuery,
    setSearchQuery,
    filteredResults,
    hasResults: filteredResults.length > 0,
  };
}