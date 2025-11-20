import React, { useState, useEffect } from 'react';
import { ParticipantEvent } from 'livekit-client';
import { VideoTrack, TrackReferenceOrPlaceholder, TrackReference } from '@livekit/components-react';
import { MicOff, User } from 'lucide-react';

interface ParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  className?: string;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({ trackRef, className }) => {
  const { participant, publication } = trackRef;
  const [isMicMuted, setMicMuted] = useState(!participant.isMicrophoneEnabled);
  const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);

  useEffect(() => {
    const updateState = () => {
      setMicMuted(!participant.isMicrophoneEnabled);
      setIsSpeaking(participant.isSpeaking);
    };

    participant.on(ParticipantEvent.TrackMuted, updateState);
    participant.on(ParticipantEvent.TrackUnmuted, updateState);
    participant.on(ParticipantEvent.IsSpeakingChanged, updateState);
    participant.on(ParticipantEvent.LocalTrackPublished, updateState);
    participant.on(ParticipantEvent.LocalTrackUnpublished, updateState);

    updateState();

    return () => {
      participant.off(ParticipantEvent.TrackMuted, updateState);
      participant.off(ParticipantEvent.TrackUnmuted, updateState);
      participant.off(ParticipantEvent.IsSpeakingChanged, updateState);
      participant.off(ParticipantEvent.LocalTrackPublished, updateState);
      participant.off(ParticipantEvent.LocalTrackUnpublished, updateState);
    };
  }, [participant]);

  const isVideoVisible = 
    publication && 
    !publication.isMuted && 
    (publication.isSubscribed || participant.isLocal) &&
    publication.track;

  // Generate a consistent gradient based on identity for avatar background
  const getGradient = (id: string) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-violet-500 to-fuchsia-600',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`relative bg-dark-800 rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-xl transition-all duration-300 ${className}`}>
      
      {/* Speaking Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none z-20 ${isSpeaking ? 'opacity-100 shadow-[inset_0_0_0_2px_rgba(96,165,250,0.8)]' : 'opacity-0'}`} />

      {isVideoVisible ? (
        <VideoTrack 
          trackRef={trackRef as TrackReference}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-dark-900 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 to-transparent"></div>
          
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGradient(participant.identity || '')} flex items-center justify-center shadow-lg relative z-10`}>
             <span className="text-3xl font-bold text-white">
               {participant.identity ? participant.identity.charAt(0).toUpperCase() : <User size={40} />}
             </span>
          </div>
        </div>
      )}
      
      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pointer-events-none z-10">
        <div className="flex items-center gap-2 max-w-[80%]">
          {isSpeaking && (
             <div className="flex space-x-0.5 h-3 items-end">
                <div className="w-1 bg-brand-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3"></div>
                <div className="w-1 bg-brand-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.1s] h-2"></div>
                <div className="w-1 bg-brand-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-3"></div>
             </div>
          )}
          <span className="text-sm font-medium text-white drop-shadow-md truncate">
            {participant.isLocal ? 'You' : participant.identity}
          </span>
        </div>

        {isMicMuted && (
          <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full ring-1 ring-white/10">
            <MicOff size={14} className="text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
};