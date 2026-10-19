import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ExternalLink, Folder, 
  Image as ImageIcon, Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export default function DriveFolderViewerModal({ 
  isOpen, 
  album, 
  onClose, 
  onOpenLightbox, 
  allPhotos = [] 
}) {
  const { isAdmin, canUploadPhotos, currentUser } = useAuth();
  const userCanUpload = !!(isAdmin || canUploadPhotos || currentUser?.canUploadPhotos || currentUser?.social?.canUploadPhotos);

  const [modalMode, setModalMode] = useState('iframe'); // 'iframe' | 'inApp'
  const [prevAlbumId, setPrevAlbumId] = useState(album?.id);

  if (album?.id !== prevAlbumId) {
    setPrevAlbumId(album?.id);
    setModalMode('iframe');
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const albumPhotos = useMemo(() => {
    if (!album) return [];
    const fromAll = (allPhotos || []).filter(p => p.albumId === album.id || p.folderId === album.folderId);
    if (fromAll.length > 0) return fromAll;
    return (album.samplePhotos || []).map((p, idx) => ({
      id: `sample-${album.id}-${idx}`,
      url: p.url,
      caption: p.caption || album.title,
      albumTitle: album.title,
      year: album.year
    }));
  }, [album, allPhotos]);

  if (!isOpen || !album) return null;

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${album.folderId}#grid`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {album.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-rose-300">
                  {album.year}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {album.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Mode Switcher */}
            <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setModalMode('iframe')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalMode === 'iframe'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Drive Gallery (Live)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('inApp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalMode === 'inApp'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Highlights ({albumPhotos.length})</span>
              </button>
            </div>

            {userCanUpload && (
              <a
                href={album.driveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                title="Open folder directly in Google Drive to add photos"
              >
                <span>Add to Drive</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: In-App Photos vs Embedded Iframe */}
        {modalMode === 'inApp' ? (
          <div className="relative flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto">
            {albumPhotos.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">
                    Browsing {albumPhotos.length} {albumPhotos.length === 1 ? 'photo' : 'photos'} in {album.title}
                  </span>
                  <span>Tap any photo to view in fullscreen Lightbox</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {albumPhotos.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      onClick={() => {
                        if (onOpenLightbox) {
                          onOpenLightbox(albumPhotos, idx, album.driveFolderUrl);
                        }
                      }}
                      className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-amber-400/60 bg-slate-900 transition-all hover:scale-[1.02] shadow"
                    >
                      <img
                        src={formatGoogleDriveImageUrl(photo.url)}
                        alt={photo.caption || album.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <p className="text-[11px] text-white font-medium line-clamp-1">
                          {photo.caption || album.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">No In-App Photos Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  You can browse the full album folder directly in Google Drive or switch to the Drive Iframe view.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setModalMode('iframe')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700"
                  >
                    View Drive Iframe
                  </button>
                  {userCanUpload && (
                    <a
                      href={album.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs"
                    >
                      Open in Drive App ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex-1 bg-slate-950 flex flex-col">
            <iframe
              src={embedUrl}
              title={album.title}
              className="w-full h-full border-0 flex-1"
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        )}

        {/* Security & Access Footer Notice */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Google Drive:</strong> {album.title}
            </span>
          </div>

          {userCanUpload ? (
            <a
              href={album.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 shrink-0 font-medium text-[11px]"
            >
              <span>Add to Drive / Open in Google Drive App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-slate-500 text-[11px]">
              Protected Batch Archive (Read-Only)
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
