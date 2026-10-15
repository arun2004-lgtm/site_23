import React, { useState } from 'react';
import { 
  X, 
  Key, 
  FolderSync, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  Folder, 
  Check, 
  Copy, 
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { photoAlbums } from '../data/batchData';

export default function GoogleOAuthModal({ isOpen, onClose }) {
  const {
    googleClientId,
    saveGoogleClientId,
    googleAccessToken,
    loginWithGoogleOAuth,
    syncDrivePhotos,
    disconnectGoogleDrive,
    isSyncingDrive,
    syncProgress,
    driveSyncError,
    syncedDrivePhotos,
    currentUser
  } = useAuth();

  const [clientIdInput, setClientIdInput] = useState(googleClientId || '');
  const [isEditingClientId, setIsEditingClientId] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [localError, setLocalError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleSaveClientId = (e) => {
    e.preventDefault();
    saveGoogleClientId(clientIdInput);
    setIsEditingClientId(false);
    setLocalError('');
  };

  const handleConnectOAuth = async () => {
    setLocalError('');
    setIsConnecting(true);
    try {
      await loginWithGoogleOAuth(clientIdInput);
    } catch (err) {
      setLocalError(err.message || 'Failed to authenticate with Google OAuth.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTriggerSync = async () => {
    setLocalError('');
    try {
      await syncDrivePhotos();
    } catch (err) {
      setLocalError(err.message || 'Failed to sync Google Drive folders.');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const year1Folders = photoAlbums.filter(a => a.id.startsWith('y1') || a.year === 'Year 1');
  const year2Folders = photoAlbums.filter(a => a.id.startsWith('y2') || a.year === 'Year 2');

  const isConnected = !!googleAccessToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Google Drive Photo Stream Integration
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  API v3
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct OAuth 2.0 authorization for E/23 batch members to view restricted Google Drive albums.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-300 custom-scrollbar">

          {/* Connection Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isConnected 
              ? 'bg-emerald-950/30 border-emerald-500/30' 
              : 'bg-slate-850/60 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isConnected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isConnected ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">OAuth Status:</span>
                    {isConnected ? (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected & Authorized
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-400 rounded-full border border-slate-700">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isConnected 
                      ? `Active token present${currentUser ? ` for ${currentUser.name} (${currentUser.universityEmail || currentUser.regNo})` : ''}. Synced ${syncedDrivePhotos.length} photos from batch folders.`
                      : 'Connect your @eng.pdn.ac.lk or authorized account to load photos into the gallery.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isConnected ? (
                  <>
                    <button
                      onClick={handleTriggerSync}
                      disabled={isSyncingDrive}
                      className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                      {isSyncingDrive ? 'Syncing...' : 'Sync Folders Now'}
                    </button>
                    <button
                      onClick={disconnectGoogleDrive}
                      className="px-3 py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-500/30 font-medium rounded-xl text-xs transition-colors"
                      title="Disconnect OAuth Token"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectOAuth}
                    disabled={isConnecting}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Connect Google Account
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sync Progress Bar */}
            {isSyncingDrive && syncProgress && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-amber-300 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing: {syncProgress.currentAlbum} ({syncProgress.currentIndex} of {syncProgress.totalFolders})
                  </span>
                  <span className="text-slate-400 font-mono">
                    {syncProgress.photosFoundSoFar} photos found
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress.percent || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error display */}
          {(localError || driveSyncError) && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">OAuth / Drive Notice</p>
                <p className="mt-0.5">{localError || driveSyncError}</p>
              </div>
            </div>
          )}

          {/* Client ID Configuration */}
          <div className="p-4 rounded-2xl bg-slate-850/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white text-xs uppercase tracking-wider">
                  Google OAuth Client ID
                </span>
              </div>
              <button
                onClick={() => setIsEditingClientId(!isEditingClientId)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                {isEditingClientId ? 'Cancel' : 'Change Client ID'}
              </button>
            </div>

            {isEditingClientId ? (
              <form onSubmit={handleSaveClientId} className="space-y-2">
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="e.g. 298305600625-xxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setClientIdInput('298305600625-57kc5rilqcgrae3uinsqh1esngh84add.apps.googleusercontent.com');
                    }}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    Restore Default E/23 ID
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <code className="text-xs font-mono text-amber-300/90 truncate">
                  {googleClientId || 'No Client ID configured'}
                </code>
                <button
                  onClick={() => copyToClipboard(googleClientId, 'client-id')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Copy Client ID"
                >
                  {copiedText === 'client-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* 9 Connected Drive Folders List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" />
                {photoAlbums.length} Connected Batch Drive Folders
              </h4>
              <span className="text-[11px] text-slate-500">Year 1 & Year 2 Albums</span>
            </div>

            {/* Folder Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Year 1 */}
              <div className="p-3 bg-slate-850/30 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Year 1 Albums ({year1Folders.length} Folders)
                </div>
                <div className="space-y-1.5">
                  {year1Folders.map(folder => (
                    <a
                      key={folder.id}
                      href={folder.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs group transition-colors"
                    >
                      <div className="truncate mr-2">
                        <div className="text-white font-medium truncate group-hover:text-amber-300 transition-colors">
                          {folder.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          ID: {folder.folderId}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Year 2 */}
              <div className="p-3 bg-slate-850/30 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400/90 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Year 2 Albums ({year2Folders.length} Folders)
                </div>
                <div className="space-y-1.5">
                  {year2Folders.map(folder => (
                    <a
                      key={folder.id}
                      href={folder.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs group transition-colors"
                    >
                      <div className="truncate mr-2">
                        <div className="text-white font-medium truncate group-hover:text-emerald-300 transition-colors">
                          {folder.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          ID: {folder.folderId}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Setup / Help guide */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              How Option 1 Native Restricted Drive Vault Works
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>
                <span className="text-slate-300">Host Account:</span> The batch photo folders are owned by <code className="text-amber-300 font-mono">peradeniyaguys@gmail.com</code> and shared with batch members.
              </li>
              <li>
                <span className="text-slate-300">Zero Drive Permissions Requested:</span> When logging in with Google, students only verify their university identity (<code className="text-amber-300 font-mono">@eng.pdn.ac.lk</code>). The website never asks to see or download your personal Drive files!
              </li>
              <li>
                <span className="text-slate-300">Native Session Security:</span> Google verifies your permitted access directly through your browser session. Outsiders get "Access Denied" or can request access from the host.
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-850/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {syncedDrivePhotos.length > 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {syncedDrivePhotos.length} Google Drive photos loaded in gallery
              </span>
            ) : (
              <span>Click "Sync Folders Now" to fetch latest drive images</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
