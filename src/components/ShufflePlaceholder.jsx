import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle } from 'lucide-react';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

/**
 * Reusable ShufflePlaceholder component
 * Shuffles through an array of photos with smooth crossfade,
 * auto-rotation, dot indicators, and an interactive manual shuffle button.
 */
export default function ShufflePlaceholder({ 
  images = [], 
  fallbackImage = '', 
  interval = 4000, 
  alt = 'Batch Photo',
  className = 'w-full h-full',
  showControls = true,
  enableAutoShuffle = true,
  onClick = null
}) {
  // Normalize images to an array of URLs and format any Google Drive links
  const photoList = (images.length > 0 
    ? images.map(img => (typeof img === 'string' ? img : img.url)) 
    : [fallbackImage].filter(Boolean)
  ).map(url => formatGoogleDriveImageUrl(url));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photoList.length);
      setIsTransitioning(false);
    }, 200);
  }, [photoList.length]);

  // Auto-shuffle timer (pauses when user hovers to allow them to view)
  useEffect(() => {
    if (!enableAutoShuffle || photoList.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, photoList.length, interval, enableAutoShuffle, handleNext]);

  const handleRandomShuffle = (e) => {
    if (e) e.stopPropagation();
    if (photoList.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * photoList.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % photoList.length;
      }
      setCurrentIndex(nextIdx);
      setIsTransitioning(false);
    }, 200);
  };

  const currentPhoto = photoList[currentIndex] || formatGoogleDriveImageUrl(fallbackImage);

  return (
    <div 
      className={`relative overflow-hidden group select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(currentIndex)}
    >
      {/* Photo with smooth scale and crossfade */}
      <img
        src={currentPhoto}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          isTransitioning ? 'opacity-40 scale-100 blur-[1px]' : 'opacity-100'
        }`}
      />

      {/* Manual Shuffle & Controls Overlay */}
      {showControls && photoList.length > 1 && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRandomShuffle}
            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-amber-400 backdrop-blur-md border border-slate-750 transition-all hover:scale-110 shadow"
            title="Shuffle to another photo"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pagination dots indicator */}
      {photoList.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-750/50">
          {photoList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-3 h-1.5 bg-amber-400'
                  : 'w-1.5 h-1.5 bg-slate-500 hover:bg-slate-300'
              }`}
              title={`Photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
