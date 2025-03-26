class PreferencesService {
    static instance = null;

    constructor() {
        if (!PreferencesService.instance) {
            PreferencesService.instance = this;
            this.preferences = {
                browser: false,
                sound: false
            };
            this.loadPreferences();
        }
        return PreferencesService.instance;
    }

    static getInstance() {
        if (!PreferencesService.instance) {
            PreferencesService.instance = new PreferencesService();
        }
        return PreferencesService.instance;
    }

    loadPreferences() {
        try {
            const savedPreferences = localStorage.getItem('preferences');
            if (savedPreferences) {
                this.preferences = JSON.parse(savedPreferences);
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    getPreferences() {
        return { ...this.preferences };
    }

    updatePreferences(newPreferences) {
        this.preferences = {
            ...this.preferences,
            ...newPreferences
        };
        this.savePreferences();
    }
}

export default PreferencesService; 