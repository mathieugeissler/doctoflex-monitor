"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const logger_1 = require("../utils/logger");
const SlotScraper_1 = require("./SlotScraper");
const SlotNotifier_1 = require("./SlotNotifier");
const ConfigurationService_1 = require("./ConfigurationService");
const SocketService_1 = require("./SocketService");
const SlotStorageService_1 = require("./SlotStorageService");
const SlotFilter_1 = require("./SlotFilter");
class MonitoringService {
    monitoringInterval = null;
    monitoringSettings = null;
    isMonitoringActive = false;
    slotScraper;
    slotNotifier;
    configService;
    socketService;
    slotStorageService;
    slotFilter;
    isMonitoring() {
        return this.isMonitoringActive;
    }
    getMonitoringSettings() {
        return this.monitoringSettings;
    }
    static instance = null;
    constructor() {
        this.slotScraper = new SlotScraper_1.SlotScraper();
        this.slotNotifier = new SlotNotifier_1.SlotNotifier();
        this.configService = ConfigurationService_1.ConfigurationService.getInstance();
        this.socketService = SocketService_1.SocketService.getInstance();
        this.slotStorageService = new SlotStorageService_1.SlotStorageService();
        this.slotFilter = new SlotFilter_1.SlotFilter();
    }
    // Pour les tests uniquement
    static resetInstance() {
        MonitoringService.instance = null;
    }
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    async initialize() {
        try {
            const io = this.socketService.getIO();
            io.on('connection', (socket) => {
                this.handleConnection(socket);
            });
            logger_1.logger.info('MonitoringService initialized');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize MonitoringService', { error });
            throw error;
        }
    }
    async startMonitoring(settings) {
        this.configService.updateConfiguration(settings);
        try {
            // Arrêter le monitoring existant s'il y en a un
            await this.stopMonitoring();
            // Initialiser le scraper si nécessaire
            if (!this.slotScraper.isInitialized()) {
                await this.slotScraper.initialize();
            }
            // Démarrer le nouveau monitoring
            const intervalMs = settings.monitoringInterval * 60 * 1000; // Convertir les minutes en millisecondes
            this.monitoringInterval = setInterval(async () => {
                try {
                    // Charger les créneaux précédents
                    const previousSlots = await this.slotStorageService.loadSlots();
                    // Extraire les nouveaux créneaux
                    const slots = await this.slotScraper.extractSlots();
                    // Sauvegarder les nouveaux créneaux
                    await this.slotStorageService.saveSlots(slots);
                    // Notifier des nouveaux créneaux
                    this.slotNotifier.notifyNewSlots(slots);
                    if (settings.autoRefresh) {
                        // Comparer avec les créneaux précédents
                        const { added: newSlots, removed: removedSlots } = this.slotFilter.compareSlots(previousSlots, slots);
                        // Si des changements sont détectés, envoyer une notification spéciale
                        if (newSlots.length > 0 || removedSlots.length > 0) {
                            this.slotNotifier.notifySlotChanges({
                                newSlots,
                                removedSlots,
                                timestamp: Date.now()
                            });
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.error('Erreur lors du scraping:', error);
                    this.slotNotifier.notifyError(error);
                }
            }, intervalMs);
            // Sauvegarder les paramètres
            this.monitoringSettings = settings;
            this.isMonitoringActive = true;
            // Notifier tous les clients
            this.socketService.getIO().emit('monitoring:started', { active: true, settings });
            // Exécuter immédiatement la première vérification
            try {
                const slots = await this.slotScraper.extractSlots();
                await this.slotStorageService.saveSlots(slots);
                this.slotNotifier.notifyNewSlots(slots);
            }
            catch (error) {
                logger_1.logger.error('Erreur lors du scraping initial:', error);
                this.slotNotifier.notifyError(error);
            }
            const slots = await this.slotScraper.extractSlots();
            this.slotNotifier.notifyNewSlots(slots);
            logger_1.logger.info('Monitoring global démarré', { settings });
        }
        catch (error) {
            logger_1.logger.error('Erreur lors de l\'initialisation du monitoring:', error);
            this.slotNotifier.notifyError(error);
        }
    }
    async stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.monitoringSettings = null;
        this.isMonitoringActive = false;
        // Notifier tous les clients
        this.socketService.getIO().emit('monitoring:stopped', { active: false });
        await this.slotScraper.close();
        logger_1.logger.info('Monitoring global arrêté');
    }
    async handleConnection(socket) {
        const clientId = socket.id;
        logger_1.logger.info(`Client connecté: ${clientId}`);
        // Envoyer l'état actuel du monitoring au nouveau client
        socket.emit('monitoring:status', {
            active: this.isMonitoringActive,
            settings: this.monitoringSettings
        });
        // Charger les créneaux sauvegardés ou faire un nouveau scraping si nécessaire
        try {
            let slots = await this.slotStorageService.loadSlots();
            let lastUpdate = await this.slotStorageService.getLastUpdate();
            // Si aucun créneau n'est sauvegardé, faire un scraping initial
            if (!slots || slots.length === 0) {
                if (!this.slotScraper.isInitialized()) {
                    await this.slotScraper.initialize();
                }
                slots = await this.slotScraper.extractSlots();
                await this.slotStorageService.saveSlots(slots);
                lastUpdate = new Date().toISOString();
            }
            socket.emit('slots:new', { slots, lastUpdate });
        }
        catch (error) {
            logger_1.logger.error('Erreur lors du chargement initial des créneaux:', error);
            socket.emit('error', { message: 'Erreur lors du chargement des créneaux' });
        }
        socket.on('monitoring:start', async (settings) => {
            if (!this.isMonitoringActive) {
                logger_1.logger.info('Démarrage du monitoring global', settings);
                await this.startMonitoring(settings);
            }
        });
        socket.on('client:preferences', (preferences) => {
            const { dateRange } = preferences;
            const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
            const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
            this.configService.updateDateRange(startDate, endDate);
            logger_1.logger.info('Préférences client mises à jour', { dateRange });
        });
        socket.on('monitoring:stop', async () => {
            if (this.isMonitoringActive) {
                logger_1.logger.info('Arrêt du monitoring global');
                await this.stopMonitoring();
            }
        });
        socket.on('monitoring:update', async (settings) => {
            if (this.isMonitoringActive) {
                logger_1.logger.info('Mise à jour des paramètres globaux', settings);
                await this.startMonitoring(settings);
            }
        });
        socket.on('slots:refresh', async () => {
            logger_1.logger.info('Réception de la demande de rafraîchissement des créneaux');
            try {
                if (!this.slotScraper.isInitialized()) {
                    logger_1.logger.info('Initialisation du scraper...');
                    await this.slotScraper.initialize();
                    logger_1.logger.info('Scraper initialisé');
                }
                logger_1.logger.info('Extraction des créneaux...');
                const slots = await this.slotScraper.extractSlots();
                logger_1.logger.info(`${slots.length} créneaux extraits, envoi au client...`);
                socket.emit('slots:new', slots);
                logger_1.logger.info('Créneaux envoyés au client');
            }
            catch (error) {
                logger_1.logger.error('Erreur lors du rafraîchissement manuel des créneaux:', error);
                socket.emit('error', { message: 'Erreur lors du rafraîchissement des créneaux' });
            }
        });
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=MonitoringService.js.map