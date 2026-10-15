import React, { useState, useEffect } from 'react';
import { 
  Cake, Sparkles, PartyPopper, Send, 
  ArrowRight, Flame 
} from 'lucide-react';
import { 
  isBirthdayToday, 
  formatBirthday, 
  getDaysUntilBirthday, 
  sortByUpcomingBirthday, 
  getTurningAge 
} from '../utils/birthdayUtils';

/**
 * BirthdayBanner: A sleek, high-impact celebratory banner designed specifically
 * for the Home feed. It announces today's celebrant or upcoming birthday countdown
 * and links directly to the full Birthday Poster & WhatsApp Story template.
 */
export default function BirthdayBanner({ 
  batchmates, 
  onTriggerConfetti, 
  onViewPoster,
  onOpenBirthdayGreeting 
}) {
  const [selectedCelebrantIndex, setSelectedCelebrantIndex] = useState(0);

  // Real celebrants whose birthday is today
  const realCelebrants = batchmates.filter(m => m.birthday && isBirthdayToday(m.birthday));
  
  // Sorted upcoming members with birthdays
  const withBirthdays = batchmates.filter(m => m.birthday && m.birthday.trim() !== '');
  const upcomingSorted = sortByUpcomingBirthday(withBirthdays);
  const nextCelebrant = upcomingSorted.find(m => getDaysUntilBirthday(m.birthday) > 0);

  // Auto-trigger confetti when there is a real birthday today
  useEffect(() => {
    if (realCelebrants.length > 0 && onTriggerConfetti) {
      const timer = setTimeout(() => {
        onTriggerConfetti();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [realCelebrants.length, onTriggerConfetti]);

  const handleShareWhatsAppChat = (person) => {
    const turningAge = getTurningAge(person.birthday);
    const ageText = turningAge ? ` on turning ${turningAge}` : '';
    const text = `🎂 *Happy Birthday ${person.name}!* 🎉%0A%0AWishing you an extraordinary year ahead filled with joy, success, and great engineering triumphs${ageText}!%0A%0A_Sent with love from the Class of E/23_ 🥳✨`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // =========================================================================
  // CASE 1: REAL BIRTHDAY TODAY -> CELEBRATION SPOTLIGHT BANNER
  // =========================================================================
  if (realCelebrants.length > 0) {
    const currentCelebrant = realCelebrants[selectedCelebrantIndex] || realCelebrants[0];
    const turningAge = getTurningAge(currentCelebrant.birthday);

    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border-2 border-amber-400/50 p-6 sm:p-7 shadow-2xl shadow-amber-500/10">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Celebrant Avatar & Birthday Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with luxury golden ring */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-rose-500 shadow-xl shadow-amber-500/30">
                <img
                  src={currentCelebrant.photo}
                  alt={currentCelebrant.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow whitespace-nowrap">
                🎂 Celebrant
              </div>
            </div>

            {/* Title, Name, Role, Age */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Today's Birthday Spotlight</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Happy Birthday, {currentCelebrant.name}! 🎉
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="font-mono font-bold text-amber-300 bg-slate-900/80 border border-slate-700 px-2 py-0.5 rounded-md">
                  {currentCelebrant.regNo}
                </span>
                {currentCelebrant.nickname && (
                  <span className="text-slate-300 font-semibold">
                    "{currentCelebrant.nickname}"
                  </span>
                )}
                {turningAge && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>Turning {turningAge} Today!</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 italic line-clamp-1 max-w-xl">
                "{currentCelebrant.quote || 'Another year bolder, wiser, and closer to our engineering dreams!'}"
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            {/* View Full Poster & WhatsApp Story */}
            <button
              onClick={onViewPoster}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              title="View full birthday poster & generate WhatsApp Status story"
            >
              <span>View Story Poster 📱</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {/* WhatsApp direct chat */}
              <button
                onClick={() => handleShareWhatsAppChat(currentCelebrant)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
                title="Send quick WhatsApp message"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wish on WhatsApp</span>
              </button>

              {/* Pop Confetti */}
              <button
                onClick={onTriggerConfetti}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                title="Pop Confetti"
              >
                <PartyPopper className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

        </div>

        {/* If multiple celebrants share today */}
        {realCelebrants.length > 1 && (
          <div className="mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-center gap-2">
            <span className="text-[11px] text-amber-300 font-semibold">Also celebrating today:</span>
            {realCelebrants.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedCelebrantIndex(idx)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedCelebrantIndex === idx
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // CASE 2: NO BIRTHDAY TODAY -> UPCOMING COUNTDOWN BANNER
  // =========================================================================
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Cake className="w-6 h-6" />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              <span>Class of E/23 Birthday Countdown</span>
            </div>

            {nextCelebrant ? (
              <p className="text-sm font-medium text-slate-200 mt-0.5">
                Next upcoming: <span className="text-amber-400 font-bold">{nextCelebrant.name}</span> on{' '}
                <span className="text-white font-semibold">{formatBirthday(nextCelebrant.birthday)}</span>{' '}
                <span className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full ml-1">
                  {getDaysUntilBirthday(nextCelebrant.birthday)} days to go!
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-400">All member birthdays are organized in the batch directory.</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onViewPoster && (
            <button
              onClick={onViewPoster}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/30 transition-all shadow-sm active:scale-95"
              title="Open Birthday Tab & Story Posters"
            >
              <span>Explore Birthday Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenBirthdayGreeting && (
            <button
              onClick={() => {
                if (onTriggerConfetti) onTriggerConfetti();
                onOpenBirthdayGreeting();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
              title="Preview the celebrant's login popup"
            >
              <Cake className="w-3.5 h-3.5 text-amber-400" />
              <span>Login Popup Preview</span>
            </button>
          )}

          <button
            onClick={onTriggerConfetti}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Confetti</span>
          </button>
        </div>

      </div>
    </div>
  );
}
