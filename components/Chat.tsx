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
    <div className="absolute top-4 right-4 bottom-24 w-80 md:w-96 bg-dark-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-right-10 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          Messages
          <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-400">{chatMessages.length}</span>
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
             <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-brand-500 opacity-50" />
             </div>
             <p className="text-sm">No messages yet.</p>
             <p className="text-xs opacity-70 mt-1">Start the conversation!</p>
           </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.timestamp} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline space-x-2 mb-1 px-1">
                <span className="text-xs font-medium text-slate-400">
                  {msg.from?.isLocal ? 'You' : msg.from?.identity || 'Unknown'}
                </span>
                <span className="text-[10px] text-slate-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.from?.isLocal 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-dark-800 text-white pl-4 pr-12 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-50 disabled:bg-slate-700 transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
