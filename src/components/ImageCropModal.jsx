import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Check, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  Move, Circle, Square, Loader2 
} from 'lucide-react';
import { loadSafeImageBlob } from '../utils/imageUtils';

const FRAME_SIZE = 280; // Standard 280px viewport fits all phones without horizontal overflow

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  title = "Frame & Position Photo",
  initialShape = 'circle'
}) {
  const [displaySrc, setDisplaySrc] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [shape, setShape] = useState(initialShape); // 'circle' | 'square'
  const [isProcessing, setIsProcessing] = useState(false);

  const imageLoaded = Boolean(displaySrc && !isLoadingImage && !loadError && naturalSize.width > 0);

  const imgRef = useRef(null);
  const activeBlobUrlRef = useRef(null);
  const frameContainerRef = useRef(null);
  const mouseDragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPan: { x: 0, y: 0 } });
  const touchStateRef = useRef({
    isPinching: false,
    startDist: 0,
    startZoom: 1,
    startPan: { x: 0, y: 0 },
    startTouch1: { x: 0, y: 0 }
  });

  // Load image dimensions asynchronously with CORS-safe fallback pipeline
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      return;
    }

    let active = true;

    (async () => {
      setIsLoadingImage(true);
      setLoadError(false);
      setDisplaySrc(null);

      let resolvedUrl = imageSrc;
      let isBlob = false;

      try {
        const safeResult = await loadSafeImageBlob(imageSrc);
        if (!active) {
          if (safeResult.isBlobUrl) URL.revokeObjectURL(safeResult.url);
          return;
        }
        resolvedUrl = safeResult.url;
        isBlob = safeResult.isBlobUrl;
        if (isBlob) {
          if (activeBlobUrlRef.current) {
            URL.revokeObjectURL(activeBlobUrlRef.current);
          }
          activeBlobUrlRef.current = resolvedUrl;
        }
      } catch (prepErr) {
        console.warn('Image preparation warning:', prepErr);
      }

      const img = new Image();
      // Only set crossOrigin if not a local blob/data URL
      if (!isBlob && !resolvedUrl.startsWith('data:') && !resolvedUrl.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }

      const onImageSuccess = () => {
        if (!active) return;
        imgRef.current = img;
        setNaturalSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        setDisplaySrc(resolvedUrl);
        setLoadError(false);
        setIsLoadingImage(false);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      };

      img.onload = onImageSuccess;

      img.onerror = () => {
        if (!active) return;
        // If image failed with crossOrigin, retry once without crossOrigin as visual fallback
        if (img.crossOrigin) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            if (!active) return;
            imgRef.current = fallbackImg;
            setNaturalSize({ width: fallbackImg.naturalWidth || fallbackImg.width, height: fallbackImg.naturalHeight || fallbackImg.height });
            setDisplaySrc(resolvedUrl);
            setLoadError(false);
            setIsLoadingImage(false);
            setZoom(1);
            setRotation(0);
            setPan({ x: 0, y: 0 });
          };
          fallbackImg.onerror = () => {
            if (!active) return;
            setLoadError(true);
            setIsLoadingImage(false);
          };
          fallbackImg.src = resolvedUrl;
        } else {
          setLoadError(true);
          setIsLoadingImage(false);
        }
      };

      img.src = resolvedUrl;
    })();

    return () => {
      active = false;
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, [isOpen, imageSrc]);

  // Compute scale and clamping bounds
  const getScaleAndBounds = useCallback((curZoom, curRotation) => {
    if (!naturalSize.width || !naturalSize.height) {
      return { baseScale: 1, maxPanX: 0, maxPanY: 0 };
    }

    const isRotated90 = curRotation === 90 || curRotation === 270;
    const effNatW = isRotated90 ? naturalSize.height : naturalSize.width;
    const effNatH = isRotated90 ? naturalSize.width : naturalSize.height;

    // Minimum scale required so that image completely covers the frame
    const baseScale = Math.max(FRAME_SIZE / effNatW, FRAME_SIZE / effNatH);

    // Effective visual dimensions on screen
    const effW = effNatW * baseScale * curZoom;
    const effH = effNatH * baseScale * curZoom;

    const maxPanX = Math.max(0, (effW - FRAME_SIZE) / 2);
    const maxPanY = Math.max(0, (effH - FRAME_SIZE) / 2);

    return { baseScale, maxPanX, maxPanY };
  }, [naturalSize]);

  // Clamp pan so image never uncovers the frame window
  const clampPan = useCallback((rawX, rawY, curZoom, curRotation) => {
    const { maxPanX, maxPanY } = getScaleAndBounds(curZoom, curRotation);
    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, rawX)),
      y: Math.min(maxPanY, Math.max(-maxPanY, rawY))
    };
  }, [getScaleAndBounds]);

  // Zoom slider change handler
  const handleZoomChange = useCallback((newZoom) => {
    const clampedZoom = Math.min(4, Math.max(1, newZoom));
    setZoom(clampedZoom);
    setPan(prev => clampPan(prev.x, prev.y, clampedZoom, rotation));
  }, [clampPan, rotation]);

  // Rotation handler (90 degrees clockwise)
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setPan(prev => clampPan(prev.x, prev.y, zoom, nextRot));
  };

  // Recenter / Reset handler
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Touch event handlers (pinch-to-zoom + single finger drag)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStateRef.current = {
        isPinching: true,
        startDist: dist || 1,
        startZoom: zoom,
        startPan: { ...pan },
        startTouch1: { x: t1.clientX, y: t1.clientY }
      };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current = {
        isPinching: false,
        startDist: 0,
        startZoom: zoom,
        startPan: { ...pan },
        startTouch1: { x: t.clientX, y: t.clientY }
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = dist / touchStateRef.current.startDist;
      const nextZoom = Math.min(4, Math.max(1, touchStateRef.current.startZoom * factor));
      setZoom(nextZoom);
      setPan(clampPan(touchStateRef.current.startPan.x, touchStateRef.current.startPan.y, nextZoom, rotation));
    } else if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - touchStateRef.current.startTouch1.x;
      const dy = t.clientY - touchStateRef.current.startTouch1.y;
      const rawX = touchStateRef.current.startPan.x + dx;
      const rawY = touchStateRef.current.startPan.y + dy;
      setPan(clampPan(rawX, rawY, zoom, rotation));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      touchStateRef.current.isPinching = false;
    } else if (e.touches.length === 1) {
      touchStateRef.current.isPinching = false;
      touchStateRef.current.startTouch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStateRef.current.startPan = { ...pan };
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    mouseDragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPan: { ...pan }
    };
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!mouseDragRef.current.isDragging) return;
      const dx = e.clientX - mouseDragRef.current.startX;
      const dy = e.clientY - mouseDragRef.current.startY;
      const rawX = mouseDragRef.current.startPan.x + dx;
      const rawY = mouseDragRef.current.startPan.y + dy;
      setPan(clampPan(rawX, rawY, zoom, rotation));
    };

    const handleGlobalMouseUp = () => {
      mouseDragRef.current.isDragging = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [clampPan, zoom, rotation]);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    handleZoomChange(zoom + delta);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        setPan(prev => clampPan(prev.x - 6, prev.y, zoom, rotation));
      } else if (e.key === 'ArrowRight') {
        setPan(prev => clampPan(prev.x + 6, prev.y, zoom, rotation));
      } else if (e.key === 'ArrowUp') {
        setPan(prev => clampPan(prev.x, prev.y - 6, zoom, rotation));
      } else if (e.key === 'ArrowDown') {
        setPan(prev => clampPan(prev.x, prev.y + 6, zoom, rotation));
      } else if (e.key === '+' || e.key === '=') {
        handleZoomChange(zoom + 0.1);
      } else if (e.key === '-') {
        handleZoomChange(zoom - 0.1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, clampPan, zoom, rotation, handleZoomChange]);

  // Crop & Export to 512x512 JPEG Data URL
  const handleApplyCrop = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);

    try {
      const OUTPUT_SIZE = 512;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const scaleRatio = OUTPUT_SIZE / FRAME_SIZE;
      const { baseScale } = getScaleAndBounds(zoom, rotation);

      ctx.save();
      // Translate to center + scaled pan
      ctx.translate(OUTPUT_SIZE / 2 + pan.x * scaleRatio, OUTPUT_SIZE / 2 + pan.y * scaleRatio);
      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Unrotated drawn dimensions
      const drawW = naturalSize.width * baseScale * zoom * scaleRatio;
      const drawH = naturalSize.height * baseScale * zoom * scaleRatio;

      ctx.drawImage(imgRef.current, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Export as high quality compressed JPEG (~35-45KB)
      let croppedDataUrl;
      try {
        croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      } catch (canvasErr) {
        console.warn('Canvas export tainted, falling back to clean source:', canvasErr);
        croppedDataUrl = displaySrc || imageSrc;
      }
      onCropComplete(croppedDataUrl);
    } catch (err) {
      console.error('Error applying crop:', err);
      alert('Failed to crop photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const { baseScale } = getScaleAndBounds(zoom, rotation);
  const imgWidth = naturalSize.width * baseScale * zoom;
  const imgHeight = naturalSize.height * baseScale * zoom;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight">
                Drag to reposition • Pinch or slide to zoom
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Card */}
        <div className="relative mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center select-none">
          {isLoadingImage && (
            <div className="w-[280px] h-[280px] flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              <span className="text-xs">Preparing picture for framing...</span>
            </div>
          )}

          {loadError && !isLoadingImage && (
            <div className="w-[280px] h-[280px] flex flex-col items-center justify-center gap-2 text-rose-400 p-4 text-center">
              <span className="text-xs font-semibold">Failed to load picture for framing.</span>
              <p className="text-[11px] text-slate-500 max-w-[220px]">
                The picture link could not be loaded or accessed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-white"
              >
                Close
              </button>
            </div>
          )}

          {imageLoaded && (
            <div
              ref={frameContainerRef}
              className="relative w-[280px] h-[280px] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none bg-slate-950"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
            >
              {/* Image Layer */}
              <img
                src={displaySrc || imageSrc}
                alt="Framing preview"
                draggable={false}
                className="absolute pointer-events-none select-none max-w-none will-change-transform"
                style={{
                  width: `${imgWidth}px`,
                  height: `${imgHeight}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              />

              {/* Framing Mask Overlay (SVG Cutout) */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                viewBox="0 0 280 280"
              >
                <defs>
                  <mask id="photo-frame-cutout">
                    <rect width="280" height="280" fill="white" />
                    {shape === 'circle' ? (
                      <circle cx="140" cy="140" r="130" fill="black" />
                    ) : (
                      <rect x="10" y="10" width="260" height="260" rx="36" fill="black" />
                    )}
                  </mask>
                </defs>

                {/* Darkened Outer Mask */}
                <rect 
                  width="280" 
                  height="280" 
                  fill="rgba(2, 6, 23, 0.65)" 
                  mask="url(#photo-frame-cutout)" 
                />

                {/* Amber Frame Border */}
                {shape === 'circle' ? (
                  <circle 
                    cx="140" 
                    cy="140" 
                    r="130" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                ) : (
                  <rect 
                    x="10" 
                    y="10" 
                    width="260" 
                    height="260" 
                    rx="36" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                )}

                {/* Framing Center Crosshairs */}
                <line 
                  x1="140" 
                  y1="25" 
                  x2="140" 
                  y2="255" 
                  stroke="rgba(255,255,255,0.18)" 
                  strokeWidth="1" 
                  strokeDasharray="3 3" 
                />
                <line 
                  x1="25" 
                  y1="140" 
                  x2="255" 
                  y2="140" 
                  stroke="rgba(255,255,255,0.18)" 
                  strokeWidth="1" 
                  strokeDasharray="3 3" 
                />
              </svg>

              {/* Interactive Helper Hint Tag */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700/60 text-[10px] text-amber-300 font-medium whitespace-nowrap shadow">
                Drag to Move
              </div>
            </div>
          )}
        </div>

        {/* Zoom Slider Control */}
        <div className="mt-4 px-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Zoom Scale</span>
            </span>
            <span className="font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 text-[10px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.2)}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.2)}
              disabled={zoom >= 3.5}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tool Buttons: Rotate, Shape, Recenter */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleRotate}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/60 transition-colors"
            title="Rotate photo 90 degrees"
          >
            <RotateCw className="w-3 h-3 text-amber-400" />
            <span>Rotate</span>
          </button>

          <button
            type="button"
            onClick={() => setShape(s => s === 'circle' ? 'square' : 'circle')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/60 transition-colors"
            title="Toggle between circular and rounded square framing"
          >
            {shape === 'circle' ? (
              <>
                <Square className="w-3 h-3 text-amber-400" />
                <span>Square</span>
              </>
            ) : (
              <>
                <Circle className="w-3 h-3 text-amber-400" />
                <span>Circle</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/60 transition-colors"
            title="Reset position and zoom"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={!imageLoaded || isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying Frame...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Set Framed Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
