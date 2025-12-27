
import React from 'react';
import { BookingSlot, Request } from '../types';

interface AdminResolverProps {
  slot: BookingSlot;
  onResolve: (requestId: string) => void;
  onClose: () => void;
}

const AdminResolver: React.FC<AdminResolverProps> = ({ slot, onResolve, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-emerald-600 text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-black">Resolve Race</h3>
            <button onClick={onClose} className="p-1 hover:bg-emerald-500 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-emerald-100 text-sm font-medium">Multiple requests for {slot.timeSlot}</p>
        </div>
        
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {slot.requests.map((req) => {
            const hour = slot.timeSlot.split(':')[0];
            const waMessage = `salam ${req.userName} ana said wach nta li baghi tkri tiran m3a ${hour}`;
            const waLink = `https://wa.me/${req.userPhone.replace(/\D/g,'')}?text=${encodeURIComponent(waMessage)}`;

            return (
              <div key={req.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{req.userName}</h4>
                    <p className="text-xs text-slate-400">{req.userPhone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter ${
                      req.trustScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {req.trustScore > 80 ? 'Regular' : 'New User'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <a 
                    href={waLink}
                    target="_blank"
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.284l-.54 1.916 1.946-.512c.927.576 1.896.938 3.324.938 3.174 0 5.767-2.586 5.767-5.766 0-3.18-2.586-5.766-5.767-5.766zm3.336 8.086c-.144.405-.824.737-1.12.783-.296.046-.574.064-.945-.054-.372-.119-1.577-.611-2.935-1.823-1.045-.933-1.751-2.085-1.954-2.433-.203-.349-.022-.538.152-.712.156-.156.349-.405.522-.607.172-.202.23-.344.344-.572.115-.229.057-.429-.029-.601-.086-.172-.768-1.851-1.052-2.535-.276-.665-.558-.574-.768-.585l-.655-.011c-.227 0-.596.086-.908.429-.312.344-1.192 1.168-1.192 2.85 0 1.682 1.223 3.307 1.396 3.535.172.229 2.407 3.673 5.83 5.152.814.351 1.45.56 1.945.717.818.26 1.562.223 2.151.135.656-.098 2.016-.824 2.3-1.621.285-.797.285-1.48.2-1.621-.086-.14-.316-.226-.66-.399z"/></svg>
                    WhatsApp
                  </a>
                  <button 
                    onClick={() => onResolve(req.id)}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium italic">Said Manager will manually contact players via WhatsApp for confirmation.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminResolver;
