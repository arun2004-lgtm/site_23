import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, GraduationCap, ShieldCheck, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { batchInfo } from '../data/batchData';
import GoogleOAuthModal from './GoogleOAuthModal';

export default function LoginScreen() {
  const { loginWithGoogleOAuth, googleClientId } = useAuth();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  // 1-Click Google OAuth Sign-In
  const handleGoogleOAuthClick = async () => {
    setError('');
    setIsLoading(true);

    if (!googleClientId) {
      setIsLoading(false);
      setIsOAuthModalOpen(true);
      return;
    }

    try {
      setSuccessMsg('Opening Google OAuth account chooser...');
      const member = await loginWithGoogleOAuth();
      setSuccessMsg(`Welcome, ${member.name}! Secure session established...`);
    } catch (err) {
      setSuccessMsg('');
      setError(err.message || 'Google authorization failed.');
      if (err.message?.includes('Client ID')) {
        setIsOAuthModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/20">
              23
            </div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base leading-tight">
                Faculty of Engineering • University of Peradeniya
              </div>
              <p className="text-xs text-amber-400 font-medium">Batch E/23 Official Member Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google OAuth 2.0 Protected</span>
            </div>

            <button
              onClick={() => setIsOAuthModalOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Google OAuth Client Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 mb-3 shadow">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Oct 10, 2024 • 4 Semesters Conquered</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In with Google
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Authorized E/23 batch portal. Sign in with your official university Google account or your registered personal Gmail.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed whitespace-pre-line">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Primary Action: Google OAuth Sign-In Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleOAuthClick}
              disabled={isLoading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] border border-slate-200 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isLoading ? 'Authorizing with Google...' : 'Sign in with Google Account'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographic OAuth 2.0 • University & Registered Personal Gmail</span>
            </div>
          </div>

          {/* Security & Access Guidelines Card */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Security & Access Policy:</span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-white">University Google:</strong> Sign in with your official <code className="text-amber-300">{batchInfo.universityDomain}</code> account.
              </li>
              <li>
                <strong className="text-white">Personal Gmail:</strong> Link your everyday Gmail in <strong className="text-slate-300">Profile Settings</strong> (or Admin register) for seamless future access.
              </li>
              <li>
                <strong className="text-white">Encrypted Session:</strong> Sessions are authenticated, secured, and valid for 7 days.
              </li>
            </ul>
          </div>

        </div>

        {/* Google Drive OAuth Modal */}
        <GoogleOAuthModal
          isOpen={isOAuthModalOpen}
          onClose={() => setIsOAuthModalOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-850">
        Faculty of Engineering • University of Peradeniya • Batch E/23 (2024 - 2028)
      </footer>
    </div>
  );
}
