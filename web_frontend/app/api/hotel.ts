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
      console.error('Hotel detail API error:', response.status, errorText);
      throw new Error('Failed to fetch hotel property');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
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