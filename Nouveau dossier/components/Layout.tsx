
import React from 'react';
import { UserRole, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'bookings' | 'profile';
  setActiveTab: (tab: 'home' | 'bookings' | 'profile') => void;
  role: UserRole;
  user: User;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role, user }) => {
  return (
    <div className="flex flex-col h-screen relative bg-slate-50">
      {/* Header */}
      <header className="px-6 py-5 bg-white sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-lg">T</div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
            Ti<span className="text-emerald-600">rani</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-500">
                {role}
            </span>
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold overflow-hidden cursor-pointer"
            >
                {user.photo ? (
                  <img src={user.photo} className="w-full h-full object-cover" />
                ) : (
                  user.name[0]
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="h-20 bg-white border-t border-slate-100 px-10 flex items-center justify-between sticky bottom-0 z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'bookings' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
