export interface Slot {
  date: string;      // Format: YYYY-MM-DD
  time: string;      // Format: HH:mm
  bookingUrl: string; // URL directe de réservation
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SlotFilter {
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
}

export interface SlotUpdate {
  newSlots: Slot[];
  removedSlots: Slot[];
  timestamp: number;
}

export interface SlotStorage {
  lastUpdate?: string;
  slots: Slot[];
} 