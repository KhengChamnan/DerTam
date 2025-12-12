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

export interface UpcomingJourney {
  price: number;
  id: number;
  terminal: string;
  from: string;
  to: string;
  departureTime: string;
  date: string;
  busNumber?: string;
  company?: string;
  type?: 'mini-van' | 'sleeping-bus' | 'regular';
}

export interface Province {
  id: number;
  name: string;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// ✅ Add this helper function to convert API bus types to expected format
function mapBusType(apiType: string | undefined): 'mini-van' | 'sleeping-bus' | 'regular' {
  if (!apiType) return 'regular';
  
  const type = apiType.toLowerCase().trim();
  
  console.log('Mapping bus type:', apiType, '→', type);
  
  // Handle actual API values
  if (type.includes('van') || type.includes('15')) return 'mini-van';
  if (type.includes('sleeping')) return 'sleeping-bus';
  if (type.includes('regular') || type.includes('45')) return 'regular';
  
  return 'regular';
}

// Get provinces
export async function getProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bus/provinces`);
    if (!response.ok) throw new Error('Failed to fetch provinces');
    const result = await response.json();
    
    console.log('Provinces response:', result);
    
    // Handle Laravel API response structure: { success: true, data: { provinces: [...], total: N } }
    let data = [];
    if (Array.isArray(result)) {
      data = result;
    } else if (result?.data?.provinces) {
      data = result.data.provinces;
    } else if (result?.data && Array.isArray(result.data)) {
      data = result.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
}

// Search buses - Updated for actual API structure
export async function searchBuses(params: { from: string; to: string; date: string }): Promise<Bus[]> {
  const dateFilter = getDateFilter(params.date);
  const url = new URL(`${API_BASE_URL}/api/bus/search`);
  url.searchParams.append('from_location', params.from);
  url.searchParams.append('to_location', params.to);
  url.searchParams.append('date_filter', dateFilter.type);
  if (dateFilter.specificDate) {
    url.searchParams.append('specific_date', dateFilter.specificDate);
  }

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to search buses');
  const result = await response.json();
  
  console.log('Search buses API response:', result);
  
  // Extract schedules array from response
  const data = result?.data?.schedules || [];
  
  console.log('Extracted schedules:', data.length);
  
  return data.map((item: any) => {
    console.log('Processing bus:', item.id, 'Type:', item.bus_type);
    
    return {
      id: item.id,
      company: item.transportation_company || 'Unknown Company',
      busNumber: item.bus_name || 'N/A',
      type: mapBusType(item.bus_type), // ✅ Use top-level bus_type
      from: item.from_location || params.from,
      to: item.to_location || params.to,
      departureTime: item.departure_time,
      arrivalTime: item.arrival_time,
      duration: `${item.duration_hours || 0}h`,
      price: parseFloat(item.price),
      availableSeats: item.available_seats || 0,
      totalSeats: item.bus_type?.includes('Van') ? 15 : item.bus_type?.includes('Sleeping') ? 34 : 45,
      amenities: [],
      rating: 4.0,
    };
  });
}

export async function getUpcomingJourneys(limit: number = 10): Promise<UpcomingJourney[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/bus/upcoming-journeys`);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch upcoming journeys');
    const result = await response.json();

    console.log('Upcoming journeys API response:', result);

    // Extract data based on actual API structure
    const data = result?.data?.schedules || result?.data?.journeys || [];

    return data.map((item: any) => {
      console.log('Processing journey:', item.id, 'Type:', item.bus_type);
      
      return {
        id: item.id,
        terminal: item.terminal || item.transportation_company || 'Bus Terminal',
        from: item.from_location || 'Unknown',
        to: item.to_location || 'Unknown',
        departureTime: item.departure_time || '00:00',
        date: item.departure_date || item.schedule_date || new Date().toISOString(),
        busNumber: item.bus_name,
        company: item.transportation_company,
        type: mapBusType(item.bus_type), // ✅ Use top-level bus_type
        price: parseFloat(item.price || '100'),
      };
    });
  } catch (error) {
    console.error('Error fetching upcoming journeys:', error);
    return [];
  }
}

// Get bus details with seat layout
export async function getBusById(id: string): Promise<Bus> {
  const response = await fetch(`${API_BASE_URL}/api/bus/schedule/${id}`);
  if (!response.ok) throw new Error('Failed to fetch bus');
  const result = await response.json();
  
  console.log('getBusById API response:', result);
  
  const data = result.data?.schedule || result.data || result;

  return {
    id: data.id,
    company: data.transportation_company || 'Unknown Company',
    busNumber: data.bus_name || 'N/A',
    type: mapBusType(data.bus_type),
    from: data.from_location || '',
    to: data.to_location || '',
    departureTime: data.departure_time || '00:00',
    arrivalTime: data.arrival_time || '00:00',
    duration: `${data.duration_hours || 0}h`,
    price: parseFloat(data.price || '0'),
    availableSeats: data.available_seats || 0,
    totalSeats: data.bus_type?.includes('Van') ? 15 : data.bus_type?.includes('Sleeping') ? 34 : 45,
    amenities: [],
    rating: 4.0,
  };
}

// Book bus seats
export async function bookBusSeats(data: BookingData): Promise<{ bookingId: string; qrCode: string }> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/booking/bus/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      schedule_id: data.busId,
      seat_ids: data.seats.map(id => parseInt(id)),
    }),
  });
  if (!response.ok) throw new Error('Failed to book seats');
  return response.json();
}

// Helper functions
function getDateFilter(date: string): { type: 'today' | 'tomorrow' | 'other'; specificDate?: string } {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (date === today) return { type: 'today' };
  if (date === tomorrow) return { type: 'tomorrow' };
  return { type: 'other', specificDate: date };
}

function calculateDuration(departure: string, arrival: string): string {
  if (!departure || !arrival) return '0h 0m';
  
  const depParts = departure.split(':');
  const arrParts = arrival.split(':');
  
  if (depParts.length < 2 || arrParts.length < 2) return '0h 0m';
  
  const depHour = parseInt(depParts[0]);
  const depMin = parseInt(depParts[1]);
  const arrHour = parseInt(arrParts[0]);
  const arrMin = parseInt(arrParts[1]);
  
  if (isNaN(depHour) || isNaN(depMin) || isNaN(arrHour) || isNaN(arrMin)) {
    return '0h 0m';
  }
  
  let hours = arrHour - depHour;
  let minutes = arrMin - depMin;
  
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  
  if (hours < 0) hours += 24;
  
  return `${hours}h ${minutes}m`;
}

// Helper to parse seat_no and convert to sequential seat number
function parseSeatNumber(seatNo: string, busType: string): number {
  const column = seatNo.charAt(0);
  const row = parseInt(seatNo.substring(1));
  
  if (busType.includes('Van')) {
    // Mini Van (15 seats)
    // Row 1: C1, D1 (seats 1, 2)
    // Row 2: A2, B2, C2 (seats 3, 4, 5)
    // Row 3: A3, B3, D3 (seats 6, 7, 8)
    // Row 4: A4, B4, D4 (seats 9, 10, 11)
    // Row 5: A5, B5, C5, D5 (seats 12, 13, 14, 15)
    
    if (row === 1) {
      return column === 'C' ? 1 : 2; // C1=1, D1=2
    } else if (row === 2) {
      const cols = ['A', 'B', 'C'];
      return 3 + cols.indexOf(column); // A2=3, B2=4, C2=5
    } else if (row === 3) {
      const cols = ['A', 'B', 'D'];
      return 6 + cols.indexOf(column); // A3=6, B3=7, D3=8
    } else if (row === 4) {
      const cols = ['A', 'B', 'D'];
      return 9 + cols.indexOf(column); // A4=9, B4=10, D4=11
    } else if (row === 5) {
      const cols = ['A', 'B', 'C', 'D'];
      return 12 + cols.indexOf(column); // A5=12, B5=13, C5=14, D5=15
    }
  } else if (busType.includes('Regular')) {
    // Regular Bus (45 seats)
    // Rows 1-10: A B [aisle - no C] D E (4 seats per row)
    // Row 11: A B C D E (5 seats)
    
    if (row <= 10) {
      // Rows 1-10: 4 seats per row (A, B, D, E)
      // A=0, B=1, D=2, E=3
      const colMap: {[key: string]: number} = { 'A': 0, 'B': 1, 'D': 2, 'E': 3 };
      const colIndex = colMap[column];
      return (row - 1) * 4 + colIndex + 1; // seat number: 1-40
    } else if (row === 11) {
      // Row 11: 5 seats (A, B, C, D, E)
      const cols = ['A', 'B', 'C', 'D', 'E'];
      return 40 + cols.indexOf(column) + 1; // seats 41-45
    }
  } else if (busType.includes('Sleeping')) {
    // Sleeping Bus logic (if needed)
    // Lower deck: rows 1-5, 3 seats per row (A, B, C) = 15 seats
    // Upper deck: rows 1-4: 3 per row, row 5: 4 seats = 19 seats
  }
  
  return 1; // fallback
}

// Get bus seat layout - Updated with correct parsing
export async function getBusSeats(busId: string, date: string): Promise<Seat[]> {
  try {
    console.log('Fetching seats for busId:', busId);
    
    const response = await fetch(`${API_BASE_URL}/api/bus/schedule/${busId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Schedule API error:', response.status, errorText);
      throw new Error(`Failed to fetch schedule: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Schedule API response:', result);

    const seatLayout = result?.data?.seat_layout;
    const schedule = result?.data?.schedule;
    const busType = schedule?.bus_type || '';
    
    if (!seatLayout) {
      console.warn('No seat_layout found in API response');
      return [];
    }

    const allSeats: Seat[] = [];

    // Process lower deck seats
    if (seatLayout.lower_deck?.seats) {
      seatLayout.lower_deck.seats.forEach((seat: any) => {
        allSeats.push({
          id: seat.id.toString(),
          number: parseSeatNumber(seat.seat_no, busType),
          status: seat.status === 'booked' ? 'booked' : 'available',
          deck: 'lower',
          price: parseFloat(schedule?.price || '0'),
        });
      });
    }

    // Process upper deck seats
    if (seatLayout.upper_deck?.seats && seatLayout.upper_deck.seats.length > 0) {
      seatLayout.upper_deck.seats.forEach((seat: any) => {
        allSeats.push({
          id: seat.id.toString(),
          number: parseSeatNumber(seat.seat_no, busType),
          status: seat.status === 'booked' ? 'booked' : 'available',
          deck: 'upper',
          price: parseFloat(schedule?.price || '0'),
        });
      });
    }

    console.log('Transformed seats:', allSeats.length, allSeats);
    return allSeats;
  } catch (error) {
    console.error('Error in getBusSeats:', error);
    throw error;
  }
}