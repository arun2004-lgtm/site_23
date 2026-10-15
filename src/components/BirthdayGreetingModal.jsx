import React, { useState } from 'react';
import { 
  X, Cake, Sparkles, PartyPopper, Smartphone, 
  Download, CheckCircle2, Loader2, ArrowRight, Flame 
} from 'lucide-react';
import { getTurningAge } from '../utils/birthdayUtils';
import { 
  shareStoryToWhatsAppStatus, 
  downloadBirthdayStoryImage 
} from '../utils/birthdayStoryGenerator';

export default function BirthdayGreetingModal({ isOpen, onClose, user, onTriggerConfetti }) {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSuccess, setStatusSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const turningAge = getTurningAge(user.birthday);
  const firstName = user.name?.split(' ')[0] || user.name;

  const handleShareToWhatsApp = async () => {
    setIsGeneratingStory(true);
    setStatusMessage('Generating your 1080x1920 HD birthday story...');
    setStatusSuccess(false);

    try {
      const result = await shareStoryToWhatsAppStatus(user, (msg) => {
        setStatusMessage(msg);
      });

      if (result.success) {
        setStatusSuccess(true);
        if (result.method === 'native-share') {
          setStatusMessage('Story shared successfully!');
        } else if (result.method === 'download-and-open') {
          setStatusMessage('Story graphic downloaded! In WhatsApp, select "My Status" and attach the photo 📸');
        }
      } else {
        setStatusMessage(result.error || 'Could not share to status.');
      }
    } catch (err) {
      console.error('Error generating WhatsApp status story:', err);
      setStatusMessage('Failed to create story: ' + err.message);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleDownloadStory = async () => {
    setIsGeneratingStory(true);
    setStatusMessage('Rendering high-res story graphic...');
    try {
      await downloadBirthdayStoryImage(user);
      setStatusSuccess(true);
      setStatusMessage('Story image (1080x1920 HD) saved to your device! 📸');
    } catch (err) {
      setStatusMessage('Download failed: ' + err.message);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/25 text-center overflow-hidden my-6 animate-in zoom-in-95">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
          title="Close greeting"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Academic Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Faculty of Engineering • University of Peradeniya</span>
        </div>

        {/* Large Celebrant Photo with Glowing Gold Halo */}
        <div className="relative inline-block my-2">
          <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 via-yellow-300 to-rose-500 rounded-full blur-md opacity-80 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-400 bg-slate-900 shadow-xl">
            <img
              src={user.photo}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Party Hat / Cake Icon */}
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-2 rounded-full shadow-lg border-2 border-slate-950 animate-bounce">
            <Cake className="w-4 h-4" />
          </div>
        </div>

        {/* Greetings Typography */}
        <div className="space-y-1.5 mt-3">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center justify-center gap-1.5">
            <PartyPopper className="w-4 h-4 text-amber-400" />
            <span>It's Your Birthday Today!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-400 bg-clip-text text-transparent tracking-tight">
            HAPPY BIRTHDAY, {firstName.toUpperCase()}! 🎂
          </h2>

          <h3 className="text-sm font-semibold text-white">
            {user.name}
            {user.nickname && <span className="text-amber-400 font-normal"> ("{user.nickname}")</span>}
          </h3>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold border border-slate-700">
              {user.regNo}
            </span>
            {turningAge && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Turning {turningAge} Today!</span>
              </span>
            )}
          </div>
        </div>

        {/* Personalized Message Plaque */}
        <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-amber-400/30 text-xs sm:text-sm text-slate-200 leading-relaxed text-left shadow-inner">
          <p className="italic text-slate-300">
            "{user.quote || 'Another year bolder, wiser, and closer to our dreams. May your day be filled with endless joy, academic triumphs, and memorable celebrations!'}"
          </p>
          <div className="text-right text-[11px] text-amber-400 font-bold mt-2">
            — With warmest love from the entire Class of E/23 🎓✨
          </div>
        </div>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div className={`mb-4 p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ${
            statusSuccess 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
              : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
          }`}>
            {isGeneratingStory ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            ) : statusSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : null}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Add to WhatsApp Status */}
          <button
            onClick={handleShareToWhatsApp}
            disabled={isGeneratingStory}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Smartphone className="w-4 h-4 text-slate-950" />
            <span>Post My Birthday Story on WhatsApp Status 📲</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Download Story Image */}
            <button
              onClick={handleDownloadStory}
              disabled={isGeneratingStory}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Story</span>
            </button>

            {/* Pop Confetti */}
            <button
              onClick={onTriggerConfetti}
              className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
              <span>Pop Confetti 🎊</span>
            </button>
          </div>

          {/* Dismiss & Enter Portal */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Thank You! Enter Batch Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
