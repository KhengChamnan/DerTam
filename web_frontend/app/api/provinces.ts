import type { Place } from "./place";

export interface Province {
  id: number;
  name: string;
  description: string;
  image: string;
  popularPlaces: number;
  averageRating: number;
  categories: ProvinceCategory[];
}

export interface ProvinceCategory {
  id: number;
  name: string;
  count: number;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Get all provinces
export async function getAllProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/province-categories`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Failed to fetch provinces');
  }
}

// Get province by ID
export async function getProvinceById(id: string): Promise<Province> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/province-categories/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching province:', error);
    throw new Error('Failed to fetch province');
  }
}

// Get places by province
export async function getPlacesByProvince(provinceId: string): Promise<Place[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places/by-province?provinceId=${provinceId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching places by province:', error);
    throw new Error('Failed to fetch places');
  }
}