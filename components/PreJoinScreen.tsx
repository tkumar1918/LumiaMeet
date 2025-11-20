import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Radio, Loader2, Keyboard, AlertTriangle, Sparkles } from 'lucide-react';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';

interface PreJoinScreenProps {
  onJoin: (
    roomName: string, 
    participantName: string, 
    audioEnabled: boolean, 
    videoEnabled: boolean
  ) => void;
  isLoading: boolean;
  error?: string;
}

export const PreJoinScreen: React.FC<PreJoinScreenProps> = ({ onJoin, isLoading, error: joinError }) => {
  // Initialize from localStorage if available
  const [roomName, setRoomName] = useState(() => localStorage.getItem('lumina_room_id') || '');
  const [name, setName] = useState(() => localStorage.getItem('lumina_username') || '');
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const [, setForceUpdate] = useState({});

  useEffect(() => {
    let mounted = true;

    const toggleVideo = async () => {
      try {
        setMediaError(null);

        if (isVideoEnabled) {
          if (videoTrackRef.current) return;

          const track = await createLocalVideoTrack({
            resolution: { width: 1280, height: 720 },
          });

          if (!mounted) {
            await track.stop();
            return;
          }

          videoTrackRef.current = track;
          setForceUpdate({});
          
          if (videoRef.current) {
            track.attach(videoRef.current);
          }
        } else {
          if (videoTrackRef.current) {
            if (videoRef.current) {
              videoTrackRef.current.detach(videoRef.current);
            }
            await videoTrackRef.current.stop();
            videoTrackRef.current = null;
            setForceUpdate({});
          }
        }
      } catch (e) {
        console.error("Failed to acquire camera", e);
        if (mounted) {
          setIsVideoEnabled(false);
          if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setMediaError("HTTPS required for camera access.");
          } else {
            setMediaError("Camera access denied.");
          }
        }
      }
    };

    toggleVideo();

    return () => {
      mounted = false;
    };
  }, [isVideoEnabled]);

  useEffect(() => {
    return () => {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (videoTrackRef.current && videoRef.current) {
        videoTrackRef.current.attach(videoRef.current);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName && name) {
      // Save to localStorage for convenience
      localStorage.setItem('lumina_room_id', roomName);
      localStorage.setItem('lumina_username', name);

      onJoin(
        roomName, 
        name, 
        isAudioEnabled, 
        isVideoEnabled
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto">
      
      {/* Header - Centered Top */}
      <div className="w-full max-w-7xl mb-8 lg:mb-10 flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-700">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/20 rounded-xl border border-brand-500/20 backdrop-blur-md shadow-lg shadow-brand-500/10">
              <Sparkles className="text-brand-400 fill-brand-400/10" size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Lumina Meet</h1>
              <p className="text-slate-400 text-sm font-medium hidden sm:block">Next-gen video conferencing</p>
            </div>
         </div>
         
         <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Systems Operational
            </span>
         </div>
      </div>

      {/* Main Grid Layout - Stretch Items for Equal Height */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        
        {/* Left Side: Preview (7 columns) - Defines the height via aspect ratio */}
        <div className="lg:col-span-7 flex flex-col order-1">
          <div className="relative w-full h-full aspect-video bg-dark-900/50 rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] group backdrop-blur-sm">
            {isVideoEnabled ? (
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                muted 
                playsInline 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4 bg-dark-900/80 backdrop-blur-md">
                <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10 shadow-inner">
                  <VideoOff className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-slate-500 font-medium tracking-wide">
                  {mediaError || "Camera is turned off"}
                </p>
              </div>
            )}
            
            {/* Floating Media Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:scale-105 hover:border-white/20 z-20">
              <button
                type="button"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isAudioEnabled 
                    ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                }`}
              >
                {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isVideoEnabled 
                    ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                }`}
              >
                {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            </div>

            {mediaError && (
               <div className="absolute top-4 left-4 right-4 flex justify-center animate-in slide-in-from-top-2 z-20">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs backdrop-blur-md shadow-lg">
                     <AlertTriangle size={14} />
                     <span>{mediaError}</span>
                  </div>
               </div>
            )}

            {/* Text overlay for balance */}
            <div className="absolute bottom-6 left-6 hidden lg:block z-10 pointer-events-none">
              <p className="text-white/30 text-xs font-medium tracking-widest uppercase">Preview Mode</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form (5 columns) - Stretches to match video height */}
        <div className="lg:col-span-5 flex flex-col relative order-2">
          
          <div className="glass-card p-6 lg:p-8 rounded-[2rem] relative overflow-hidden h-full flex flex-col justify-center">
            {/* Decorative background gradient for card */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                 <div>
                   <h2 className="text-2xl font-bold text-white tracking-tight">Join Meeting</h2>
                   <p className="text-slate-400 text-sm mt-1 font-medium">Configure your session details</p>
                 </div>
              </div>
              
              {joinError && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                  <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                  <span className="font-medium">{joinError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-brand-500/5 transition-all placeholder:text-slate-600 font-medium"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Room ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="w-full bg-black/20 border border-white/10 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-brand-500/5 transition-all placeholder:text-slate-600 font-medium"
                      required
                    />
                    <Keyboard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold py-3.5 rounded-xl shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed border border-brand-400/20 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Now</span>
                        <Radio size={18} className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};