class NotificationService {
    constructor(notificationPreferencesService) {
        this.preferencesService = notificationPreferencesService;
        this.notificationSound = new Audio('/sounds/notification.mp3');
    }

    async initialize() {
        if (this.preferencesService.isBrowserNotificationEnabled()) {
            await this.requestPermission();
        }
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Ce navigateur ne supporte pas les notifications desktop');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Erreur lors de la demande de permission:', error);
            return false;
        }
    }

    showNotification(title, options = {}) {
        // Notifications navigateur
        if (this.preferencesService.isBrowserNotificationEnabled()) {
            this.showBrowserNotification(title, options);
        }

        // Son de notification
        if (this.preferencesService.isSoundNotificationEnabled()) {
            this.playNotificationSound();
        }
    }

    showBrowserNotification(title, options = {}) {
        if (!('Notification' in window)) {
            console.warn('Ce navigateur ne supporte pas les notifications desktop');
            return;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Permission de notification non accordée');
            return;
        }

        try {
            const defaultOptions = {
                icon: '/icons/notification.png',
                badge: '/icons/badge.png',
                tag: 'doctoflex-monitor',
                renotify: true,
                requireInteraction: false,
                silent: !this.preferencesService.isSoundNotificationEnabled()
            };

            const notification = new Notification(title, {
                ...defaultOptions,
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            if (!options.requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }

        } catch (error) {
            console.error('Erreur lors de l\'affichage de la notification:', error);
        }
    }

    static success(message) {
        this.showNotification('Succès', {
            body: message,
            icon: '/icons/success.png'
        });
    }

    static error(message) {
        this.showNotification('Erreur', {
            body: message,
            icon: '/icons/error.png',
            requireInteraction: true
        });
    }

    static info(message) {
        this.showNotification('Information', {
            body: message,
            icon: '/icons/info.png'
        });
    }
}

export default NotificationService;
