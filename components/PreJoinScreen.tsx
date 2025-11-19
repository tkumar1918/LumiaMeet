import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Radio, Loader2, Keyboard, AlertTriangle } from 'lucide-react';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';

interface PreJoinScreenProps {
  onJoin: (roomName: string, participantName: string, audioEnabled: boolean, videoEnabled: boolean) => void;
  isLoading: boolean;
  error?: string;
}

export const PreJoinScreen: React.FC<PreJoinScreenProps> = ({ onJoin, isLoading, error: joinError }) => {
  const [roomName, setRoomName] = useState('');
  const [name, setName] = useState('');
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // We use a ref to track the active video track to ensure cleanup works 
  // regardless of closure staleness during unmount/re-renders.
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  // We also keep state to trigger re-renders for UI updates
  const [, setForceUpdate] = useState({});

  // Initialize local video preview
  useEffect(() => {
    let mounted = true;

    const toggleVideo = async () => {
      try {
        setMediaError(null);

        if (isVideoEnabled) {
          // If track already exists, do nothing
          if (videoTrackRef.current) return;

          const track = await createLocalVideoTrack({
            resolution: { width: 640, height: 480 },
          });

          if (!mounted) {
            // Component unmounted while waiting for track
            await track.stop();
            return;
          }

          videoTrackRef.current = track;
          setForceUpdate({}); // Trigger render to attach track
          
          // Attach to video element if available
          if (videoRef.current) {
            track.attach(videoRef.current);
          }
        } else {
          // Turn off video
          if (videoTrackRef.current) {
            // Detach first
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
          
          // Specific check for secure context issues common on mobile LAN
          if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setMediaError("Camera blocked. Browser requires HTTPS or localhost.");
          } else {
            setMediaError("Camera permission denied or device not found.");
          }
        }
      }
    };

    toggleVideo();

    return () => {
      mounted = false;
      // IMPORTANT: We do NOT stop the track here if we are just toggling deps.
      // But since we only depend on [isVideoEnabled], this runs when user toggles.
      // We handle stop logic inside the effect for the toggle case.
      // However, we MUST handle the unmount case (navigating away/joining).
    };
  }, [isVideoEnabled]);

  // Cleanup on unmount specifically
  useEffect(() => {
    return () => {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
      }
    };
  }, []);

  // Re-attach logic if ref changes (e.g. unmount/remount of DOM node)
  useEffect(() => {
    if (videoTrackRef.current && videoRef.current) {
        videoTrackRef.current.attach(videoRef.current);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName && name) {
      // Stop the preview track before joining so the main room can take over the device
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
      }
      // Pass the current media state (enabled/disabled) to the join handler
      onJoin(roomName, name, isAudioEnabled, isVideoEnabled);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Preview */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Lumina Meet
            </h1>
            <p className="text-slate-400">Enter the future of seamless communication.</p>
          </div>

          <div className="relative aspect-video bg-dark-800 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
            {isVideoEnabled ? (
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover transform -scale-x-100" 
                muted 
                playsInline 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4 p-4 text-center">
                <div className="p-4 rounded-full bg-dark-900 border border-slate-700">
                  <VideoOff className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-500 font-medium">
                  {mediaError || "Camera is off"}
                </p>
                {mediaError && (
                  <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/30 p-2 rounded-lg max-w-xs text-left">
                     <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                     <span>{mediaError}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 transition-transform duration-300 lg:translate-y-0 translate-y-2 opacity-100">
              <button
                type="button"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                }`}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                }`}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
            
            <div className="absolute top-4 right-4">
               <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-green-400 border border-green-500/20">
                  <Radio size={12} className="animate-pulse" />
                  <span>Ready to Connect</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-dark-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Join Room</h2>
            
            {joinError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {joinError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Johnson"
                  className="w-full bg-dark-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Room Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Daily Standup"
                    className="w-full bg-dark-950 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    required
                  />
                  <Keyboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Join Meeting</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};