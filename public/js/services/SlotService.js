import { formatDate } from '../utils/dateUtils.js';

class SlotService {
    constructor(socketService) {
        this.socketService = socketService;
        this.currentSlots = [];
        this.lastUpdate = null;
    }

    getLastUpdate() {
        return this.lastUpdate;
    }

    initialize() {
        this.socketService.on('slots:new', (data) => {
            this.currentSlots = data.slots;
            this.lastUpdate = data.lastUpdate;
            this.notifySlotUpdate();
        });

        this.socketService.on('slots:changes', (data) => {
            if (data.added > 0) {
                this.showNotification(`${data.added} nouveaux créneaux disponibles !`);
            }
        });
    }

    setSlotUpdateCallback(callback) {
        this.onSlotsUpdated = callback;
    }

    notifySlotUpdate() {
        if (this.onSlotsUpdated) {
            this.onSlotsUpdated(this.currentSlots);
        }
    }

    updateDateRange(startDate, endDate) {
        this.socketService.emit('config:update', { startDate, endDate });
    }

    formatDate(date) {
        return formatDate(date);
    }
}

export default SlotService;
