import SocketService from './services/SocketService.js';
import NotificationService from './services/NotificationService.js';
import SlotService from './services/SlotService.js';
import SettingsModal from './ui/SettingsModal.js';
import MonitoringControls from './ui/MonitoringControls.js';
import DateFilter from './ui/DateFilter.js';
import SlotDisplay from './ui/SlotDisplay.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des services
    const socketService = SocketService.getInstance();
    const slotService = new SlotService(socketService);
    
    // Initialisation des composants UI
    const slotDisplay = new SlotDisplay(slotService);
    const monitoringControls = new MonitoringControls(socketService, NotificationService);
    const settingsModal = new SettingsModal(socketService, NotificationService);
    const dateFilter = new DateFilter((startDate, endDate) => {
        const filteredSlots = slotService.filterSlots(startDate, endDate);
        slotDisplay.displaySlots(filteredSlots);
    });

    // Configuration des callbacks
    slotService.setSlotUpdateCallback((slots) => {
        const { startDate, endDate } = dateFilter.getDateRange();
        const filteredSlots = slotService.filterSlots(startDate, endDate);
        slotDisplay.displaySlots(filteredSlots);
        NotificationService.success('Créneaux mis à jour');
    });

    // Initialisation des services
    slotService.initialize();


    // Gestionnaire de dates
    function updateDatePreferences() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        if (startDate && endDate) {
            if (startDate > endDate) {
                showNotification('La date de début doit être antérieure à la date de fin', 'error');
                return;
            }
        }

        socket.emit('client:preferences', {
            dateRange: {
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null
            }
        });

        filterAndDisplaySlots();
    }

    // Filtrer et afficher les créneaux
    function filterAndDisplaySlots() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        const filteredSlots = currentSlots.filter(slot => {
            if (!startDate || !endDate) return true;
            const slotDate = new Date(slot.date);
            return slotDate >= startDate && slotDate <= endDate;
        });

        displaySlots(filteredSlots);
        if (filteredSlots.length === 0 && startDate && endDate) {
            showNotification('Aucun créneau disponible pour la période sélectionnée', 'info');
        }
    }

    // Afficher les créneaux
    function displaySlots(slots) {
        slotsContainer.innerHTML = '';
        if (slots.length === 0) {
            slotsContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">Aucun créneau disponible pour la période sélectionnée</p>
                </div>
            `;
            return;
        }

        // Trier les créneaux par date et heure
        slots.sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;
            return a.time.localeCompare(b.time);
        });

        slots.forEach(slot => {
            slotsContainer.appendChild(createSlotCard(slot));
        });
    }

    // Écouteurs d'événements
    startDateInput.addEventListener('change', updateDatePreferences);
    endDateInput.addEventListener('change', updateDatePreferences);
    toggleMonitoringBtn.addEventListener('click', toggleMonitoring);
    openSettingsBtn.addEventListener('click', openModal);
    closeSettingsBtn.addEventListener('click', closeModal);
    saveSettingsBtn.addEventListener('click', saveSettings);
    cancelSettingsBtn.addEventListener('click', closeModal);

    // Fermer la modal si on clique en dehors
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeModal();
        }
    });

    // Gestionnaire de notifications
    const notifications = {
        success: (message) => {
            showNotification(message, 'success');
            if (settings.notifications && Notification.permission === 'granted') {
                new Notification('DoctofleX Monitor', {
                    body: message,
                    icon: '/favicon.ico'
                });
            }
        },
        error: (message) => showNotification(message, 'error'),
        info: (message) => showNotification(message, 'info'),
    };

    // Afficher une notification
    function showNotification(message, type = 'success', duration = 3000) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${type}`;
        notificationEl.innerHTML = `
            <div class="flex items-center">
                <span class="flex-1">${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        // Ajouter la notification au conteneur
        const container = document.getElementById('notification');
        container.appendChild(notificationEl);

        // Animation d'entrée
        setTimeout(() => notificationEl.classList.add('visible'), 100);

        // Suppression automatique
        if (duration > 0) {
            setTimeout(() => {
                notificationEl.classList.remove('visible');
                setTimeout(() => notificationEl.remove(), 300);
            }, duration);
        }
    }

    // Créer une carte de créneau
    function createSlotCard(slot) {
        const card = document.createElement('div');
        card.className = 'card transform transition-all duration-300 hover:scale-105 hover:shadow-lg';
        card.innerHTML = `
            <div class="p-4">
                <p class="text-lg font-semibold text-primary">${formatDate(slot.date)}</p>
                <p class="text-secondary mt-1">${slot.time}</p>
                <a href="${slot.bookingUrl}" target="_blank" class="btn-primary mt-4 inline-block transition-colors duration-300">
                    Réserver
                </a>
            </div>
        `;
        return card;
    }

    // Formater une date
    function formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Écouteurs Socket.IO
    socket.on('connect', () => {
        notifications.success('Connecté au serveur');
        statusIndicator.classList.remove('error');

        // Vérifier les permissions de notification au démarrage
        if (Notification.permission === 'granted') {
            settings.notifications = true;
            document.getElementById('notifications-enabled').checked = true;
        } else {
            settings.notifications = false;
            document.getElementById('notifications-enabled').checked = false;
        }
        showLoadingState();
    });

    socket.on('disconnect', () => {
        notifications.error('Déconnecté du serveur');
        statusIndicator.classList.add('error');
        statusText.textContent = 'Déconnecté';
    });

    socket.on('monitoring:error', (error) => {
        notifications.error(error.message);
        statusIndicator.classList.add('error');
        statusText.textContent = 'Erreur';
    });

    socket.on('disconnect', () => {
        notifications.error('Déconnecté du serveur');
    });

    socket.on('slots:new', (slots) => {
        currentSlots = slots;
        const slotsContainer = document.getElementById('slots-container');
        slotsContainer.classList.remove('animate-pulse');
        hideProgressIndicator();
        filterAndDisplaySlots();
        
        if (slots.length > 0) {
            const message = `${slots.length} nouveau(x) créneau(x) disponible(s)`;
            if (settings.notifications && Notification.permission === 'granted') {
                new Notification('Nouveaux créneaux disponibles', {
                    body: message,
                    icon: '/favicon.ico'
                });
            } else {
                notifications.success(message);
            }
        } else {
            notifications.info('Aucun créneau disponible pour le moment');
        }
    });

    socket.on('slots:error', (error) => {
        notifications.error(`Erreur : ${error.message}`);
    });
});
