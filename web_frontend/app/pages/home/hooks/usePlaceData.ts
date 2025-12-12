import { useState, useEffect } from "react";
import {
  getPlaceCategories,
  getRecommendedPlaces,
  searchPlaces,
  type Place,
  type PlaceCategory,
} from "~/api/place";
import { getUpcomingEvents, type Event } from "~/api/event";

export function usePlaceData() {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [destinations, setDestinations] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        categoriesData,
        destinationsData,
        eventsData,
      ] = await Promise.all([
        getPlaceCategories(),
        getRecommendedPlaces(),
        getUpcomingEvents(),
      ]);

      setCategories(categoriesData);
      setDestinations(destinationsData);
      setEvents(eventsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
      console.error("Error loading homepage data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function search(query: string) {
    try {
      setLoading(true);
      const results = await searchPlaces(query);
      setDestinations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return {
    categories,
    destinations,
    events,
    loading,
    error,
    search,
    refresh: loadData,
  };
}
