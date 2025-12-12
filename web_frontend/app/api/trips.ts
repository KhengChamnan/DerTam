import type { Place } from "./place";

export interface Trip {
  id: number;
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
  createdAt: string;
  updatedAt: string;
}

export interface TripDay {
  id: number;
  tripId: number;
  dayNumber: number;
  date: string;
  places: TripPlace[];
}

export interface TripPlace {
  id: number;
  placeId: number;
  name: string;
  location: string;
  image: string;
  time?: string;
  notes?: string;
  order: number;
}

export interface CreateTripData {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AddPlaceToTripData {
  tripDayId: number;
  placeId: number;
  time?: string;
  notes?: string;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Get all user trips
export async function getAllTrips(): Promise<Trip[]> {
  const response = await fetch(`${API_BASE_URL}/api/trips`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch trips');
  return response.json();
}

// Get trip by ID
export async function getTripById(id: string): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch trip');
  return response.json();
}

// Create trip
export async function createTrip(data: CreateTripData): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/api/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create trip');
  return response.json();
}

// Add place to trip day
export async function addPlaceToTripDay(data: AddPlaceToTripData): Promise<TripPlace> {
  const response = await fetch(`${API_BASE_URL}/api/trip-days/${data.tripDayId}/places`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      placeId: data.placeId,
      time: data.time,
      notes: data.notes,
    }),
  });
  if (!response.ok) throw new Error('Failed to add place to trip day');
  return response.json();
}

// Get places for trip day
export async function getPlacesForTripDay(tripDayId: number): Promise<TripPlace[]> {
  const response = await fetch(`${API_BASE_URL}/api/trip-days/${tripDayId}/places`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch places for trip day');
  return response.json();
}

// Get all places for trip planning
export async function getAllPlacesForTripPlanning(): Promise<Place[]> {
  const response = await fetch(`${API_BASE_URL}/api/trip-planning/places`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch places for trip planning');
  return response.json();
}

// Remove place from trip day
export async function removePlaceFromTripDay(tripDayId: number, placeId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/trip-days/${tripDayId}/places/${placeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to remove place from trip day');
}

// Update trip
export async function updateTrip(id: number, data: Partial<CreateTripData>): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update trip');
  return response.json();
}

// Delete trip
export async function deleteTrip(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete trip');
}