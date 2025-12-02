import { Star, MapPin } from "lucide-react";

interface HotelHeaderProps {
  name: string;
  rating: number;
  reviews: number;
  location: string;
}

export default function HotelHeader({
  name,
  rating,
  reviews,
  location,
}: HotelHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 lg:-mt-16 relative z-10">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-7 lg:p-9 mb-6 sm:mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 w-fit">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg text-gray-900">{rating}</span>
                <span className="text-gray-600">({reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-full border border-gray-200 w-fit">
                <MapPin className="w-5 h-5 text-blue-900" />
                <span className="font-semibold text-gray-800">{location}</span>
              </div>
            </div>
          </div>
          
          {/* Price Display */}
          <div className="text-right">
            <div className="flex items-baseline gap-2 justify-end">
              {/* <span className="text-3xl sm:text-4xl font-bold text-blue-900">${pricePerNight}</span> */}
              {/* <span className="text-gray-600 text-sm">per night</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
