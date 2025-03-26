import { Logger } from 'winston';
import { Slot } from '../types/Slot';
import { DateRange } from '../types/date-range';
import { createLogger } from '../utils/logger';

export class SlotFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger('SlotFilter');
  }

  public filterByDateRange(slots: Slot[], range: DateRange): Slot[] {
    try {
      const startDate = this.normalizeDate(range.startDate);
      const endDate = this.normalizeDate(range.endDate);

      if (startDate > endDate) {
        throw new Error('Start date must be before or equal to end date');
      }

      return slots.filter((slot) => {
        const [year, month, day] = slot.date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day);
        return slotDate >= startDate && slotDate <= endDate;
      });
    } catch (error) {
      this.logger.error('Error filtering slots by date range', { error });
      throw error;
    }
  }

  public compareSlots(oldSlots: Slot[], newSlots: Slot[]): number {
    const added = newSlots.filter((slot) => !oldSlots.some((oldSlot) => oldSlot.date === slot.date));
    const removed = oldSlots.filter((oldSlot) => !newSlots.some((slot) => slot.date === oldSlot.date));
    if(added.length > removed.length) {
      return added.length - removed.length;
    } else {
      return 0;
    }
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
