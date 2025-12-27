
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import AIChatModal from './components/AIChatModal';
import AdminResolver from './components/AdminResolver';
import Login from './components/Login';
import { MOCK_PITCHES } from './services/mockData';
import { Pitch, BookingSlot, SlotStatus, UserRole, User, Request, AppStorage } from './types';

const STORAGE_KEY = 'tirani_storage_v1';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'profile'>('home');
  
  // Strictly Tiran Yassmine
  const [selectedPitch] = useState<Pitch>(MOCK_PITCHES[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  
  // Storage state
  const [persistentBookings, setPersistentBookings] = useState<BookingSlot[]>([]);

  // State for interactions
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0); // To force new chat session
  const [resolvingSlot, setResolvingSlot] = useState<BookingSlot | null>(null);

  // Auto-login & Storage Load
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    const storage: AppStorage = data ? JSON.parse(data) : { users: [], bookings: [] };
    setPersistentBookings(storage.bookings);

    const activeUserId = localStorage.getItem('tirani_active_user');
    if (activeUserId) {
      const existingUser = storage.users.find(u => u.id === activeUserId);
      if (existingUser) setUser(existingUser);
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (persistentBookings.length > 0) {
      const data = localStorage.getItem(STORAGE_KEY);
      const storage: AppStorage = data ? JSON.parse(data) : { users: [], bookings: [] };
      storage.bookings = persistentBookings;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    }
  }, [persistentBookings]);

  // Initialize Slots for the day
  useEffect(() => {
    const times = [];
    for (let i = 9; i <= 23; i++) {
      times.push(`${i.toString().padStart(2, '0')}:00`);
    }

    const dailySlots = times.map(t => {
      const slotId = `${selectedPitch.id}-${selectedDate}-${t}`;
      const existing = persistentBookings.find(b => b.id === slotId);
      
      return existing || {
        id: slotId,
        pitchId: selectedPitch.id,
        date: selectedDate,
        timeSlot: t,
        status: SlotStatus.AVAILABLE,
        requests: []
      };
    });
    setSlots(dailySlots);
  }, [selectedDate, selectedPitch.id, persistentBookings]);

  // Calendar logic: Always limit at the upcoming Sunday
  const dates = useMemo(() => {
    const today = new Date();
    const result = [];
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    for (let i = 0; i <= daysUntilSunday; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        iso: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate()
      });
    }
    return result;
  }, []);

  const handleRequestSlot = () => {
    if (!selectedTime || !user) return;
    
    const slotId = `${selectedPitch.id}-${selectedDate}-${selectedTime}`;
    
    setPersistentBookings(prev => {
      const existingIdx = prev.findIndex(b => b.id === slotId);
      const newReq: Request = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        trustScore: user.trustScore,
        timestamp: Date.now()
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: SlotStatus.PENDING,
          requests: [...updated[existingIdx].requests.filter(r => r.userId !== user.id), newReq]
        };
        return updated;
      } else {
        return [...prev, {
          id: slotId,
          pitchId: selectedPitch.id,
          date: selectedDate,
          timeSlot: selectedTime,
          status: SlotStatus.PENDING,
          requests: [newReq]
        }];
      }
    });
    
    setIsChatOpen(false);
    setSelectedTime(null);
    setActiveTab('bookings');
  };

  const handleResolve = (requestId: string) => {
    if (!resolvingSlot) return;
    
    setPersistentBookings(prev => prev.map(s => {
      if (s.id === resolvingSlot.id) {
        return {
          ...s,
          status: SlotStatus.CONFIRMED,
          confirmedUserId: s.requests.find(r => r.id === requestId)?.userId,
          requests: s.requests.filter(r => r.id === requestId)
        };
      }
      return s;
    }));
    setResolvingSlot(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('tirani_active_user');
    setUser(null);
    setActiveTab('home');
  };

  const openChat = () => {
    setChatSessionId(prev => prev + 1); // Trigger re-mount of AIChatModal
    setIsChatOpen(true);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const userBookings = persistentBookings.filter(s => s.requests.some(r => r.userId === user.id));

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} user={user}>
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-500 pb-32">
          {/* Status Header */}
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
            <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
              {user.role === UserRole.ADMIN ? 'Panneau de Contrôle Said' : 'Réservation Joueur'}
            </p>
            <div className="flex items-center gap-1.5">
               <span className={`w-2 h-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-slate-900' : 'bg-emerald-500'}`} />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Direct Link</span>
            </div>
          </div>

          {/* Calendar Strip */}
          <div className="px-6 py-6 bg-white border-b border-slate-100 overflow-x-auto hide-scrollbar flex gap-4">
            {dates.map((d) => (
              <button 
                key={d.iso}
                onClick={() => {
                  setSelectedDate(d.iso);
                  setSelectedTime(null);
                }}
                className={`flex-shrink-0 w-16 h-20 rounded-[24px] flex flex-col items-center justify-center transition-all ${
                  selectedDate === d.iso 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' 
                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{d.day}</span>
                <span className="text-xl font-black mt-1">{d.num}</span>
              </button>
            ))}
          </div>

          {/* Pitch Detail */}
          <div className="px-6 mt-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                {selectedPitch.name}
              </span>
            </div>
            <div className="flex justify-between items-end mt-6">
               <h2 className="text-3xl font-black text-slate-900 leading-none">Terrain Principal</h2>
               <p className="text-sm text-emerald-600 font-bold uppercase tracking-wide italic">100 MAD / H</p>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-[28px] flex items-center gap-4 border border-blue-100">
               <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <p className="text-[11px] font-bold text-blue-700 leading-snug uppercase tracking-tight">
                 Bghiti 2 swaye3? Kré lawla o zid kré sâa li mouraha ila kant khawya.
               </p>
            </div>
          </div>

          {/* Hourly Slots */}
          <div className="px-6 mt-8 space-y-4">
            {slots.map((slot) => {
              const isConfirmed = slot.status === SlotStatus.CONFIRMED;
              const isMyConfirmation = isConfirmed && slot.confirmedUserId === user.id;
              const isOtherConfirmation = isConfirmed && slot.confirmedUserId !== user.id;
              const isPending = slot.status === SlotStatus.PENDING;
              const isSelected = selectedTime === slot.timeSlot;
              const hasUserRequested = slot.requests.some(r => r.userId === user.id);

              return (
                <button
                  key={slot.timeSlot}
                  disabled={isOtherConfirmation && user.role === UserRole.PLAYER}
                  onClick={() => {
                    if (user.role === UserRole.ADMIN && isPending) {
                      setResolvingSlot(slot);
                    } else if (user.role === UserRole.PLAYER && !isConfirmed) {
                      setSelectedTime(slot.timeSlot);
                    }
                  }}
                  className={`w-full flex items-center gap-4 transition-all group ${
                    (isOtherConfirmation && user.role === UserRole.PLAYER) ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <div className={`w-12 text-xs font-black transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {slot.timeSlot}
                  </div>
                  
                  <div className={`flex-1 p-5 rounded-[32px] border transition-all flex justify-between items-center shadow-sm ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.02]' 
                      : isMyConfirmation
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : isOtherConfirmation 
                          ? 'bg-slate-100 border-transparent text-slate-400' 
                          : isPending 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-white border-slate-100 hover:border-emerald-200'
                  }`}>
                    <div className="text-left">
                      <p className={`text-sm font-black uppercase tracking-tight ${isMyConfirmation ? 'text-white' : ''}`}>
                        {isMyConfirmation ? "C'EST TON MATCH!" : isOtherConfirmation ? 'RÉSERVÉ' : hasUserRequested ? 'MA DEMANDE' : isPending ? `${slot.requests.length} DEMANDES` : 'DISPONIBLE'}
                      </p>
                      {isMyConfirmation && <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest mt-0.5">Said a validé ta place</p>}
                    </div>
                    {!isConfirmed && (
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-white bg-white/10' : 'border-slate-100 group-hover:border-emerald-200'
                      }`}>
                        {isSelected && <div className="w-3.5 h-3.5 bg-white rounded-full animate-pulse" />}
                        {hasUserRequested && <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />}
                      </div>
                    )}
                    {isMyConfirmation && (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {user.role === UserRole.PLAYER && selectedTime && (
            <div className="fixed bottom-24 left-6 right-6 z-40 animate-in slide-in-from-bottom-10">
              <button 
                onClick={openChat}
                className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-800"
              >
                Chat avec Concierge
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="px-6 py-10 animate-in fade-in pb-32">
          <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">Mon Historique</h2>
          
          <div className="space-y-4">
             {userBookings.length === 0 ? (
               <div className="py-20 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Mazal majebti ta sâa</p>
               </div>
             ) : (
               userBookings.map(s => {
                 const isWinner = s.status === SlotStatus.CONFIRMED && s.confirmedUserId === user.id;
                 const isLoser = s.status === SlotStatus.CONFIRMED && s.confirmedUserId !== user.id;

                 return (
                  <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-[36px] shadow-sm flex items-center gap-5 transition-all active:scale-[0.98]">
                      <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center font-black ${
                        isWinner ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : isLoser ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <span className="text-[10px] opacity-70 uppercase tracking-tighter">{s.timeSlot.split(':')[0]}</span>
                        <span className="text-xl">H</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{selectedPitch.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.date} • {s.timeSlot}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tight ${
                        isWinner ? 'bg-emerald-100 text-emerald-700' : isLoser ? 'bg-red-50 text-red-500' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isWinner ? 'Confirmé' : isLoser ? 'Occupé' : 'Attente'}
                      </div>
                  </div>
                 )
               })
             )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="px-6 py-12 animate-in fade-in flex flex-col h-full items-center">
          <div className="w-40 h-40 rounded-[48px] border-8 border-white shadow-2xl overflow-hidden bg-slate-100 mb-8 rotate-3">
            {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl font-black bg-gradient-to-br from-slate-50 to-slate-100">{user.name[0]}</div>
            )}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{user.name}</h2>
          <p className="text-sm text-slate-400 font-bold mt-2 tracking-[0.2em]">{user.phone}</p>
          
          <div className="mt-8 flex items-center gap-4 bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 w-full">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Score de Confiance</span>
                <span className="text-[11px] font-black text-emerald-600">{user.trustScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${user.trustScore}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-auto w-full pb-10">
             <button 
               onClick={handleLogout}
               className="w-full p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center justify-between group transition-all hover:bg-red-100 active:scale-[0.98]"
             >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-red-600">Se déconnecter</span>
                </div>
                <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
             </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTime && isChatOpen && (
        <AIChatModal 
          key={`${selectedTime}-${chatSessionId}`} // Force fresh session every click
          user={user}
          pitch={selectedPitch}
          slot={selectedTime}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onConfirm={handleRequestSlot}
        />
      )}

      {resolvingSlot && (
        <AdminResolver 
          slot={resolvingSlot}
          onClose={() => setResolvingSlot(null)}
          onResolve={handleResolve}
        />
      )}
    </Layout>
  );
};

export default App;
