import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  name: string;
  hourlyRate: number;
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
  projectId: string;
  type: EntryType;
  startTime: Timestamp;
  endTime: Timestamp | null;
  duration: number;
  price: number;
  note?: string;
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
