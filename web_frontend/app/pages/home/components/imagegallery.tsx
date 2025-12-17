// import { MapPin } from "lucide-react";

// interface ImageGalleryProps {
//   images: string[];
//   placeName: string;
//   onImageClick: (index: number) => void;
// }

// export default function ImageGallery({ images, placeName, onImageClick }: ImageGalleryProps) {
//   // Ensure we have at least 1 image
//   if (!images || images.length === 0) {
//     return null;
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
//       {/* Desktop & Tablet View */}
//       <div className="hidden md:grid md:grid-cols-3 gap-3 h-[300px] sm:h-[350px] lg:h-[450px]">
//         {/* Main large image */}
//         <div 
//           className={`${images.length === 1 ? 'col-span-3' : 'col-span-2'} relative rounded-l-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500`}
//           onClick={() => onImageClick(0)}
//         >
//           <img
//             src={images[0]}
//             alt={placeName}
//             className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
//           {/* Route button */}
//           <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 bg-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-full flex items-center gap-3 shadow-xl transform transition-all duration-300 hover:scale-105">
//             <div className="p-2 rounded-full" style={{ backgroundColor: '#01005B' }}>
//               <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//             </div>
//             <span className="font-bold text-gray-900 text-sm sm:text-base">View Route</span>
//           </div>

//           {/* Photo count */}
//           <div className="absolute top-6 left-6 sm:left-8 bg-black/70 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500">
//             <span className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
//               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//               </svg>
//               <span>{images.length} {images.length === 1 ? 'Photo' : 'Photos'}</span>
//             </span>
//           </div>
//         </div>

//         {/* Right side grid - Only show if more than 1 image */}
//         {images.length > 1 && (
//           <div className="grid grid-rows-2 gap-3">
//             {images[1] && (
//               <div 
//                 className="relative rounded-tr-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
//                 onClick={() => onImageClick(1)}
//               >
//             <img
//               src={images[1]}
//               alt={`${placeName} view 2`}
//               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
//               />
//               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
//             </div>
//           )}

//             <div className="grid grid-cols-2 gap-3">
//               {images[2] && (
//                 <div 
//                   className="relative rounded-bl-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
//                   onClick={() => onImageClick(2)}
//                 >
//               <img
//                 src={images[2]}
//                 alt={`${placeName} view 3`}
//                 className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
//                 </div>
//               )}
            
//               {images[3] && (
//                 <div 
//                   className="relative rounded-br-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500"
//                   onClick={() => onImageClick(3)}
//                 >
//               <img
//                 src={images[3]}
//                 alt={`${placeName} view 4`}
//                 className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
//               />
//               {images.length > 4 && (
//                 <div className="absolute inset-0 flex items-center justify-center transition-all duration-500" style={{ backgroundColor: 'rgba(1, 0, 91, 0.85)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(1, 0, 91, 0.90)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(1, 0, 91, 0.85)'}>
//                   <div className="transform transition-all duration-500 group-hover:scale-110 text-center">
//                     <div className="bg-white rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-xl mb-2">
//                       <span className="text-xl sm:text-2xl font-black" style={{ color: '#01005B' }}>
//                         +{images.length - 4}
//                       </span>
//                     </div>
//                     <p className="text-white font-bold text-xs sm:text-sm">View All</p>
//                   </div>
//                 </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile View */}
//       <div className="md:hidden space-y-3">
//         <div 
//           className="relative h-72 rounded-3xl overflow-hidden shadow-lg"
//           onClick={() => onImageClick(0)}
//         >
//           <img
//             src={images[0]}
//             alt={placeName}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
//           <div className="absolute bottom-4 left-4 bg-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl">
//             <div className="p-1.5 rounded-full" style={{ backgroundColor: '#01005B' }}>
//               <MapPin className="w-4 h-4 text-white" />
//             </div>
//             <span className="font-bold text-gray-900 text-sm">Route</span>
//           </div>

//           <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded-full">
//             <span className="font-semibold text-white text-xs flex items-center gap-1.5">
//               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//               </svg>
//               {images.length} Photos
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-3 gap-2">
//           {images.slice(1, 4).map((img: string, idx: number) => (
//             <div
//               key={idx}
//               className="relative h-28 rounded-xl overflow-hidden shadow-md cursor-pointer"
//               onClick={() => onImageClick(idx + 1)}
//             >
//               <img src={img} alt={`${placeName} ${idx + 2}`} className="w-full h-full object-cover" />
//               {idx === 2 && images.length > 4 && (
//                 <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(1, 0, 91, 0.85)' }}>
//                   <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
//                     <span className="text-base font-black" style={{ color: '#01005B' }}>+{images.length - 4}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import { MapPin, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageGalleryProps {
  images: string[];
  placeName: string;
  onImageClick: (index: number) => void;
}

export default function ImageGallery({ images, placeName, onImageClick }: ImageGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [loadingTimeouts, setLoadingTimeouts] = useState<Set<number>>(new Set());

  const LOADING_TIMEOUT = 5000; // 8 seconds max loading time

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
    setLoadingTimeouts(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
    setLoadingTimeouts(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleLoadingTimeout = (index: number) => {
    // Only mark as error if still loading (not already loaded or errored)
    if (!loadedImages.has(index) && !imageErrors.has(index)) {
      console.warn(`Image ${index} timed out after ${LOADING_TIMEOUT}ms`);
      setImageErrors(prev => new Set(prev).add(index));
      setLoadingTimeouts(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Filter out images that have errors
  const validImages = images.filter((_, index) => !imageErrors.has(index));

  // Safety check - if no valid images after filtering, return null
  if (!validImages || validImages.length === 0) {
    return null;
  }

  // Ensure we don't try to access images that don't exist
  const safeGetImage = (index: number) => {
    return validImages[index] || validImages[0];
  };

  const ImageWithFallback = ({ src, alt, index, className, onClick }: { 
    src: string; 
    alt: string; 
    index: number;
    className: string;
    onClick: () => void;
  }) => {
    useEffect(() => {
      // Only set timeout if image hasn't loaded yet
      if (!loadedImages.has(index) && !imageErrors.has(index)) {
        setLoadingTimeouts(prev => new Set(prev).add(index));
        
        const timeoutId = setTimeout(() => {
          handleLoadingTimeout(index);
        }, LOADING_TIMEOUT);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }, [src, index]);

    const hasError = imageErrors.has(index);

    return (
      <div className="relative w-full h-full">
        {/* Actual image with fade-in */}
        {!hasError && (
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300`}
            onClick={onClick}
            onError={() => handleImageError(index)}
            onLoad={() => handleImageLoad(index)}
            loading="lazy"
            style={{
              opacity: loadedImages.has(index) ? 1 : 0,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Desktop & Tablet View - Facebook Style */}
      <div className="hidden md:block">
        {/* 1 Image - Full width */}
        {validImages.length === 1 && (
          <div className="relative h-[500px] overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
            <ImageWithFallback
              src={validImages[0]}
              alt={placeName}
              index={images.indexOf(validImages[0])}
              className="w-full h-full object-cover"
              onClick={() => onImageClick(0)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        )}

        {/* 2 Images - Two equal columns */}
        {validImages.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 h-[500px]">
            {validImages.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${placeName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {/* 3 Images - Balanced: 2 top equal + 1 bottom full */}
        {validImages.length === 3 && (
          <div className="grid grid-rows-2 gap-0.5 h-[500px]">
            <div className="grid grid-cols-2 gap-0.5">
              {validImages.slice(0, 2).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${placeName} ${idx + 1}`}
                    index={images.indexOf(img)}
                    className="w-full h-full object-cover"
                    onClick={() => onImageClick(idx)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>
              ))}
            </div>
            {validImages[2] && (
              <div className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(2)}>
                <ImageWithFallback
                  src={validImages[2]}
                  alt={`${placeName} 3`}
                  index={images.indexOf(validImages[2])}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(2)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            )}
          </div>
        )}

        {/* 4 Images - Perfect 2x2 grid */}
        {validImages.length === 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-[500px]">
            {validImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${placeName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {/* 5+ Images - Balanced: 2 top equal + 3 bottom equal */}
        {validImages.length >= 5 && (
          <div className="grid grid-rows-2 gap-0.5 h-[500px]">
            <div className="grid grid-cols-2 gap-0.5">
              {validImages.slice(0, Math.min(2, validImages.length)).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${placeName} ${idx + 1}`}
                    index={images.indexOf(img)}
                    className="w-full h-full object-cover"
                    onClick={() => onImageClick(idx)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-0.5">
              {validImages.slice(2, Math.min(5, validImages.length)).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx + 2)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${placeName} ${idx + 3}`}
                    index={images.indexOf(img)}
                    className="w-full h-full object-cover"
                    onClick={() => onImageClick(idx + 2)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  {idx === validImages.slice(2, 5).length - 1 && validImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-4xl font-semibold">+{validImages.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        <div 
          className="relative h-72 rounded-3xl overflow-hidden shadow-lg cursor-pointer"
          onClick={() => onImageClick(0)}
        >
          <ImageWithFallback
            src={validImages[0]}
            alt={placeName}
            index={images.indexOf(validImages[0])}
            className="w-full h-full object-cover"
            onClick={() => onImageClick(0)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`, '_blank');
            }}
            className="absolute bottom-4 left-4 bg-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl z-10"
          >
            <div className="p-1.5 rounded-full" style={{ backgroundColor: '#01005B' }}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Route</span>
          </button>

          <div className="absolute top-4 left-4 bg-black/70 px-3 py-2 rounded-full">
            <span className="font-semibold text-white text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {validImages.length} Photos
            </span>
          </div>
        </div>

        {validImages.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {validImages.slice(1, 4).map((img: string, idx: number) => (
              <div
                key={idx}
                className="relative h-28 rounded-xl overflow-hidden shadow-md cursor-pointer"
                onClick={() => onImageClick(idx + 1)}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${placeName} ${idx + 2}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx + 1)}
                />
                {idx === 2 && validImages.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(1, 0, 91, 0.85)' }}>
                    <div className="bg-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
                      <span className="text-base font-black" style={{ color: '#01005B' }}>+{validImages.length - 4}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile View - Facebook Style */}
      <div className="md:hidden">
        {/* 1 Image */}
        {validImages.length === 1 && (
          <div className="relative h-96 overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
            <ImageWithFallback
              src={validImages[0]}
              alt={placeName}
              index={images.indexOf(validImages[0])}
              className="w-full h-full object-cover"
              onClick={() => onImageClick(0)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        )}

        {/* 2 Images */}
        {validImages.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 h-96">
            {validImages.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${placeName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {/* 3+ Images - Balanced */}
        {validImages.length >= 3 && (
          <div className="grid grid-rows-2 gap-0.5 h-96">
            {validImages[0] && (
              <div className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
                <ImageWithFallback
                  src={validImages[0]}
                  alt={placeName}
                  index={images.indexOf(validImages[0])}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(0)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-0.5">
              {validImages.slice(1, Math.min(3, validImages.length)).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx + 1)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${placeName} ${idx + 2}`}
                    index={images.indexOf(img)}
                    className="w-full h-full object-cover"
                    onClick={() => onImageClick(idx + 1)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  {idx === validImages.slice(1, 3).length - 1 && validImages.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-3xl font-semibold">+{validImages.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}