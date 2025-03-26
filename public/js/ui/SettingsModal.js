class SettingsModal {
    constructor(socketService, notificationService, preferencesService) {
        this.socketService = socketService;
        this.notificationService = notificationService;
        this.preferencesService = preferencesService;

        // Elements DOM
        this.modal = document.getElementById('settings-modal');
        this.intervalInput = document.getElementById('interval');
        this.browserNotifInput = document.getElementById('browser-notifications');
        this.soundNotifInput = document.getElementById('sound-notifications');

        // Configuration initiale
        this.initializeListeners();
        this.saveDebounced = this.debounce(this.saveSettings.bind(this), 500);

        // Écouter les changements de configuration
        this.socketService.on('config:changed', (config) => {
            this.updateConfigUI(config);
        });
    }

    initializeListeners() {
        document.getElementById('open-settings').addEventListener('click', () => this.open());
        document.getElementById('close-settings').addEventListener('click', () => this.close());

        // Sauvegarde en temps réel
        this.intervalInput.addEventListener('input', () => {
            if (process.env.NODE_ENV === 'test') {
                this.saveSettings();
            } else {
                this.saveDebounced();
            }
        });

        // Gestion des notifications
        this.browserNotifInput.addEventListener('change', () => this.handleBrowserNotificationChange());
        this.soundNotifInput.addEventListener('change', () => this.handleSoundNotificationChange());
    }

    open() {
        this.modal.classList.remove('hidden');
        const preferences = this.preferencesService.getPreferences();
        this.browserNotifInput.checked = preferences.browser;
        this.soundNotifInput.checked = preferences.sound;
    }

    close() {
        this.modal.classList.add('hidden');
    }

    async handleBrowserNotificationChange() {
        const enabled = this.browserNotifInput.checked;
        if (enabled) {
            try {
                const granted = await this.notificationService.requestPermission();
                if (!granted) {
                    this.browserNotifInput.checked = false;
                    this.notificationService.error({
                        body: 'Permission de notification refusée',
                        icon: '/icons/error.png',
                        requireInteraction: true
                    });
                    return;
                }
            } catch (error) {
                this.browserNotifInput.checked = false;
                this.notificationService.error({
                    body: 'Erreur lors de la demande de permission',
                    icon: '/icons/error.png',
                    requireInteraction: true
                });
                return;
            }
        }
        this.preferencesService.updatePreferences({ browser: enabled });
    }

    handleSoundNotificationChange() {
        const enabled = this.soundNotifInput.checked;
        this.preferencesService.updatePreferences({ sound: enabled });
    }

    saveSettings() {
        const newSettings = {
            monitoringInterval: parseInt(this.intervalInput.value) || 1,
            dateRange: {
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
            }
        };

        this.socketService.emit('config:update', newSettings);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

export default SettingsModal;
