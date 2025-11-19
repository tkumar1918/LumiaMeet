export interface SessionConfig {
  url: string;
  token: string;
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
}

export interface TrackInfo {
  participantIdentity: string;
  source: string;
  isMuted: boolean;
}