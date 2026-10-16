import React from 'react';
import { Cake, Camera, Home, Sparkles, LogIn, LogOut, Edit3, Crown } from 'lucide-react';
import { isBirthdayToday } from '../utils/birthdayUtils';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onTriggerConfetti, 
  onOpenLogin,
  onOpenEditProfile,
  onOpenBirthdayGreeting,
  onOpenAdminControl
}) {
  const { currentUser, isLoggedIn, logout, batchmates, isAdmin } = useAuth();
  
  // Count how many birthdays today
  const todayBirthdaysCount = batchmates.filter(m => isBirthdayToday(m.birthday)).length;
  const isMyBirthdayToday = currentUser?.birthday && isBirthdayToday(currentUser.birthday);

  return (
    <>
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand / Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              23
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base md:text-lg flex items-center gap-1.5 leading-tight">
                Site 23 
                <span className="hidden sm:inline-flex text-amber-400 text-[10px] sm:text-xs font-normal px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Class Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">Birthdays • Feed • Drive Archives</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('birthdays')}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'birthdays'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cake className="w-4 h-4" />
              <span>Birthdays</span>
              {todayBirthdaysCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-slate-950 bg-amber-400 rounded-full animate-bounce">
                  {todayBirthdaysCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Drive Photos</span>
            </button>
          </nav>

          {/* Right Action / Auth Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Confetti button for desktop */}
            <button
              onClick={onTriggerConfetti}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              title="Celebrate!"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Wish!</span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Master Admin Control Button for E/23/020 */}
                {isAdmin && (
                  <button
                    onClick={onOpenAdminControl}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
                    title="Open E/23 Master Admin Control Panel (E/23/020)"
                  >
                    <Crown className="w-3.5 h-3.5 text-slate-950" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                {/* Special Birthday Badge if it's the logged-in user's birthday */}
                {isMyBirthdayToday && (
                  <button
                    onClick={onOpenBirthdayGreeting}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 animate-bounce transition-transform hover:scale-105 shrink-0"
                    title="Open your Birthday Celebration Wish!"
                  >
                    <Cake className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Birthday! 🎉</span>
                  </button>
                )}

                {/* User Avatar with Profile trigger */}
                <div 
                  onClick={onOpenEditProfile}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-all group shrink-0"
                  title="Click to edit your profile details"
                >
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-amber-400"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[90px]">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono leading-none">
                      {currentUser.regNo}
                    </div>
                  </div>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-400 hidden sm:block" />
                </div>

                {/* Logout button */}
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors shrink-0"
                  title="Sign out of batch account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly & 100% Responsive) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-1.5 safe-area-bottom shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Home</span>
            {activeTab === 'home' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 animate-pulse" />
            )}
          </button>

          {/* Birthdays Tab */}
          <button
            onClick={() => setActiveTab('birthdays')}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'birthdays'
                ? 'text-amber-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Cake className="w-5 h-5 mb-0.5" />
              {todayBirthdaysCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-black rounded-full bg-amber-400 text-slate-950 leading-tight">
                  {todayBirthdaysCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Birthdays</span>
            {activeTab === 'birthdays' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 animate-pulse" />
            )}
          </button>

          {/* Drive Photos Tab */}
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'gallery'
                ? 'text-rose-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Drive Photos</span>
            {activeTab === 'gallery' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-0.5 animate-pulse" />
            )}
          </button>

          {/* Profile Quick Button */}
          {isLoggedIn ? (
            <button
              onClick={onOpenEditProfile}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-amber-300 transition-all"
            >
              <div className="relative w-5 h-5 mb-0.5">
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-amber-400/80"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 border border-slate-950 rounded-full" />
              </div>
              <span className="text-[10px]">Profile</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-amber-400 transition-all"
            >
              <LogIn className="w-5 h-5 mb-0.5 text-amber-400" />
              <span className="text-[10px]">Sign In</span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
}
