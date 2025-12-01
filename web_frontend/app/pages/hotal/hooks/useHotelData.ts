import { useState, useEffect } from "react";

export interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  description: string;
  images: string[];
  amenities: string[];
  rooms: Room[];
  reviewsList: Review[];
}

interface Room {
  id: number;
  type: string;
  price: number;
  capacity: number;
  beds: string;
  size: string;
  image: string;
  amenities: string[];
}

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

const mockHotels: Record<number, Hotel> = {
  1: {
    id: 1,
    name: "Raffles Hotel Le Royal",
    location: "Phnom Penh, Cambodia",
    rating: 4.8,
    reviews: 1234,
    pricePerNight: 250,
    description:
      "Experience luxury and elegance at Raffles Hotel Le Royal, a landmark of Phnom Penh since 1929. This iconic hotel combines colonial charm with modern amenities, offering guests an unforgettable stay in the heart of Cambodia's capital. Featuring beautifully appointed rooms, world-class dining, and impeccable service.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    ],
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Restaurant",
      "Bar",
      "Fitness Center",
      "Spa",
      "Room Service",
      "Air Conditioning",
      "Parking",
      "Concierge",
    ],
    rooms: [
      {
        id: 1,
        type: "Deluxe Room",
        price: 250,
        capacity: 2,
        beds: "1 King Bed",
        size: "35 m²",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400",
        amenities: ["WiFi", "TV", "Mini Bar", "City View"],
      },
      {
        id: 2,
        type: "Executive Suite",
        price: 450,
        capacity: 4,
        beds: "1 King Bed + Sofa Bed",
        size: "65 m²",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
        amenities: ["WiFi", "TV", "Mini Bar", "Balcony", "Living Room"],
      },
      {
        id: 3,
        type: "Presidential Suite",
        price: 800,
        capacity: 6,
        beds: "2 King Beds",
        size: "120 m²",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        amenities: ["WiFi", "TV", "Kitchen", "Balcony", "Jacuzzi", "Butler Service"],
      },
    ],
    reviewsList: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        date: "November 2024",
        comment: "Absolutely stunning hotel! The staff was incredibly helpful and the rooms were immaculate. The pool area is gorgeous.",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        id: 2,
        name: "Michael Chen",
        rating: 4,
        date: "October 2024",
        comment: "Great location and beautiful property. The breakfast was excellent. Only minor issue was the WiFi speed in some areas.",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      {
        id: 3,
        name: "Emma Wilson",
        rating: 5,
        date: "October 2024",
        comment: "A truly luxurious experience. Every detail was perfect from check-in to check-out. Will definitely return!",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
    ],
  },
  2: {
    id: 2,
    name: "Sokha Phnom Penh Hotel",
    location: "Phnom Penh, Cambodia",
    rating: 4.6,
    reviews: 856,
    pricePerNight: 180,
    description:
      "Sokha Phnom Penh Hotel & Residence offers contemporary luxury in the heart of the city. With modern amenities, spacious rooms, and exceptional service, it's perfect for both business and leisure travelers.",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800",
    ],
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Restaurant",
      "Gym",
      "Spa",
      "Business Center",
      "Room Service",
      "Parking",
    ],
    rooms: [
      {
        id: 1,
        type: "Superior Room",
        price: 180,
        capacity: 2,
        beds: "1 Queen Bed",
        size: "30 m²",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
        amenities: ["WiFi", "TV", "Mini Bar"],
      },
      {
        id: 2,
        type: "Family Suite",
        price: 320,
        capacity: 4,
        beds: "2 Queen Beds",
        size: "55 m²",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400",
        amenities: ["WiFi", "TV", "Kitchenette", "Balcony"],
      },
    ],
    reviewsList: [
      {
        id: 1,
        name: "David Park",
        rating: 5,
        date: "November 2024",
        comment: "Excellent hotel with modern facilities. The staff went above and beyond to make our stay comfortable.",
        avatar: "https://i.pravatar.cc/150?img=4",
      },
      {
        id: 2,
        name: "Lisa Anderson",
        rating: 4,
        date: "October 2024",
        comment: "Very clean and comfortable. Great location near shopping areas. Would recommend!",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
    ],
  },
};

export function useHotelData(hotelId: string | undefined) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchHotel = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const id = hotelId ? parseInt(hotelId) : 1;
      setHotel(mockHotels[id] || null);
      setLoading(false);
    };

    fetchHotel();
  }, [hotelId]);

  return { hotel, loading };
}
