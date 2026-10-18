import React, { useState } from 'react';
import { 
  X, User, Calendar, Camera, Briefcase, Quote, Check, Sparkles, 
  ShieldCheck, Link2, Upload, Loader2, RotateCcw, 
  CloudUpload, Settings2, CheckCircle2, AlertCircle, 
  ChevronRight, ChevronLeft, Globe, AtSign, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatGoogleDriveImageUrl, processImageFile, isHeicFile, uploadImageToGoogleDrive } from '../utils/imageUtils';
import { getDefaultAvatar } from '../data/batchData';

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile, linkGoogleAccountViaOAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'photo' | 'account' | 'social'

  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [linkGoogleMsg, setLinkGoogleMsg] = useState('');
  const [linkGoogleSuccess, setLinkGoogleSuccess] = useState(false);

  const [isConvertingPhoto, setIsConvertingPhoto] = useState(false);
  const [heicConverted, setHeicConverted] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState(false);
  const [driveUploadError, setDriveUploadError] = useState('');
  const [showDriveConfig, setShowDriveConfig] = useState(false);
  const [gasUrlInput, setGasUrlInput] = useState(() => 
    localStorage.getItem('site23_gas_upload_url') || import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || ''
  );
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || '',
    nickname: currentUser?.nickname || '',
    birthday: currentUser?.birthday || '',
    photo: currentUser?.photo || '',
    role: currentUser?.role || '',
    department: currentUser?.department || '',
    quote: currentUser?.quote || '',
    personalEmail: currentUser?.personalEmail || '',
    instagram: currentUser?.social?.instagram || '',
    linkedin: currentUser?.social?.linkedin || '',
    phone: currentUser?.social?.phone || ''
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [prevUser, setPrevUser] = useState(currentUser);

  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    setFormData({
      name: currentUser?.name || '',
      nickname: currentUser?.nickname || '',
      birthday: currentUser?.birthday || '',
      photo: currentUser?.photo || '',
      role: currentUser?.role || '',
      department: currentUser?.department || '',
      quote: currentUser?.quote || '',
      personalEmail: currentUser?.personalEmail || '',
      instagram: currentUser?.social?.instagram || '',
      linkedin: currentUser?.social?.linkedin || '',
      phone: currentUser?.social?.phone || ''
    });
    if (currentUser?.detailsPending) {
      setActiveTab('info');
    }
  }

  if (!isOpen || !currentUser) return null;

  const tabs = [
    { id: 'info', label: 'Basic Info', icon: User, desc: 'Name, birthday & quote' },
    { id: 'photo', label: 'Photo & Avatar', icon: Camera, desc: 'Drive upload & picture' },
    { id: 'account', label: 'Login & Security', icon: ShieldCheck, desc: 'Personal Gmail link' },
    { id: 'social', label: 'Social & Links', icon: Globe, desc: 'Instagram & LinkedIn' }
  ];

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);

  const handleNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDriveUploadError('');
    setDriveUploadSuccess(false);

    const isHeic = isHeicFile(file);
    if (isHeic) {
      setIsConvertingPhoto(true);
      setHeicConverted(true);
    }

    try {
      const dataUrl = await processImageFile(file);
      // Immediately set local preview
      setFormData(prev => ({ ...prev, photo: dataUrl }));

      // Check if Google Apps Script Web App upload endpoint is configured
      const activeGasUrl = (gasUrlInput || localStorage.getItem('site23_gas_upload_url') || import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || '').trim();

      if (activeGasUrl) {
        setIsUploadingToDrive(true);
        const safeName = (formData.name || currentUser.name || 'member').replace(/[^a-zA-Z0-9]/g, '_');
        const safeReg = (currentUser.regNo || 'e23').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${safeReg}_${safeName}_${Date.now()}.jpg`;

        try {
          const directDriveUrl = await uploadImageToGoogleDrive(dataUrl, filename, activeGasUrl);
          if (directDriveUrl) {
            setFormData(prev => ({ ...prev, photo: directDriveUrl }));
            setDriveUploadSuccess(true);
          }
        } catch (uploadErr) {
          console.warn('Google Drive direct upload failed, keeping local image:', uploadErr);
          setDriveUploadError(uploadErr.message || 'Drive upload error');
        } finally {
          setIsUploadingToDrive(false);
        }
      }
    } catch (err) {
      console.error('Error processing profile photo:', err);
    } finally {
      setIsConvertingPhoto(false);
    }
  };

  const handleTestGasConnection = async () => {
    if (!gasUrlInput.trim()) {
      setTestStatus('error');
      setTestMessage('Please paste your Google Apps Script Web App URL first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage('Pinging Google Apps Script endpoint...');
    try {
      const res = await fetch(gasUrlInput.trim());
      const data = await res.json();
      if (data.status === 'ok') {
        localStorage.setItem('site23_gas_upload_url', gasUrlInput.trim());
        setTestStatus('success');
        setTestMessage(data.message || 'Connected to peradeniyaguys@gmail.com Drive successfully!');
      } else {
        setTestStatus('error');
        setTestMessage('Connected, but unexpected response: ' + JSON.stringify(data));
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage('Connection failed: ' + err.message + '. Ensure "Who has access" is set to "Anyone" when deploying.');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        nickname: formData.nickname,
        birthday: formData.birthday,
        photo: formatGoogleDriveImageUrl(formData.photo.trim()),
        role: formData.role,
        department: formData.department,
        quote: formData.quote,
        personalEmail: formData.personalEmail.trim().toLowerCase(),
        detailsPending: false,
        social: {
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          phone: formData.phone
        }
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setHeicConverted(false);
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkGoogleOAuth = async () => {
    setIsLinkingGoogle(true);
    setLinkGoogleMsg('');
    try {
      const res = await linkGoogleAccountViaOAuth();
      setFormData(prev => ({ ...prev, personalEmail: res.email }));
      setLinkGoogleSuccess(true);
      setLinkGoogleMsg(`Verified and linked to ${res.email}! Saved into the batch database.`);
    } catch (err) {
      setLinkGoogleSuccess(false);
      setLinkGoogleMsg(err.message || 'Google authorization failed.');
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const getPhotoSourceBadge = () => {
    const photo = formData.photo || '';
    if (photo.includes('thumbnail?id=') || photo.includes('drive.google.com')) {
      return { text: 'Google Drive Cloud', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (photo.startsWith('data:')) {
      return { text: 'Custom Image Upload', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
    if (photo.includes('dicebear')) {
      return { text: 'Default Initials Avatar', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { text: 'Web Image URL', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const photoBadge = getPhotoSourceBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-6 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={formData.photo || currentUser.photo}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/10"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {formData.name || currentUser.name}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-semibold border border-slate-700">
                  {currentUser.regNo}
                </span>
                {currentUser.detailsPending && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 animate-pulse">
                    Setup Incomplete
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Customize your batch profile, graduation memory & login credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 pt-3 bg-slate-950/40 border-b border-slate-800/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                    isActive
                      ? 'bg-amber-400/10 border border-amber-400/40 text-amber-300 shadow-sm'
                      : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold truncate leading-none mb-0.5">
                      {tab.label}
                    </span>
                    <span className="hidden sm:block text-[10px] text-slate-500 truncate leading-none">
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Profile and credentials successfully saved! Closing setup...</span>
          </div>
        )}

        {/* Form Body (Scrollable with max height) */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Arunothayan G."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm transition-colors"
                  />
                </div>

                {/* Nickname / Moniker */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-sky-400" />
                    <span>Nickname / Call Sign</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g. Arun, Chief"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Birthday Date & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Date of Birth *</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm [color-scheme:dark] transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Powers birthday alerts, upcoming birthday badges & anniversary spotlight.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-rose-400" />
                    <span>Batch Role / Tag</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Batch Rep, Web Lead, Sports Lead"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department / Faculty</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Faculty of Engineering, University of Peradeniya"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm transition-colors"
                />
              </div>

              {/* Memorable Quote */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Memorable Quote or Campus Memory</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="What made your first 4 semesters at Pera Engineering unforgettable?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs sm:text-sm transition-colors leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO & AVATAR */}
          {activeTab === 'photo' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Photo Preview & Control Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={formData.photo || currentUser.photo}
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 rounded-full p-1 shadow">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-white text-sm">Active Avatar</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${photoBadge.color}`}>
                      {photoBadge.text}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload your favorite portrait or keep the generated vector initials. Supports standard photos and iPhone HEIC format with automatic compression.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {/* Upload Button */}
                    <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-all">
                      <Upload className="w-3.5 h-3.5 text-slate-950" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*,.heic,.HEIC,.heif,.HEIF"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo: getDefaultAvatar(prev.name || currentUser.name) }))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                      title="Reset to clean vector initials avatar"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset to Initials</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status messages for photo upload */}
              {isConvertingPhoto && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Converting iPhone HEIC photo to web-compatible JPEG...</span>
                </div>
              )}

              {isUploadingToDrive && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Uploading photo directly to Google Drive (peradeniyaguys@gmail.com)...</span>
                </div>
              )}

              {driveUploadSuccess && !isUploadingToDrive && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Photo saved directly to Google Drive folder! Permanent high-res link active ☁️</span>
                </div>
              )}

              {driveUploadError && !isUploadingToDrive && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Notice: {driveUploadError} (image saved locally as fallback)</span>
                </div>
              )}

              {heicConverted && !isConvertingPhoto && !driveUploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>iPhone HEIC photo auto-converted to high-res JPEG ✨</span>
                </div>
              )}

              {/* Image URL / Google Drive Share Link */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Or Paste Image Link (Google Drive, Web URL)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... or direct image link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Paste any Google Drive file link — our engine automatically converts it into a high-res embed thumbnail.
                </p>
              </div>

              {/* Collapsible Google Drive Cloud Uploader Settings */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowDriveConfig(!showDriveConfig)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Drive Cloud Uploader Settings</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    gasUrlInput ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {gasUrlInput ? 'Connected 🟢' : 'Setup Option 3 ⚪'}
                  </span>
                </button>

                {showDriveConfig && (
                  <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <CloudUpload className="w-3.5 h-3.5 text-indigo-400" />
                        Google Apps Script Web App Endpoint
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">peradeniyaguys@gmail.com</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Deployed Web App URL that saves student photos into your Google Drive folder.
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={gasUrlInput}
                        onChange={(e) => setGasUrlInput(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleTestGasConnection}
                        disabled={testStatus === 'testing'}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
                      >
                        {testStatus === 'testing' ? 'Testing...' : 'Test & Save'}
                      </button>
                    </div>

                    {testMessage && (
                      <div className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                        testStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}>
                        {testStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{testMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LOGIN & SECURITY */}
          {activeTab === 'account' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Permanent University Identity */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>University Email (Official Academic ID)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    Permanent Verified
                  </span>
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                  {currentUser.universityEmail}
                </div>
                <p className="text-[11px] text-slate-500">
                  This address is anchored to your batch record (<span className="text-amber-400 font-mono">{currentUser.regNo}</span>) and cannot be altered.
                </p>
              </div>

              {/* Personal Email Linking Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-900/40 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span>Link Personal Email for 1-Click Sign-In</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Personal Google / Gmail Email Address
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                      placeholder="e.g. yourname@gmail.com"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleLinkGoogleOAuth}
                      disabled={isLinkingGoogle}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition-all shrink-0 disabled:opacity-60"
                      title="Authorize and link your current active Google account directly"
                    >
                      {isLinkingGoogle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                      )}
                      <span>{isLinkingGoogle ? 'Verifying...' : 'Link with Google'}</span>
                    </button>
                  </div>
                </div>

                {linkGoogleMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    linkGoogleSuccess
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}>
                    {linkGoogleSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{linkGoogleMsg}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Database Synchronization & Google OAuth:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    When you save or link this email, it is immediately registered in the E/23 batch database. You can then sign in directly with Google OAuth using this personal account from any phone or PC!
                  </p>
                </div>
              </div>

              {/* Profile Completion Status */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Profile Setup Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                  currentUser.detailsPending 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentUser.detailsPending ? 'Pending First Save' : 'Active & Completed ✓'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL & LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram Handle</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace(/^@/, '') })}
                      placeholder="username"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>LinkedIn Username</span>
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="e.g. arunothayan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contact Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 7X XXX XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Only visible to verified batch members within the directory.
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls (Sticky Bottom) */}
          <div className="pt-4 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Tab navigation stepper buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrevTab}
                disabled={currentTabIndex === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNextTab}
                disabled={currentTabIndex === tabs.length - 1}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cancel & Save Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
