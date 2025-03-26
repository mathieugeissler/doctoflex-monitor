import SocketService from './services/SocketService.js';
import NotificationService from './services/NotificationService.js';
import NotificationPreferencesService from './services/NotificationPreferencesService.js';
import SlotService from './services/SlotService.js';
import SettingsModal from './ui/SettingsModal.js';
import { MonitoringControls } from './ui/MonitoringControls.js';
import DateFilter from './ui/DateFilter.js';
import SlotDisplay from './ui/SlotDisplay.js';

export class App {
    constructor() {
        // Initialisation des services
        this.socketService = SocketService.getInstance();
        this.preferencesService = new NotificationPreferencesService();
        this.notificationService = new NotificationService(this.preferencesService);
        this.slotService = new SlotService(this.socketService);
        
        // Initialisation des composants UI
        this.slotDisplay = new SlotDisplay(this.slotService);
        this.monitoringControls = new MonitoringControls(this.socketService, this.notificationService, this.slotDisplay);
        this.settingsModal = new SettingsModal(this.socketService, this.notificationService, this.preferencesService);
        this.dateFilter = new DateFilter(this.slotService);

        // Configuration des callbacks
        this.slotService.setSlotUpdateCallback((slots) => {
            this.slotDisplay.displaySlots(slots);
        });

        // Initialisation des services
        this.initialize();
    }

    async initialize() {
        await this.notificationService.initialize();
        this.slotService.initialize();
    }
}

// Initialisation de l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
