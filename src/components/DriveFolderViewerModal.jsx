import React, { useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Lock, Folder } from 'lucide-react';

export default function DriveFolderViewerModal({ isOpen, album, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !album) return null;

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${album.folderId}#grid`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                  <Lock className="w-3 h-3" />
                  <span>Restricted to Authorized Accounts</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {album.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={album.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              <span>Open in Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Google Drive Iframe Viewer */}
        <div className="relative flex-1 bg-slate-950 flex flex-col">
          <iframe
            src={embedUrl}
            title={album.title}
            className="w-full h-full border-0 flex-1"
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>

        {/* Security & Access Footer Notice */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Google Drive Permission Security:</strong> Only Google accounts with access granted in Drive can view or download these photos.
            </span>
          </div>

          <a
            href={album.driveFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1 shrink-0 font-medium"
          >
            <span>Trouble viewing inside? Click to open directly in Google Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
