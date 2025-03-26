import { SlotFilter } from '../../src/services/SlotFilter';
import { Slot, DateRange } from '../../src/types/Slot';

// Mock setImmediate
const mockSetImmediate = function setImmediate(callback: () => void) {
  return setTimeout(callback, 0) as unknown as NodeJS.Immediate;
};
mockSetImmediate.__promisify__ = () => Promise.resolve();
global.setImmediate = mockSetImmediate as typeof global.setImmediate;

describe('SlotFilter', () => {
  let filter: SlotFilter;

  beforeEach(() => {
    filter = new SlotFilter();
  });

  describe('filterByDateRange', () => {
    it('should filter slots within date range', () => {
      // Given
      const slots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' },
        { date: '2025-03-27', time: '10:00', bookingUrl: '/booking/124' },
        { date: '2025-03-28', time: '11:00', bookingUrl: '/booking/125' }
      ];

      const dateRange: DateRange = {
        startDate: new Date('2025-03-26'),
        endDate: new Date('2025-03-27')
      };

      // When
      const filteredSlots = filter.filterByDateRange(slots, dateRange);

      // Then
      expect(filteredSlots).toHaveLength(2);
      expect(filteredSlots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ date: '2025-03-26' }),
          expect.objectContaining({ date: '2025-03-27' })
        ])
      );
    });

    it('should return empty array when no slots match date range', () => {
      // Given
      const slots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' },
        { date: '2025-03-27', time: '10:00', bookingUrl: '/booking/124' }
      ];

      const dateRange: DateRange = {
        startDate: new Date('2025-03-28'),
        endDate: new Date('2025-03-29')
      };

      // When
      const filteredSlots = filter.filterByDateRange(slots, dateRange);

      // Then
      expect(filteredSlots).toHaveLength(0);
    });

    it('should handle empty slots array', () => {
      // Given
      const slots: Slot[] = [];
      const dateRange: DateRange = {
        startDate: new Date('2025-03-26'),
        endDate: new Date('2025-03-27')
      };

      // When
      const filteredSlots = filter.filterByDateRange(slots, dateRange);

      // Then
      expect(filteredSlots).toHaveLength(0);
    });

    it('should throw error when start date is after end date', () => {
      // Given
      const slots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
      ];

      const dateRange: DateRange = {
        startDate: new Date('2025-03-27'),
        endDate: new Date('2025-03-26')
      };

      // When/Then
      expect(() => filter.filterByDateRange(slots, dateRange)).toThrow('Start date must be before or equal to end date');
    });
  });

  describe('compareSlots', () => {
    it('should return positive number when more slots added than removed', () => {
      // Given
      const oldSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
      ];

      const newSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' },
        { date: '2025-03-27', time: '10:00', bookingUrl: '/booking/124' }
      ];

      // When
      const result = filter.compareSlots(oldSlots, newSlots);

      // Then
      expect(result).toBe(1);
    });

    it('should return 0 when no slots added or removed', () => {
      // Given
      const oldSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
      ];

      const newSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
      ];

      // When
      const result = filter.compareSlots(oldSlots, newSlots);

      // Then
      expect(result).toBe(0);
    });

    it('should return 0 when more slots removed than added', () => {
      // Given
      const oldSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' },
        { date: '2025-03-27', time: '10:00', bookingUrl: '/booking/124' }
      ];

      const newSlots: Slot[] = [
        { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
      ];

      // When
      const result = filter.compareSlots(oldSlots, newSlots);

      // Then
      expect(result).toBe(0);
    });

    it('should handle empty slots arrays', () => {
      // Given
      const oldSlots: Slot[] = [];
      const newSlots: Slot[] = [];

      // When
      const result = filter.compareSlots(oldSlots, newSlots);

      // Then
      expect(result).toBe(0);
    });
  });
});
