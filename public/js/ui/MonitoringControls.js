import SocketService from '../services/SocketService.js';
import NotificationService from '../services/NotificationService.js';

export class MonitoringControls {
    constructor(socketService) {
        this.socketService = socketService || SocketService.getInstance();
        this.toggleButton = document.getElementById('toggle-monitoring');
        this.refreshButton = document.getElementById('refresh-slots');
        this.statusText = document.getElementById('monitoring-status');
        this.progressIndicator = document.getElementById('progress-indicator');
        this.notificationService = NotificationService;

        this.initializeListeners();
    }

    initializeListeners() {
        this.toggleButton.addEventListener('click', () => this.toggleMonitoring());
        this.refreshButton.addEventListener('click', () => this.refreshSlots());

        this.socketService.on('monitoring:status', (data) => {
            this.updateMonitoringStatus(data.active);
        });

        this.socketService.on('error', (error) => {
            this.notificationService.error(`Erreur de surveillance: ${error.message}`);
            this.updateMonitoringStatus(false);
        });

        this.socketService.on('slots:refresh:complete', () => {
            this.progressIndicator.classList.add('translate-y-full', 'opacity-0');
            this.notificationService.success('Actualisation terminée');
        });
    }

    toggleMonitoring() {
        const isActive = this.toggleButton.textContent === 'Arrêter';
        this.socketService.emit(isActive ? 'monitoring:stop' : 'monitoring:start');
    }

    refreshSlots() {
        this.progressIndicator.classList.remove('translate-y-full', 'opacity-0');
        this.socketService.emit('slots:refresh');
        this.notificationService.info('Actualisation des créneaux en cours...');
    }

    updateMonitoringStatus(active) {
        this.toggleButton.textContent = active ? 'Arrêter' : 'Démarrer';
        this.statusText.textContent = active ? 'Surveillance active' : 'Surveillance inactive';
        this.statusText.className = active ? 'text-green-500' : 'text-gray-500';
    }
}
