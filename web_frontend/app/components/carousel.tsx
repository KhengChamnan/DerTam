import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function Carousel({ 
  images, 
  autoPlay = true, 
  autoPlayInterval = 5000,
  className = ''
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Show only if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none rounded-full w-12 h-12 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} style={{ color: '#01005B' }} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none rounded-full w-12 h-12 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight size={24} style={{ color: '#01005B' }} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full border-none cursor-pointer transition-all ${
                  index === currentIndex ? 'w-10' : 'w-3'
                }`}
                style={{ 
                  backgroundColor: index === currentIndex ? '#01005B' : 'rgba(255, 255, 255, 0.7)'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}