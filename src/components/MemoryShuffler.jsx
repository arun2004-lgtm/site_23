import React, { useState, useEffect } from 'react';
import { Shuffle, Sparkles, ExternalLink, Play, Pause, Folder, Maximize2 } from 'lucide-react';
import { photoAlbums } from '../data/batchData';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export default function MemoryShuffler({ onOpenLightbox }) {
  // Flatten all sample photos from Year 1 and Year 2 with metadata
  const allMemories = photoAlbums.flatMap(album => 
    (album.samplePhotos || []).map(photo => ({
      ...photo,
      url: formatGoogleDriveImageUrl(photo.url),
      albumTitle: album.title,
      albumId: album.id,
      year: album.year,
      type: album.type,
      driveFolderUrl: album.driveFolderUrl,
      folderId: album.folderId
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Auto-shuffle every 4 seconds when playing
  useEffect(() => {
    if (!isPlaying || allMemories.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allMemories.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, allMemories.length]);

  const handleShuffle = () => {
    setIsSpinning(true);
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * allMemories.length);
      if (nextIdx === currentIndex) {
        nextIdx = (currentIndex + 1) % allMemories.length;
      }
      setCurrentIndex(nextIdx);
      setIsSpinning(false);
    }, 300);
  };

  if (allMemories.length === 0) return null;
  const current = allMemories[currentIndex] || allMemories[0];

  return (
    <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden relative shadow-2xl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Side: Photo Display Frame */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
            <img
              src={current.url}
              alt={current.caption || 'Batch Memory'}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-slate-750">
                {current.year}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-rose-300 border border-slate-750">
                {current.type}
              </span>
            </div>

            {/* In-photo caption */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm font-semibold text-white drop-shadow">
                "{current.caption}"
              </p>
              <p className="text-[11px] text-amber-400 mt-0.5">
                {current.albumTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Shuffle Info & Controls */}
        <div className="w-full lg:w-1/2 space-y-5 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Memory Shuffle Reel</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Relive Random Batch Moments
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Every click shuffles between our Year 1 & Year 2 batch trips, Kovil poojas, sports championships, hostel birthdays, and campus memories.
            </p>
          </div>

          {/* Current Album Info Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-750 text-amber-400 flex items-center justify-center shrink-0">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">{current.albumTitle}</div>
                <div className="text-[11px] text-slate-400">Memory {currentIndex + 1} of {allMemories.length}</div>
              </div>
            </div>

            <a
              href={current.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-xs transition-colors shrink-0"
            >
              <span>Drive Folder</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Buttons: Shuffle & Play/Pause */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>🎲 Shuffle Next Memory!</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause Slideshow</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>

            {onOpenLightbox && (
              <button
                onClick={() => onOpenLightbox(allMemories, currentIndex, current.driveFolderUrl)}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Fullscreen Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
