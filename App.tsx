import React, { useState } from 'react';
import { PreJoinScreen } from './components/PreJoinScreen';
import { ActiveRoom } from './components/ActiveRoom';
import { SessionConfig } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleJoin = async (roomName: string, participantName: string, audioEnabled: boolean, videoEnabled: boolean) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Dynamically determine the hostname (localhost or IP address)
      // Fallback to 'localhost' if window.location.hostname is empty (prevents http://:8080 errors)
      const hostname = window.location.hostname || 'localhost';
      const tokenEndpoint = `http://${hostname}:8080/token`;
      const liveKitUrl = `ws://${hostname}:7880`;

      console.log(`[App] Fetching token from: ${tokenEndpoint}`);
      console.log(`[App] LiveKit Server URL: ${liveKitUrl}`);

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to obtain token: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.token) {
         throw new Error('Server response did not contain a token');
      }

      setSession({
        url: liveKitUrl,
        token: data.token,
        name: participantName,
        audioEnabled, // Store user preference
        videoEnabled  // Store user preference
      });
    } catch (err) {
      console.error("[App] Connection failed:", err);
      setError(err instanceof Error ? err.message : 'Failed to connect. Ensure the token server is running and accessible.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = () => {
    setSession(null);
  };

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500/30 selection:text-brand-200">
      {!session ? (
        <PreJoinScreen 
          onJoin={handleJoin} 
          isLoading={isLoading} 
          error={error}
        />
      ) : (
        <ActiveRoom 
          config={session} 
          onLeave={handleLeave} 
        />
      )}
    </div>
  );
};

export default App;