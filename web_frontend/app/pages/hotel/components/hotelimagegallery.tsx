import { useState, useEffect } from "react";

interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
  onImageClick: (index: number) => void;
}

export default function HotelImageGallery({ images, hotelName, onImageClick }: HotelImageGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [loadingTimeouts, setLoadingTimeouts] = useState<Set<number>>(new Set());

  const LOADING_TIMEOUT = 5000;

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

  const validImages = images.filter((_, index) => !imageErrors.has(index));

  if (!validImages || validImages.length === 0) {
    return null;
  }

  const ImageWithFallback = ({ src, alt, index, className, onClick }: { 
    src: string; 
    alt: string; 
    index: number;
    className: string;
    onClick: () => void;
  }) => {
    useEffect(() => {
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
      <div className="hidden md:block">
        {validImages.length === 1 && (
          <div className="relative h-[500px] overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
            <ImageWithFallback
              src={validImages[0]}
              alt={hotelName}
              index={images.indexOf(validImages[0])}
              className="w-full h-full object-cover"
              onClick={() => onImageClick(0)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        )}

        {validImages.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 h-[500px]">
            {validImages.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${hotelName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {validImages.length === 3 && (
          <div className="grid grid-rows-2 gap-0.5 h-[500px]">
            <div className="grid grid-cols-2 gap-0.5">
              {validImages.slice(0, 2).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${hotelName} ${idx + 1}`}
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
                  alt={`${hotelName} 3`}
                  index={images.indexOf(validImages[2])}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(2)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            )}
          </div>
        )}

        {validImages.length === 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-[500px]">
            {validImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${hotelName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {validImages.length >= 5 && (
          <div className="grid grid-rows-2 gap-0.5 h-[500px]">
            <div className="grid grid-cols-2 gap-0.5">
              {validImages.slice(0, Math.min(2, validImages.length)).map((img, idx) => (
                <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                  <ImageWithFallback
                    src={img}
                    alt={`${hotelName} ${idx + 1}`}
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
                    alt={`${hotelName} ${idx + 3}`}
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

      <div className="md:hidden">
        {validImages.length === 1 && (
          <div className="relative h-96 overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
            <ImageWithFallback
              src={validImages[0]}
              alt={hotelName}
              index={images.indexOf(validImages[0])}
              className="w-full h-full object-cover"
              onClick={() => onImageClick(0)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        )}

        {validImages.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 h-96">
            {validImages.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(idx)}>
                <ImageWithFallback
                  src={img}
                  alt={`${hotelName} ${idx + 1}`}
                  index={images.indexOf(img)}
                  className="w-full h-full object-cover"
                  onClick={() => onImageClick(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
              </div>
            ))}
          </div>
        )}

        {validImages.length >= 3 && (
          <div className="grid grid-rows-2 gap-0.5 h-96">
            {validImages[0] && (
              <div className="relative overflow-hidden cursor-pointer group" onClick={() => onImageClick(0)}>
                <ImageWithFallback
                  src={validImages[0]}
                  alt={hotelName}
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
                    alt={`${hotelName} ${idx + 2}`}
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
