import React from 'react';
import { Cake, ChevronRight, Clock } from 'lucide-react';
import { 
  sortByUpcomingBirthday, 
  getDaysUntilBirthday, 
  formatBirthday 
} from '../utils/birthdayUtils';

export default function UpcomingBirthdays({ batchmates, onSelectMember, onTriggerConfetti }) {
  // Sort members with confirmed birthdays by who has their birthday next
  const withBirthdays = batchmates.filter(m => m.birthday && m.birthday.trim() !== '');
  const sorted = sortByUpcomingBirthday(withBirthdays);
  // Get upcoming members within the next 45 days (or top 4)
  const upcoming = sorted.slice(0, 4);

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upcoming Birthdays</h3>
            <p className="text-xs text-slate-400">Classmates celebrating soon</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-750">
          Next in line
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {upcoming.map(member => {
          const daysLeft = getDaysUntilBirthday(member.birthday);
          const isToday = daysLeft === 0;

          return (
            <div
              key={member.id}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02] ${
                isToday
                  ? 'bg-gradient-to-b from-amber-500/10 to-rose-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:border-amber-400/50 transition-colors shadow-sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                      {member.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{member.role || member.nickname}</p>

                  {/* Countdown Badge */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      isToday 
                        ? 'bg-amber-400 text-slate-950 animate-pulse'
                        : daysLeft <= 7
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      <Cake className="w-3 h-3" />
                      {isToday ? 'Today!' : daysLeft === 1 ? 'Tomorrow!' : `In ${daysLeft} days`}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatBirthday(member.birthday)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member regNo / Details footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono text-slate-400 font-semibold">{member.regNo}</span>
                <button
                  onClick={() => {
                    if (isToday) onTriggerConfetti();
                    if (onSelectMember) onSelectMember(member);
                  }}
                  className="text-amber-400/80 hover:text-amber-400 flex items-center gap-0.5"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
