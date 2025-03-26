const puppeteer = require('puppeteer');

class SlotScraper {
    constructor(doctorUrl) {
        this.doctorUrl = doctorUrl;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
        this.page = await this.browser.newPage();
    }

    async close() {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    async extractSlots() {
        try {
            // Charger la page et attendre qu'elle soit prête
            await this.page.goto(this.doctorUrl, { waitUntil: 'networkidle0' });
            
            // Sélectionner le type de rendez-vous "Déjà venu"
            await this.page.waitForSelector('#validation-select');
            await this.page.select('#validation-select', '1973');
            
            // Attendre que le calendrier se mette à jour
            await this.page.waitForSelector('#webagenda');
            await this.page.waitForNetworkIdle();
            
            // Récupérer les créneaux disponibles
            const slots = await this.page.evaluate(() => {
                const results = [];
                const agendaEvents = document.querySelectorAll('.agenda-event');
                
                agendaEvents.forEach(event => {
                    const href = event.getAttribute('href');
                    if (href) {
                        const match = href.match(/myFunctionRdv\('([^']+)',\s*'([^']+)'/);
                        if (match) {
                            const [, dateStr, timeStr] = match;
                            // Format: "Lundi 07 Avril 2025" -> "07/04/2025"
                            const [, day, month, year] = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
                            const monthNum = {
                                'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
                                'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
                                'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
                            }[month];
                            
                            results.push({
                                date: `${day}/${monthNum}/${year}`,
                                time: timeStr.substring(0, 5)
                            });
                        }
                    }
                });
                
                return results;
            });

            return slots;
        } catch (error) {
            console.error('Erreur lors de l\'extraction des créneaux:', error);
            return [];
        }
    }
}

module.exports = SlotScraper;
