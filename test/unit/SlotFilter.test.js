const SlotFilter = require('../../src/services/SlotFilter');

describe('SlotFilter', () => {
    let filter;
    const testSlots = [
        { date: '07/04/2025', time: '15:30' },
        { date: '23/04/2025', time: '12:30' },
        { date: '25/04/2025', time: '10:30' },
        { date: '30/04/2025', time: '12:00' }
    ];

    beforeEach(() => {
        filter = new SlotFilter();
    });

    test('should return all slots when no dates are specified', () => {
        const filteredSlots = filter.filterByDateRange(testSlots);
        expect(filteredSlots).toEqual(testSlots);
    });

    test('should filter slots after start date', () => {
        const startDate = '2025-04-24';
        const filteredSlots = filter.filterByDateRange(testSlots, startDate);
        
        expect(filteredSlots).toEqual([
            { date: '25/04/2025', time: '10:30' },
            { date: '30/04/2025', time: '12:00' }
        ]);
    });

    test('should filter slots before end date', () => {
        const endDate = '2025-04-24';
        const filteredSlots = filter.filterByDateRange(testSlots, null, endDate);
        
        expect(filteredSlots).toEqual([
            { date: '07/04/2025', time: '15:30' },
            { date: '23/04/2025', time: '12:30' }
        ]);
    });

    test('should filter slots between start and end dates', () => {
        const startDate = '2025-04-22';
        const endDate = '2025-04-26';
        const filteredSlots = filter.filterByDateRange(testSlots, startDate, endDate);
        
        expect(filteredSlots).toEqual([
            { date: '23/04/2025', time: '12:30' },
            { date: '25/04/2025', time: '10:30' }
        ]);
    });
});
