class NotificationPreferencesService {
    constructor() {
        this.loadPreferences();
    }

    loadPreferences() {
        const savedPreferences = localStorage.getItem('notificationPreferences');
        this.preferences = savedPreferences ? JSON.parse(savedPreferences) : {
            browser: true,
            sound: true
        };
    }

    savePreferences() {
        localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    }

    getPreferences() {
        return this.preferences;
    }

    updatePreferences(preferences) {
        this.preferences = { ...this.preferences, ...preferences };
        this.savePreferences();
    }

    isBrowserNotificationEnabled() {
        return this.preferences.browser;
    }

    isSoundNotificationEnabled() {
        return this.preferences.sound;
    }

    toggleBrowserNotification() {
        this.preferences.browser = !this.preferences.browser;
        this.savePreferences();
        return this.preferences.browser;
    }

    toggleSoundNotification() {
        this.preferences.sound = !this.preferences.sound;
        this.savePreferences();
        return this.preferences.sound;
    }
}

export default NotificationPreferencesService;
