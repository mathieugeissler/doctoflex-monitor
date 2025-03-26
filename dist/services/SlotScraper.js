"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotScraper = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../utils/logger");
const ConfigurationService_1 = require("./ConfigurationService");
class SlotScraper {
    browser = null;
    page = null;
    isRunning = false;
    configService;
    constructor() {
        this.configService = ConfigurationService_1.ConfigurationService.getInstance();
    }
    isInitialized() {
        return this.browser !== null && this.page !== null;
    }
    async initialize() {
        this.browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            pipe: true // Utiliser pipe au lieu de WebSocket
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 800 });
    }
    async close() {
        try {
            if (this.page) {
                await this.page.close();
            }
            if (this.browser) {
                await this.browser.close();
            }
        }
        catch (error) {
            logger_1.logger.error('Error closing browser:', { error });
        }
        finally {
            this.page = null;
            this.browser = null;
        }
    }
    async extractSlots() {
        if (this.isRunning) {
            throw new Error('Scraping already in progress');
        }
        try {
            if (!this.isInitialized()) {
                logger_1.logger.info('Initialisation du navigateur...');
                await this.initialize();
            }
            if (!this.page) {
                throw new Error('Browser not initialized');
            }
            this.isRunning = true;
            const config = this.configService.getConfiguration();
            logger_1.logger.info(`Navigation vers ${config.doctorUrl}...`);
            // Naviguer vers la page avec un timeout plus long
            await this.page.goto(config.doctorUrl, { waitUntil: 'networkidle0', timeout: 60000 });
            logger_1.logger.info('Page chargée avec succès');
            logger_1.logger.info('Attente du sélecteur de type de rendez-vous...');
            // Attendre que le select soit chargé
            try {
                await this.page.waitForSelector('#validation-select', { timeout: 5000 });
                logger_1.logger.info('Sélecteur trouvé');
            }
            catch (error) {
                // Capturer le contenu HTML pour debug
                const html = await this.page.content();
                logger_1.logger.error('Impossible de trouver le sélecteur. Contenu HTML:', { html });
                throw error;
            }
            logger_1.logger.info('Sélection du type de rendez-vous (1973)...');
            // Sélectionner toujours la valeur 1973
            await this.page.select('#validation-select', '1973');
            logger_1.logger.info('Type de rendez-vous sélectionné');
            logger_1.logger.info('Attente de la mise à jour du calendrier...');
            // Attendre que le calendrier se mette à jour
            const daysResponse = await this.page.waitForResponse(response => response.url().includes('/extern/days/available'), { timeout: 5000 });
            const daysData = await daysResponse.json();
            logger_1.logger.info('Réponse du calendrier reçue:', { daysData });
            // Attendre que le calendrier soit chargé
            await this.page.waitForSelector('#webagenda', { timeout: 5000 });
            logger_1.logger.info('Calendrier chargé');
            // Attendre que les créneaux soient chargés
            try {
                await this.page.waitForSelector('.agenda-event', { timeout: 5000 });
            }
            catch (error) {
                // Vérifier s'il y a un message "Pas de rendez-vous disponibles"
                const noSlotsMessage = await this.page.evaluate(() => {
                    const webagenda = document.querySelector('#webagenda');
                    if (!webagenda)
                        return false;
                    return webagenda.textContent?.includes('Pas de rendez-vous disponibles aujourd\'hui!') || false;
                });
                if (noSlotsMessage) {
                    logger_1.logger.info('Aucun créneau disponible');
                    return [];
                }
                logger_1.logger.error('Erreur lors de l\'attente des créneaux', { error });
                throw error;
            }
            logger_1.logger.info('Extraction des créneaux...');
            // Extraire les créneaux du calendrier
            const slots = await this.page.evaluate((baseUrl) => {
                const monthMap = {
                    'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
                    'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
                    'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
                };
                const results = [];
                const agendaEvents = document.querySelectorAll('.agenda-event');
                agendaEvents.forEach(event => {
                    const href = event.getAttribute('href');
                    if (href) {
                        const match = href.match(/myFunctionRdv\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)'/);
                        if (match?.[1] && match?.[2] && match?.[6]) {
                            const dateStr = match[1];
                            const timeStr = match[2];
                            const dateMatch = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
                            if (dateMatch?.[1] && dateMatch?.[2] && dateMatch?.[3]) {
                                const day = dateMatch[1];
                                const month = dateMatch[2];
                                const year = dateMatch[3];
                                const monthNum = monthMap[month];
                                if (monthNum) {
                                    results.push({
                                        date: `${year}-${monthNum}-${day.padStart(2, '0')}`,
                                        time: timeStr.substring(0, 5),
                                        bookingUrl: baseUrl
                                    });
                                }
                            }
                        }
                    }
                });
                return results;
            }, this.configService.getConfiguration().doctorUrl);
            logger_1.logger.info(`${slots.length} créneaux trouvés`);
            if (slots.length > 0) {
                logger_1.logger.info('Exemple de créneau:', { slot: slots[0] });
            }
            return slots;
        }
        catch (error) {
            logger_1.logger.error('Erreur lors de l\'extraction des créneaux:', { error });
            await this.close();
            throw error instanceof Error ? error : new Error('Unknown error');
        }
        finally {
            this.isRunning = false;
        }
    }
}
exports.SlotScraper = SlotScraper;
//# sourceMappingURL=SlotScraper.js.map