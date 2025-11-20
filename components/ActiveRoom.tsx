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
      video={config.videoEnabled}
      audio={config.audioEnabled}
      onDisconnected={onLeave}
      className="h-screen w-screen overflow-hidden relative"
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
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const getGridLayout = (count: number) => {
    if (count === 0) return 'flex items-center justify-center';
    if (count === 1) return 'grid grid-cols-1 max-w-6xl mx-auto h-full';
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto h-full items-center';
    if (count <= 4) return 'grid grid-cols-2 gap-4 max-w-6xl mx-auto h-full content-center';
    if (count <= 9) return 'grid grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto h-full content-center';
    return 'grid grid-cols-3 md:grid-cols-4 gap-4 h-full content-center';
  };

  return (
    <div className="h-full w-full p-4 md:p-6 pb-24 flex relative">
      {/* Main Video Grid */}
      <div className={`flex-1 transition-all duration-500 ease-in-out ${isChatOpen ? 'mr-4 md:mr-6' : ''}`}>
        
        {tracks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="relative animate-spin text-brand-400" size={48} />
              </div>
              <p className="text-lg text-slate-400 mt-6 font-medium tracking-wide">Waiting for others to join...</p>
            </div>
        ) : (
          <div className={`w-full h-full ${getGridLayout(tracks.length)}`}>
            {tracks.map((track) => (
              <ParticipantTile 
                key={track.participant.sid ?? track.participant.identity ?? track.source} 
                trackRef={track} 
                className="w-full h-full shadow-2xl"
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Controls */}
      <ControlBar 
        onLeave={onLeave} 
        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
        isChatOpen={isChatOpen}
      />
    </div>
  );
};