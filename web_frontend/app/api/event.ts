export interface Event {
  id: number;
  title: string;
  description: string;
  image_url: string;
  place_id: number;
  province_id: number;
  start_at: string;
  end_at: string;
  location?: string;
  placeName?: string;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Helper function to transform API event data
function transformEventData(apiEvent: any): Event {
  console.log('Raw API Event Data:', apiEvent);
  
  return {
    id: apiEvent.id || apiEvent.event_id || 0,
    title: apiEvent.title || apiEvent.name || '',
    description: apiEvent.description || '',
    image_url: apiEvent.image_url || apiEvent.image || '',
    place_id: apiEvent.place_id || 0,
    province_id: apiEvent.province_id || 0,
    start_at: apiEvent.start_at || apiEvent.startDate || '',
    end_at: apiEvent.end_at || apiEvent.endDate || '',
    location: apiEvent.location || '',
    placeName: apiEvent.place_name || apiEvent.placeName || '',
  };
}

// Get all events
export async function getAllEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    
    if (!response.ok) {
      console.error('Events API error:', response.status, response.statusText);
      throw new Error('Failed to fetch events');
    }
    
    const result = await response.json();
    console.log('Fetched all events:', result);
    
    // Handle wrapped response
    const data = result.data || result;
    
    if (Array.isArray(data)) {
      return data.map(transformEventData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    return [];
  }
}

// Get upcoming events
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/upcoming`);
    
    if (!response.ok) {
      console.error('Upcoming events API error:', response.status, response.statusText);
      throw new Error('Failed to fetch upcoming events');
    }
    
    const result = await response.json();
    
    // Handle wrapped response
    const data = result.data || result;
    
    if (Array.isArray(data)) {
      return data.map(transformEventData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    return [];
  }
}

// Get event by ID
export async function getEventById(id: string | number): Promise<Event> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
    
    if (!response.ok) {
      console.error('Event detail API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch event details (${response.status})`);
    }
    
    const result = await response.json();
    
    // Handle wrapped response - extract data property
    const eventData = result.data || result;
    
    return transformEventData(eventData);
  } catch (error) {
    console.error('Error in getEventById:', error);
    throw error;
  }
}

// Get events by place ID
export async function getEventsByPlaceId(placeId: number): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/by-place/${placeId}`);
    
    if (!response.ok) {
      console.error('Events by place API error:', response.status);
      return [];
    }
    
    const result = await response.json();

    
    // Handle wrapped response
    const data = result.data || result;
    
    if (Array.isArray(data)) {
      return data.map(transformEventData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getEventsByPlaceId:', error);
    return [];
  }
}

// Get events by province ID
export async function getEventsByProvinceId(provinceId: number): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/by-province/${provinceId}`);
    
    if (!response.ok) {
      console.error('Events by province API error:', response.status);
      return [];
    }
    
    const result = await response.json();
    console.log(`Fetched events for province ${provinceId}:`, result);
    
    // Handle wrapped response
    const data = result.data || result;
    
    if (Array.isArray(data)) {
      return data.map(transformEventData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in getEventsByProvinceId:', error);
    return [];
  }
}

// Search events
export async function searchEvents(query: string): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error('Events search API error:', response.status);
      return [];
    }
    
    const result = await response.json();
    console.log('Search results:', result);
    
    // Handle wrapped response
    const data = result.data || result;
    
    if (Array.isArray(data)) {
      return data.map(transformEventData);
    }
    
    return [];
  } catch (error) {
    console.error('Error in searchEvents:', error);
    return [];
  }
}