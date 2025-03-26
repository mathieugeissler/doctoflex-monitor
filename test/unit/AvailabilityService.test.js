jest.mock('../../src/services/SlotScraper');
jest.mock('../../src/services/SlotFilter');
jest.mock('../../src/services/SlotNotifier');

const { AvailabilityService } = require('../../src/services/availability');

describe('AvailabilityService', () => {
    const mockSlots = [
        { date: '07/04/2025', time: '15:30' },
        { date: '23/04/2025', time: '12:30' }
    ];

    let mockScraper, mockFilter, mockNotifier, service;

    beforeEach(() => {
        jest.clearAllMocks();

        mockScraper = {
            initialize: jest.fn().mockResolvedValue(undefined),
            extractSlots: jest.fn().mockResolvedValue(mockSlots),
            close: jest.fn().mockResolvedValue(undefined)
        };

        mockFilter = {
            filterByDateRange: jest.fn().mockReturnValue(mockSlots)
        };

        mockNotifier = {
            notify: jest.fn().mockResolvedValue(undefined)
        };

        service = new AvailabilityService(mockScraper, mockFilter, mockNotifier);
    });

    test('should get found slots', async () => {
        const slots = await service.checkAvailability();
        expect(slots).toEqual(mockSlots);
        expect(mockScraper.initialize).toHaveBeenCalled();
        expect(mockScraper.extractSlots).toHaveBeenCalled();
        expect(mockScraper.close).toHaveBeenCalled();
    });

    test('should filter slots by date range', async () => {
        const startDate = '2025-04-22';
        const endDate = '2025-04-24';
        
        await service.checkAvailability(startDate, endDate);
        
        expect(mockFilter.filterByDateRange).toHaveBeenCalledWith(
            mockSlots,
            startDate,
            endDate
        );
    });

    test('should notify about new slots', async () => {
        process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/test';
        
        await service.checkAvailability();
        
        expect(mockNotifier.notify).toHaveBeenCalledWith(mockSlots);
    });

    test('should handle errors gracefully', async () => {
        mockScraper.extractSlots.mockRejectedValueOnce(new Error('Test error'));

        const slots = await service.checkAvailability();
        expect(slots).toEqual([]);
        expect(mockScraper.close).toHaveBeenCalled();
    });
});
