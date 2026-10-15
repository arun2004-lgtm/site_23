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
 * Reads any image file (including iPhone HEIC) and returns a browser-compatible JPEG Data URL
 */
export async function processImageFile(file, onProgress) {
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

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(finalBlob);
      });
    } catch (err) {
      console.warn('HEIC conversion fallback error:', err);
      // Fallback to standard read if conversion fails
      return readAsDataURL(file);
    }
  }

  return readAsDataURL(file);
}

/**
 * Helper to read standard files as DataURL
 */
function readAsDataURL(file) {
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

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w1600`;
  }

  // Pattern 2: id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1600`;
  }

  // Pattern 3: lh3.googleusercontent.com/d/FILE_ID
  const lh3Match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) {
    return `https://drive.google.com/thumbnail?id=${lh3Match[1]}&sz=w1600`;
  }

  return url;
}

/**
 * Uploads an image base64 data URL to Google Drive via Google Apps Script Web App
 * deployed under peradeniyaguys@gmail.com.
 */
export async function uploadImageToGoogleDrive(dataUrl, filename = 'profile.jpg', customEndpoint = null, folderId = '1_VBM374H-BypVbpChe1H6JqdC9XkoAhp') {
  const endpoint = customEndpoint || import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || localStorage.getItem('site23_gas_upload_url');
  if (!endpoint) return null;

  const payload = {
    base64: dataUrl,
    filename: filename,
    type: 'image/jpeg',
    folderId: folderId
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

