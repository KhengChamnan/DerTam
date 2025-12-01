import { useState, useEffect } from "react";

export interface Restaurant {
  id: number;
  name: string;
  location: string;
  rating: number;
  phone: string;
  description: string;
  images: string[];
  menu: {
    [category: string]: MenuItem[];
  };
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

const mockRestaurants: Record<number, Restaurant> = {
  1: {
    id: 1,
    name: "Malis Cambodian Cuisine",
    location: "Phnom Penh, Cambodia",
    rating: 4.8,
    phone: "+855 23 221 022",
    description:
      "Malis Cambodian Cuisine draws inspiration from the ancient Angkor period, offering a unique flavor profile created through a masterful blend of spices. Each dish reflects Cambodia's rich botanical heritage.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ],
    menu: {
      Food: [
        {
          id: 1,
          name: "Nom Banh Chok",
          price: 5,
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        },
        {
          id: 2,
          name: "Amok Trey",
          price: 7,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        },
        {
          id: 3,
          name: "Bai Sach Chrouk",
          price: 6,
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        },
        {
          id: 4,
          name: "Lok Lak",
          price: 8,
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
        },
        {
          id: 5,
          name: "Kuy Teav",
          price: 5,
          image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=400",
        },
        {
          id: 6,
          name: "Samlor Korko",
          price: 6,
          image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
        },
      ],
      Drink: [
        {
          id: 7,
          name: "Iced Coffee",
          price: 2,
          image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",
        },
        {
          id: 8,
          name: "Tamarind Juice",
          price: 3,
          image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400",
        },
        {
          id: 9,
          name: "Sugarcane Juice",
          price: 2,
          image: "https://images.unsplash.com/photo-1542444459-db8b2f9b6a3a?w=400",
        },
        {
          id: 10,
          name: "Fresh Coconut",
          price: 3,
          image: "https://images.unsplash.com/photo-1585828447939-348d2acfbd31?w=400",
        },
      ],
      Snack: [
        {
          id: 11,
          name: "Fried Spring Rolls",
          price: 4,
          image: "https://images.unsplash.com/photo-1604908177522-2b0b6f6d6b3b?w=400",
        },
        {
          id: 12,
          name: "Grilled Corn",
          price: 1,
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        },
        {
          id: 13,
          name: "Coconut Pancake",
          price: 3,
          image: "https://images.unsplash.com/photo-1543486958-d783bfbf1b6d?w=400",
        },
        {
          id: 14,
          name: "Fried Banana",
          price: 2,
          image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
        },
      ],
      Others: [
        {
          id: 15,
          name: "Chef Special Platter",
          price: 12,
          image: "https://images.unsplash.com/photo-1478144592103-25e218a04891?w=400",
        },
        {
          id: 16,
          name: "Dessert Box",
          price: 5,
          image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400",
        },
      ],
    },
  },
  2: {
    id: 2,
    name: "Romdeng Restaurant",
    location: "Phnom Penh, Cambodia",
    rating: 4.6,
    phone: "+855 92 219 565",
    description:
      "Romdeng serves traditional Cambodian cuisine in a beautifully restored colonial villa. The restaurant provides vocational training to former street youth.",
    images: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    ],
    menu: {
      Food: [
        {
          id: 1,
          name: "Khmer Red Curry",
          price: 8,
          image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400",
        },
        {
          id: 2,
          name: "Beef Lok Lak",
          price: 9,
          image: "https://images.unsplash.com/photo-1598514982901-ae62764ae96e?w=400",
        },
      ],
      Drink: [
        {
          id: 3,
          name: "Palm Sugar Shake",
          price: 3,
          image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
        },
      ],
      Snack: [
        {
          id: 4,
          name: "Deep Fried Tarantula",
          price: 4,
          image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
        },
      ],
      Others: [],
    },
  },
};

export function useRestaurantData(restaurantId: string | undefined) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const id = restaurantId ? parseInt(restaurantId) : 1;
      setRestaurant(mockRestaurants[id] || null);
      setLoading(false);
    };

    fetchRestaurant();
  }, [restaurantId]);

  return { restaurant, loading };
}
