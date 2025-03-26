export interface Slot {
    date: string;
    time: string;
    bookingUrl: string;
}
export interface SlotFilter {
    startDate?: string;
    endDate?: string;
}
export interface SlotUpdate {
    newSlots: Slot[];
    removedSlots: Slot[];
    timestamp: number;
}
