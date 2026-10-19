import React from 'react';
import { Cake, Camera, Users, FolderArchive, ArrowRight, GraduationCap, Calendar } from 'lucide-react';

export default function Hero({ batchInfo, setActiveTab, onOpenGuide, batchmatesCount }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-12 transform-gpu isolate">
      {/* Background accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none transform-gpu" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/15 rounded-full blur-2xl sm:blur-3xl pointer-events-none transform-gpu" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Top badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Started {batchInfo.startedOn}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">4 Semesters Completed 🎓</span>
          <span className="text-slate-500">•</span>
          <span>{batchInfo.year}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Welcome to <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">{batchInfo.title}</span>
        </h1>

        {/* Subtitle / Motto */}
        <p className="mt-4 text-lg sm:text-xl text-slate-300 font-medium italic max-w-2xl mx-auto">
          "{batchInfo.motto}"
        </p>

        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {batchInfo.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('birthdays')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Cake className="w-4 h-4" />
            <span>Check Birthday Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-all hover:border-slate-600"
          >
            <Camera className="w-4 h-4 text-rose-400" />
            <span>Browse Year 1 & 2 Photos in Drive</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            <span>💡 How to update data & photos</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mt-10 pt-6 sm:mt-12 sm:pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-sm transform-gpu">
            <div className="text-xl sm:text-3xl font-extrabold text-amber-400">4 Semesters</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Conquered Together</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-sm transform-gpu">
            <div className="text-xl sm:text-3xl font-extrabold text-rose-400">Oct 10, 2024</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Inception Date</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-sm transform-gpu">
            <div className="text-xl sm:text-3xl font-extrabold text-indigo-400">{batchmatesCount || 45}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Batchmates</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-sm transform-gpu">
            <div className="text-xl sm:text-3xl font-extrabold text-emerald-400">1,200+</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Drive Photos Saved</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
