const SlotScraper = require('../../src/services/SlotScraper');

// Mock Puppeteer
jest.mock('puppeteer', () => ({
    launch: jest.fn().mockImplementation(() => ({
        newPage: jest.fn().mockResolvedValue({
            goto: jest.fn(),
            waitForSelector: jest.fn(),
            select: jest.fn(),
            waitForNetworkIdle: jest.fn(),
            evaluate: jest.fn().mockResolvedValue([
                { date: '07/04/2025', time: '15:30' },
                { date: '23/04/2025', time: '12:30' }
            ]),
            close: jest.fn()
        }),
        close: jest.fn()
    }))
}));

describe('SlotScraper', () => {
    let scraper;
    const doctorUrl = 'https://test.com/doctor';

    beforeEach(() => {
        scraper = new SlotScraper(doctorUrl);
    });

    test('should initialize browser and page', async () => {
        await scraper.initialize();
        expect(scraper.browser).toBeDefined();
        expect(scraper.page).toBeDefined();
    });

    test('should extract slots from page', async () => {
        await scraper.initialize();
        const slots = await scraper.extractSlots();

        expect(slots).toEqual([
            { date: '07/04/2025', time: '15:30' },
            { date: '23/04/2025', time: '12:30' }
        ]);
    });

    test('should close browser and page', async () => {
        await scraper.initialize();
        await scraper.close();

        expect(scraper.browser.close).toHaveBeenCalled();
        expect(scraper.page.close).toHaveBeenCalled();
    });
});
