
import React, { useState } from 'react';
import { User, UserRole, AppStorage } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const STORAGE_KEY = 'tirani_storage_v1';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getStorage = (): AppStorage => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: [], bookings: [] };
  };

  const saveToStorage = (storage: AppStorage) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const storage = getStorage();
    const fullPhone = `+212 ${phone}`;

    // Admin backdoor: Specific password triggers admin mode regardless of number
    if (password === 'SAID123') {
      const adminUser: User = {
        id: 'admin_said',
        name: 'Said Manager',
        phone: fullPhone,
        role: UserRole.ADMIN,
        trustScore: 100,
        photo: photo || undefined
      };
      // We don't necessarily persist the admin in the users list to keep it as a backdoor
      localStorage.setItem('tirani_active_user', adminUser.id);
      onLogin(adminUser);
      return;
    }

    if (isRegistering) {
      if (storage.users.find(u => u.phone === fullPhone)) {
        setError("N'mra hadi msta3mla déjà! Connecti.");
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone: fullPhone,
        password, // Save password for future logins
        role: UserRole.PLAYER,
        trustScore: 50,
        photo: photo || undefined
      };

      storage.users.push(newUser);
      saveToStorage(storage);
      localStorage.setItem('tirani_active_user', newUser.id);
      onLogin(newUser);
    } else {
      // Find user by phone AND password
      const existingUser = storage.users.find(u => u.phone === fullPhone && u.password === password);
      if (!existingUser) {
        setError("N'mra awla l'password ghaltin!");
        return;
      }
      localStorage.setItem('tirani_active_user', existingUser.id);
      onLogin(existingUser);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-100 rotate-3 mb-6">
            T
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
            Ti<span className="text-emerald-600">rani</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            The Pitch Is Yours
          </p>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setIsRegistering(false); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            Se Connecter
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setError(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isRegistering ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            S'enregistrer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all group-hover:border-emerald-100">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-slate-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-700 active:scale-90 transition-all">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-pulse">
              <p className="text-[11px] text-red-600 font-bold text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Benani"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Numéro de Téléphone</label>
              <div className="flex gap-3">
                <div className="px-4 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm flex items-center border border-transparent">
                  +212
                </div>
                <input 
                  type="tel" 
                  required
                  pattern="[0-9]{9,}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                  placeholder="600-000000"
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mot de Passe</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all mt-6"
          >
            {isRegistering ? "S'ENREGISTRER" : "CONNECTER"}
          </button>
        </form>
      </div>

      <div className="mt-auto text-center pb-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Tirani • Said is watching
        </p>
      </div>
    </div>
  );
};

export default Login;
