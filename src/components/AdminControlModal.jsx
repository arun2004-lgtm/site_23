import React, { useState } from 'react';
import { 
  X, Users, CloudUpload, Settings, 
  Search, Edit3, Trash2, UserPlus, CheckCircle2, 
  AlertCircle, Crown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatBirthday } from '../utils/birthdayUtils';
import { getDefaultAvatar } from '../data/batchData';

export default function AdminControlModal({ isOpen, onClose, initialMemberToEdit = null }) {
  const { 
    currentUser, 
    isAdmin, 
    batchmates, 
    updateMemberAsAdmin, 
    addNewMemberAsAdmin, 
    deleteMemberAsAdmin,
    resetBatchRosterToDefaults
  } = useAuth();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'cloud' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Member edit state
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nickname: '',
    birthday: '',
    photo: '',
    role: '',
    department: '',
    quote: '',
    universityEmail: '',
    personalEmail: ''
  });

  // New member add state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    regNo: '',
    nickname: '',
    birthday: '',
    role: 'Batchmate',
    department: 'Faculty of Engineering, University of Peradeniya',
    quote: '',
    universityEmail: '',
    personalEmail: ''
  });

  // Cloud uploader state
  const [gasUrl, setGasUrl] = useState(() => 
    localStorage.getItem('site23_gas_upload_url') || import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || ''
  );
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const [actionSuccess, setActionSuccess] = useState('');
  const [prevInitialMember, setPrevInitialMember] = useState(initialMemberToEdit);

  if (initialMemberToEdit !== prevInitialMember) {
    setPrevInitialMember(initialMemberToEdit);
    if (initialMemberToEdit) {
      setActiveTab('members');
      setEditingMember(initialMemberToEdit);
      setEditFormData({
        name: initialMemberToEdit.name || '',
        nickname: initialMemberToEdit.nickname || '',
        birthday: initialMemberToEdit.birthday || '',
        photo: initialMemberToEdit.photo || '',
        role: initialMemberToEdit.role || '',
        department: initialMemberToEdit.department || '',
        quote: initialMemberToEdit.quote || '',
        universityEmail: initialMemberToEdit.universityEmail || '',
        personalEmail: initialMemberToEdit.personalEmail || ''
      });
    }
  }

  if (!isOpen || !isAdmin) return null;

  // Filter batchmates
  const filteredMembers = batchmates.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.regNo?.toLowerCase().includes(q) ||
      m.nickname?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q) ||
      m.universityEmail?.toLowerCase().includes(q) ||
      m.personalEmail?.toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalCount = batchmates.length;
  const withBirthdaysCount = batchmates.filter(m => m.birthday && m.birthday.trim() !== '').length;
  const pendingCount = batchmates.filter(m => m.detailsPending).length;

  const startEditMember = (member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name || '',
      nickname: member.nickname || '',
      birthday: member.birthday || '',
      photo: member.photo || '',
      role: member.role || '',
      department: member.department || '',
      quote: member.quote || '',
      universityEmail: member.universityEmail || '',
      personalEmail: member.personalEmail || ''
    });
  };

  const handleSaveMemberEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMemberAsAdmin(editingMember.id, {
      name: editFormData.name,
      nickname: editFormData.nickname,
      birthday: editFormData.birthday,
      photo: editFormData.photo,
      role: editFormData.role,
      department: editFormData.department,
      quote: editFormData.quote,
      universityEmail: editFormData.universityEmail.trim().toLowerCase(),
      personalEmail: editFormData.personalEmail.trim().toLowerCase(),
      detailsPending: false
    });

    setEditingMember(null);
    showNotice(`Successfully updated ${editFormData.name} in batch database!`);
  };

  const handleAddNewMember = (e) => {
    e.preventDefault();
    if (!newMemberData.name || !newMemberData.regNo) return;

    const normReg = newMemberData.regNo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const newEntry = {
      id: normReg,
      regNo: newMemberData.regNo.toUpperCase().trim(),
      universityEmail: (newMemberData.universityEmail || `${normReg}@eng.pdn.ac.lk`).trim().toLowerCase(),
      personalEmail: (newMemberData.personalEmail || '').trim().toLowerCase(),
      name: newMemberData.name.trim(),
      nickname: newMemberData.nickname.trim(),
      birthday: newMemberData.birthday,
      photo: getDefaultAvatar(newMemberData.name),
      role: newMemberData.role.trim() || 'Batchmate',
      department: newMemberData.department.trim(),
      quote: newMemberData.quote.trim(),
      detailsPending: !newMemberData.birthday,
      social: {}
    };

    addNewMemberAsAdmin(newEntry);
    setIsAddingMember(false);
    setNewMemberData({
      name: '',
      regNo: '',
      nickname: '',
      birthday: '',
      role: 'Batchmate',
      department: 'Faculty of Engineering, University of Peradeniya',
      quote: '',
      universityEmail: '',
      personalEmail: ''
    });
    showNotice(`Added new batchmate: ${newEntry.name} (${newEntry.regNo}) to batch database!`);
  };

  const handleDeleteMember = (member) => {
    if (confirm(`Are you sure you want to remove ${member.name} (${member.regNo}) from the batch roster?`)) {
      deleteMemberAsAdmin(member.id);
      showNotice(`Removed ${member.name} from directory.`);
    }
  };

  const handleTestCloudConnection = async () => {
    if (!gasUrl.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(gasUrl.trim());
      const data = await res.json();
      if (data.status === 'ok') {
        localStorage.setItem('site23_gas_upload_url', gasUrl.trim());
        setTestResult({ success: true, message: data.message || 'Connected to peradeniyaguys@gmail.com!' });
      } else {
        setTestResult({ success: false, message: 'Unexpected response: ' + JSON.stringify(data) });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Connection error: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const showNotice = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl my-6 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  E/23 Master Admin Control
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase tracking-wider">
                  Super Admin (E/23/020)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-white">{currentUser.name}</strong> • Full Roster & System Control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-slate-950 border-b border-slate-800/80 text-xs">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Enrolled:</span>
            <span className="font-bold text-white font-mono">{totalCount} Students</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Birthdays Registered:</span>
            <span className="font-bold text-amber-400 font-mono">{withBirthdaysCount} / {totalCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Pending Login:</span>
            <span className="font-bold text-rose-400 font-mono">{pendingCount}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 bg-slate-950/40 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => { setActiveTab('members'); setEditingMember(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Members ({totalCount})</span>
          </button>

          <button
            onClick={() => { setActiveTab('cloud'); setEditingMember(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cloud'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Cloud Sync & Drive Settings</span>
          </button>

          <button
            onClick={() => { setActiveTab('system'); setEditingMember(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'system'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>System Maintenance</span>
          </button>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && !editingMember && !isAddingMember && (
            <div className="space-y-4">
              {/* Search & Add Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, E-number, role..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={() => setIsAddingMember(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Batch Member</span>
                </button>
              </div>

              {/* Members Table / List */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 divide-y divide-slate-800">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm truncate">
                            {member.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 shrink-0">
                            {member.regNo}
                          </span>
                          {member.id === 'e23020' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                              ADMIN
                            </span>
                          )}
                          {member.detailsPending && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 truncate mt-0.5">
                          <span>{member.role || 'Batchmate'}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">
                            {member.birthday ? formatBirthday(member.birthday) : 'No birthday set'}
                          </span>
                          {member.personalEmail && (
                            <>
                              <span>•</span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                🔑 {member.personalEmail}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEditMember(member)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit this student's profile details as admin"
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                      </button>
                      {member.id !== 'e23020' && (
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT MEMBER SUB-FORM */}
          {editingMember && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Admin Edit: {editingMember.name}</span>
                  <span className="text-xs font-mono text-amber-400">({editingMember.regNo})</span>
                </h4>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveMemberEdit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nickname</label>
                    <input
                      type="text"
                      value={editFormData.nickname}
                      onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.birthday}
                      onChange={(e) => setEditFormData({ ...editFormData, birthday: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Role / Tag</label>
                    <input
                      type="text"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">University Email (@eng.pdn.ac.lk)</label>
                    <input
                      type="email"
                      value={editFormData.universityEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, universityEmail: e.target.value })}
                      placeholder="e.g. e23020@eng.pdn.ac.lk"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Personal Google Email (OAuth Login)</label>
                    <input
                      type="email"
                      value={editFormData.personalEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, personalEmail: e.target.value })}
                      placeholder="e.g. student@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Photo URL / Google Drive link</label>
                  <input
                    type="text"
                    value={editFormData.photo}
                    onChange={(e) => setEditFormData({ ...editFormData, photo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Memory / Quote</label>
                  <textarea
                    rows={2}
                    value={editFormData.quote}
                    onChange={(e) => setEditFormData({ ...editFormData, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADD NEW MEMBER SUB-FORM */}
          {isAddingMember && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Register New Batch Member to E/23 Roster</span>
                </h4>
                <button
                  onClick={() => setIsAddingMember(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddNewMember} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Registration No *</label>
                    <input
                      type="text"
                      value={newMemberData.regNo}
                      onChange={(e) => setNewMemberData({ ...newMemberData, regNo: e.target.value })}
                      required
                      placeholder="e.g. E/23/999"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newMemberData.name}
                      onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                      required
                      placeholder="Student full name"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newMemberData.birthday}
                      onChange={(e) => setNewMemberData({ ...newMemberData, birthday: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nickname</label>
                    <input
                      type="text"
                      value={newMemberData.nickname}
                      onChange={(e) => setNewMemberData({ ...newMemberData, nickname: e.target.value })}
                      placeholder="Call sign"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">University Email (@eng.pdn.ac.lk)</label>
                    <input
                      type="email"
                      value={newMemberData.universityEmail}
                      onChange={(e) => setNewMemberData({ ...newMemberData, universityEmail: e.target.value })}
                      placeholder="e.g. e23xxx@eng.pdn.ac.lk"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Personal Google Email (OAuth)</label>
                    <input
                      type="email"
                      value={newMemberData.personalEmail}
                      onChange={(e) => setNewMemberData({ ...newMemberData, personalEmail: e.target.value })}
                      placeholder="e.g. student@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                  >
                    Register Member
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CLOUD & DRIVE SETTINGS */}
          {activeTab === 'cloud' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-indigo-400" />
                  <span>Google Apps Script Cloud Upload Engine</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Configured under <strong className="text-amber-300">peradeniyaguys@gmail.com</strong>. Student profile picture uploads are piped straight into your Google Drive folder.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Published Web App Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                  <button
                    onClick={handleTestCloudConnection}
                    disabled={isTesting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isTesting ? 'Testing...' : 'Test & Save'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="text-slate-200 font-semibold">Active Destination Folder:</div>
                <div className="font-mono text-[11px] text-amber-300">1_VBM374H-BypVbpChe1H6JqdC9XkoAhp</div>
                <div className="text-[11px] text-slate-500">Google Drive "E23 Batch Profile Pictures" folder on peradeniyaguys@gmail.com</div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM UTILITIES */}
          {activeTab === 'system' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-rose-400" />
                  <span>Administrative Emergency Controls</span>
                </h4>
                <p className="text-slate-400 mt-1">
                  Use these options if roster data gets corrupted during testing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="font-bold text-rose-300">Reset Roster to Fresh Factory State</div>
                <p className="text-slate-300 leading-relaxed">
                  Restores the official 25 transcribed handwritten birthdays and clean initial batch records. Overwrites any local modifications.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to restore the official factory roster?')) {
                      resetBatchRosterToDefaults();
                      showNotice('Batch roster restored to factory register!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Restore Factory Roster
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Protected Area • Reserved for E/23/020 Lead Admin</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
