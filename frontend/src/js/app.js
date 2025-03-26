import { NotificationManager } from './modules/notifications.js';
import { TableView } from './modules/tableView.js';
import { ConfigManager } from './modules/config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser Socket.IO
    const socket = io();

    // Initialiser les composants
    const notificationManager = new NotificationManager(socket);
    const tableView = new TableView('slotsTableBody');
    const configManager = new ConfigManager();

    // Éléments DOM
    const toggleButton = document.getElementById('toggleButton');
    const toggleLabel = document.getElementById('toggleLabel');
    const checkNowButton = document.getElementById('checkNowButton');

    // Initialiser les datepickers
    const startDatePicker = flatpickr('#startDate', {
        locale: 'fr',
        dateFormat: 'd/m/Y',
        onChange: () => checkAvailability()
    });

    const endDatePicker = flatpickr('#endDate', {
        locale: 'fr',
        dateFormat: 'd/m/Y',
        onChange: () => checkAvailability()
    });

    // Réinitialiser les dates
    document.getElementById('resetDates').addEventListener('click', () => {
        startDatePicker.clear();
        endDatePicker.clear();
        checkAvailability();
    });

    // Mettre à jour l'interface avec les derniers résultats
    async function updateUI() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            toggleButton.checked = data.isRunning;
            toggleLabel.textContent = data.isRunning ? 'Surveillance active' : 'Surveillance inactive';
            
            if (data.foundSlots) {
                tableView.updateTable(data.foundSlots);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
        }
    }

    // Vérifier la disponibilité
    async function checkAvailability() {
        const startDate = startDatePicker.selectedDates[0];
        const endDate = endDatePicker.selectedDates[0];

        if (!startDate || !endDate) return;

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                })
            });

            const data = await response.json();
            tableView.updateTable(data.slots || []);
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
        }
    }

    // Événements Socket.IO
    socket.on('notification', (data) => {
        notificationManager.handleNotification(data);
    });

    socket.on('statusUpdate', (data) => {
        toggleButton.checked = data.isRunning;
        toggleLabel.textContent = data.isRunning ? 'Surveillance active' : 'Surveillance inactive';
        tableView.updateTable(data.slots || []);
    });

    // Événements
    toggleButton.addEventListener('change', async () => {
        try {
            const response = await fetch('/api/toggle', { method: 'POST' });
            const data = await response.json();
            toggleLabel.textContent = data.isRunning ? 'Surveillance active' : 'Surveillance inactive';
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            toggleButton.checked = !toggleButton.checked;
        }
    });

    checkNowButton.addEventListener('click', checkAvailability);

    // Événements de configuration
    document.addEventListener('configUpdated', (e) => {
        notificationManager.updateConfig(e.detail);
    });

    // Charger les derniers créneaux disponibles
    async function loadLastAvailableSlots() {
        try {
            const response = await fetch('/api/slots/latest');
            const data = await response.json();
            if (data.slots) {
                tableView.updateTable(data.slots);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des derniers créneaux:', error);
        }
    }

    // Initialisation
    async function init() {
        await notificationManager.setupBrowserNotifications();
        const config = notificationManager.loadConfig();
        configManager.loadConfig(config);
        await Promise.all([
            updateUI(),
            loadLastAvailableSlots()
        ]);
    }

    init();
    setInterval(updateUI, 30000); // Mise à jour toutes les 30 secondes
});
