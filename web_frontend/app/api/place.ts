export interface Place {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  category: string;
  categoryId: number;
  images: string[];
  openingHours?: string | Record<string, string>;
  entryFee?: {
    local: number;
    foreign: number;
  };
  highlights?: string[];
  tips?: string[];
  nearbyPlaces?: Array<{
    id: number;
    name: string;
    distance: string;
    image: string;
    rating: number;
    category: string;
  }>;
  nearbyHotels?: Array<{
    id: number;         // property_id
    place_id: number;   // <-- add this
    name: string;
    image: string;
    rating: number;
    price: number;
    distance: string;
  }>;
  nearbyRestaurants?: Array<{
    id: number;
    name: string;
    image: string;
    rating: number;
    cuisine: string;
    distance: string;
  }>;
}

export interface PlaceCategory {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

// Remove old Event interface - now imported from event.ts
export type { Event } from './event';

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Helper function to transform API place data to frontend Place interface
function transformPlaceData(apiPlace: any): Place {
  // Handle different image formats from API
  let images: string[] = [];
  if (apiPlace.images_url && Array.isArray(apiPlace.images_url)) {
    images = apiPlace.images_url;
  } else if (apiPlace.image_url) {
    images = [apiPlace.image_url];
  } else if (apiPlace.images && Array.isArray(apiPlace.images)) {
    images = apiPlace.images;
  } else if (apiPlace.image) {
    images = [apiPlace.image];
  }

  // Handle different category ID field names
  const categoryId = apiPlace.categoryID || apiPlace.categoryId || apiPlace.category_id || apiPlace.place_category_id || 0;

  return {
    id: apiPlace.placeID || apiPlace.id,
    name: apiPlace.name || '',
    location: apiPlace.location || apiPlace.province_categoryName || apiPlace.provinceCategoryName || '',
    description: apiPlace.description || '',
    rating: parseFloat(apiPlace.ratings || apiPlace.rating) || 0,
    reviews: parseInt(apiPlace.reviews_count || apiPlace.reviews) || 0,
    price: parseFloat(apiPlace.price) || 0,
    category: apiPlace.category_name || apiPlace.category || '',
    categoryId: categoryId,
    images: images,
    openingHours: apiPlace.operating_hours || apiPlace.openingHours || '',
    entryFee: apiPlace.entry_free !== undefined ? {
      local: apiPlace.entry_free ? 0 : apiPlace.entry_fee_local || 0,
      foreign: apiPlace.entry_free ? 0 : apiPlace.entry_fee_foreign || 0,
    } : undefined,
    highlights: [
      apiPlace.category_name,
      apiPlace.best_season_to_visit,
      apiPlace.accessibility_info,
    ].filter(Boolean) as string[],
    tips: apiPlace.tips ? [apiPlace.tips] : [],
  };
}

// Get place categories
export async function getPlaceCategories(): Promise<PlaceCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/place-categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data;
}

// Get places by category
export async function getPlacesByCategory(categoryId: number): Promise<Place[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places/by-category?category_id=${categoryId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch places by category');
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} places for category ${categoryId}`, data);
    
    if (Array.isArray(data)) {
      return data.map(transformPlaceData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getPlacesByCategory:', error);
    throw error;
  }
}

// Search places
export async function searchPlaces(query: string): Promise<Place[]> {
  const response = await fetch(`${API_BASE_URL}/api/places/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search places');
  const data = await response.json();
  
  if (Array.isArray(data)) {
    return data.map(transformPlaceData);
  }
  return [];
}

// Get place details by ID
export async function getPlaceById(id: string): Promise<Place> {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}/details`);
  if (!response.ok) throw new Error('Failed to fetch place details');
  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Invalid API response');
  }

  const { placeDetail, listOfImageUrl, nearbyPlace, hotelNearby, restaurantNearby } = result.data;

  return {
    id: placeDetail.placeID,
    name: placeDetail.name,
    location: placeDetail.province_categoryName || placeDetail.provinceCategoryName || '',
    description: placeDetail.description || '',
    rating: parseFloat(placeDetail.ratings) || 0,
    reviews: parseInt(placeDetail.reviews_count) || 0,
    price: 0,
    category: placeDetail.category_name || '',
    categoryId: placeDetail.categoryID || 0,
    images: listOfImageUrl || [],
    openingHours: placeDetail.operating_hours || '',
    entryFee: placeDetail.entry_free !== undefined ? {
      local: placeDetail.entry_free ? 0 : placeDetail.entry_fee_local || 0,
      foreign: placeDetail.entry_free ? 0 : placeDetail.entry_fee_foreign || 0,
    } : undefined,
    highlights: [
      placeDetail.category_name,
      placeDetail.best_season_to_visit,
      placeDetail.accessibility_info,
    ].filter(Boolean) as string[],
    tips: placeDetail.tips ? [placeDetail.tips] : [],
    nearbyPlaces: nearbyPlace?.map((place: any) => ({
      id: place.placeID,
      name: place.name,
      distance: place.distance ? `${place.distance.toFixed(1)} km` : 'N/A',
      image: place.images_url?.[0] || place.image_url || '',
      rating: parseFloat(place.ratings) || 0,
      category: place.category_name || '',
    })) || [],
    nearbyHotels: hotelNearby?.map((hotel: any) => {
      console.log('Backend hotel data:', hotel);
      return {
        id: hotel.property_id,
        place_id: hotel.place_id || hotel.placeID,
        name: hotel.property_name || hotel.name || hotel.title || '',
        image: hotel.images_url?.[0] || hotel.image_url || '',
        rating: parseFloat(hotel.ratings) || 0,
        price: parseFloat(hotel.price_per_night) || 0,
        distance: hotel.distance ? `${hotel.distance.toFixed(1)} km` : 'N/A',
      };
    }) || [],
    nearbyRestaurants: restaurantNearby?.map((restaurant: any) => ({
      id: restaurant.placeID,
      name: restaurant.name,
      image: restaurant.images_url?.[0] || restaurant.image_url || '',
      rating: parseFloat(restaurant.ratings) || 0,
      cuisine: restaurant.category_name || 'Restaurant',
      distance: restaurant.distance ? `${restaurant.distance.toFixed(1)} km` : 'N/A',
    })) || [],
  };
}


// Get recommended places
export async function getRecommendedPlaces(): Promise<Place[]> {
  const response = await fetch(`${API_BASE_URL}/api/places/recommended`);
  if (!response.ok) throw new Error('Failed to fetch recommended places');
  const data = await response.json();
  
  if (Array.isArray(data)) {
    return data.map(transformPlaceData);
  }
  return [];
}

// Get all places for trip planning
export async function getAllPlacesForTripPlanning(): Promise<Place[]> {
  const response = await fetch(`${API_BASE_URL}/api/trip-planning/places`);
  if (!response.ok) throw new Error('Failed to fetch places');
  const data = await response.json();
  
  if (Array.isArray(data)) {
    return data.map(transformPlaceData);
  }
  return [];
}