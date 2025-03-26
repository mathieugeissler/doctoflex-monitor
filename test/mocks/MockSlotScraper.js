class MockSlotScraper {
    constructor() {
        this.mockSlots = [
            { date: '07/04/2025', time: '15:30' },
            { date: '07/04/2025', time: '16:00' },
            { date: '23/04/2025', time: '12:30' },
            { date: '23/04/2025', time: '14:30' },
            { date: '23/04/2025', time: '16:00' },
            { date: '25/04/2025', time: '10:30' },
            { date: '25/04/2025', time: '11:00' },
            { date: '25/04/2025', time: '12:00' },
            { date: '25/04/2025', time: '12:30' },
            { date: '25/04/2025', time: '15:30' },
            { date: '25/04/2025', time: '16:00' },
            { date: '30/04/2025', time: '12:00' },
            { date: '30/04/2025', time: '12:30' },
            { date: '30/04/2025', time: '14:30' },
            { date: '30/04/2025', time: '15:30' },
            { date: '30/04/2025', time: '16:00' }
        ];
    }

    async initialize() {
        // Ne rien faire
    }

    async close() {
        // Ne rien faire
    }

    async extractSlots() {
        return this.mockSlots;
    }
}

module.exports = MockSlotScraper;
