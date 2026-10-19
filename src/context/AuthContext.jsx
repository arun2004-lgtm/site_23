import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialBatchmates, batchInfo, photoAlbums } from '../data/batchData';
import { 
  requestGoogleDriveToken, 
  fetchGoogleUserInfo, 
  syncAllBatchFolders 
} from '../services/googleDriveService';
import {
  fetchBatchmatesFromCloud,
  updateMemberInCloud,
  insertMemberInCloud,
  deleteMemberInCloud,
  subscribeToBatchmateRealtime
} from '../services/supabaseClient';

const AuthContext = createContext(null);

// Normalize E-Number (e.g., 'E/23/020' or 'e23020' -> 'e23020')
function normalizeRegNo(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

const DEFAULT_GOOGLE_CLIENT_ID = '298305600625-57kc5rilqcgrae3uinsqh1esngh84add.apps.googleusercontent.com';
const SESSION_STORAGE_KEY = 'site23_auth_session_v2';
const BATCHMATES_STORAGE_KEY = 'site23_pera_batchmates_v7';

function generateSessionToken() {
  return (
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '') ||
    'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
}

function createSession(member, authEmail) {
  const session = {
    userId: member.id,
    regNo: member.regNo,
    email: authEmail || member.personalEmail || member.universityEmail,
    name: member.name,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days secure session duration
    token: generateSessionToken(),
    authProvider: 'google_oauth'
  };
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
  return session;
}

function getValidSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.expiresAt || !session.userId) return null;
    if (Date.now() > session.expiresAt) {
      // Session has expired!
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('site23_pera_currentUser_v4');
      sessionStorage.removeItem('site23_gdrive_access_token');
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Load batchmates roster from localStorage or fallback to initial data
  const [batchmates, setBatchmates] = useState(() => {
    try {
      const saved = localStorage.getItem(BATCHMATES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialBatchmates;
    } catch {
      return initialBatchmates;
    }
  });

  // Current logged in user validated through secure session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const activeSession = getValidSession();
      if (!activeSession) return null;

      // Validate session against current batchmates database
      const roster = (() => {
        try {
          const saved = localStorage.getItem(BATCHMATES_STORAGE_KEY);
          return saved ? JSON.parse(saved) : initialBatchmates;
        } catch {
          return initialBatchmates;
        }
      })();

      const member = roster.find(m => m.id === activeSession.userId);
      if (member) return member;

      // Invalidate if user no longer in database
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('site23_pera_currentUser_v4');
      return null;
    } catch {
      return null;
    }
  });

  // Google OAuth Access Token (stored in sessionStorage for privacy)
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return sessionStorage.getItem('site23_gdrive_access_token') || '';
  });

  // Google Client ID (from localStorage, environment variable, or default)
  const [googleClientId, setGoogleClientId] = useState(() => {
    return (
      localStorage.getItem('site23_gdrive_client_id') || 
      import.meta.env.VITE_GOOGLE_CLIENT_ID || 
      DEFAULT_GOOGLE_CLIENT_ID
    );
  });

  // Synced photos pulled directly from Google Drive API v3
  const [syncedDrivePhotos, setSyncedDrivePhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('site23_synced_drive_photos_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [driveSyncError, setDriveSyncError] = useState('');

  // Persist batchmates whenever they change locally
  useEffect(() => {
    try {
      localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(batchmates));
    } catch (e) {
      console.error(e);
    }
  }, [batchmates]);

  // Connect to Supabase Cloud Database on app mount and subscribe to live changes
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial live roster from Supabase
    fetchBatchmatesFromCloud().then((cloudRoster) => {
      if (!isMounted || !cloudRoster || cloudRoster.length === 0) return;

      setBatchmates(cloudRoster);
      localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(cloudRoster));

      // Keep currentUser in sync with cloud data
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updated = cloudRoster.find(m => m.id === prev.id);
        if (updated) {
          localStorage.setItem('site23_pera_currentUser_v4', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    });

    // 2. Subscribe to Real-time PostgreSQL updates (broadcasts from any student's phone)
    const unsubscribe = subscribeToBatchmateRealtime(
      (newMember) => {
        if (!isMounted || !newMember) return;
        setBatchmates((prev) => {
          if (prev.some(m => m.id === newMember.id)) return prev;
          const updated = [newMember, ...prev];
          localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      },
      (updatedMember) => {
        if (!isMounted || !updatedMember) return;
        setBatchmates((prev) => {
          const updated = prev.map(m => m.id === updatedMember.id ? { ...m, ...updatedMember } : m);
          localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        setCurrentUser((prev) => {
          if (prev?.id === updatedMember.id) {
            const merged = { ...prev, ...updatedMember };
            localStorage.setItem('site23_pera_currentUser_v4', JSON.stringify(merged));
            return merged;
          }
          return prev;
        });
      },
      (deletedId) => {
        if (!isMounted || !deletedId) return;
        setBatchmates((prev) => {
          const updated = prev.filter(m => m.id !== deletedId);
          localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    );

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist currentUser and keep active session in sync
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('site23_pera_currentUser_v4', JSON.stringify(currentUser));
        // Keep active session in sync
        const activeSession = getValidSession();
        if (activeSession) {
          activeSession.userId = currentUser.id;
          activeSession.regNo = currentUser.regNo;
          activeSession.email = currentUser.personalEmail || currentUser.universityEmail;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
        }
      } else {
        localStorage.removeItem('site23_pera_currentUser_v4');
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Save Google OAuth Client ID
  const saveGoogleClientId = (id) => {
    const cleanId = (id || '').trim();
    setGoogleClientId(cleanId);
    if (cleanId) {
      localStorage.setItem('site23_gdrive_client_id', cleanId);
    } else {
      localStorage.removeItem('site23_gdrive_client_id');
    }
  };

  // Sync photos from all 9 Google Drive folders using Drive API v3
  const syncDrivePhotos = async (tokenOverride) => {
    const token = tokenOverride || googleAccessToken;
    if (!token) {
      setDriveSyncError('No active Google OAuth session. Please connect your Google account.');
      return [];
    }

    setIsSyncingDrive(true);
    setDriveSyncError('');

    try {
      const photos = await syncAllBatchFolders(photoAlbums, token, (progress) => {
        setSyncProgress(progress);
      });

      setSyncedDrivePhotos(photos);
      localStorage.setItem('site23_synced_drive_photos_v1', JSON.stringify(photos));
      return photos;
    } catch (err) {
      console.error('Error syncing Drive photos:', err);
      setDriveSyncError(err.message || 'Could not sync photos from Google Drive.');
      return [];
    } finally {
      setIsSyncingDrive(false);
      setSyncProgress(null);
    }
  };

  // Direct Google Sign-In with OAuth2
  const loginWithGoogleOAuth = async (clientIdOverride) => {
    const clientId = clientIdOverride || googleClientId;
    if (!clientId) {
      throw new Error(
        'Google OAuth Client ID is not configured. Please enter your Google Client ID or check .env (VITE_GOOGLE_CLIENT_ID).'
      );
    }

    setDriveSyncError('');
    const tokenResponse = await requestGoogleDriveToken(clientId);
    const token = tokenResponse.access_token;
    setGoogleAccessToken(token);
    sessionStorage.setItem('site23_gdrive_access_token', token);

    // Fetch user profile from Google to identify student
    const userInfo = await fetchGoogleUserInfo(token);
    const authEmail = (userInfo.email || '').toLowerCase().trim();

    // Authenticate matching batchmate from the database
    let member = batchmates.find(m => 
      m.universityEmail?.toLowerCase() === authEmail ||
      m.personalEmail?.toLowerCase() === authEmail ||
      (m.linkedEmails && m.linkedEmails.map(e => e.toLowerCase()).includes(authEmail)) ||
      (m.id === 'e23020' && authEmail === 'peradeniyaguys@gmail.com')
    );

    // If not found by exact email, check if prefix matches an E-Number in the database
    if (!member) {
      const prefix = authEmail.split('@')[0];
      const normPrefix = normalizeRegNo(prefix);
      member = batchmates.find(m => normalizeRegNo(m.regNo) === normPrefix || m.id === normPrefix);

      // If recognized by registration prefix, associate/save this Google email into their database record!
      if (member) {
        const updatedMember = {
          ...member,
          personalEmail: member.personalEmail || authEmail
        };
        member = updatedMember;
        setBatchmates(prev => {
          const updated = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
          localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        updateMemberInCloud(member.id, { personalEmail: member.personalEmail }).catch(err => {
          console.error('Failed to sync personalEmail to Supabase cloud:', err);
        });
      }
    }

    // If still not found, check if it's an official university domain account (@eng.pdn.ac.lk)
    if (!member) {
      if (authEmail.endsWith(batchInfo.universityDomain.toLowerCase())) {
        const prefix = authEmail.split('@')[0];
        const normPrefix = normalizeRegNo(prefix);
        const formattedRegNo = prefix.toUpperCase().startsWith('E23')
          ? `E/23/${prefix.slice(3).padStart(3, '0')}`
          : `E/23/${prefix.toUpperCase()}`;

        member = {
          id: normPrefix,
          regNo: formattedRegNo,
          universityEmail: authEmail,
          personalEmail: '',
          name: userInfo.name || prefix.toUpperCase(),
          nickname: userInfo.given_name || prefix,
          birthday: '',
          photo: userInfo.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(prefix)}`,
          role: "E/23 Engineer",
          department: "Engineering Faculty",
          quote: "Details not included yet — will be updated upon first login.",
          detailsPending: true,
          social: {}
        };

        setBatchmates(prev => {
          const updated = [member, ...prev];
          localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        insertMemberInCloud(member).catch(err => {
          console.error('Failed to insert new member to Supabase cloud:', err);
        });
      } else {
        throw new Error(
          `Google account "${userInfo.email}" is not listed in the E/23 batch database.\n\n` +
          `Please sign in with your official university Google account (@eng.pdn.ac.lk), or link this personal email in your profile settings after logging in.`
        );
      }
    }

    // Create a secured session with 7-day expiration
    createSession(member, authEmail);
    setCurrentUser(member);
    return member;
  };

  // Authorize & Link Google Account directly from profile
  const linkGoogleAccountViaOAuth = async () => {
    if (!currentUser) throw new Error('Must be logged in to link account.');
    const tokenResponse = await requestGoogleDriveToken(googleClientId);
    const token = tokenResponse.access_token;
    setGoogleAccessToken(token);
    sessionStorage.setItem('site23_gdrive_access_token', token);

    const userInfo = await fetchGoogleUserInfo(token);
    const verifiedEmail = (userInfo.email || '').toLowerCase().trim();

    if (!verifiedEmail) throw new Error('Could not retrieve email from Google.');

    // Save into database for this user
    const updatedUser = {
      ...currentUser,
      personalEmail: verifiedEmail
    };

    setCurrentUser(updatedUser);
    setBatchmates(prev => {
      const updated = prev.map(m => m.id === updatedUser.id ? updatedUser : m);
      localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Update active session
    const activeSession = getValidSession();
    if (activeSession) {
      activeSession.email = verifiedEmail;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    }

    // Sync to Supabase cloud database
    updateMemberInCloud(currentUser.id, { personalEmail: verifiedEmail }).catch(err => {
      console.error('Failed to sync linked personalEmail to Supabase cloud:', err);
    });

    return { success: true, email: verifiedEmail };
  };

  // Logout (purges all active tokens & session keys)
  const logout = () => {
    setCurrentUser(null);
    setGoogleAccessToken('');
    sessionStorage.removeItem('site23_gdrive_access_token');
    localStorage.removeItem('site23_pera_currentUser_v4');
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Disconnect Drive
  const disconnectGoogleDrive = () => {
    setGoogleAccessToken('');
    sessionStorage.removeItem('site23_gdrive_access_token');
    setSyncedDrivePhotos([]);
    localStorage.removeItem('site23_synced_drive_photos_v1');
  };

  // Update own profile (safely persists profile edits with strict privilege validation)
  // Update own profile (safely persists profile edits with strict privilege validation)
  const updateProfile = async (updatedFields) => {
    if (!currentUser) return;

    // Security: Only allow safe presentation fields to be updated by a member
    const safeUpdates = {};
    if (updatedFields.name !== undefined && String(updatedFields.name || '').trim()) {
      safeUpdates.name = String(updatedFields.name).trim().slice(0, 100);
    }
    if (updatedFields.nickname !== undefined) safeUpdates.nickname = String(updatedFields.nickname || '').slice(0, 60);
    if (updatedFields.role !== undefined) safeUpdates.role = String(updatedFields.role || '').slice(0, 80);
    if (updatedFields.birthday !== undefined) safeUpdates.birthday = updatedFields.birthday || '';
    if (updatedFields.photo !== undefined) safeUpdates.photo = updatedFields.photo || '';
    if (updatedFields.quote !== undefined) safeUpdates.quote = String(updatedFields.quote || '').slice(0, 300);
    if (updatedFields.department !== undefined) safeUpdates.department = updatedFields.department || '';
    if (updatedFields.social !== undefined) safeUpdates.social = updatedFields.social || {};
    safeUpdates.detailsPending = false;

    // Security: Validate personalEmail uniqueness and prevent admin email spoofing
    if (updatedFields.personalEmail !== undefined) {
      const targetEmail = (updatedFields.personalEmail || '').trim().toLowerCase();
      if (targetEmail) {
        // Disallow linking protected admin emails to any other student ID
        if (
          (targetEmail === 'peradeniyaguys@gmail.com' || targetEmail === 'e23020@eng.pdn.ac.lk') &&
          currentUser.id !== 'e23020'
        ) {
          throw new Error('This email address is reserved for administrator access.');
        }

        // Disallow claiming another student's email
        const conflict = batchmates.find(m => 
          m.id !== currentUser.id && (
            m.personalEmail?.toLowerCase() === targetEmail ||
            m.universityEmail?.toLowerCase() === targetEmail
          )
        );
        if (conflict) {
          throw new Error(`Email "${targetEmail}" is already linked to another batchmate (${conflict.name}).`);
        }
      }
      safeUpdates.personalEmail = targetEmail;
    }

    // Security: Enforce immutability of academic identity
    const updatedUser = {
      ...currentUser,
      ...safeUpdates,
      id: currentUser.id,
      regNo: currentUser.regNo,
      universityEmail: currentUser.universityEmail
    };

    setCurrentUser(updatedUser);
    setBatchmates(prev => {
      const updated = prev.map(m => m.id === currentUser.id ? updatedUser : m);
      try {
        localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage quota warning:', storageErr);
      }
      return updated;
    });

    const activeSession = getValidSession();
    if (activeSession) {
      if (safeUpdates.personalEmail) activeSession.email = safeUpdates.personalEmail;
      if (safeUpdates.name) activeSession.name = safeUpdates.name;
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
      } catch (storageErr) {
        console.warn('Session storage warning:', storageErr);
      }
    }

    // Persist changes to Supabase cloud database permanently
    const cloudResult = await updateMemberInCloud(currentUser.id, safeUpdates);
    if (!cloudResult) {
      console.warn('⚠️ Cloud update could not be confirmed immediately. Local state preserved.');
    }

    return updatedUser;
  };

  // Strict Admin identification for E/23/020 (G. Arunothayan)
  const isAdmin = !!(currentUser && (
    (currentUser.id === 'e23020' || normalizeRegNo(currentUser.regNo) === 'e23020') &&
    (
      currentUser.universityEmail?.toLowerCase() === 'e23020@eng.pdn.ac.lk' ||
      currentUser.personalEmail?.toLowerCase() === 'peradeniyaguys@gmail.com'
    )
  ));

  // Determine if active user has photo upload & drive contributor permission
  const canUploadPhotos = !!(
    isAdmin || 
    currentUser?.id === 'e23020' || 
    currentUser?.canUploadPhotos || 
    currentUser?.social?.canUploadPhotos
  );

  // Admin capability: toggle upload/Drive contributor permission for a member
  const setMemberUploadPermission = async (memberId, allowed) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    if (memberId === 'e23020' && !allowed) {
      throw new Error('Super Admin always has upload access.');
    }

    const member = batchmates.find(m => m.id === memberId);
    if (!member) return false;

    const updatedSocial = {
      ...(member.social || {}),
      canUploadPhotos: !!allowed
    };

    const updatedMember = {
      ...member,
      canUploadPhotos: !!allowed,
      social: updatedSocial
    };

    setBatchmates(prev => {
      const updated = prev.map(m => m.id === memberId ? updatedMember : m);
      try {
        localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage quota warning:', storageErr);
      }
      return updated;
    });

    if (currentUser?.id === memberId) {
      setCurrentUser(prev => ({
        ...prev,
        canUploadPhotos: !!allowed,
        social: updatedSocial
      }));
    }

    return await updateMemberInCloud(memberId, {
      social: updatedSocial,
      canUploadPhotos: !!allowed
    });
  };

  // Admin capability: batch grant or revoke upload permissions
  const batchSetUploadPermissions = async (memberIds, allowed) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    const targetSet = new Set(memberIds);
    setBatchmates(prev => {
      const updated = prev.map(m => {
        if (!targetSet.has(m.id)) return m;
        const perm = m.id === 'e23020' ? true : !!allowed;
        return {
          ...m,
          canUploadPhotos: perm,
          social: {
            ...(m.social || {}),
            canUploadPhotos: perm
          }
        };
      });
      try {
        localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage quota warning:', storageErr);
      }
      return updated;
    });

    if (currentUser && targetSet.has(currentUser.id)) {
      const perm = currentUser.id === 'e23020' ? true : !!allowed;
      setCurrentUser(prev => ({
        ...prev,
        canUploadPhotos: perm,
        social: {
          ...(prev?.social || {}),
          canUploadPhotos: perm
        }
      }));
    }

    for (const id of memberIds) {
      if (id === 'e23020' && !allowed) continue;
      const target = batchmates.find(m => m.id === id);
      const social = { ...(target?.social || {}), canUploadPhotos: !!allowed };
      await updateMemberInCloud(id, {
        social,
        canUploadPhotos: !!allowed
      });
    }
  };

  // Admin capability: update any member permanently
  const updateMemberAsAdmin = async (memberId, updatedFields) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    const cleanFields = { ...updatedFields };
    if (cleanFields.personalEmail !== undefined) {
      cleanFields.personalEmail = cleanFields.personalEmail ? cleanFields.personalEmail.trim().toLowerCase() : '';
    }
    if (cleanFields.universityEmail !== undefined) {
      cleanFields.universityEmail = cleanFields.universityEmail ? cleanFields.universityEmail.trim().toLowerCase() : '';
    }
    if (cleanFields.canUploadPhotos !== undefined) {
      cleanFields.social = {
        ...(cleanFields.social || {}),
        canUploadPhotos: !!cleanFields.canUploadPhotos
      };
    }
    setBatchmates(prev => {
      const updated = prev.map(m => m.id === memberId ? { ...m, ...cleanFields } : m);
      try {
        localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('LocalStorage quota warning:', storageErr);
      }
      return updated;
    });
    if (currentUser?.id === memberId) {
      setCurrentUser(prev => ({ ...prev, ...cleanFields }));
    }
    // Sync update to Supabase cloud permanently
    return await updateMemberInCloud(memberId, cleanFields);
  };

  // Admin capability: add a new member
  const addNewMemberAsAdmin = (newMember) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    const cleanMember = {
      ...newMember,
      canUploadPhotos: !!newMember.canUploadPhotos,
      social: {
        ...(newMember.social || {}),
        canUploadPhotos: !!newMember.canUploadPhotos
      },
      personalEmail: (newMember.personalEmail || '').trim().toLowerCase(),
      universityEmail: (newMember.universityEmail || '').trim().toLowerCase()
    };
    setBatchmates(prev => {
      const updated = [cleanMember, ...prev];
      localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    // Sync insert to Supabase cloud
    insertMemberInCloud(cleanMember).catch(err => {
      console.error('Failed to insert new member to Supabase cloud:', err);
    });
  };

  // Admin capability: delete a member
  const deleteMemberAsAdmin = (memberId) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    setBatchmates(prev => {
      const updated = prev.filter(m => m.id !== memberId);
      localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    // Sync delete to Supabase cloud
    deleteMemberInCloud(memberId).catch(err => {
      console.error('Failed to delete member from Supabase cloud:', err);
    });
  };

  // Admin capability: reset batch roster to fresh defaults
  const resetBatchRosterToDefaults = () => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin privileges required.');
    }
    setBatchmates(initialBatchmates);
    localStorage.setItem(BATCHMATES_STORAGE_KEY, JSON.stringify(initialBatchmates));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      isAdmin,
      canUploadPhotos,
      batchmates,
      googleAccessToken,
      googleClientId,
      syncedDrivePhotos,
      isSyncingDrive,
      syncProgress,
      driveSyncError,
      saveGoogleClientId,
      syncDrivePhotos,
      loginWithGoogleOAuth,
      linkGoogleAccountViaOAuth,
      disconnectGoogleDrive,
      logout,
      updateProfile,
      updateMemberAsAdmin,
      setMemberUploadPermission,
      batchSetUploadPermissions,
      addNewMemberAsAdmin,
      deleteMemberAsAdmin,
      resetBatchRosterToDefaults
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
