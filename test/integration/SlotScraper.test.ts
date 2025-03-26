/* istanbul ignore file */
import { SlotScraper } from '../../src/services/SlotScraper';

describe('SlotScraper Integration', () => {
  let scraper: SlotScraper;

  beforeEach(() => {
    scraper = new SlotScraper();
  });

  it('should extract slots from Doctoflex website', async () => {
    const slots = await scraper.extractSlots();

    expect(slots).toBeDefined();
    expect(Array.isArray(slots)).toBe(true);
    
    if (slots.length > 0) {
      const slot = slots[0];
      expect(slot).toHaveProperty('date');
      expect(slot).toHaveProperty('time');
      expect(slot).toHaveProperty('bookingUrl');

      // Validate data formats
      expect(slot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(slot.time).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.bookingUrl).toContain('/booking/');
    }
  }, 120000); // Timeout plus long pour les tests d'intégration
});