interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
  onImageClick: (index: number) => void;
}

export default function HotelImageGallery({ images, hotelName, onImageClick }: HotelImageGalleryProps) {
  // Ensure we have images to display
  if (!images || images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  // If only 1 image, show it full width
  if (images.length === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div 
          className="relative h-96 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onImageClick(0)}
        >
          <img
            src={images[0]}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // If 2-3 images, show in equal columns
  if (images.length <= 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 h-96`}>
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => onImageClick(idx)}
            >
              <img
                src={img}
                alt={`${hotelName} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If 4+ images, show grid layout with "+X more" on last image
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-4 gap-3 h-96">
        {/* First image - larger */}
        <div 
          className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onImageClick(0)}
        >
          <img
            src={images[0]}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded-full">
            <span className="text-white text-sm font-semibold">{images.length} Photos</span>
          </div>
        </div>

        {/* Second image */}
        <div 
          className="col-span-2 relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onImageClick(1)}
        >
          <img
            src={images[1]}
            alt={`${hotelName} 2`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Third image */}
        <div 
          className="relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onImageClick(2)}
        >
          <img
            src={images[2]}
            alt={`${hotelName} 3`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Fourth image with "+X more" overlay if there are more images */}
        <div 
          className="relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onImageClick(3)}
        >
          <img
            src={images[3]}
            alt={`${hotelName} 4`}
            className="w-full h-full object-cover"
          />
          {images.length > 4 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">+{images.length - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
