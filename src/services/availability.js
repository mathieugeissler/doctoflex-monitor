const SlotScraper = require('./SlotScraper');
const SlotFilter = require('./SlotFilter');
const SlotNotifier = require('./SlotNotifier');
require('dotenv').config();

const DOCTOR_URL = 'https://www.doctoflex.fr/details/213049';

class AvailabilityService {
    constructor(scraper = null, filter = null, notifier = null) {
        this.scraper = scraper || new SlotScraper(DOCTOR_URL);
        this.filter = filter || new SlotFilter();
        this.notifier = notifier || new SlotNotifier();
        this.previousSlots = [];
    }

    getFoundSlots() {
        return this.previousSlots;
    }

    async checkAvailability(startDate = null, endDate = null) {
        try {
            await this.scraper.initialize();

            // Extraire les créneaux
            const slots = await this.scraper.extractSlots();
            if (!slots || !Array.isArray(slots)) {
                return [];
            }

            // Filtrer les créneaux par date
            const filteredSlots = this.filter.filterByDateRange(slots, startDate, endDate);

            console.log('Créneaux extraits:', filteredSlots);

            // Détecter les nouveaux créneaux
            const newSlots = filteredSlots.filter(slot => 
                !this.previousSlots.some(prevSlot => 
                    prevSlot.date === slot.date && prevSlot.time === slot.time
                )
            );

            // Mettre à jour les créneaux précédents
            this.previousSlots = filteredSlots;

            // Envoyer une notification s'il y a de nouveaux créneaux
            if (this.notifier && newSlots.length > 0) {
                await this.notifier.notify(newSlots);
            }

            return filteredSlots;
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
            return [];
        } finally {
            await this.scraper.close();
        }
    }
}

// Créer une instance singleton du service
const availabilityService = new AvailabilityService();

module.exports = {
    AvailabilityService,
    checkAvailability: (startDate, endDate) => 
        availabilityService.checkAvailability(startDate, endDate),
    getFoundSlots: () => availabilityService.getFoundSlots()
};
