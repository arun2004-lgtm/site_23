import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export default function LightboxModal({ 
  photos = [], 
  currentIndex = 0, 
  onClose, 
  onNext, 
  onPrev,
  driveFolderUrl
}) {
  const { isAdmin, canUploadPhotos, currentUser } = useAuth();
  const userCanUpload = !!(isAdmin || canUploadPhotos || currentUser?.canUploadPhotos || currentUser?.social?.canUploadPhotos);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!photos || photos.length === 0) return null;
  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <div className="text-sm font-medium text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          Photo {currentIndex + 1} of {photos.length}
        </div>

        <div className="flex items-center gap-2">
          {userCanUpload && driveFolderUrl && (
            <a
              href={driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-amber-400 transition-colors"
              title="Open album in Google Drive to add photos"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Drive</span>
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation - Prev */}
      {photos.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all z-20 hover:scale-105"
          title="Previous photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image & Caption */}
      <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
        <img
          src={formatGoogleDriveImageUrl(currentPhoto.url || currentPhoto)}
          alt={currentPhoto.caption || 'Batch photo'}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
        />
        {currentPhoto.caption && (
          <p className="mt-3 text-center text-sm text-slate-300 max-w-2xl bg-slate-900/90 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-sm">
            {currentPhoto.caption}
          </p>
        )}
      </div>

      {/* Navigation - Next */}
      {photos.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-800 transition-all z-20 hover:scale-105"
          title="Next photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
