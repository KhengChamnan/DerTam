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

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

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