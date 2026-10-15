import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { batchInfo, photoAlbums } from './data/batchData';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BirthdayBanner from './components/BirthdayBanner';
import BirthdayPoster from './components/BirthdayPoster';
import UpcomingBirthdays from './components/UpcomingBirthdays';
import BatchDirectory from './components/BatchDirectory';
import PhotoGallery from './components/PhotoGallery';
import UploadPhotoModal from './components/UploadPhotoModal';
import LoginModal from './components/LoginModal';
import LoginScreen from './components/LoginScreen';
import EditProfileModal from './components/EditProfileModal';
import LightboxModal from './components/LightboxModal';
import DriveGuideModal from './components/DriveGuideModal';
import BirthdayGreetingModal from './components/BirthdayGreetingModal';
import AdminControlModal from './components/AdminControlModal';
import ShufflePlaceholder from './components/ShufflePlaceholder';
import MemoryShuffler from './components/MemoryShuffler';
import Footer from './components/Footer';
import { Camera, ArrowRight, Sparkles } from 'lucide-react';
import { isBirthdayToday } from './utils/birthdayUtils';

function AppContent() {
  const { batchmates, currentUser, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);
  const [isBirthdayGreetingOpen, setIsBirthdayGreetingOpen] = useState(false);
  const [isAdminControlOpen, setIsAdminControlOpen] = useState(false);
  const [adminEditTarget, setAdminEditTarget] = useState(null);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    photos: [],
    currentIndex: 0,
    driveFolderUrl: ''
  });

  // Confetti trigger function
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#f43f5e', '#6366f1', '#10b981', '#ec4899']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 200);
  };

  // Lightbox helpers
  const handleOpenLightbox = (photos, index = 0, driveFolderUrl = '') => {
    setLightbox({
      isOpen: true,
      photos: photos || [],
      currentIndex: index,
      driveFolderUrl: driveFolderUrl || ''
    });
  };

  const handleCloseLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  const handleNextPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length
    }));
  };

  const handlePrevPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
    }));
  };

  // Automatically pop up celebratory birthday wish modal when the birthday person logs in
  React.useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.birthday) {
      if (isBirthdayToday(currentUser.birthday)) {
        const sessionKey = `site23_bday_modal_seen_${currentUser.id}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(sessionKey)) {
          const timer = setTimeout(() => {
            setIsBirthdayGreetingOpen(true);
            triggerConfetti();
            sessionStorage.setItem(sessionKey, 'true');
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isLoggedIn, currentUser]);

  // Require login first before accessing the whole website
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 pb-20 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerConfetti={triggerConfetti}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenBirthdayGreeting={() => setIsBirthdayGreetingOpen(true)}
        onOpenAdminControl={() => setIsAdminControlOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* First Login Profile Details Notice Banner */}
        {(currentUser?.detailsPending || !currentUser?.birthday) && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Welcome to E/23 Portal, {currentUser.name}!</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    First Login Setup
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your profile details (birthday, photo, nickname, and quote) are not included yet. Complete them now to join the batch birthday countdown!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md active:scale-95 shrink-0"
            >
              <span>Complete My Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* HOME FEED TAB */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Birthday Spotlight Banner on Home Feed */}
            <BirthdayBanner
              batchmates={batchmates}
              onTriggerConfetti={triggerConfetti}
              onViewPoster={() => setActiveTab('birthdays')}
              onOpenBirthdayGreeting={() => setIsBirthdayGreetingOpen(true)}
            />

            {/* Hero Banner with Stats */}
            <Hero
              batchInfo={batchInfo}
              setActiveTab={setActiveTab}
              onOpenGuide={() => setIsGuideOpen(true)}
            />

            {/* Upcoming Birthdays Carousel / Grid */}
            <UpcomingBirthdays
              batchmates={batchmates}
              onTriggerConfetti={triggerConfetti}
              onSelectMember={() => setActiveTab('birthdays')}
            />

            {/* Live Memory Shuffler Reel on Home Feed */}
            <MemoryShuffler
              onOpenLightbox={handleOpenLightbox}
            />

            {/* Teaser for Google Drive Photo Albums */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <Camera className="w-4 h-4" />
                    <span>Google Drive Archive Highlights</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">Our Treasured Albums</h3>
                  <p className="text-xs text-slate-400">All photos are stored and organized in our batch Google Drive.</p>
                </div>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <span>Explore All Albums</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Album Teaser Grid with Live Shuffling Placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {photoAlbums.slice(0, 4).map(album => (
                  <div
                    key={album.id}
                    onClick={() => setActiveTab('gallery')}
                    className="group cursor-pointer rounded-2xl bg-slate-950 border border-slate-850 hover:border-rose-500/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <ShufflePlaceholder
                        images={album.samplePhotos && album.samplePhotos.length > 0 ? album.samplePhotos.map(p => p.url) : [album.coverImage]}
                        fallbackImage={album.coverImage}
                        alt={album.title}
                        interval={4500}
                        showControls={false}
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-slate-200 border border-slate-750 z-10">
                        {album.year}
                      </span>
                    </div>

                    <div className="p-3.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                        {album.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {album.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* BIRTHDAYS TAB */}
        {activeTab === 'birthdays' && (
          <div className="space-y-8">
            {/* Birthday Celebration Poster & WhatsApp Story on Birthday Tab */}
            <BirthdayPoster
              batchmates={batchmates}
              onTriggerConfetti={triggerConfetti}
            />
            <BatchDirectory
              onTriggerConfetti={triggerConfetti}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onOpenAdminEditMember={(member) => {
                setAdminEditTarget(member);
                setIsAdminControlOpen(true);
              }}
            />
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div>
            <PhotoGallery
              albums={photoAlbums}
              onOpenLightbox={handleOpenLightbox}
              onOpenGuide={() => setIsGuideOpen(true)}
              onPromptLogin={() => setIsLoginOpen(true)}
              onOpenUploadModal={() => setIsUploadPhotoOpen(true)}
            />
          </div>
        )}
      </main>

      {/* MODALS */}

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isUploadPhotoOpen}
        onClose={() => setIsUploadPhotoOpen(false)}
        onPhotoUploaded={() => {
          // Photo uploaded feedback
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Birthday Greeting Modal for Celebrant */}
      <BirthdayGreetingModal
        isOpen={isBirthdayGreetingOpen}
        onClose={() => setIsBirthdayGreetingOpen(false)}
        user={currentUser}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Admin Control Modal for E/23/020 */}
      <AdminControlModal
        isOpen={isAdminControlOpen}
        initialMemberToEdit={adminEditTarget}
        onClose={() => {
          setIsAdminControlOpen(false);
          setAdminEditTarget(null);
        }}
      />

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <LightboxModal
          photos={lightbox.photos}
          currentIndex={lightbox.currentIndex}
          driveFolderUrl={lightbox.driveFolderUrl}
          onClose={handleCloseLightbox}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
        />
      )}

      {/* Google Drive Guide Modal */}
      <DriveGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <Footer
        batchInfo={batchInfo}
        setActiveTab={setActiveTab}
        onTriggerConfetti={triggerConfetti}
        onOpenGuide={() => setIsGuideOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
