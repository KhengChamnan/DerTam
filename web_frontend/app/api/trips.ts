import type { Place } from "./place";

// API Response Types (matching backend structure)
export interface Trip {
  trip_id: number;
  user_id: number;
  trip_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  days_count?: number;
}

export interface TripDay {
  trip_day_id: number;
  trip_id: number;
  date: string;
  day_number: number;
  created_at: string;
  updated_at: string;
}

export interface TripPlace {
  trip_place_id: number;
  trip_day_id: number;
  place_id: number;
  notes?: string;
  added_at: string;
  place_name: string;
  place_description: string;
  category_id: number;
  category_name: string;
  google_maps_link: string;
  ratings: number;
  reviews_count: number;
  images_url: string[];
  entry_free: boolean;
  operating_hours?: any;
  province_id: number;
  province_categoryName: string;
  latitude: number;
  longitude: number;
}

export interface TripWithDays extends Trip {
  days: TripDay[];
}

export interface TripDayWithPlaces extends TripDay {
  trip_name: string;
  places: TripPlace[];
  total_places: number;
}

// API Request Types
export interface CreateTripData {
  trip_name: string;
  start_date: string;
  end_date: string;
}

export interface AddPlacesToTripDayData {
  place_ids: number[];
  notes?: string[];
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Get all user trips
export async function getAllTrips(): Promise<Trip[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trips`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch trips');
  }
  
  const result: ApiResponse<Trip[]> = await response.json();
  return result.data;
}

// Get trip by ID with days
export async function getTripById(id: string | number): Promise<{ trip: any; days: any }> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch trip');
  }

  const result = await response.json();

  // Support both { trip, days } and flat trip object with days
  if (result.data && result.data.trip && result.data.days) {
    return result.data;
  } else if (result.data && result.data.days && !result.data.trip) {
    // Flat structure, wrap as { trip, days }
    const { days, ...trip } = result.data;
    return { trip, days };
  } else {
    throw new Error('Invalid trip data received');
  }
}

// Create trip
export async function createTrip(data: CreateTripData): Promise<{ trip: Trip; days: TripDay[]; total_days: number }> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.errors) {
      const errorMessages = Object.entries(error.errors)
        .map(([field, messages]) => (messages as string[]).join(', '))
        .join('. ');
      throw new Error(errorMessages || error.message || 'Failed to create trip');
    }
    throw new Error(error.message || 'Failed to create trip');
  }
  
  const result: ApiResponse<{ trip: Trip; days: TripDay[]; total_days: number }> = await response.json();
  return result.data;
}

// Add places to trip day (accepts multiple places)
export async function addPlacesToTripDay(
  tripDayId: number,
  data: AddPlacesToTripDayData
): Promise<{ trip_day_id: number; places: TripPlace[]; total_places_added: number }> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trip-days/${tripDayId}/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.errors) {
      const errorMessages = Object.entries(error.errors)
        .map(([field, messages]) => (messages as string[]).join(', '))
        .join('. ');
      throw new Error(errorMessages || error.message || 'Failed to add places to trip day');
    }
    throw new Error(error.message || 'Failed to add places to trip day');
  }
  
  const result: ApiResponse<{ trip_day_id: number; places: TripPlace[]; total_places_added: number }> = await response.json();
  return result.data;
}

// Get places for trip day
export async function getPlacesForTripDay(tripDayId: number): Promise<TripDayWithPlaces> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trip-days/${tripDayId}/places`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch places for trip day');
  }
  
  const result: ApiResponse<{ trip_day: TripDay & { trip_name: string }; places: TripPlace[]; total_places: number }> = await response.json();
  return {
    ...result.data.trip_day,
    places: result.data.places,
    total_places: result.data.total_places,
  };
}

// Get all places for trip planning with pagination and filters
export interface GetPlacesForPlanningParams {
  page?: number;
  per_page?: number;
  category_id?: number;
  province_id?: number;
  search?: string;
  min_rating?: number;
  entry_free?: boolean;
}

export interface PlaceForPlanning {
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
  operating_hours?: any;
  best_season_to_visit?: string;
  province_id: number;
  province_categoryName: string;
  latitude: number;
  longitude: number;
}

export interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export async function getPlacesForTripPlanning(
  params?: GetPlacesForPlanningParams
): Promise<{ data: PlaceForPlanning[]; pagination: PaginationInfo }> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
  if (params?.province_id) queryParams.append('province_id', params.province_id.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.min_rating) queryParams.append('min_rating', params.min_rating.toString());
  if (params?.entry_free !== undefined) queryParams.append('entry_free', params.entry_free ? '1' : '0');

  const url = `${API_BASE_URL}/api/trip-planning/places${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch places for trip planning');
  }
  
  const result: ApiResponse<PlaceForPlanning[]> & { pagination: PaginationInfo } = await response.json();
  return {
    data: result.data,
    pagination: result.pagination,
  };
}

// Get place details
export async function getPlaceDetails(placeId: number): Promise<PlaceForPlanning> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trip-planning/places/${placeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch place details');
  }
  
  const result: ApiResponse<PlaceForPlanning> = await response.json();
  return result.data;
}

// Get popular places
export async function getPopularPlaces(limit: number = 10): Promise<PlaceForPlanning[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/api/trip-planning/places/popular/list?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch popular places');
  }
  
  const result: ApiResponse<PlaceForPlanning[]> = await response.json();
  return result.data;
}