
// Use correct types from types.ts
import { Pitch, BookingSlot, SlotStatus, User, UserRole } from '../types';

export const MOCK_PITCHES: Pitch[] = [
  { id: 'p1', name: 'Tiran Yassmine', type: 'Football', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400', pricePerHour: 25 },
  { id: 'p2', name: 'Green Arena', type: 'Football', image: 'https://images.unsplash.com/photo-1459865264687-5d593c42ee4e?auto=format&fit=crop&q=80&w=400', pricePerHour: 30 },
  { id: 'p3', name: 'Padel Pro 1', type: 'Padel', image: 'https://images.unsplash.com/photo-1626225010667-f9d957d18910?auto=format&fit=crop&q=80&w=400', pricePerHour: 40 },
];

export const MOCK_USER: User = {
  id: 'u1',
  phone: '+212 600-112233',
  name: 'Ahmed Benani',
  role: UserRole.PLAYER,
  trustScore: 85
};

export const MOCK_ADMIN: User = {
  id: 'admin1',
  phone: '+212 699-000000',
  name: 'Yassmine Manager',
  role: UserRole.ADMIN,
  trustScore: 100
};

// Fixing INITIAL_BOOKINGS to use BookingSlot interface and SlotStatus enum
export const INITIAL_BOOKINGS: BookingSlot[] = [
  {
    id: 'b1',
    pitchId: 'p1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '18:00',
    status: SlotStatus.CONFIRMED,
    confirmedUserId: 'u2',
    requests: [
      {
        id: 'r1',
        userId: 'u2',
        userName: 'Zaid Karim',
        userPhone: '+212 655-443322',
        trustScore: 90,
        timestamp: Date.now()
      }
    ]
  },
  {
    id: 'b2',
    pitchId: 'p1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '20:00',
    status: SlotStatus.PENDING,
    requests: [
      {
        id: 'r2',
        userId: 'u3',
        userName: 'Hassan Mourad',
        userPhone: '+212 622-118899',
        trustScore: 40,
        timestamp: Date.now()
      }
    ]
  }
];
