
import React, { useState, useEffect, useRef } from 'react';
import { getAIResponse } from '../services/geminiService';
import { User, Pitch } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatModalProps {
  user: User;
  pitch: Pitch;
  slot: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ user, pitch, slot, isOpen, onClose, onConfirm }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Marhba ${user.name}! Bghiti tkri ${pitch.name} f'had l'weqt: ${slot}?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoConfirming, setIsAutoConfirming] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isAutoConfirming, isWarning]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || isAutoConfirming || isWarning) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const fullResponse = await getAIResponse(user.name, user.trustScore, pitch.name, slot, userMessage, messages);
    setIsTyping(false);

    if (fullResponse) {
      if (fullResponse.includes("[CANCEL_CHAT]")) {
        onClose();
        return;
      }

      if (fullResponse.includes("[TROLL_WARNING]")) {
        setIsWarning(true);
        return;
      }

      const autoConfirmTag = "[AUTO_CONFIRM]";
      if (fullResponse.includes(autoConfirmTag)) {
        const cleanedText = fullResponse.replace(autoConfirmTag, "").trim();
        setMessages(prev => [...prev, { role: 'model', text: cleanedText }]);
        setIsAutoConfirming(true);
        setTimeout(() => {
          onConfirm();
        }, 2000); 
      } else {
        setMessages(prev => [...prev, { role: 'model', text: fullResponse }]);
      }
    } else {
      setMessages(prev => [...prev, { role: 'model', text: "Sma7 lia, kayn wahed l'mouchkil f'system. Hawel mra khra." }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[480px] bg-white rounded-t-[40px] overflow-hidden flex flex-col h-[88vh] animate-in slide-in-from-bottom duration-300 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-500 shadow-lg ${isWarning ? 'bg-red-500' : isAutoConfirming ? 'bg-emerald-500 scale-110' : 'bg-emerald-600 shadow-emerald-100'}`}>
              {isWarning ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : isAutoConfirming ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              )}
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Tirani Concierge</h3>
              <div className="flex items-center gap-1.5">
                 <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-red-500' : isAutoConfirming ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                   {isWarning ? 'Violation detected' : isAutoConfirming ? 'Processing Booking...' : 'Direct Smart Assistant'}
                 </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-slate-50/10">
          {isWarning ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 px-8 text-center animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Warning / Tandir</h4>
               <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                 "la knti katnez bla matkri tiran rah said kichuf had lmessagat"
               </p>
               <button 
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100"
               >
                 I understand / Bla mat3awed
               </button>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none font-medium'
                  }`}>
                    <p className="text-sm leading-relaxed tracking-tight">{m.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {isAutoConfirming && (
                <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-emerald-700 font-black uppercase tracking-widest text-[11px] text-center">
                    Safi, Enregistrée!<br/>
                    <span className="opacity-60 font-bold">Redirecting to your bookings...</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Bar */}
        {!isWarning && (
          <div className="p-6 pb-10 bg-white border-t border-slate-50">
            <div className={`flex gap-3 transition-opacity duration-300 ${isAutoConfirming ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              <input 
                disabled={isAutoConfirming || isTyping}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Jawab l'concierge..."
                className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder:text-slate-300"
              />
              <button 
                disabled={isAutoConfirming || isTyping || !input.trim()}
                onClick={handleSend}
                className={`w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 transition-all active:scale-90 ${(!input.trim() || isTyping) ? 'opacity-40' : 'hover:bg-emerald-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatModal;
