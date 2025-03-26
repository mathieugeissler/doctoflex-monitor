export class NotificationManager {
    constructor(socket) {
        this.socket = socket;
        this.browserNotificationsEnabled = false;
    }

    async setupBrowserNotifications() {
        if (!('Notification' in window)) {
            console.log('Ce navigateur ne supporte pas les notifications desktop');
            return;
        }

        if (Notification.permission === 'granted') {
            this.browserNotificationsEnabled = true;
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.browserNotificationsEnabled = permission === 'granted';
        }
    }

    handleNotification(data) {
        if (this.browserNotificationsEnabled) {
            new Notification(data.title, {
                body: data.body,
                icon: '/favicon.ico'
            });
        }
    }

    updateConfig(config) {
        this.browserNotificationsEnabled = config.browser;
        this.socket.emit('updateNotificationConfig', config);
        localStorage.setItem('notificationConfig', JSON.stringify(config));
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('notificationConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            this.browserNotificationsEnabled = config.browser;
            return config;
        }
        return { browser: false };
    }
}
