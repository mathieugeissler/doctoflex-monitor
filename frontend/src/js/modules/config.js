export class ConfigManager {
    constructor() {
        this.configModal = document.getElementById('configModal');
        this.configButton = document.getElementById('configButton');
        this.closeConfigModal = document.getElementById('closeConfigModal');
        this.configForm = document.getElementById('configForm');
        this.browserNotificationsToggle = document.getElementById('browserNotificationsToggle');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal controls
        this.configButton.addEventListener('click', () => this.openModal());
        this.closeConfigModal.addEventListener('click', () => this.closeModal());
        this.configModal.addEventListener('click', (e) => {
            if (e.target === this.configModal) {
                this.closeModal();
            }
        });

        // Form submission
        this.configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });
    }

    openModal() {
        this.configModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.configModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    saveConfig() {
        const config = {
            browser: this.browserNotificationsToggle.checked
        };
        
        // Émettre un événement personnalisé pour la mise à jour de la configuration
        const event = new CustomEvent('configUpdated', { detail: config });
        document.dispatchEvent(event);
        
        this.closeModal();
    }

    loadConfig(config) {
        this.browserNotificationsToggle.checked = config.browser;
    }
}
