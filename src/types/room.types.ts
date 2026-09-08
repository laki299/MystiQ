export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  enabled?: boolean;
  order?: number;
}

export interface PresenceUser {
  uid: string;
  anonymousName: string;
  avatar: string;
  age?: number;
  gender?: string;
  city?: string;
  language?: string;
  status: 'online';
  lastHeartbeat: number;
  expiresAt: number;
}
