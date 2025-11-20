import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@livekit/components-react';
import { Send, Sparkles, X } from 'lucide-react';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const { chatMessages, send } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      await send(inputValue);
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-24 w-full md:w-96 bg-dark-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-right-10 fade-in duration-300 origin-right ml-4">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          Chat
          <span className="bg-white/10 text-[10px] px-2 py-0.5 rounded-full text-slate-300 font-bold">{chatMessages.length}</span>
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {chatMessages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center opacity-60">
             <Sparkles size={32} className="text-brand-400 mb-4 animate-pulse" />
             <p className="text-sm font-medium">No messages yet</p>
             <p className="text-xs mt-1">Say hello to the team!</p>
           </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.timestamp} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline space-x-2 mb-1.5 px-1">
                <span className="text-xs font-semibold text-slate-400">
                  {msg.from?.isLocal ? 'You' : msg.from?.identity || 'Guest'}
                </span>
                <span className="text-[10px] text-slate-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.from?.isLocal 
                  ? 'bg-brand-600 text-white rounded-tr-sm' 
                  : 'bg-white/10 text-slate-100 rounded-tl-sm border border-white/5'
              }`}>
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/5 text-white pl-4 pr-10 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 text-sm"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-0 disabled:translate-x-2 transition-all duration-200 shadow-lg"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};