export interface Restaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  cuisine: string[];
  priceRange: string;
  images: string[];
  openingHours: string;
  menu: MenuCategory[];
  amenities: string[];
}

export interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isSpicy: boolean;
  isVegetarian: boolean;
}

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get all restaurants
export async function getAllRestaurants(params?: {
  cuisine?: string;
  location?: string;
  priceRange?: string;
  limit?: number;
  offset?: number;
}): Promise<Restaurant[]> {
  const queryParams = new URLSearchParams();
  if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
  if (params?.location) queryParams.append('location', params.location);
  if (params?.priceRange) queryParams.append('priceRange', params.priceRange);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE_URL}/restaurants?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch restaurants');
  return response.json();
}

// Get restaurant by ID
export async function getRestaurantById(id: string): Promise<Restaurant> {
  const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
  if (!response.ok) throw new Error('Failed to fetch restaurant');
  return response.json();
}

// Get restaurant menu
export async function getRestaurantMenu(id: string): Promise<MenuCategory[]> {
  const response = await fetch(`${API_BASE_URL}/restaurants/${id}/menu`);
  if (!response.ok) throw new Error('Failed to fetch menu');
  return response.json();
}