const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { checkAvailability, getFoundSlots } = require('../services/availability');
const { toggleJob, getJobStatus } = require('../jobs/availability-check');

const router = express.Router();
const configPath = path.join(__dirname, '../../config.json');

// Récupérer le statut et l'historique
router.get('/status', (req, res) => {
    res.json({
        isActive: getJobStatus(),
        foundSlots: getFoundSlots()
    });
});

// Activer/désactiver le job
router.post('/toggle', (req, res) => {
    const isActive = toggleJob();
    res.json({ isActive });
});

// Lancer une vérification manuelle
router.post('/check-now', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const slots = await checkAvailability(startDate, endDate);

        // Notifier des créneaux trouvés
        if (slots && slots.length > 0) {
            const notificationService = require('../services/notification');
            await notificationService.sendNotification(
                `Créneaux disponibles :\n${slots.map(slot => `${slot.date} à ${slot.time}`).join('\n')}`
            );
        }

        res.json({ success: true, slots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer la configuration
router.get('/config', async (req, res) => {
    try {
        const config = await loadConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour la configuration
router.post('/config', async (req, res) => {
    try {
        const { notifications } = req.body;
        await saveConfig({ notifications });

        // Mettre à jour le service de notification
        const notificationService = require('../services/notification');
        notificationService.updateConfig(notifications);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Charger la configuration
async function loadConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { slackWebhook: process.env.SLACK_WEBHOOK_URL || '' };
        }
        throw error;
    }
}

// Sauvegarder la configuration
async function saveConfig(config) {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

module.exports = router;
