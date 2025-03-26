document.addEventListener('DOMContentLoaded', () => {
    // Initialiser Socket.IO
    const socket = io();

    // Gérer les notifications
    socket.on('notification', async (data) => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.body,
                    icon: '/favicon.ico'
                });
            }
        }
    });

    // Envoyer la configuration des notifications au serveur
    function updateNotificationConfig() {
        const config = {
            browser: browserNotificationsToggle.checked
        };
        socket.emit('updateNotificationConfig', config);
        localStorage.setItem('notificationConfig', JSON.stringify(config));
    }

    // Éléments DOM
    const toggleButton = document.getElementById('toggleButton');
    const toggleLabel = document.getElementById('toggleLabel');
    const checkNowButton = document.getElementById('checkNowButton');
    const slotsTableBody = document.getElementById('slotsTableBody');
    const configButton = document.getElementById('configButton');
    const configModal = document.getElementById('configModal');
    const configForm = document.getElementById('configForm');
    const closeConfigModal = document.getElementById('closeConfigModal');
    const slackWebhookInput = document.getElementById('slackWebhook');

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
            
            // Mettre à jour le switch
            toggleButton.checked = data.isActive;
            toggleLabel.textContent = data.isActive ? 'Surveillance active' : 'Surveillance inactive';
            
            // Mettre à jour le tableau des créneaux
            updateSlotsTable(data.foundSlots || []);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    }

    // Mettre à jour le tableau des créneaux
    function updateSlotsTable(slots) {
        if (slots.length === 0) {
            slotsTableBody.innerHTML = `
                <tr>
                    <td colspan="2">Aucun créneau disponible</td>
                </tr>
            `;
            return;
        }

        // Grouper les créneaux par date
        const slotsByDate = slots.reduce((acc, slot) => {
            const date = slot.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(slot.time);
            return acc;
        }, {});

        // Fonction pour regrouper les horaires consécutifs
        function groupConsecutiveTimes(times) {
            // Trier les horaires
            times.sort();
            const groups = [];
            let currentGroup = [times[0]];

            for (let i = 1; i < times.length; i++) {
                const currentTime = times[i];
                const lastTime = currentGroup[currentGroup.length - 1];
                
                // Convertir les heures en minutes pour comparer
                const [lastHour, lastMin] = lastTime.split(':').map(Number);
                const [currentHour, currentMin] = currentTime.split(':').map(Number);
                const lastTotalMinutes = lastHour * 60 + lastMin;
                const currentTotalMinutes = currentHour * 60 + currentMin;

                // Si l'horaire est consécutif (30 minutes d'écart)
                if (currentTotalMinutes - lastTotalMinutes === 30) {
                    currentGroup.push(currentTime);
                } else {
                    groups.push([...currentGroup]);
                    currentGroup = [currentTime];
                }
            }
            groups.push(currentGroup);
            return groups;
        }

        // Générer les lignes du tableau
        slotsTableBody.innerHTML = Object.entries(slotsByDate)
            .map(([date, times]) => {
                const timeGroups = groupConsecutiveTimes(times);
                return `
                    <tr>
                        <td>${date}</td>
                        <td>
                            ${timeGroups.map(group => `
                                <span class="time-chip">${
                                    group.length > 1 
                                        ? `${group[0]}-${group[group.length-1]}`
                                        : group[0]
                                }</span>
                            `).join('')}
                        </td>
                    </tr>
                `;
            }).join('');
    }

    // Vérifier la disponibilité
    async function checkAvailability() {
        const startDate = startDatePicker.selectedDates[0];
        const endDate = endDatePicker.selectedDates[0];

        try {
            checkNowButton.disabled = true;
            const response = await fetch('/api/check-now', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate: startDate ? startDate.toLocaleDateString('fr-FR') : null,
                    endDate: endDate ? endDate.toLocaleDateString('fr-FR') : null
                })
            });
            const data = await response.json();
            
            if (data.success) {
                updateSlotsTable(data.slots || []);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
        } finally {
            checkNowButton.disabled = false;
        }
    }

    // Événements
    toggleButton.addEventListener('change', async () => {
        try {
            const response = await fetch('/api/toggle', { method: 'POST' });
            const data = await response.json();
            
            toggleLabel.textContent = data.isActive ? 'Surveillance active' : 'Surveillance inactive';
        } catch (error) {
            console.error('Erreur lors du changement d\'état:', error);
        }
    });

    checkNowButton.addEventListener('click', checkAvailability);

    // Configuration
    configButton.addEventListener('click', () => {
        configModal.showModal();
    });

    closeConfigModal.addEventListener('click', () => {
        configModal.close();
    });

    const browserNotificationsToggle = document.getElementById('browserNotifications');
    const slackNotificationsToggle = document.getElementById('slackNotifications');
    const slackSettings = document.getElementById('slackSettings');

    // Gérer les notifications du navigateur
    async function setupBrowserNotifications() {
        console.log('Configuration des notifications navigateur...');
        console.log('Permission actuelle:', Notification.permission);

        if (!('Notification' in window)) {
            console.log('Les notifications ne sont pas supportées');
            browserNotificationsToggle.checked = false;
            browserNotificationsToggle.disabled = true;
            return;
        }

        // Gérer le changement d'état du switch
        browserNotificationsToggle.addEventListener('change', async () => {
            console.log('Switch changé:', browserNotificationsToggle.checked);

            if (browserNotificationsToggle.checked) {
                if (Notification.permission === 'granted') {
                    console.log('Permission déjà accordée');
                    await saveConfig();
                } else {
                    console.log('Demande de permission...');
                    const permission = await Notification.requestPermission();
                    console.log('Permission reçue:', permission);

                    if (permission === 'granted') {
                        await saveConfig();
                    } else {
                        browserNotificationsToggle.checked = false;
                        if (permission === 'denied') {
                            browserNotificationsToggle.disabled = true;
                        }
                    }
                }
            } else {
                console.log('Notifications désactivées');
                await saveConfig();
            }
        });

        // Configurer l'état initial
        if (Notification.permission === 'denied') {
            console.log('Notifications bloquées par l\'utilisateur');
            browserNotificationsToggle.checked = false;
            browserNotificationsToggle.disabled = true;
        }
    }

    setupBrowserNotifications();

    // Afficher/masquer les paramètres Slack
    slackNotificationsToggle.addEventListener('change', () => {
        slackSettings.style.display = slackNotificationsToggle.checked ? 'block' : 'none';
    });

    // Sauvegarder la configuration
    async function saveConfig() {
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notifications: {
                        browser: browserNotificationsToggle.checked,
                        slack: slackNotificationsToggle.checked,
                        slackWebhook: slackWebhookInput.value
                    }
                })
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la configuration:', error);
            return false;
        }
    }

    // Gérer le formulaire de configuration
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateNotificationConfig();
        configModal.close();
    });

    // Gérer la fermeture du modal
    closeConfigModal.addEventListener('click', () => {
        configModal.close();
    });

    // Charger la configuration des notifications depuis le stockage local
    const savedConfig = localStorage.getItem('notificationConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        browserNotificationsToggle.checked = config.browser;
        updateNotificationConfig();
    }

    // Gérer les changements des switches
    browserNotificationsToggle.addEventListener('change', async () => {
        if (!browserNotificationsToggle.checked || Notification.permission === 'granted') {
            saveConfig();
        }
    });

    slackNotificationsToggle.addEventListener('change', () => {
        slackSettings.style.display = slackNotificationsToggle.checked ? 'block' : 'none';
        saveConfig();
    });

    // Charger la configuration initiale
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            const notifications = data.notifications || {};

            if (notifications.browser && Notification.permission === 'granted') {
                browserNotificationsToggle.checked = true;
            }

            if (notifications.slack) {
                slackNotificationsToggle.checked = true;
                slackSettings.style.display = 'block';
            }

            if (notifications.slackWebhook) {
                slackWebhookInput.value = notifications.slackWebhook;
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
        }
    }

    // Initialisation
    loadConfig();
    updateUI();
    setInterval(updateUI, 30000);
});
