import { Wifi, Coffee, Wind, Tv, Car, UtensilsCrossed, Dumbbell, Waves } from "lucide-react";

interface HotelAmenitiesProps {
  amenities: string[];
}

const amenityIcons: Record<string, any> = {
  "Free WiFi": Wifi,
  "WiFi": Wifi,
  "Swimming Pool": Waves,
  "Pool": Waves,
  "Restaurant": UtensilsCrossed,
  "Bar": Coffee,
  "Fitness Center": Dumbbell,
  "Gym": Dumbbell,
  "Spa": Coffee,
  "Room Service": UtensilsCrossed,
  "Air Conditioning": Wind,
  "Parking": Car,
  "TV": Tv,
};

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  const getIcon = (amenity: string) => {
    const Icon = amenityIcons[amenity] || Coffee;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((amenity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-blue-900">
              {getIcon(amenity)}
            </div>
            <span className="text-gray-700 font-medium text-sm">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
