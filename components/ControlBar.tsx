import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  Monitor, 
  MessageSquare, 
  Phone, 
  Settings,
  Users
} from 'lucide-react';
import { useRoomContext } from '@livekit/components-react';
import { ParticipantEvent, RoomEvent } from 'livekit-client';

interface ControlBarProps {
  onLeave: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({ onLeave, onToggleChat, isChatOpen }) => {
  const room = useRoomContext();
  
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(room.localParticipant.isMicrophoneEnabled);
  const [isCameraEnabled, setIsCameraEnabled] = useState(room.localParticipant.isCameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(room.localParticipant.isScreenShareEnabled);

  useEffect(() => {
    const onLocalTrackUpdate = () => {
      setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);
      setIsCameraEnabled(room.localParticipant.isCameraEnabled);
      setIsScreenSharing(room.localParticipant.isScreenShareEnabled);
    };

    // Listen for track events on local participant
    room.localParticipant.on(ParticipantEvent.LocalTrackPublished, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.TrackMuted, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.TrackUnmuted, onLocalTrackUpdate);
    
    return () => {
        room.localParticipant.off(ParticipantEvent.LocalTrackPublished, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.TrackMuted, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.TrackUnmuted, onLocalTrackUpdate);
    };
  }, [room]);

  const toggleAudio = () => room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleVideo = () => room.localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreenShare = () => room.localParticipant.setScreenShareEnabled(!isScreenSharing);

  return (
    <div className="h-20 bg-dark-950 border-t border-slate-800 px-6 flex items-center justify-between z-50 relative">
       
       {/* Left Info */}
       <div className="hidden md:flex items-center space-x-4 text-slate-400 text-sm">
          <span>Lumina Meeting</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="text-green-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Encrypted
          </span>
       </div>

       {/* Center Controls */}
       <div className="flex items-center gap-3">
          <ControlButton 
            active={isMicrophoneEnabled} 
            onClick={toggleAudio} 
            onIcon={<Mic size={20} />} 
            offIcon={<MicOff size={20} />}
            variant="toggle" 
          />
          <ControlButton 
            active={isCameraEnabled} 
            onClick={toggleVideo} 
            onIcon={<Video size={20} />} 
            offIcon={<VideoOff size={20} />}
            variant="toggle" 
          />
          <ControlButton 
            active={isScreenSharing} 
            onClick={toggleScreenShare} 
            onIcon={<Monitor size={20} />} 
            offIcon={<Monitor size={20} />}
            variant="secondary"
            tooltip="Share Screen"
          />
          <ControlButton 
            active={false} 
            onClick={() => {}} 
            onIcon={<Settings size={20} />} 
            offIcon={<Settings size={20} />}
            variant="secondary" 
            tooltip="Settings"
          />
          
          <div className="w-px h-8 bg-slate-800 mx-2" />

          <button 
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
          >
            <Phone size={20} className="rotate-[135deg]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
       </div>

       {/* Right Toggles */}
       <div className="flex items-center gap-3">
         <ControlButton 
            active={isChatOpen} 
            onClick={onToggleChat} 
            onIcon={<MessageSquare size={20} />} 
            offIcon={<MessageSquare size={20} />}
            variant="ghost"
            label="Chat"
            className="hidden md:flex"
          />
          <ControlButton 
            active={false} 
            onClick={() => {}} 
            onIcon={<Users size={20} />} 
            offIcon={<Users size={20} />}
            variant="ghost"
            label="People"
            className="hidden md:flex"
          />
       </div>
    </div>
  );
};

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  variant: 'toggle' | 'secondary' | 'ghost';
  label?: string;
  tooltip?: string;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  active, onClick, onIcon, offIcon, variant, label, className 
}) => {
  
  const baseClass = "p-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    toggle: active 
      ? "bg-dark-800 hover:bg-dark-700 text-white border border-slate-700" 
      : "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
    secondary: active
      ? "bg-brand-600 text-white"
      : "bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700",
    ghost: active
      ? "bg-brand-500/10 text-brand-400"
      : "hover:bg-dark-800 text-slate-400 hover:text-white"
  };

  return (
    <button onClick={onClick} className={`${baseClass} ${variants[variant]} ${className}`}>
      {active ? onIcon : offIcon}
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};