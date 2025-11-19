import React, { useState, useEffect } from 'react';
import { ParticipantEvent } from 'livekit-client';
import { VideoTrack, TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { MicOff, User } from 'lucide-react';

interface ParticipantTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  className?: string;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({ trackRef, className }) => {
  const { participant, publication } = trackRef;

  // State for audio status and speaking
  // Initialize based on current participant state
  const [isMicMuted, setMicMuted] = useState(!participant.isMicrophoneEnabled);
  const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);

  useEffect(() => {
    const updateState = () => {
      setMicMuted(!participant.isMicrophoneEnabled);
      setIsSpeaking(participant.isSpeaking);
    };

    // Listen for relevant events
    participant.on(ParticipantEvent.TrackMuted, updateState);
    participant.on(ParticipantEvent.TrackUnmuted, updateState);
    participant.on(ParticipantEvent.IsSpeakingChanged, updateState);
    participant.on(ParticipantEvent.LocalTrackPublished, updateState);
    participant.on(ParticipantEvent.LocalTrackUnpublished, updateState);

    // Initial check
    updateState();

    return () => {
      participant.off(ParticipantEvent.TrackMuted, updateState);
      participant.off(ParticipantEvent.TrackUnmuted, updateState);
      participant.off(ParticipantEvent.IsSpeakingChanged, updateState);
      participant.off(ParticipantEvent.LocalTrackPublished, updateState);
      participant.off(ParticipantEvent.LocalTrackUnpublished, updateState);
    };
  }, [participant]);

  // Determine video visibility based on track publication state
  // We rely on useTracks from the parent to keep trackRef updated
  const isVideoVisible = 
    publication && 
    !publication.isMuted && 
    (publication.isSubscribed || participant.isLocal) &&
    publication.track; // Ensure actual MediaStreamTrack is present

  return (
    <div className={`relative bg-dark-800 rounded-xl overflow-hidden border border-slate-800 shadow-lg group ${className}`}>
      {isVideoVisible ? (
        <VideoTrack 
          trackRef={trackRef}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-dark-900">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-inner">
             <span className="text-2xl font-bold text-white">
               {participant.identity ? participant.identity.charAt(0).toUpperCase() : <User size={32} />}
             </span>
          </div>
        </div>
      )}
      
      {/* Overlays */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 flex items-center space-x-2 max-w-[80%]">
           <span className="text-xs font-medium text-white truncate">
             {participant.isLocal ? `${participant.identity || 'You'} (You)` : participant.identity || 'Guest'}
           </span>
           {participant.isLocal && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
        </div>

        {isMicMuted && (
          <div className="bg-red-500/20 backdrop-blur-md p-1.5 rounded-full border border-red-500/20">
            <MicOff size={14} className="text-red-500" />
          </div>
        )}
      </div>
      
      {/* Speaking Indicator */}
      <div className={`absolute inset-0 border-2 border-brand-500 rounded-xl pointer-events-none transition-opacity duration-200 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};