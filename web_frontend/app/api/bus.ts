export interface Bus {
  id: number;
  company: string;
  busNumber: string;
  type: 'mini-van' | 'sleeping-bus' | 'regular';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  amenities: string[];
  rating: number;
}

export interface Seat {
  id: string;
  number: number;
  status: 'available' | 'booked' | 'selected';
  deck?: 'lower' | 'upper';
  price: number;
}

export interface BusSearchParams {
  from: string;
  to: string;
  date: string;
}

export interface BookingData {
  busId: number;
  seats: string[];
  date: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  totalPrice: number;
}

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Search buses
export async function searchBuses(params: BusSearchParams): Promise<Bus[]> {
  const response = await fetch(`${API_BASE_URL}/buses/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Failed to search buses');
  return response.json();
}

// Get bus details
export async function getBusById(id: string): Promise<Bus> {
  const response = await fetch(`${API_BASE_URL}/buses/${id}`);
  if (!response.ok) throw new Error('Failed to fetch bus');
  return response.json();
}

// Get bus seat layout
export async function getBusSeats(busId: string, date: string): Promise<Seat[]> {
  const response = await fetch(`${API_BASE_URL}/buses/${busId}/seats?date=${date}`);
  if (!response.ok) throw new Error('Failed to fetch seats');
  return response.json();
}

// Book bus seats
export async function bookBusSeats(data: BookingData): Promise<{ bookingId: string; qrCode: string }> {
  const response = await fetch(`${API_BASE_URL}/bookings/bus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to book seats');
  return response.json();
}