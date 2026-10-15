import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Cake, 
  Calendar, 
  Phone, 
  Sparkles, 
  Check, 
  Edit3,
  UserCheck,
  Crown
} from 'lucide-react';
import { 
  MONTH_SHORT, 
  parseBirthday, 
  formatBirthday, 
  getDaysUntilBirthday, 
  isBirthdayToday,
  sortByUpcomingBirthday
} from '../utils/birthdayUtils';
import { useAuth } from '../context/AuthContext';

// Custom clean SVGs for social platforms
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function BatchDirectory({ onTriggerConfetti, onOpenEditProfile, onOpenAdminEditMember }) {
  const { batchmates, currentUser, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [sortBy, setSortBy] = useState('upcoming'); // 'upcoming' | 'alpha'
  const [copiedId, setCopiedId] = useState(null);

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    let result = batchmates.filter(member => {
      // Search filter
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.regNo && member.regNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.nickname && member.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Month filter
      if (selectedMonth !== 'ALL') {
        const parsed = parseBirthday(member.birthday);
        if (!parsed || parsed.month !== parseInt(selectedMonth, 10)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'upcoming') {
      result = sortByUpcomingBirthday(result);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [batchmates, searchQuery, selectedMonth, sortBy]);

  const handleCopyWish = (person) => {
    const text = `Hey ${person.name}! Happy Birthday! 🎂🎉 Hope you have an awesome celebration! Greetings from Batch '23! ✨`;
    navigator.clipboard.writeText(text);
    setCopiedId(person.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Directory Header & Controls */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Cake className="w-6 h-6 text-amber-400" />
              <span>Batchmate Directory & Birthdays</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Controlled by Registration IDs. Find your batchmates and update your personal record.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setSortBy('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'upcoming' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upcoming First
              </button>
              <button
                onClick={() => setSortBy('alpha')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'alpha' 
                    ? 'bg-amber-500 text-slate-950 shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Name (A-Z)
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, Registration ID (e.g. 23CS01), Role, or Department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        {/* Month Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedMonth('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMonth === 'ALL'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Months
          </button>
          {MONTH_SHORT.map((m, idx) => {
            const monthNum = idx + 1;
            const isSelected = selectedMonth === monthNum.toString();
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(monthNum.toString())}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredMembers.length} batchmates</span>
        {selectedMonth !== 'ALL' && (
          <span>Filtered by: {MONTH_SHORT[parseInt(selectedMonth, 10) - 1]}</span>
        )}
      </div>

      {/* Classmates Card Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Cake className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base text-slate-300 font-medium">No batchmates match your search or filter.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing the search or choosing "All Months".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map(member => {
            const isToday = isBirthdayToday(member.birthday);
            const daysLeft = getDaysUntilBirthday(member.birthday);
            const isMe = currentUser && currentUser.id === member.id;

            return (
              <div
                key={member.id}
                className={`group relative flex flex-col justify-between rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isMe
                    ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Birthday Ribbon / Badge */}
                {isToday ? (
                  <div className="absolute top-3 right-3 z-10 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow animate-pulse">
                    🎂 Birthday Today!
                  </div>
                ) : isMe ? (
                  <div className="absolute top-3 right-3 z-10 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Your Account</span>
                  </div>
                ) : member.detailsPending ? (
                  <div className="absolute top-3 right-3 z-10 bg-slate-800/90 text-amber-400/90 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full border border-slate-700 shadow">
                    Pending First Login
                  </div>
                ) : null}

                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    
                    {/* Registration ID pill */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono font-bold text-amber-300">
                      ID: {member.regNo}
                    </span>

                    {/* Nickname pill */}
                    {member.nickname && (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-amber-300">
                        "{member.nickname}"
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {member.name}
                        </h3>
                        {isMe ? (
                          <button
                            onClick={onOpenEditProfile}
                            className="p-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                            title="Edit your details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : isAdmin ? (
                          <button
                            onClick={() => onOpenAdminEditMember && onOpenAdminEditMember(member)}
                            className="p-1 px-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors flex items-center gap-1 text-[10px] font-bold border border-amber-500/30"
                            title={`Edit ${member.name} as Master Admin (E/23/020)`}
                          >
                            <Crown className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        ) : null}
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium">{member.role || 'Batchmate'}</p>
                      {member.department && (
                        <p className="text-[11px] text-slate-400">{member.department}</p>
                      )}
                    </div>

                    {/* Birthday & Countdown details */}
                    {member.birthday ? (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-200 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>{formatBirthday(member.birthday)}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{member.regNo}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[11px]">
                          <span className="text-slate-400">Countdown:</span>
                          <span className={`font-bold ${
                            isToday 
                              ? 'text-amber-400' 
                              : daysLeft <= 14 
                              ? 'text-rose-400' 
                              : 'text-indigo-400'
                          }`}>
                            {isToday ? 'Happening Today!' : `${daysLeft} days to go`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-amber-400/90 font-medium text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Birthday Not Included Yet</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Will be included when logging in for the first time.
                        </p>
                      </div>
                    )}

                    {/* Memory Quote */}
                    {member.quote && (
                      <p className="text-xs text-slate-400 italic line-clamp-2 pl-2 border-l-2 border-amber-400/40">
                        "{member.quote}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 mt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  {/* Social links */}
                  <div className="flex items-center gap-2 text-slate-400">
                    {member.social?.instagram && (
                      <a
                        href={`https://instagram.com/${member.social.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-rose-400 transition-colors"
                        title={`@${member.social.instagram}`}
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                    {member.social?.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${member.social.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-sky-400 transition-colors"
                        title="LinkedIn"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    )}
                    {member.social?.phone && (
                      <a
                        href={`tel:${member.social.phone}`}
                        className="hover:text-emerald-400 transition-colors"
                        title={member.social.phone}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Action Button: Edit if isMe, else Wish */}
                  {isMe ? (
                    <button
                      onClick={onOpenEditProfile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit My Info</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (isToday) onTriggerConfetti();
                        handleCopyWish(member);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedId === member.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isToday
                          ? 'bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {copiedId === member.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Wish</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
