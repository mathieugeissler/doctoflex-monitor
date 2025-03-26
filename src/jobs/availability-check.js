const cron = require('node-cron');
const { checkAvailability } = require('../services/availability');

let isJobActive = false;

/**
 * Démarre le job de vérification des disponibilités
 */
function startJob() {
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    // Planifier la vérification toutes les 5 minutes
    cron.schedule('*/5 * * * *', () => {
        if (isJobActive) {
            console.log('Vérification des disponibilités...');
            checkAvailability();
        }
    });
}

/**
 * Active ou désactive le job
 * @param {boolean} active - True pour activer, false pour désactiver
 * @returns {boolean} - Nouvel état du job
 */
function toggleJob(active = null) {
    if (active !== null) {
        isJobActive = active;
    } else {
        isJobActive = !isJobActive;
    }
    return isJobActive;
}

/**
 * Récupère l'état actuel du job
 * @returns {boolean} - True si le job est actif, false sinon
 */
function getJobStatus() {
    return isJobActive;
}

module.exports = {
    startJob,
    toggleJob,
    getJobStatus
};
