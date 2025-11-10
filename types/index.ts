import { Timestamp } from 'firebase/firestore';

export type Currency = 'CZK' | 'EUR';

export interface Project {
  id: string;
  userId: string;
  name: string; // encrypted
  hourlyRate: number; // encrypted
  currency: Currency;
  color: string;
  totalTimeCurrentMonth: number;
  totalPriceCurrentMonth: number;
  isActive: boolean;
  order: number;
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
  currency: Currency;
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

export interface InvoiceSettings {
  userId: string;
  companyName: string;
  street: string;
  city: string;
  zipCode: string;
  ico: string;
  dic?: string;
  phone?: string;
  email?: string;
  bankAccount?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectInvoiceSettings {
  projectId: string;
  clientName: string;
  street: string;
  city: string;
  zipCode: string;
  ico?: string;
  dic?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PaymentMethod = 'transfer' | 'cash';

export interface Invoice {
  id: string;
  userId: string;
  projectId: string;
  invoiceNumber: string;
  variableSymbol: string;
  issueDate: Timestamp;
  dueDate: Timestamp;
  description: string;
  hours: number;
  hourlyRate: number;
  totalPrice: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  supplier: {
    companyName: string;
    street: string;
    city: string;
    zipCode: string;
    ico: string;
    dic?: string;
    phone?: string;
    email?: string;
    bankAccount?: string;
  };
  client: {
    companyName: string;
    street: string;
    city: string;
    zipCode: string;
    ico?: string;
    dic?: string;
  };
  createdAt: Timestamp;
}
