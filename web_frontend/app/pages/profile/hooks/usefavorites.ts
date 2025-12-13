import { useState, useEffect } from "react";
import type { Place } from "~/api/place";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    setFavorites(stored ? JSON.parse(stored) : []);
  }, []);

  const addFavorite = (place: Place) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === place.id)) return prev;
      const updated = [...prev, { ...place, addedDate: new Date().toISOString() }];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (id: number | string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id: number | string) => favorites.some((f) => f.id === id);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}