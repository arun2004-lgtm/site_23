import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Camera, 
  ExternalLink, 
  Image as ImageIcon, 
  UploadCloud, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  Folder, 
  Search, 
  Shuffle, 
  Maximize2, 
  Minimize2,
  Grid,
  List,
  LayoutGrid,
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DriveFolderViewerModal from './DriveFolderViewerModal';
import ShufflePlaceholder from './ShufflePlaceholder';
import MemoryShuffler from './MemoryShuffler';
import GoogleOAuthModal from './GoogleOAuthModal';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export default function PhotoGallery({ 
  albums, 
  selectedAlbumId,
  onSelectAlbum,
  onOpenLightbox, 
  onPromptLogin, 
  onOpenUploadModal 
}) {
  const { 
    isLoggedIn, 
    currentUser, 
    syncedDrivePhotos, 
    isSyncingDrive, 
    syncProgress 
  } = useAuth();

  const [viewMode, setViewMode] = useState('liveVault'); // 'liveVault' (Native Restricted Drive Vault), 'stream' (Featured Photos Grid), or 'albums' (9 Drive Folders)
  const [activeVaultFolder, setActiveVaultFolder] = useState(() => {
    if (selectedAlbumId) {
      const found = albums.find(a => a.id === selectedAlbumId);
      if (found) return found;
    }
    return albums[0] || null;
  });
  const [vaultLayout, setVaultLayout] = useState('grid'); // 'grid' | 'list'
  const [isVaultExpanded, setIsVaultExpanded] = useState(false);
  const [vaultRefreshKey, setVaultRefreshKey] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // React pattern: Adjust state during render when selectedAlbumId changes
  const [prevSelectedAlbumId, setPrevSelectedAlbumId] = useState(selectedAlbumId);
  if (selectedAlbumId !== prevSelectedAlbumId) {
    setPrevSelectedAlbumId(selectedAlbumId);
    if (selectedAlbumId) {
      const target = albums.find(a => a.id === selectedAlbumId);
      if (target) {
        setActiveVaultFolder(target);
        setViewMode('liveVault');
      }
    }
  }

  const vaultSectionRef = useRef(null);

  // Smoothly scroll to the vault section and folder tab when selected album changes
  useEffect(() => {
    if (selectedAlbumId) {
      const scrollTimer = setTimeout(() => {
        if (vaultSectionRef.current) {
          vaultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const tabBtn = document.getElementById(`vault-tab-${selectedAlbumId}`);
        if (tabBtn) {
          tabBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }, 120);

      return () => clearTimeout(scrollTimer);
    }
  }, [selectedAlbumId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriveFolder, setSelectedDriveFolder] = useState(null);
  const [showAccessHelp, setShowAccessHelp] = useState(false);
  const [showLoadingHelp, setShowLoadingHelp] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState(0);

  // Filter options
  const filterTabs = [
    { id: 'ALL', label: 'All Photos & Folders' },
    { id: 'Year 1', label: 'Year 1' },
    { id: 'Year 2', label: 'Year 2' },
    { id: 'Trips', label: 'Batch Trips 🎒' },
    { id: 'Birthdays', label: 'Birthdays 🎂' },
    { id: 'Kovil', label: 'Kovil 🛕' },
    { id: 'Matches', label: 'Matches 🏏' },
    { id: 'Random', label: 'Random 📸' }
  ];

  // Extract all individual photos across the 9 albums + Google Drive synced photos into a unified Featured Photo Stream
  const allPhotos = useMemo(() => {
    // 1. Curated photos from albums
    const albumPhotos = albums.flatMap(album => 
      (album.samplePhotos || []).map((photo, pIdx) => ({
        ...photo,
        id: `${album.id}-${pIdx}`,
        url: formatGoogleDriveImageUrl(photo.url),
        rawUrl: photo.url,
        albumTitle: album.title,
        albumId: album.id,
        year: album.year,
        type: album.type,
        driveFolderUrl: album.driveFolderUrl,
        folderId: album.folderId
      }))
    );

    // 2. Photos fetched live from Google Drive API v3
    const livePhotos = (syncedDrivePhotos || []).map(p => ({
      ...p,
      url: formatGoogleDriveImageUrl(p.url)
    }));

    // Merge live photos with album photos (avoiding duplicates)
    const seenUrls = new Set(livePhotos.map(p => p.url));
    const combined = [...livePhotos, ...albumPhotos.filter(p => !seenUrls.has(p.url))];

    return combined;
  }, [albums, syncedDrivePhotos]);

  // Filter photos based on tab and search query
  const filteredPhotos = useMemo(() => {
    let result = allPhotos.filter(photo => {
      // Tab filter
      if (selectedFilter !== 'ALL') {
        if (selectedFilter === 'Year 1' || selectedFilter === 'Year 2') {
          if (photo.year !== selectedFilter) return false;
        } else if (photo.type !== selectedFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCaption = (photo.caption || '').toLowerCase().includes(q);
        const matchesAlbum = (photo.albumTitle || '').toLowerCase().includes(q);
        const matchesType = (photo.type || '').toLowerCase().includes(q);
        const matchesYear = (photo.year || '').toLowerCase().includes(q);
        if (!matchesCaption && !matchesAlbum && !matchesType && !matchesYear) {
          return false;
        }
      }

      return true;
    });

    // Shuffle if requested (deterministic seed based on shuffleOrder for pure render)
    if (shuffleOrder > 0) {
      const seed = shuffleOrder * 1664525 + 1013904223;
      result = [...result].sort((a, b) => {
        const hashA = (String(a.id).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0) ^ seed) % 1000;
        const hashB = (String(b.id).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0) ^ seed) % 1000;
        return hashA - hashB;
      });
    }

    return result;
  }, [allPhotos, selectedFilter, searchQuery, shuffleOrder]);

  // Filtered album cards for the 'albums' view mode
  const filteredAlbums = useMemo(() => {
    return albums.filter(album => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'Year 1' || selectedFilter === 'Year 2') {
        return album.year === selectedFilter;
      }
      return album.type === selectedFilter;
    });
  }, [albums, selectedFilter]);

  const handleShuffleStream = () => {
    setShuffleOrder(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>E/23 Official Google Drive Archives</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Year 1 & Year 2 Photo Archives
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Every photo from our 4 semesters is loaded directly here on the platform and connected to the batch Google Drive folders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onOpenUploadModal}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>+ Upload Photos</span>
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlocked ({currentUser.regNo})</span>
                </div>

                {/* Google Drive Native Vault Status */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Drive Vault Active</span>
                </div>
                <button
                  onClick={() => setIsOAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  title={`View all ${albums.length} connected Google Drive folders`}
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{albums.length} Folders</span>
                </button>
              </>
            ) : (
              <button
                onClick={onPromptLogin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Unlock Drive</span>
              </button>
            )}

            <button
              onClick={() => setShowLoadingHelp(!showLoadingHelp)}
              className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Load Photos</span>
            </button>

            <button
              onClick={() => setShowAccessHelp(!showAccessHelp)}
              className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Drive Security</span>
            </button>
          </div>
        </div>

        {/* Live Drive Sync Progress Banner */}
        {isSyncingDrive && syncProgress && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 text-amber-300 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
              <span>
                Syncing Google Drive: <strong className="text-white">{syncProgress.currentAlbum}</strong> ({syncProgress.currentIndex} of {syncProgress.totalFolders})
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                {syncProgress.photosFoundSoFar} photos fetched
              </span>
              <div className="w-28 sm:w-36 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress.percent || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* How to Load Photos Help Banner (Toggleable) */}
        {showLoadingHelp && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-rose-500/30 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How to Load & Feature Any Google Drive Photo on this Gallery:</span>
              </span>
              <button 
                onClick={() => setShowLoadingHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            
            <p className="leading-relaxed">
              This platform automatically converts any Google Drive link into a direct web image and features it in this gallery!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">1</span>
                  <span>Direct Drive Links</span>
                </div>
                <p className="text-slate-400">
                  In <code className="text-rose-300">src/data/batchData.js</code>, you can paste any link like <code className="text-amber-300">drive.google.com/file/d/FILE_ID/view</code> under <code className="text-rose-300">samplePhotos</code>. Our platform transforms it automatically into a live high-res image!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">2</span>
                  <span>In-App Uploader</span>
                </div>
                <p className="text-slate-400">
                  Click the <strong>"+ Upload Photos"</strong> button above to upload photos directly from your phone or laptop. Supports JPG, PNG, and <strong>iPhone HEIC</strong> (auto-converted to web format).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">3</span>
                  <span>Google Drive API Sync</span>
                </div>
                <p className="text-slate-400">
                  You can also connect a Google Drive API Key to dynamically pull every image inside the 9 folder IDs without typing URLs manually!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access Settings Explainer Card (Toggleable) */}
        {showAccessHelp && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>How Google Drive "Restricted Access" Works on this Website:</span>
              </span>
              <button 
                onClick={() => setShowAccessHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            
            <p className="leading-relaxed">
              <strong>Yes!</strong> By configuring each folder's Google Drive sharing setting to <span className="text-emerald-400 font-semibold">"Restricted"</span>, only Google accounts explicitly invited (or university accounts with <code className="text-amber-300">@eng.pdn.ac.lk</code>) can view or download the photos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">1</span>
                  <span>Set to "Restricted"</span>
                </div>
                <p className="text-slate-400">
                  In Google Drive, right-click the folder &rarr; Share &rarr; Under General Access, choose <strong>"Restricted"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">2</span>
                  <span>Add Batch Emails</span>
                </div>
                <p className="text-slate-400">
                  Add the batch group email or individual classmate emails (`e23xxx@eng.pdn.ac.lk` or their personal Gmails).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">3</span>
                  <span>100% Protected</span>
                </div>
                <p className="text-slate-400">
                  When someone clicks the folder on this website, Google verifies their login. Outsiders get "Access Denied"!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Switcher & Category Filter Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Left: View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setViewMode('liveVault')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'liveVault'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-300" />
              <span>🔒 Live Restricted Vault</span>
            </button>

            <button
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'stream'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>📸 Featured Photo Stream ({allPhotos.length})</span>
            </button>

            <button
              onClick={() => setViewMode('albums')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'albums'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>📁 {albums.length} Drive Folders</span>
            </button>
          </div>

          {/* Right: Search & Random Shuffle (Stream mode) */}
          {viewMode === 'stream' && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photo memories..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={handleShuffleStream}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-semibold transition-colors"
                title="Shuffle photo order"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Memory Shuffle Showcase Reel */}
      <MemoryShuffler onOpenLightbox={onOpenLightbox} />

      {/* ============================================================== */}
      {/* VIEW 1: FEATURED PHOTO STREAM (ALL PHOTOS LOADED ON PLATFORM) */}
      {/* ============================================================== */}
      {viewMode === 'stream' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredPhotos.length}</strong> photos
              {selectedFilter !== 'ALL' && <span> in <span className="text-amber-400">{selectedFilter}</span></span>}
              {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
            </span>
            <span className="text-slate-500 text-[11px]">Click any photo to open fullscreen viewer</span>
          </div>

          {filteredPhotos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Camera className="w-10 h-10 mx-auto text-slate-600" />
              <h4 className="text-base font-bold text-white">No photos matched your filter</h4>
              <p className="text-xs text-slate-400">Try changing the category filter or clearing the search box.</p>
              <button
                onClick={() => { setSelectedFilter('ALL'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => onOpenLightbox(filteredPhotos, idx, photo.driveFolderUrl)}
                  className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
                >
                  {/* Photo Display Frame */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Batch photo'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Category & Year Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-rose-300 border border-slate-750">
                        {photo.year}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-slate-750">
                        {photo.type}
                      </span>
                    </div>

                    {/* Quick Lightbox Action Button on Hover */}
                    <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="p-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white border border-slate-750 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-colors">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Caption & Folder Info */}
                  <div className="p-3.5 bg-slate-900/90 flex flex-col justify-between flex-1 border-t border-slate-800/80">
                    <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {photo.caption || photo.albumTitle}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[170px] text-slate-400 flex items-center gap-1">
                        <Folder className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{photo.albumTitle}</span>
                      </span>

                      <a
                        href={photo.driveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 shrink-0 transition-colors font-medium text-[10px]"
                        title="Open folder in Google Drive"
                      >
                        <span>Drive</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: 9 GOOGLE DRIVE ALBUM FOLDERS                           */}
      {/* ============================================================== */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map(album => (
            <div
              key={album.id}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl"
            >
              <div>
                {/* Cover Image & Overlay with Dynamic Shuffle Placeholder */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <ShufflePlaceholder
                    images={album.samplePhotos && album.samplePhotos.length > 0 ? album.samplePhotos.map(p => p.url) : [album.coverImage]}
                    fallbackImage={album.coverImage}
                    alt={album.title}
                    interval={4000}
                    showControls={true}
                    className="w-full h-full"
                    onClick={(idx) => onOpenLightbox(album.samplePhotos || [{ url: album.coverImage, caption: album.title }], idx, album.driveFolderUrl)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-rose-300 border border-slate-750">
                      {album.year}
                    </span>
                    <span className="px-2 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-slate-750">
                      {album.type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      <Lock className="w-3 h-3" />
                      <span>Restricted</span>
                    </span>
                  </div>
                </div>

                {/* Album Details */}
                <div className="p-4 space-y-3">
                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {album.description}
                  </p>

                  {/* Sample Photo Highlights */}
                  {album.samplePhotos && album.samplePhotos.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Highlights ({album.samplePhotos.length})</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {album.samplePhotos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => onOpenLightbox(album.samplePhotos, pIdx, album.driveFolderUrl)}
                            className="relative h-20 rounded-lg overflow-hidden cursor-pointer group/thumb border border-slate-800 hover:border-amber-400/60 transition-colors"
                          >
                            <img
                              src={formatGoogleDriveImageUrl(photo.url)}
                              alt={photo.caption || 'Preview'}
                              className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 group-hover/thumb:bg-transparent transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-slate-800/80 mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDriveFolder(album)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition-colors border border-slate-700"
                  title="Browse folder inside website"
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browse in App</span>
                </button>

                <a
                  href={album.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
                  title="Open directly in Google Drive"
                >
                  <span>Drive Folder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* VIEW 1: LIVE RESTRICTED GOOGLE DRIVE VAULT (ALL 9 FOLDERS)     */}
      {/* ============================================================== */}
      {viewMode === 'liveVault' && (
        <div ref={vaultSectionRef} className="space-y-4 scroll-mt-24">
          {/* Vault Folder Selector Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google Drive Native Session Active • Zero Personal Drive Access Requested</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                  <span>{activeVaultFolder?.title || 'Select a Folder'}</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-800 text-rose-300 border border-slate-700 rounded-full">
                    {activeVaultFolder?.year}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeVaultFolder?.description}
                </p>
              </div>

              {/* Top Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Layout Toggle (Grid / List) */}
                <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setVaultLayout('grid')}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                      vaultLayout === 'grid' 
                        ? 'bg-slate-800 text-amber-400 font-bold shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setVaultLayout('list')}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                      vaultLayout === 'list' 
                        ? 'bg-slate-800 text-amber-400 font-bold shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">List</span>
                  </button>
                </div>

                {/* Reload / Refresh Button */}
                <button
                  onClick={() => setVaultRefreshKey(prev => prev + 1)}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white transition-colors"
                  title="Reload Google Drive folder"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen Expand Toggle */}
                <button
                  onClick={() => setIsVaultExpanded(!isVaultExpanded)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  title={isVaultExpanded ? "Exit Fullscreen" : "Fullscreen Vault View"}
                >
                  {isVaultExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isVaultExpanded ? "Minimize" : "Fullscreen"}</span>
                </button>

                {/* Open in Google Drive */}
                <a
                  href={activeVaultFolder?.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  <span>Open in Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Folder selection pills: Grouped by Year 1 & Year 2 */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              {/* Year 1 Albums */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider shrink-0 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                  Year 1
                </span>
                {albums.filter(a => a.id.startsWith('y1') || a.year === 'Year 1').map(album => (
                  <button
                    key={album.id}
                    id={`vault-tab-${album.id}`}
                    onClick={() => {
                      setActiveVaultFolder(album);
                      if (onSelectAlbum) onSelectAlbum(album.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeVaultFolder?.id === album.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow ring-2 ring-amber-400/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{album.title.replace('Year 1: ', '')}</span>
                  </button>
                ))}
              </div>

              {/* Year 2 Albums */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                  Year 2
                </span>
                {albums.filter(a => a.id.startsWith('y2') || a.year === 'Year 2').map(album => (
                  <button
                    key={album.id}
                    id={`vault-tab-${album.id}`}
                    onClick={() => {
                      setActiveVaultFolder(album);
                      if (onSelectAlbum) onSelectAlbum(album.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeVaultFolder?.id === album.id
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow ring-2 ring-emerald-400/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{album.title.replace('Year 2: ', '')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Photo Highlights for Active Album */}
          {activeVaultFolder?.samplePhotos && activeVaultFolder.samplePhotos.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>{activeVaultFolder.title} — Key Highlights ({activeVaultFolder.samplePhotos.length})</span>
                </span>
                <span className="text-slate-400 text-[11px]">Click photo to open full-screen lightbox</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeVaultFolder.samplePhotos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => onOpenLightbox(activeVaultFolder.samplePhotos, pIdx, activeVaultFolder.driveFolderUrl)}
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-slate-800 hover:border-amber-400/60 transition-all hover:scale-[1.02] shadow-sm bg-slate-950"
                  >
                    <img
                      src={formatGoogleDriveImageUrl(photo.url)}
                      alt={photo.caption || activeVaultFolder.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-[11px] text-white font-medium line-clamp-1">
                        {photo.caption || activeVaultFolder.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* iPhone / Safari Cookie Notice & Instant App Shortcut */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <span className="text-base shrink-0">📱</span>
              <div>
                <span className="font-bold text-amber-300">iPhone / Safari User?</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  If Google displays <em>"Can't access your Google Account"</em> below, Apple Safari is blocking third-party iframe cookies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href={activeVaultFolder?.driveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>Open in Drive App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowIosTip(!showIosTip)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors shrink-0"
              >
                {showIosTip ? 'Hide Guide' : 'How to Fix on iPhone'}
              </button>
            </div>
          </div>

          {/* Collapsible iOS Safari Fix Guide */}
          {showIosTip && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 space-y-2.5 animate-in fade-in">
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>To load Google Drive directly inside the webpage on iPhone:</span>
                <button onClick={() => setShowIosTip(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Open iPhone <strong>Settings</strong> app.</li>
                <li>Scroll down and tap <strong>Safari</strong> (or <strong>Apps ➔ Safari</strong> on iOS 18).</li>
                <li>Under <strong>Privacy & Security</strong>, turn <strong>OFF</strong> <span className="text-amber-300 font-semibold">"Prevent Cross-Site Tracking"</span>.</li>
                <li>Return here and refresh — the entire Google Drive folder will load directly inside the frame!</li>
              </ol>
            </div>
          )}

          {/* Full-bleed Embedded Google Drive Iframe Grid */}
          <div className={`rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl relative transition-all ${
            isVaultExpanded 
              ? 'fixed inset-4 z-50 flex flex-col max-w-7xl mx-auto my-auto h-[92vh] border-amber-500/40 ring-1 ring-amber-500/30' 
              : 'h-[750px] sm:h-[820px]'
          }`}>
            {isVaultExpanded && (
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">{activeVaultFolder?.title}</span>
                </div>
                <button
                  onClick={() => setIsVaultExpanded(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            )}
            <iframe
              key={`${activeVaultFolder?.folderId}-${vaultLayout}-${vaultRefreshKey}`}
              src={`https://drive.google.com/embeddedfolderview?id=${activeVaultFolder?.folderId}#${vaultLayout}`}
              title={activeVaultFolder?.title || 'Google Drive Folder'}
              className="w-full h-full border-0 flex-1"
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-slate-200">100% Private & Protected:</strong> Verified natively via your active Google browser session. Only accounts permitted by host (<code className="text-amber-300">peradeniyaguys@gmail.com</code>) can view or download these photos.
              </span>
            </span>
            <span className="text-slate-500 font-mono text-[11px] shrink-0">Folder ID: {activeVaultFolder?.folderId}</span>
          </div>
        </div>
      )}

      {/* Upload Callout Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Have more batch photos from Year 1 or Year 2?</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Upload photos directly into our batch archive under your E-Number ({currentUser?.regNo}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Photos</span>
          </button>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-700"
          >
            <span>Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Google Drive Folder Embed Viewer Modal */}
      {selectedDriveFolder && (
        <DriveFolderViewerModal
          isOpen={!!selectedDriveFolder}
          album={selectedDriveFolder}
          onClose={() => setSelectedDriveFolder(null)}
        />
      )}

      {/* Google OAuth & Drive Sync Modal */}
      <GoogleOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
      />
    </div>
  );
}
