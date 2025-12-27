
export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN'
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface Pitch {
  id: string;
  name: string;
  type: 'Football' | 'Tennis' | 'Padel';
  image: string;
  pricePerHour: number;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  trustScore: number;
  timestamp: number;
}

export interface BookingSlot {
  id: string;
  pitchId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:00
  status: SlotStatus;
  confirmedUserId?: string;
  requests: Request[];
}

export interface User {
  id: string;
  phone: string;
  name: string;
  password?: string;
  role: UserRole;
  trustScore: number;
  photo?: string;
}

export interface AppStorage {
  users: User[];
  bookings: BookingSlot[];
}
