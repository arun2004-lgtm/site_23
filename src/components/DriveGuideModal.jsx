import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function DriveGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Google Drive Access Control Settings</h3>
            <p className="text-xs text-slate-400">How to ensure ONLY batch members can view the photos</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-5 text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">1</span>
              <span>Set Folder Sharing to "Restricted" in Google Drive</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              To make sure random visitors cannot see your photos:
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Open each folder in <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Drive</a>.</li>
              <li>Right-click the folder and click <strong>Share &rarr; Share</strong>.</li>
              <li>Under <strong>General access</strong>, select <span className="text-emerald-400 font-bold">"Restricted"</span> (do NOT choose "Anyone with the link").</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">2</span>
              <span>Add E/23 Batch Emails or Domain Access</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              In the "Add people, groups and calendar events" box:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 space-y-1">
              <div>Option A: Add batch group email: e.g. <span className="text-white">e23@eng.pdn.ac.lk</span></div>
              <div>Option B: Or paste the 32 batch emails (<span className="text-white">e23009@..., e23020@...</span>)</div>
            </div>
            <p className="text-[11px] text-slate-400">
              You can grant them <strong>"Viewer"</strong> access so they can view and download photos, or <strong>"Editor"</strong> so they can also upload!
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-400 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[11px]">3</span>
              <span>How It Works for Batchmates on this Website</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              When an E/23 batchmate clicks <strong>"Browse in App"</strong> or <strong>"Drive Folder"</strong> on the website:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Google checks their active browser account.</li>
              <li>If they are logged in with their allowed account, all photos open instantly!</li>
              <li>If an unauthorized person tries to access it, Google Drive shows <strong>"Access Denied / You Need Access"</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got it, Clear!
          </button>
        </div>
      </div>
    </div>
  );
}
