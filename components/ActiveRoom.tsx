import React, { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ControlBar } from './ControlBar';
import { ParticipantTile } from './ParticipantTile';
import { Chat } from './Chat';
import { SessionConfig } from '../types';
import { Loader2 } from 'lucide-react';

interface ActiveRoomProps {
  config: SessionConfig;
  onLeave: () => void;
}

export const ActiveRoom: React.FC<ActiveRoomProps> = ({ config, onLeave }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <LiveKitRoom
      serverUrl={config.url}
      token={config.token}
      connect={true}
      video={config.videoEnabled} // Use the passed preference
      audio={config.audioEnabled} // Use the passed preference
      onDisconnected={onLeave}
      className="h-screen w-screen bg-dark-950 flex flex-col overflow-hidden"
      data-lk-theme="default"
    >
      <RoomContent 
        isChatOpen={isChatOpen} 
        setIsChatOpen={setIsChatOpen} 
        onLeave={onLeave} 
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

const RoomContent: React.FC<{
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  onLeave: () => void;
}> = ({ isChatOpen, setIsChatOpen, onLeave }) => {
  // Get all video tracks from Camera or ScreenShare
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const getGridLayout = (count: number) => {
    if (count === 0) return 'flex items-center justify-center';
    if (count === 1) return 'grid grid-cols-1 max-w-5xl mx-auto h-full max-h-[80vh]';
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto h-full max-h-[60vh] items-center';
    if (count <= 4) return 'grid grid-cols-2 gap-4 max-w-5xl mx-auto h-full max-h-[80vh]';
    if (count <= 9) return 'grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto h-full';
    return 'grid grid-cols-3 md:grid-cols-4 gap-4';
  };

  return (
    <>
      <div className="flex-1 relative flex p-4 md:p-6 overflow-hidden">
        {/* Video Grid Area */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-0 md:mr-4' : ''}`}>
          
          {tracks.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500">
               <Loader2 className="animate-spin mb-4 text-brand-500" size={48} />
               <p className="text-lg">Waiting for participants...</p>
             </div>
          ) : (
            <div className={`w-full h-full ${getGridLayout(tracks.length)} content-center`}>
              {tracks.map((track) => (
                <ParticipantTile 
                  key={track.participant.sid ?? track.participant.identity ?? track.source} 
                  trackRef={track} 
                  className="w-full h-full shadow-2xl ring-1 ring-white/5 bg-dark-800"
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Overlay/Sidebar */}
        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>

      <ControlBar 
        onLeave={onLeave} 
        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
        isChatOpen={isChatOpen}
      />
    </>
  );
};