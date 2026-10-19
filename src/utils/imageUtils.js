/**
 * Checks if a file or filename is an Apple HEIC/HEIF image
 */
export function isHeicFile(file) {
  if (!file) return false;
  const fileName = (typeof file === 'string' ? file : file.name || '').toLowerCase();
  const fileType = (typeof file === 'object' ? file.type || '' : '').toLowerCase();

  return (
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileType === 'image/heic' ||
    fileType === 'image/heif'
  );
}

/**
 * Resizes and compresses any image file (or Blob) using an offscreen canvas.
 * Produces an optimized, lightweight JPEG Data URL (typically ~25-45KB)
 * that safely fits within localStorage quotas and updates Supabase instantly!
 */
export async function compressAndResizeImage(fileOrBlob, maxDimension = 512, quality = 0.82) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return readAsDataURL(fileOrBlob);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return readAsDataURL(fileOrBlob).then(resolve).catch(reject);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to raw Data URL if image drawing fails
      readAsDataURL(fileOrBlob).then(resolve).catch(() => reject(err));
    };

    img.src = objectUrl;
  });
}

/**
 * Reads any image file (including iPhone HEIC) and returns a lightweight,
 * optimized JPEG Data URL ready for instant database and localStorage storage
 */
export async function processImageFile(file, onProgress, maxDimension = 1200) {
  if (!file) return null;

  if (isHeicFile(file)) {
    if (onProgress) onProgress('Converting iPhone HEIC to JPEG...');
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;

      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.88
      });

      const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      if (onProgress) onProgress('Optimizing profile image size...');
      return await compressAndResizeImage(finalBlob, maxDimension, 0.85);
    } catch (err) {
      console.warn('HEIC conversion fallback error:', err);
      return readAsDataURL(file);
    }
  }

  // Optimize and compress standard files (JPEG, PNG, WebP)
  try {
    return await compressAndResizeImage(file, maxDimension, 0.85);
  } catch {
    return readAsDataURL(file);
  }
}

/**
 * Helper to read standard files as DataURL
 */
export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts any Google Drive share link into a direct web-embeddable image URL.
 * Automatically requests high-res JPEG preview from Google's thumbnail service,
 * which successfully renders even if the original Drive file is in HEIC format!
 */
export function formatGoogleDriveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w1600`;
  }

  // Pattern 2: id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com'))) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1600`;
  }

  // Pattern 3: lh3.googleusercontent.com/d/FILE_ID or /u/0/d/FILE_ID
  const lh3Match = trimmed.match(/googleusercontent\.com\/(?:d\/|u\/\d+\/d\/)?([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1] && lh3Match[1].length > 10) {
    return `https://drive.google.com/thumbnail?id=${lh3Match[1]}&sz=w1600`;
  }

  return trimmed;
}

/**
 * Loads any image (Google Drive thumbnail, external URL, or data URL)
 * into a CORS-safe local Blob Object URL so that HTML5 Canvas operations
 * (framing, zooming, cropping, toDataURL) will never be blocked by CORS or canvas taint.
 */
export async function loadSafeImageBlob(src) {
  if (!src || typeof src !== 'string') {
    throw new Error('Invalid image source');
  }

  const trimmed = src.trim();

  // If already a local data URL or blob URL, it is 100% same-origin!
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return { url: trimmed, isBlobUrl: false };
  }

  const cleanUrl = formatGoogleDriveImageUrl(trimmed);

  // Attempt 1: Direct fetch with CORS mode
  try {
    const directRes = await fetch(cleanUrl, { mode: 'cors' });
    if (directRes.ok) {
      const blob = await directRes.blob();
      if (blob && blob.size > 0 && (blob.type.startsWith('image/') || blob.type === 'application/octet-stream')) {
        return { url: URL.createObjectURL(blob), isBlobUrl: true };
      }
    }
  } catch {
    // Direct CORS fetch failed (typical for Google Drive), fallback to proxy
  }

  // Attempt 2: High-speed global CORS image proxies (wsrv.nl / weserv.nl)
  const proxyEndpoints = [
    `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg&q=92`,
    `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg&q=92`
  ];

  for (const proxyUrl of proxyEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return { url: URL.createObjectURL(blob), isBlobUrl: true };
        }
      }
    } catch {
      // Continue to next proxy candidate
    }
  }

  // Fallback: return formatted clean URL
  return { url: cleanUrl, isBlobUrl: false };
}

/**
 * Uploads an image base64 data URL to Google Drive via Google Apps Script Web App
 * deployed under peradeniyaguys@gmail.com.
 */
export async function uploadImageToGoogleDrive(dataUrl, filename = 'profile.jpg', customEndpoint = null, folderId = '1_VBM374H-BypVbpChe1H6JqdC9XkoAhp') {
  const endpoint = customEndpoint || import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || localStorage.getItem('site23_gas_upload_url');
  if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('http')) return null;

  // Clean folder ID in case a full URL was passed or configured
  const cleanFolderId = (folderId || '1_VBM374H-BypVbpChe1H6JqdC9XkoAhp')
    .replace(/.*folders\//, '')
    .replace(/\?.*/, '')
    .trim();

  const payload = {
    base64: dataUrl,
    filename: filename,
    type: 'image/jpeg',
    folderId: cleanFolderId
  };

  // We use Content-Type: text/plain to avoid CORS preflight OPTIONS request
  // which Google Apps Script does not accept.
  const response = await fetch(endpoint.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Upload server responded with HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result.success && result.url) {
    return result.url;
  }
  throw new Error(result.error || 'Failed to upload photo to Google Drive');
}

