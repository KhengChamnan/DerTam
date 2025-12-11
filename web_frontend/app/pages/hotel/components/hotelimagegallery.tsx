import { MapPin } from "lucide-react";

interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
  onImageClick: (index: number) => void;
}

export default function HotelImageGallery({ images, hotelName, onImageClick }: HotelImageGalleryProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Desktop & Tablet View */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 h-[300px] sm:h-[350px] lg:h-[450px]">
        {/* Main large image */}
        <div 
          className="col-span-2 relative rounded-l-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
          onClick={() => onImageClick(0)}
        >
          <img
            src={images[0]}
            alt={hotelName}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Photo count */}
          <div className="absolute top-6 left-6 sm:left-8 bg-black/70 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500">
            <span className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>{images.length} Photos</span>
            </span>
          </div>
        </div>

        {/* Right side grid */}
        <div className="grid grid-rows-2 gap-3">
          <div 
            className="relative rounded-tr-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
            onClick={() => onImageClick(1)}
          >
            <img
              src={images[1]}
              alt={`${hotelName} view 2`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div 
              className="relative rounded-bl-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
              onClick={() => onImageClick(2)}
            >
              <img
                src={images[2]}
                alt={`${hotelName} view 3`}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
            </div>
            
            <div 
              className="relative rounded-br-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
              onClick={() => onImageClick(3)}
            >
              <img
                src={images[3] || images[0]}
                alt={`${hotelName} view 4`}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              {images.length > 4 && (
                <div className="absolute inset-0 bg-blue-900/85 flex items-center justify-center transition-all duration-500 group-hover:bg-blue-900/90">
                  <div className="transform transition-all duration-500 group-hover:scale-110 text-center">
                    <div className="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-xl mb-2">
                      <span className="text-xl sm:text-2xl font-black text-blue-900">
                        +{images.length - 4}
                      </span>
                    </div>
                    <p className="text-white font-bold text-xs sm:text-sm">View All</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        <div 
          className="relative h-72 rounded-3xl overflow-hidden shadow-lg"
          onClick={() => onImageClick(0)}
        >
          <img
            src={images[0]}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded-full">
            <span className="font-semibold text-white text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {images.length} Photos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {images.slice(1, 4).map((img: string, idx: number) => (
            <div
              key={idx}
              className="relative h-28 rounded-xl overflow-hidden shadow-md cursor-pointer"
              onClick={() => onImageClick(idx + 1)}
            >
              <img src={img} alt={`${hotelName} ${idx + 2}`} className="w-full h-full object-cover" />
              {idx === 2 && images.length > 4 && (
                <div className="absolute inset-0 bg-blue-900/85 flex items-center justify-center">
                  <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
                    <span className="text-base font-black text-blue-900">+{images.length - 4}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
