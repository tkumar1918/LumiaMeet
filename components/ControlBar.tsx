import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  Monitor, 
  MessageSquare, 
  Phone, 
  MoreVertical,
  Signal, SignalHigh, SignalMedium, SignalLow, WifiOff
} from 'lucide-react';
import { useRoomContext } from '@livekit/components-react';
import { ParticipantEvent, ConnectionQuality } from 'livekit-client';

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
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown);

  useEffect(() => {
    const onLocalTrackUpdate = () => {
      setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);
      setIsCameraEnabled(room.localParticipant.isCameraEnabled);
      setIsScreenSharing(room.localParticipant.isScreenShareEnabled);
    };

    const onConnectionQualityUpdate = (quality: ConnectionQuality) => {
      setConnectionQuality(quality);
    };

    room.localParticipant.on(ParticipantEvent.LocalTrackPublished, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.LocalTrackUnpublished, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.TrackMuted, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.TrackUnmuted, onLocalTrackUpdate);
    room.localParticipant.on(ParticipantEvent.ConnectionQualityChanged, onConnectionQualityUpdate);
    
    return () => {
        room.localParticipant.off(ParticipantEvent.LocalTrackPublished, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.LocalTrackUnpublished, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.TrackMuted, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.TrackUnmuted, onLocalTrackUpdate);
        room.localParticipant.off(ParticipantEvent.ConnectionQualityChanged, onConnectionQualityUpdate);
    };
  }, [room]);

  const toggleAudio = () => room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  const toggleVideo = () => room.localParticipant.setCameraEnabled(!isCameraEnabled);
  const toggleScreenShare = () => room.localParticipant.setScreenShareEnabled(!isScreenSharing);

  const getSignalIcon = () => {
    switch (connectionQuality) {
      case ConnectionQuality.Excellent: return <SignalHigh size={16} className="text-green-400" />;
      case ConnectionQuality.Good: return <SignalMedium size={16} className="text-yellow-400" />;
      case ConnectionQuality.Poor: return <SignalLow size={16} className="text-orange-400" />;
      case ConnectionQuality.Lost: return <WifiOff size={16} className="text-red-500" />;
      default: return <Signal size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-500">
       
       {/* Connection Status Pill */}
       <div className="hidden md:flex items-center justify-center h-12 px-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-slate-400 shadow-lg">
          {getSignalIcon()}
       </div>

       {/* Main Controls Dock */}
       <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          <ControlButton 
            active={isMicrophoneEnabled} 
            onClick={toggleAudio} 
            onIcon={<Mic size={20} />} 
            offIcon={<MicOff size={20} />}
            tooltip={isMicrophoneEnabled ? "Mute" : "Unmute"}
          />
          <ControlButton 
            active={isCameraEnabled} 
            onClick={toggleVideo} 
            onIcon={<Video size={20} />} 
            offIcon={<VideoOff size={20} />}
            tooltip={isCameraEnabled ? "Stop Video" : "Start Video"}
          />
          <ControlButton 
            active={isScreenSharing} 
            onClick={toggleScreenShare} 
            onIcon={<Monitor size={20} />} 
            offIcon={<Monitor size={20} />}
            variant="secondary"
            tooltip="Share Screen"
            className="hidden sm:flex"
          />
          <ControlButton 
            active={isChatOpen} 
            onClick={onToggleChat} 
            onIcon={<MessageSquare size={20} />} 
            offIcon={<MessageSquare size={20} />}
            variant="secondary"
            tooltip="Chat"
          />
          
          <div className="w-px h-8 bg-white/10 mx-1" />

          <button 
            onClick={onLeave}
            className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-95"
          >
            <Phone size={18} className="fill-current" />
            <span className="hidden sm:inline">End</span>
          </button>
       </div>

       {/* More Options */}
       <div className="hidden md:flex items-center justify-center h-12 w-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shadow-lg">
          <MoreVertical size={20} />
       </div>
    </div>
  );
};

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  variant?: 'primary' | 'secondary';
  tooltip?: string;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  active, onClick, onIcon, offIcon, variant = 'primary', tooltip, className 
}) => {
  
  const baseClass = "w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center";
  
  // Primary logic: Active = Normal/White, Inactive = Red/Strike
  // Secondary logic: Active = Blue, Inactive = Normal
  
  let styleClass = "";
  
  if (variant === 'primary') {
    styleClass = active 
      ? "bg-white/10 hover:bg-white/20 text-white" 
      : "bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-900/50";
  } else {
    styleClass = active
      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40"
      : "bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white";
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${styleClass} ${className}`} title={tooltip}>
      {active ? onIcon : offIcon}
    </button>
  );
};