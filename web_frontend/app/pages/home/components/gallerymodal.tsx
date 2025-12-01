interface GalleryModalProps {
  images: string[];
  placeName: string;
  selectedImage: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

export default function GalleryModal({
  images,
  placeName,
  selectedImage,
  onClose,
  onPrevious,
  onNext,
  onSelectImage,
}: GalleryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="max-w-6xl w-full px-4">
        <div className="relative">
          <img
            src={images[selectedImage]}
            alt={placeName}
            className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
          
          {/* Previous button */}
          {selectedImage > 0 && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Next button */}
          {selectedImage < images.length - 1 && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Thumbnail strip */}
        <div className="flex gap-3 mt-6 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => onSelectImage(idx)}
              className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-3 transition-all duration-300 hover:scale-110 ${
                selectedImage === idx ? 'border-white shadow-xl scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${placeName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        
        {/* Image counter */}
        <p className="text-white text-center mt-4 font-semibold">
          {selectedImage + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
