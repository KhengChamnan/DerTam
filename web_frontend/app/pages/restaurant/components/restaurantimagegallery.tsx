import { Navigation } from "lucide-react";

interface RestaurantImageGalleryProps {
  images: string[];
  restaurantName: string;
}

export default function RestaurantImageGallery({ images, restaurantName }: RestaurantImageGalleryProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative h-[250px] sm:h-[300px] lg:h-[350px] rounded-3xl overflow-hidden shadow-lg">
        <img
          src={images[0]}
          alt={restaurantName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Route button */}
        <div className="absolute bottom-6 right-6 bg-white px-5 py-3 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-pointer">
          <div className="p-1.5 bg-blue-900 rounded-full">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Route</span>
        </div>
      </div>
    </div>
  );
}
