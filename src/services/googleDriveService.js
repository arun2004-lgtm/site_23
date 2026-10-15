/**
 * Google Drive API v3 and Google Identity Services (OAuth 2.0) Integration
 * Enables direct fetching and rendering of restricted Google Drive photos for authorized batch members.
 */

let gisPromise = null;

/**
 * Dynamically loads Google Identity Services client script
 */
export function loadGisScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services loaded but oauth2 is undefined'));
      }
    };
    script.onerror = () => reject(new Error('Could not load Google Identity Services script from accounts.google.com'));
    document.head.appendChild(script);
  });

  return gisPromise;
}

/**
 * Requests an OAuth2 access token with Google Drive Read-Only and Profile scopes
 */
export async function requestGoogleDriveToken(clientId) {
  if (!clientId || !clientId.trim()) {
    throw new Error('Google Client ID is missing. Please configure your OAuth Client ID.');
  }

  await loadGisScript();

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'openid'
        ].join(' '),
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error || 'OAuth authorization failed'));
          } else if (!response.access_token) {
            reject(new Error('No access token returned from Google authentication'));
          } else {
            resolve(response);
          }
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'Google OAuth prompt was cancelled or closed'));
        }
      });

      // Request token with consent prompt
      client.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Fetches the user profile (email, name, picture) using the OAuth access token
 */
export async function fetchGoogleUserInfo(accessToken) {
  if (!accessToken) throw new Error('No access token provided');

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Failed to fetch user profile (${res.status}): ${errorText || res.statusText}`);
  }

  return await res.json();
}

/**
 * Lists image files inside a specific Google Drive folder using Google Drive API v3
 */
export async function listFolderImages(folderId, accessToken, pageSize = 60) {
  if (!folderId) throw new Error('No folderId specified');
  if (!accessToken) throw new Error('No access token provided');

  // Query: Inside parent folder, not trashed, and either mimeType is image/* or filename has image/HEIC extensions
  const query = `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or name contains '.heic' or name contains '.HEIC' or name contains '.jpg' or name contains '.jpeg' or name contains '.png')`;
  const fields = 'files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, createdTime, size, imageMediaMetadata)';

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&supportsAllDrives=true&includeItemsFromAllDrives=true&orderBy=createdTime%20desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => null);
    const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`Google Drive API error for folder ${folderId}: ${msg}`);
  }

  const data = await res.json();
  return data.files || [];
}

// In-memory cache for fetched blob URLs to avoid re-fetching
const blobUrlCache = new Map();

/**
 * Fetches an authenticated blob URL for restricted Drive files (bypasses cookie issues)
 */
export async function fetchImageBlobUrl(fileId, accessToken) {
  if (blobUrlCache.has(fileId)) {
    return blobUrlCache.get(fileId);
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to download image file ${fileId}`);
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  blobUrlCache.set(fileId, blobUrl);
  return blobUrl;
}

/**
 * Syncs photos from all connected batch photo albums
 */
export async function syncAllBatchFolders(albums, accessToken, onProgress) {
  if (!Array.isArray(albums) || albums.length === 0) {
    return [];
  }

  const allPhotos = [];
  const errors = [];

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    if (!album.folderId) continue;

    if (onProgress) {
      onProgress({
        currentAlbum: album.title,
        currentIndex: i + 1,
        totalFolders: albums.length,
        photosFoundSoFar: allPhotos.length,
        percent: Math.round(((i + 1) / albums.length) * 100)
      });
    }

    try {
      const files = await listFolderImages(album.folderId, accessToken, 50);

      const albumPhotos = files.map((file, idx) => ({
        id: `drive-${file.id}`,
        fileId: file.id,
        // High-res preview thumbnail directly from Google's CDN
        url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`,
        thumbnailUrl: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
        rawDriveLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        caption: file.name
          ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          : `${album.title} #${idx + 1}`,
        albumTitle: album.title,
        albumId: album.id,
        year: album.year || (album.id.startsWith('y1') ? 'Year 1' : 'Year 2'),
        type: album.type || 'Random',
        driveFolderUrl: album.driveFolderUrl,
        folderId: album.folderId,
        createdTime: file.createdTime,
        mimeType: file.mimeType,
        isDriveLive: true
      }));

      allPhotos.push(...albumPhotos);
    } catch (err) {
      console.warn(`Could not sync folder "${album.title}":`, err.message);
      errors.push({ album: album.title, error: err.message });
    }
  }

  if (onProgress) {
    onProgress({
      currentAlbum: 'Completed',
      currentIndex: albums.length,
      totalFolders: albums.length,
      photosFoundSoFar: allPhotos.length,
      percent: 100,
      errors
    });
  }

  return allPhotos;
}

