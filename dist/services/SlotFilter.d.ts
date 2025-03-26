import { Slot } from '../types/Slot';
import { DateRange } from '../types/date-range';
import { SlotDiff } from '../types/slot-diff';
export declare class SlotFilter {
    private readonly logger;
    constructor();
    filterByDateRange(slots: Slot[], range: DateRange): Slot[];
    compareSlots(oldSlots: Slot[], newSlots: Slot[]): SlotDiff;
    private normalizeDate;
    private getSlotKey;
}
