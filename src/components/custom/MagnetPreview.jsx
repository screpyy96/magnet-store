import { useState, useEffect } from 'react';

export default function MagnetPreview({ 
  imageUrl,
  images = [],
  size = '5x5cm', 
  finish = 'Flexible',
  onThumbnailClick = () => {}
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use the first image from the images array if available, otherwise use the single imageUrl
  const displayImage = images.length > 0 ? images[currentImageIndex]?.url : imageUrl;
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [displayImage]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = (e) => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    if (onThumbnailClick) {
      onThumbnailClick(index);
    }
  };

  // Check if we have a valid image URL
  const hasValidImage = (displayImage && displayImage.length > 0 && displayImage !== '');

  return (
    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 sm:p-8 shadow-lg">
      {/* Fridge surface background */}
      <div className="relative bg-white rounded-xl shadow-md overflow-hidden">
        {/* Magnet preview */}
        <div className="relative aspect-square max-w-xs mx-auto">
          {/* Magnet border/shadow effect */}
          <div className="absolute inset-0 bg-gray-300 rounded-lg transform rotate-1 shadow-lg"></div>
          <div className="absolute inset-0 bg-gray-200 rounded-lg transform -rotate-0.5 shadow-md"></div>
          
          {/* Main magnet */}
          <div className="relative w-full h-full bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-100 transform hover:scale-105 transition-transform duration-300">
            {hasValidImage ? (
              <div className="relative w-full h-full">
                {!isLoaded && !hasError && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Loading...</div>
                  </div>
                )}
                <img
                  src={displayImage}
                  alt={`Magnet Preview ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {hasError && (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                    <div className="text-center text-red-400">
                      <div className="text-2xl mb-2">⚠️</div>
                      <div className="text-xs font-medium">Image Error</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-3xl sm:text-4xl mb-2">📸</div>
                  <div className="text-xs sm:text-sm font-medium">Upload Your Photo</div>
                  <div className="text-xs">to see preview</div>
                </div>
              </div>
            )}
            
            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  &lt;
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev + 1) % images.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  &gt;
                </button>
              </>
            )}
            
            {/* Magnet reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none"></div>
          </div>
        </div>
        
        {/* Thumbnail strip for multiple images */}
        {hasMultipleImages && (
          <div className="flex justify-center gap-2 mt-4 px-2 pb-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                aria-label={`View image ${index + 1}`}
              >
                <img 
                  src={img.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Product info overlay */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {size} • {finish}
        </div>
      </div>
      
      {/* Size reference */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded border-2 border-white shadow-sm"></div>
          <span>Actual size: 5cm × 5cm</span>
        </div>
      </div>
    </div>
  );
}