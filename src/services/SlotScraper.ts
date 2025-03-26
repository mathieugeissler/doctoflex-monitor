import puppeteer, { Browser, Page } from 'puppeteer';
import { Slot } from '../types/Slot';
import { logger } from '../utils/logger';
import { ConfigurationService } from './ConfigurationService';

export class SlotScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isRunning: boolean = false;
  private configService: ConfigurationService;

  constructor() {
    this.configService = ConfigurationService.getInstance();
    this.initialize();
  }

  public isInitialized(): boolean {
    return this.browser !== null && this.page !== null;
  }

  private async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1280,800'
        ],
        defaultViewport: {
          width: 1280,
          height: 800
        },
        pipe: true // Utiliser pipe au lieu de WebSocket
      });
      this.page = await this.browser.newPage();
    } catch (error) {
      logger.error('Error initializing browser:', { error });
      await this.close();
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      logger.error('Error closing browser:', { error });
      throw error instanceof Error ? error : new Error('Unknown error');
    } finally {
      this.page = null;
      this.browser = null;
    }
  }

  async extractSlots(): Promise<Slot[]> {
    if (this.isRunning) {
      throw new Error('Scraping already in progress');
    }

    if (!this.browser || !this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      this.isRunning = true;

      const config = this.configService.getConfiguration();
      logger.info(`Navigation vers ${config.doctorUrl}...`);
      await this.page.goto(config.doctorUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      logger.info('Page chargée avec succès');
      
      logger.info('Attente du sélecteur de type de rendez-vous...');
      try {
        await this.page.waitForSelector('#validation-select', { timeout: 5000 });
        logger.info('Sélecteur trouvé');
      } catch (error) {
        const html = await this.page.content();
        logger.error('Impossible de trouver le sélecteur. Contenu HTML:', { html });
        throw error;
      }

      logger.info('Sélection du type de rendez-vous (1973)...');
      await this.page.evaluate(() => {
        const select = document.querySelector('#validation-select') as HTMLSelectElement;
        if (select) {
          select.value = '1973';
          select.dispatchEvent(new Event('change'));
        }
      });
      logger.info('Type de rendez-vous sélectionné');
      
      logger.info('Attente de la mise à jour du calendrier...');
      await this.page.waitForSelector('#webagenda', { timeout: 5000 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info('Calendrier chargé');

      try {
        await this.page.waitForSelector('.agenda-event', { timeout: 5000 });
      } catch (error) {
        const noSlotsMessage = await this.page.evaluate(() => {
          const webagenda = document.querySelector('#webagenda');
          if (!webagenda) return false;
          return webagenda.textContent?.includes('Pas de rendez-vous disponibles aujourd\'hui!') || false;
        });
        
        if (noSlotsMessage) {
          logger.info('Aucun créneau disponible');
          return [];
        }
        
        logger.error('Erreur lors de l\'attente des créneaux', { error });
        throw error;
      }
      
      logger.info('Extraction des créneaux...');

      const slots = await this.page.evaluate((baseUrl: string): Array<Slot> => {
        const monthMap = {
          'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
          'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
          'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
        } as const;

        type MonthKey = keyof typeof monthMap;

        const results: Array<Slot> = [];
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
                const month = dateMatch[2] as MonthKey;
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
      
      logger.info(`${slots.length} créneaux trouvés`);
      if (slots.length > 0) {
        logger.info('Exemple de créneau:', { slot: slots[0] });
      }
      
      return slots;

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des créneaux:', { error });
      await this.close();
      throw error instanceof Error ? error : new Error('Unknown error');
    } finally {
      this.isRunning = false;
    }
  }
}
