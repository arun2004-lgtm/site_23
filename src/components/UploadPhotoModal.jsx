import React, { useState } from 'react';
import { X, UploadCloud, Image, Check, Sparkles, ExternalLink, Loader2, Crop, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { photoAlbums } from '../data/batchData';
import { processImageFile, isHeicFile } from '../utils/imageUtils';
import ImageCropModal from './ImageCropModal';

export default function UploadPhotoModal({ isOpen, onClose, onPhotoUploaded }) {
  const { currentUser, isAdmin, canUploadPhotos } = useAuth();
  const userCanUpload = !!(isAdmin || canUploadPhotos || currentUser?.canUploadPhotos || currentUser?.social?.canUploadPhotos);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [targetAlbumId, setTargetAlbumId] = useState(photoAlbums[0]?.id || 'y1-trip');
  const [isUploading, setIsUploading] = useState(false);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [wasHeic, setWasHeic] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);

  if (!isOpen) return null;

  const handleProcessFile = async (file) => {
    if (!file) return;
    const isHeic = isHeicFile(file);
    setWasHeic(isHeic);

    if (isHeic) {
      setIsConvertingHeic(true);
    }

    try {
      const dataUrl = await processImageFile(file);
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Error processing image file:', err);
    } finally {
      setIsConvertingHeic(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!previewUrl) return;

    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);

      const targetAlbum = photoAlbums.find(a => a.id === targetAlbumId) || photoAlbums[0];

      if (onPhotoUploaded) {
        onPhotoUploaded({
          url: previewUrl,
          caption: caption || `Uploaded by ${currentUser?.name || 'E/23 Engineer'}`,
          album: targetAlbum.title,
          uploader: currentUser?.name,
          uploaderRegNo: currentUser?.regNo
        });
      }

      setTimeout(() => {
        setUploadSuccess(false);
        setPreviewUrl('');
        setCaption('');
        onClose();
      }, 1500);
    }, 1000);
  };

  const activeTargetAlbum = photoAlbums.find(a => a.id === targetAlbumId) || photoAlbums[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Upload Photos to Batch Vault</h3>
            <p className="text-xs text-slate-400">
              Contribute your memories to the E/23 Google Drive Archives
            </p>
          </div>
        </div>

        {!userCanUpload ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Upload Access Restricted</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Photo uploading to the batch Google Drive vault is restricted to authorized contributors. To request contributor upload access, please contact the batch administrator (E/23/020 G. Arunothayan).
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Photo Uploaded Successfully!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your photo is now archived in "{activeTargetAlbum?.title}" under ID {currentUser?.regNo}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-slate-700 hover:border-amber-400/70 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 transition-colors group"
            >
              <input
                type="file"
                accept="image/*,.heic,.HEIC,.heif,.HEIF"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {isConvertingHeic ? (
                <div className="py-8 space-y-3">
                  <Loader2 className="w-8 h-8 mx-auto text-amber-400 animate-spin" />
                  <div className="text-sm font-bold text-white">Converting iPhone HEIC photo...</div>
                  <p className="text-xs text-slate-400">Transforming to high-quality web JPEG for universal compatibility</p>
                </div>
              ) : previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-slate-700 shadow-md"
                  />
                  {wasHeic && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>iPhone HEIC converted to JPEG</span>
                    </div>
                  )}
                  {previewUrl && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCropOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Crop className="w-3.5 h-3.5 text-amber-400" />
                        <span>Frame & Zoom Photo</span>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-amber-400 font-medium">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors">
                    <Image className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    Click to browse or drag & drop photo here
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP, and iPhone <strong>HEIC</strong> (auto-converted)
                  </p>
                </div>
              )}
            </div>

            {/* Target Album Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Select Destination Folder
              </label>
              <select
                value={targetAlbumId}
                onChange={(e) => setTargetAlbumId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                <optgroup label="Year 1 Folders">
                  {photoAlbums.filter(a => a.year === 'Year 1').map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Year 2 Folders">
                  {photoAlbums.filter(a => a.year === 'Year 2').map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Caption / Memory */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Photo Caption / Memory
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Lab group photo or trip memory"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Google Drive Integration Note */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Google Drive Synced</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Target: {activeTargetAlbum?.title}. You can also open the folder directly in Google Drive to upload files.
                </p>
              </div>

              {activeTargetAlbum?.driveFolderUrl && (
                <a
                  href={activeTargetAlbum.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  title="Open this folder in Google Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!previewUrl || isUploading}
                className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                  !previewUrl || isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Confirm & Upload</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* Framing & Crop Intermediate Modal */}
        <ImageCropModal
          isOpen={isCropOpen}
          imageSrc={previewUrl}
          title="Frame & Position Album Photo"
          initialShape="square"
          onClose={() => setIsCropOpen(false)}
          onCropComplete={(croppedUrl) => {
            setPreviewUrl(croppedUrl);
            setIsCropOpen(false);
          }}
        />

      </div>
    </div>
  );
}
