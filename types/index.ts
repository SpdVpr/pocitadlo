import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  userId: string;
  name: string; // encrypted
  hourlyRate: number; // encrypted
  color: string;
  totalTimeCurrentMonth: number;
  totalPriceCurrentMonth: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EntryType = 'timer' | 'manual';

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  type: EntryType;
  startTime: Timestamp;
  endTime: Timestamp | null;
  duration: number;
  price: number; // encrypted
  note?: string; // encrypted
  month: number;
  year: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActiveTimer {
  projectId: string | null;
  startTime: Timestamp | null;
}

export interface MonthlyStats {
  totalHours: number;
  totalPrice: number;
  month: number;
  year: number;
}

export interface TodoItem {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettings {
  userId: string;
  timerStartOffset: number; // in seconds: 0, 900 (15min), 1800 (30min), 3600 (60min)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
