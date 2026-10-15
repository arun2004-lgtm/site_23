import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function Footer({ batchInfo, setActiveTab, onTriggerConfetti, onOpenGuide }) {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Batch Branding */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-lg">
              <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                23
              </span>
              <span>{batchInfo.title}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              "{batchInfo.motto}"
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
            <button 
              onClick={() => setActiveTab('home')} 
              className="hover:text-amber-400 transition-colors"
            >
              Home
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('birthdays')} 
              className="hover:text-amber-400 transition-colors"
            >
              Birthday Calendar
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('gallery')} 
              className="hover:text-rose-400 transition-colors"
            >
              Google Drive Photos
            </button>
            <span>•</span>
            <button 
              onClick={onOpenGuide} 
              className="hover:text-indigo-400 transition-colors"
            >
              Setup Guide
            </button>
            <span>•</span>
            <button 
              onClick={onTriggerConfetti} 
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Celebrate</span>
            </button>
          </div>

          {/* Copyright / Department */}
          <div className="text-xs text-slate-500 flex items-center justify-center md:justify-end gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for {batchInfo.batchName} ({batchInfo.year})</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
