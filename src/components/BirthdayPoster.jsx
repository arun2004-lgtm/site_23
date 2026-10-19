import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, 
  PartyPopper, Send, Flame, RefreshCw, 
  Download, Smartphone, CheckCircle2, Loader2 
} from 'lucide-react';
import { 
  isBirthdayToday, 
  formatBirthday, 
  getTurningAge,
  getBirthdayWishText,
  shareBirthdayWishViaWhatsApp
} from '../utils/birthdayUtils';
import { 
  downloadBirthdayStoryImage, 
  shareStoryToWhatsAppStatus 
} from '../utils/birthdayStoryGenerator';

/**
 * BirthdayPoster: The official commemorative Birthday Poster & 9:16 WhatsApp Story
 * Creator for the Birthday Tab. Displays the celebrant's photo in the golden framed
 * template placeholder with direct WhatsApp Status sharing and HD download capabilities.
 * 
 * NOTE: Visible ONLY on the celebrant's actual birthday date!
 */
export default function BirthdayPoster({ batchmates, onTriggerConfetti }) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);

  // WhatsApp status sharing states
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Find real celebrants whose birthday is today
  const realCelebrants = batchmates.filter(m => m.birthday && isBirthdayToday(m.birthday));
  const hasRealBirthdayToday = realCelebrants.length > 0;

  // Auto-trigger confetti when there's an actual birthday today
  useEffect(() => {
    if (hasRealBirthdayToday && onTriggerConfetti) {
      const timer = setTimeout(() => {
        onTriggerConfetti();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [hasRealBirthdayToday, onTriggerConfetti]);

  // VISIBILITY RULE: Poster is visible ONLY on the birthday date!
  if (!hasRealBirthdayToday || realCelebrants.length === 0) {
    return null;
  }

  const currentCelebrant = realCelebrants[selectedMemberIndex] || realCelebrants[0];
  const turningAge = currentCelebrant?.birthday ? getTurningAge(currentCelebrant.birthday) : null;

  const handleCopyWish = (person) => {
    const text = getBirthdayWishText(person);
    navigator.clipboard.writeText(text);
    setCopiedId(person.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsAppChat = shareBirthdayWishViaWhatsApp;

  // WhatsApp Status / Story generation & share
  const handleAddToWhatsAppStatus = async (person) => {
    setIsGeneratingStory(true);
    setStatusMessage('Generating 1080x1920 HD story template...');
    setStatusSuccess(false);

    try {
      const result = await shareStoryToWhatsAppStatus(person, (msg) => {
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
      setTimeout(() => {
        setStatusMessage('');
        setStatusSuccess(false);
      }, 8000);
    }
  };

  const handleDownloadStory = async (person) => {
    setIsGeneratingStory(true);
    setStatusMessage('Rendering high-res 1080x1920 graphic...');
    try {
      await downloadBirthdayStoryImage(person);
      setStatusSuccess(true);
      setStatusMessage('Story image (1080x1920 HD) saved to your device! 📸');
    } catch (err) {
      setStatusMessage('Download failed: ' + err.message);
    } finally {
      setIsGeneratingStory(false);
      setTimeout(() => {
        setStatusMessage('');
        setStatusSuccess(false);
      }, 5000);
    }
  };

  if (!currentCelebrant) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/10 p-1 sm:p-2">
      {/* Ambient atmospheric glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-slate-950/95 rounded-[22px] p-6 sm:p-8 md:p-10 backdrop-blur-2xl border border-amber-400/20">
        
        {/* Top Header Mode Bar: Real Birthday Celebration */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 font-bold">
            <PartyPopper className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🎉 Today's Official Birthday Celebration Poster!</span>
          </div>

          {/* Member Cycle / Switcher (if multiple celebrants today) */}
          {realCelebrants.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedMemberIndex((prev) => (prev + 1) % realCelebrants.length);
                  if (onTriggerConfetti) onTriggerConfetti();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors border border-amber-400/30 active:scale-95 shadow-sm"
                title="Switch to next birthday celebrant today"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch Celebrant ({selectedMemberIndex + 1}/{realCelebrants.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Celebrant Tabs (if multiple celebrants today) */}
        {realCelebrants.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {realCelebrants.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedMemberIndex(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedMemberIndex === idx
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🎂 {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Feedback Toast for WhatsApp Status Action */}
        {statusMessage && (
          <div className={`mb-6 p-3 rounded-2xl flex items-center gap-2.5 text-xs animate-fadeIn ${
            statusSuccess 
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' 
              : 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
          }`}>
            {isGeneratingStory ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            ) : statusSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Top Commemorative Header Plaque */}
        <div className="text-center space-y-1.5 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Faculty of Engineering • University of Peradeniya</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            Official Class of E/23 Birthday Spotlight & WhatsApp Story Template
          </div>
        </div>

        {/* Core Celebration Poster Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: THE 9:16 WHATSAPP STATUS STORY TEMPLATE PREVIEW */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* Smartphone-Style 9:16 Story Frame */}
            <div className="relative w-full max-w-[290px] sm:max-w-[310px] rounded-[30px] p-2 bg-gradient-to-b from-amber-400/40 via-slate-800 to-amber-500/30 shadow-2xl shadow-amber-500/20 border border-amber-400/50 group">
              
              {/* Story Screen Canvas Mockup (9:16 Aspect Ratio) */}
              <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 border border-slate-800 flex flex-col justify-between text-center min-h-[480px]">
                
                {/* Decorative ambient glows inside story */}
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Story Top Bar */}
                <div className="relative z-10 space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-[9px] font-bold text-amber-300 tracking-wider uppercase">
                    Faculty of Engineering • Pera
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 tracking-widest uppercase">
                    Batch E/23 • Birthday Spotlight
                  </div>
                  <div className="text-lg font-black bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400 bg-clip-text text-transparent tracking-tight leading-tight pt-1">
                    HAPPY BIRTHDAY!
                  </div>
                </div>

                {/* PHOTO IN TEMPLATE PLACEHOLDER */}
                <div className="relative z-10 my-2 flex justify-center">
                  <div className="relative">
                    {/* Golden Frame Border */}
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-rose-500 shadow-xl shadow-amber-500/30">
                      <img
                        src={currentCelebrant.photo}
                        alt={currentCelebrant.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>
                    
                    {/* Celebrant Ribbon */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow whitespace-nowrap">
                      🎂 Celebrant
                    </div>
                  </div>
                </div>

                {/* Celebrant Info on Story */}
                <div className="relative z-10 space-y-1">
                  <h4 className="text-base font-black text-white leading-tight">
                    {currentCelebrant.name}
                  </h4>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-300 font-semibold font-mono">
                    <span>{currentCelebrant.regNo}</span>
                    {currentCelebrant.nickname && <span>• "{currentCelebrant.nickname}"</span>}
                    {turningAge && <span className="text-rose-300">• Age {turningAge}</span>}
                  </div>

                  <p className="text-[9px] text-slate-400 line-clamp-1">
                    {currentCelebrant.role || 'Batchmate'} • {currentCelebrant.department || 'Pera Engineering'}
                  </p>

                  {/* Mini Blessing Box */}
                  <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-amber-400/20 text-[9px] text-slate-300 italic leading-snug line-clamp-2">
                    "{currentCelebrant.quote || 'Wishing you an extraordinary year filled with high achievements and happiness!'}"
                  </div>

                  <div className="text-[8px] text-slate-500 tracking-wider uppercase font-semibold pt-1">
                    Class of E/23 • University of Peradeniya
                  </div>
                </div>

                {/* Subtle 9:16 Watermark Pill */}
                <div className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-400/80 font-mono">
                  9:16 Story
                </div>
              </div>

            </div>

            {/* Status Action Buttons under template */}
            <div className="w-full max-w-[290px] sm:max-w-[310px] mt-4 space-y-2">
              {/* Primary: Add to WhatsApp Status */}
              <button
                onClick={() => handleAddToWhatsAppStatus(currentCelebrant)}
                disabled={isGeneratingStory}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-60"
                title="Share this ready-made template card directly to WhatsApp Status"
              >
                <Smartphone className="w-4 h-4 text-slate-950" />
                <span>Add to WhatsApp Status</span>
              </button>

              {/* Secondary: Download Story Image */}
              <button
                onClick={() => handleDownloadStory(currentCelebrant)}
                disabled={isGeneratingStory}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 transition-colors disabled:opacity-60"
                title="Download the full 1080x1920 HD graphic file"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download 1080x1920 Story (HD)</span>
              </button>
            </div>

          </div>

          {/* RIGHT: CELEBRATION DETAILS, WISHES & ACTIONS */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-4">
            
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center justify-center lg:justify-start gap-1.5">
                <PartyPopper className="w-4 h-4 text-amber-400" />
                <span>{hasRealBirthdayToday ? 'Official Birthday Spotlight' : 'Birthday Story Spotlight'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-amber-100 to-rose-400 bg-clip-text text-transparent leading-none">
                HAPPY BIRTHDAY!
              </h1>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {currentCelebrant.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {currentCelebrant.role || 'Batchmate'} • {currentCelebrant.department || 'Faculty of Engineering, University of Peradeniya'}
              </p>
            </div>

            {/* Turning Age & Stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300">
                {currentCelebrant.regNo}
              </span>
              {currentCelebrant.nickname && (
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                  "{currentCelebrant.nickname}"
                </span>
              )}
              {turningAge && (
                <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{hasRealBirthdayToday ? `Turning ${turningAge} Today!` : `Turning ${turningAge}`}</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300">
                {formatBirthday(currentCelebrant.birthday)}
              </span>
            </div>

            {/* Quote / Memory Plaque */}
            <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/60 border border-amber-400/30 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Birthday Message
              </div>
              <p className="italic text-slate-300 mt-1">
                "{currentCelebrant.quote || 'Another year bolder, wiser, and closer to our dreams. May this special year bring you boundless happiness, academic brilliance, and unforgettable engineering triumphs!'}"
              </p>
              <div className="text-right text-[11px] text-amber-400 font-semibold mt-2">
                — With love from the E/23 Family 🎓✨
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              {/* Pop Confetti */}
              <button
                onClick={onTriggerConfetti}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
              >
                <PartyPopper className="w-4 h-4 text-slate-950" />
                <span>Pop Confetti 🎊</span>
              </button>

              {/* Copy Birthday Wish */}
              <button
                onClick={() => handleCopyWish(currentCelebrant)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all transform active:scale-95 shadow-md"
              >
                {copiedId === currentCelebrant.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Wish Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copy Wish Message</span>
                  </>
                )}
              </button>

              {/* Direct WhatsApp Message to Celebrant */}
              <button
                onClick={() => handleShareWhatsAppChat(currentCelebrant)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 font-semibold text-xs border border-emerald-500/40 transition-all transform active:scale-95"
                title="Direct WhatsApp greeting"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send Direct WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
