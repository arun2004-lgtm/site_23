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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            23
          </div>
          <div>
            <div className="font-bold text-white text-base sm:text-lg flex items-center gap-1.5 leading-tight">
              Site 23 <span className="text-amber-400 text-xs font-normal px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">Class Portal</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Birthdays • Feed • Drive Archives</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Home Feed</span>
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

          {/* Quick Confetti button */}
          <button
            onClick={onTriggerConfetti}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            title="Celebrate!"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Wish!</span>
          </button>

          {/* AUTHENTICATION SECTION */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 ml-1">
              {/* Master Admin Control Button for E/23/020 */}
              {isAdmin && (
                <button
                  onClick={onOpenAdminControl}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                  title="Open E/23 Master Admin Control Panel (E/23/020)"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">Admin Control</span>
                </button>
              )}

              {/* Special Birthday Badge if it's the logged-in user's birthday */}
              {isMyBirthdayToday && (
                <button
                  onClick={onOpenBirthdayGreeting}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 animate-bounce transition-transform hover:scale-105"
                  title="Open your Birthday Celebration Wish!"
                >
                  <Cake className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Birthday! 🎉</span>
                </button>
              )}

              {/* User Avatar with Profile trigger */}
              <div 
                onClick={onOpenEditProfile}
                className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all group"
                title="Click to edit your profile details"
              >
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-amber-400"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono leading-none">
                    {currentUser.regNo}
                  </div>
                </div>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Sign out of batch account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </nav>
      </div>
    </header>
  );
}
