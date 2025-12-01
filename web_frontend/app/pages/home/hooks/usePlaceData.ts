import { useState, useEffect } from "react";

const mockDestinations = [
  {
    id: 1,
    name: "Angkor Wat",
    location: "Siem Reap, Cambodia",
    rating: 5,
    price: 120,
    image: "https://images.unsplash.com/photo-1598616264509-edd7f9312b3c?w=400",
    category: "Historical",
  },
  {
    id: 2,
    name: "Bou Sra",
    location: "Mondulkiri, Cambodia",
    rating: 5,
    price: 80,
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
    category: "Standard",
  },
  {
    id: 3,
    name: "Monument",
    location: "Phnom Penh, Cambodia",
    rating: 5,
    price: 50,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400",
    category: "Historical",
  },
  {
    id: 4,
    name: "Beach Villa",
    location: "Sihanoukville, Cambodia",
    rating: 4,
    price: 200,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400",
    category: "Villa",
  },
  {
    id: 5,
    name: "Mountain Cottage",
    location: "Mondulkiri, Cambodia",
    rating: 4,
    price: 90,
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400",
    category: "Cottages",
  },
  {
    id: 6,
    name: "City Townhouse",
    location: "Phnom Penh, Cambodia",
    rating: 4,
    price: 70,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    category: "Townhouses",
  },
];

const additionalImages = [
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
  "https://images.unsplash.com/photo-1563492065213-f74a8e32f3de?w=800",
  "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
  "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800",
];

export function usePlaceData(placeId: string | undefined) {
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundPlace = mockDestinations.find(
      (dest) => dest.id === parseInt(placeId || "0")
    );

    if (foundPlace) {
      setPlace({
        ...foundPlace,
        images: [foundPlace.image, ...additionalImages],
        reviews: 1250,
        openingHours: "6:00 AM - 6:00 PM",
        entryFee: `$${foundPlace.price} (per person)`,
        weather: "32C, Sunny",
        description: `${foundPlace.name} is one of Cambodia's most treasured destinations. Located in ${foundPlace.location}, this ${foundPlace.category.toLowerCase()} site offers visitors an unforgettable experience of Cambodian culture and heritage.`,
        highlights: [
          "Stunning architecture and design",
          "Rich cultural heritage",
          "Perfect for photography",
          "Local guided tours available",
        ],
        tips: [
          "Visit early morning for the best experience",
          "Wear comfortable clothing and footwear",
          "Bring water and sun protection",
          "Hire a local guide for deeper insights",
        ],
        nearbyPlaces: mockDestinations
          .filter(
            (dest) =>
              dest.id !== foundPlace.id && dest.location === foundPlace.location
          )
          .slice(0, 3)
          .map((dest) => ({
            id: dest.id,
            name: dest.name,
            distance: `${Math.floor(Math.random() * 5) + 1} km`,
            image: dest.image,
            rating: dest.rating,
          })),
        nearbyHotels: [
          {
            id: 1,
            name: "Luxury Resort & Spa",
            price: "$120",
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
          },
          {
            id: 2,
            name: "Boutique Hotel",
            price: "$95",
            rating: 4.3,
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
          },
        ],
        nearbyRestaurants: [
          {
            id: 1,
            name: "Traditional Khmer Cuisine",
            cuisine: "Khmer",
            price: "$$",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
          },
          {
            id: 2,
            name: "Fine Dining Experience",
            cuisine: "International",
            price: "$$$",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
          },
        ],
      });
    }

    setLoading(false);
  }, [placeId]);

  return { place, loading };
}
