export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface PresenceUser {
  uid: string;
  anonymousName: string;
  avatar: string;
  lastActiveAt: number;
}

