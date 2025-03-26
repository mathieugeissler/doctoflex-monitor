const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement de test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const { AvailabilityService } = require('../src/services/availability');

describe('Doctoflex Integration Tests', () => {
    let service;
    let originalWebhookUrl;

    beforeAll(() => {
        // Sauvegarder l'URL originale
        originalWebhookUrl = process.env.SLACK_WEBHOOK_URL;
        // Désactiver le webhook pendant les tests
        delete process.env.SLACK_WEBHOOK_URL;
    });

    afterAll(() => {
        // Restaurer l'URL originale
        process.env.SLACK_WEBHOOK_URL = originalWebhookUrl;
    });

    beforeEach(() => {
        service = new AvailabilityService();
    });

    test('should find available slots for April', async () => {
        // Appeler la fonction checkAvailability
        const slots = await service.checkAvailability();
        
        // Vérifier qu'on a trouvé des créneaux
        expect(slots).toBeDefined();
        expect(Array.isArray(slots)).toBe(true);
        expect(slots.length).toBeGreaterThan(0);
        
        // Vérifier qu'au moins un créneau est en avril
        const aprilSlots = slots.filter(slot => slot.date.includes('04/'));
        expect(aprilSlots.length).toBeGreaterThan(0);

        // Vérifier la structure des données
        slots.forEach(slot => {
            expect(slot).toHaveProperty('date');
            expect(slot).toHaveProperty('time');
            expect(typeof slot.date).toBe('string');
            expect(typeof slot.time).toBe('string');
        });
    }, 60000); // Timeout de 60 secondes
});
