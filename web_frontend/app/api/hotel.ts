export interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  images: string[];
  amenities: Amenity[];
  facilities: Facility[];
  rooms: Room[];
  description: string;
}

export interface Room {
  id: number;
  hotelId: number;
  type: string;
  capacity: number;
  price: number;
  amenities: string[];
  images: string[];
  available: boolean;
  description: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface Facility {
  id: number;
  name: string;
  description: string;
}

export interface RoomSearchParams {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface HotelProperty {
  property_id: number;
  place: {
    operating_hours(operating_hours: any): unknown;
    placeID: number;
    name: string;
    description: string;
    google_maps_link: string;
    ratings: number;
    reviews_count: number;
    images_url: string[];
    province_category: {
      province_categoryID: number;
      province_categoryName: string;
      category_description: string;
    };
  };
  facilities: {
    facility_id: number;
    facility_name: string;
    image_url: string;
  }[];
  room_properties: {
    room_properties_id: number;
    room_type: string;
    price_per_night: number;
    images_url: string[];
    available_rooms_count: number;
    room_description?: string;
    max_guests?: number;
    room_size?: number;
    amenities: {
      amenity_id: number;
      amenity_name: string;
      image_url: string;
    }[];
  }[];
}

export interface HotelPropertyDetail extends HotelProperty {
  owner_user: {
    id: number;
    name: string;
    email: string;
    profile_photo_url: string;
  };
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Get all hotel properties (without filters)
export async function getHotelProperties(): Promise<HotelProperty[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/properties`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch hotel properties');
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching hotel properties:', error);
    throw error;
  }
}

// Get single hotel property by place_id
export async function getHotelPropertyById(placeId: string): Promise<HotelPropertyDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotel-details/${placeId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Try to parse as JSON for better error message
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `Hotel not found (Status: ${response.status})`);
      } catch {
        throw new Error(`Hotel not found: ${response.statusText || 'Unknown error'}`);
      }
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Get hotel details
export async function getHotelById(id: string): Promise<Hotel> {
  const response = await fetch(`${API_BASE_URL}/api/hotel-details/${id}`);
  if (!response.ok) throw new Error('Failed to fetch hotel details');
  return response.json();
}

// Get room details
export async function getRoomById(roomId: string): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`);
  if (!response.ok) throw new Error('Failed to fetch room details');
  return response.json();
}

// Get available rooms for hotel
export async function getAvailableRooms(params: RoomSearchParams): Promise<Room[]> {
  const queryParams = new URLSearchParams({
    hotelId: params.hotelId.toString(),
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests.toString(),
  });
  const response = await fetch(`${API_BASE_URL}/api/rooms/available?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch available rooms');
  return response.json();
}

// Book room
export async function bookRoom(data: {
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}): Promise<{ bookingId: string; qrCode: string }> {
  const response = await fetch(`${API_BASE_URL}/api/bookings/hotel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to book room');
  return response.json();
}

// Search hotels with filters (optional parameters)
export async function searchHotels(params?: {
  province_id?: number;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
}): Promise<HotelProperty[]> {
  try {
    const queryParams = new URLSearchParams();
    
    // Only add params if they have values
    if (params?.province_id) queryParams.append('province_id', params.province_id.toString());
    if (params?.check_in) queryParams.append('check_in', params.check_in);
    if (params?.check_out) queryParams.append('check_out', params.check_out);
    if (params?.guests) queryParams.append('guests', params.guests.toString());
    if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    
    const url = queryParams.toString() 
      ? `${API_BASE_URL}/api/hotels/properties?${queryParams}`
      : `${API_BASE_URL}/api/hotels/properties`;
    
    console.log('Fetching hotels from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Search API Error:', errorData);
      throw new Error(errorData.message || 'Failed to search hotels');
    }
    
    const result = await response.json();
    console.log('Search results:', result);
    return result.data || [];
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}

// Get available rooms for a property
export async function getPropertyRooms(params: {
  property_id: number;
  check_in: string;
  check_out: string;
  guests?: number;
}): Promise<any[]> {
  const queryParams = new URLSearchParams({
    check_in: params.check_in,
    check_out: params.check_out,
  });
  
  if (params.guests) queryParams.append('guests', params.guests.toString());
  
  const response = await fetch(
    `${API_BASE_URL}/api/hotels/properties/${params.property_id}/rooms?${queryParams}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch available rooms');
  }
  
  const result = await response.json();
  return result.data;
}

// ==================== ROOM API FUNCTIONS ====================

export interface RoomProperty {
  room_properties_id: number;
  room_type: string;
  price_per_night: number;
  images_url: string[];
  available_rooms_count: number;
  room_description?: string;
  max_guests?: number;
  room_size?: number;
  amenities: RoomAmenity[];
}

export interface RoomAmenity {
  amenity_id: number;
  amenity_name: string;
  image_url: string;
}

export interface CreateRoomData {
  property_id: number;
  room_type: string;
  price_per_night: number;
  available_rooms_count: number;
  room_description?: string;
  max_guests?: number;
  room_size?: number;
  images: File[];
}

export interface UpdateRoomData {
  room_type?: string;
  price_per_night?: number;
  available_rooms_count?: number;
  room_description?: string;
  max_guests?: number;
  room_size?: number;
  images?: File[];
}

export interface RoomAmenitiesData {
  room_properties_id: number;
  amenities: number[]; // Array of amenity IDs
}

// Create a new room for a property
export async function createRoom(data: CreateRoomData): Promise<RoomProperty> {
  try {
    const formData = new FormData();
    formData.append('property_id', data.property_id.toString());
    formData.append('room_type', data.room_type);
    formData.append('price_per_night', data.price_per_night.toString());
    formData.append('available_rooms_count', data.available_rooms_count.toString());
    
    if (data.room_description) formData.append('room_description', data.room_description);
    if (data.max_guests) formData.append('max_guests', data.max_guests.toString());
    if (data.room_size) formData.append('room_size', data.room_size.toString());
    
    // Append multiple images
    data.images.forEach((image) => {
      formData.append('images[]', image);
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/hotels/room-properties`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create room');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Get room details by room_properties_id
export async function getRoomDetails(roomId: number): Promise<RoomProperty> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/room-properties/${roomId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch room details');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching room details:', error);
    throw error;
  }
}

// Update room details
export async function updateRoom(roomId: number, data: UpdateRoomData): Promise<RoomProperty> {
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    if (data.room_type) formData.append('room_type', data.room_type);
    if (data.price_per_night) formData.append('price_per_night', data.price_per_night.toString());
    if (data.available_rooms_count !== undefined) formData.append('available_rooms_count', data.available_rooms_count.toString());
    if (data.room_description) formData.append('room_description', data.room_description);
    if (data.max_guests) formData.append('max_guests', data.max_guests.toString());
    if (data.room_size) formData.append('room_size', data.room_size.toString());
    
    // Append new images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/hotels/room-properties/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update room');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
}

// Delete a room
export async function deleteRoom(roomId: number): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/hotels/room-properties/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete room');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

// Assign amenities to a room
export async function assignRoomAmenities(data: RoomAmenitiesData): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/hotels/room-amenities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign amenities');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error assigning room amenities:', error);
    throw error;
  }
}

// Get all available amenities
export async function getAvailableAmenities(): Promise<RoomAmenity[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/amenities`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch amenities');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching amenities:', error);
    throw error;
  }
}

// Search hotels with filters
export async function searchHotelsAdvanced(params: {
  province_id?: number;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
}): Promise<HotelProperty[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.province_id) queryParams.append('province_id', params.province_id.toString());
    if (params.check_in) queryParams.append('check_in', params.check_in);
    if (params.check_out) queryParams.append('check_out', params.check_out);
    if (params.guests) queryParams.append('guests', params.guests.toString());
    if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    
    const url = `${API_BASE_URL}/api/hotels/search?${queryParams}`;
    console.log('Searching hotels:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search hotels');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}