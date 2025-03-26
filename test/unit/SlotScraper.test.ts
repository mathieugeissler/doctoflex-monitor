import { readFileSync } from 'fs';
import { join } from 'path';
import { SlotScraper } from '../../src/services/SlotScraper';
import { ConfigurationService } from '../../src/services/ConfigurationService';

// Mock de ConfigurationService
jest.mock('../../src/services/ConfigurationService', () => ({
    ConfigurationService: {
        getInstance: () => ({
            getConfiguration: () => ({
                doctorUrl: 'http://test.com',
                monitoringInterval: 5,
                dateRange: {
                    startDate: new Date('2025-03-26T00:00:00.000Z'),
                    endDate: new Date('2025-03-27T00:00:00.000Z')
                }
            }),
            updateConfiguration: jest.fn(),
            updateDateRange: jest.fn()
        })
    }
}));

// Mock de puppeteer
jest.mock('puppeteer');

jest.setTimeout(2000);

describe('SlotScraper', () => {
    let slotScraper: SlotScraper;
    let mockBrowser: any;
    let mockPage: any;
    let puppeteer: any;

  beforeEach(() => {
        // Reset mocks
    jest.clearAllMocks();
        
        // Setup mock page
        mockPage = {
            goto: jest.fn().mockResolvedValue(undefined),
            waitForSelector: jest.fn().mockResolvedValue(undefined),
            $$eval: jest.fn().mockResolvedValue([
                { date: '2024-03-20', time: '10:00', location: 'Location 1' },
                { date: '2024-03-20', time: '11:00', location: 'Location 2' }
            ]),
            close: jest.fn().mockResolvedValue(undefined),
            setViewport: jest.fn().mockResolvedValue(undefined),
            waitForResponse: jest.fn().mockResolvedValue({
                url: () => 'http://test.com/extern/days/available',
                json: () => Promise.resolve({ days: ['2024-03-27'] })
            }),
            select: jest.fn().mockResolvedValue(undefined),
            evaluate: jest.fn().mockResolvedValue([
                { date: '2024-03-20', time: '10:00', location: 'Location 1' },
                { date: '2024-03-20', time: '11:00', location: 'Location 2' }
            ]),
            content: jest.fn().mockResolvedValue('<html></html>')
        };

        // Setup mock browser
        mockBrowser = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Get puppeteer mock
        puppeteer = require('puppeteer');
        puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialize', () => {
        it('should initialize browser and page', async () => {
            slotScraper = new SlotScraper();
            await (slotScraper as any).initialize();

            expect(puppeteer.launch).toHaveBeenCalledWith({
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
                pipe: true
            });
            expect(mockBrowser.newPage).toHaveBeenCalled();
        });

        it('should handle browser initialization error', async () => {
            slotScraper = new SlotScraper();
            puppeteer.launch.mockRejectedValueOnce(new Error('Failed to initialize browser'));

            await expect((slotScraper as any).initialize()).rejects.toThrow('Failed to initialize browser');
      });
    });

    describe('isInitialized', () => {
        it('devrait retourner false quand le browser et la page sont null', () => {
            slotScraper = new SlotScraper();
            (slotScraper as any).browser = null;
            (slotScraper as any).page = null;
            expect(slotScraper.isInitialized()).toBe(false);
        });

        it('devrait retourner true quand le browser et la page sont initialisés', async () => {
            slotScraper = new SlotScraper();
            await (slotScraper as any).initialize();
            expect(slotScraper.isInitialized()).toBe(true);
        });
    });

    describe('extractSlots', () => {
        beforeEach(async () => {
            slotScraper = new SlotScraper();
            await (slotScraper as any).initialize();
        });

        it('devrait retourner un tableau vide quand aucun créneau n\'est disponible', async () => {
            mockPage.waitForSelector.mockImplementation((selector) => {
                if (selector === '.agenda-event') {
                    throw new Error('No slots available');
                }
                return Promise.resolve();
            });

            mockPage.evaluate.mockResolvedValueOnce(true); // Simule le message "Pas de rendez-vous disponibles"

            const slots = await slotScraper.extractSlots();
            expect(slots).toEqual([]);
        });

        it('devrait extraire correctement les créneaux du DOM', async () => {
            const mockHtml = `
                <div class="agenda-event" href="javascript:myFunctionRdv('15 Mars 2024', '14:30', 'param3', 'param4', 'param5', 'http://test.com')"></div>
                <div class="agenda-event" href="javascript:myFunctionRdv('16 Mars 2024', '10:00', 'param3', 'param4', 'param5', 'http://test.com')"></div>
            `;

            mockPage.content.mockResolvedValueOnce(mockHtml);
            mockPage.evaluate.mockImplementation((fn, baseUrl) => {
                return [
                    { date: '2024-03-15', time: '14:30', bookingUrl: 'http://test.com' },
                    { date: '2024-03-16', time: '10:00', bookingUrl: 'http://test.com' }
                ];
            });

            const slots = await slotScraper.extractSlots();
            expect(slots).toHaveLength(2);
            expect(slots[0]).toEqual({
                date: '2024-03-15',
                time: '14:30',
                bookingUrl: 'http://test.com'
            });
        });

        it('devrait gérer les erreurs lors de la sélection du type de rendez-vous', async () => {
            mockPage.evaluate.mockRejectedValueOnce(new Error('Failed to select appointment type'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Failed to select appointment type');
            expect((slotScraper as any).isRunning).toBe(false);
        });

        it('should throw error if scraping is already in progress', async () => {
            (slotScraper as any).isRunning = true;

            await expect(slotScraper.extractSlots()).rejects.toThrow('Scraping already in progress');
        });

        it('should throw error if browser is not initialized', async () => {
            (slotScraper as any).browser = null;
            (slotScraper as any).page = null;

            await expect(slotScraper.extractSlots()).rejects.toThrow('Browser not initialized');
    });

    it('should handle network error', async () => {
            mockPage.goto.mockRejectedValueOnce(new Error('Network error'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Network error');
    });

    it('should handle calendar response error', async () => {
            mockPage.waitForSelector.mockRejectedValueOnce(new Error('Calendar response error'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Calendar response error');
    });

    it('should reset isRunning after error', async () => {
            mockPage.goto.mockRejectedValueOnce(new Error('Test error'));
      
      try {
                await slotScraper.extractSlots();
      } catch (error) {
                expect((slotScraper as any).isRunning).toBe(false);
            }
        });

        it('devrait gérer les erreurs lors de la recherche du sélecteur de type de rendez-vous', async () => {
            mockPage.waitForSelector.mockRejectedValueOnce(new Error('Selector not found'));
            mockPage.content.mockResolvedValueOnce('<html><body>Page content</body></html>');
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Selector not found');
            expect(mockPage.content).toHaveBeenCalled();
        });

        it('devrait gérer les erreurs lors de l\'attente de la réponse du calendrier', async () => {
            mockPage.waitForSelector.mockRejectedValueOnce(new Error('Calendar response timeout'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Calendar response timeout');
        });

        it('devrait extraire correctement les créneaux avec différents formats de dates', async () => {
            mockPage.evaluate.mockImplementation((fn, baseUrl) => {
                // Simuler l'exécution de la fonction d'évaluation
                const monthMap = {
                    'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
                    'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
                    'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
                };

                const mockEvents = [
                    { href: "javascript:myFunctionRdv('15 Mars 2024', '14:30', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('1 Janvier 2024', '09:00', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('30 Décembre 2024', '16:45', '', '', '', 'http://test.com')" }
                ];

                return mockEvents.map(event => {
                    const match = event.href.match(/myFunctionRdv\('([^']+)',\s*'([^']+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']+)'/);
                    if (match) {
                        const [_, dateStr, timeStr, url] = match;
                        const [day, month, year] = dateStr.split(' ');
                        const monthNum = monthMap[month as keyof typeof monthMap];
                        return {
                            date: `${year}-${monthNum}-${day.padStart(2, '0')}`,
                            time: timeStr.substring(0, 5),
                            bookingUrl: url
                        };
                    }
                    return null;
                }).filter(Boolean);
            });

            const slots = await slotScraper.extractSlots();
            expect(slots).toHaveLength(3);
            expect(slots[0]).toEqual({
                date: '2024-03-15',
                time: '14:30',
                bookingUrl: 'http://test.com'
            });
            expect(slots[1]).toEqual({
                date: '2024-01-01',
                time: '09:00',
                bookingUrl: 'http://test.com'
            });
            expect(slots[2]).toEqual({
                date: '2024-12-30',
                time: '16:45',
                bookingUrl: 'http://test.com'
            });
        });

        it('devrait gérer les erreurs lors de la recherche du sélecteur de rendez-vous avec capture HTML', async () => {
            mockPage.waitForSelector.mockRejectedValueOnce(new Error('Selector not found'));
            const mockHtml = '<html><body><div>Contenu différent</div></body></html>';
            mockPage.content.mockResolvedValueOnce(mockHtml);
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Selector not found');
            expect(mockPage.content).toHaveBeenCalled();
            expect((slotScraper as any).isRunning).toBe(false);
        });

        it('devrait gérer les erreurs lors de l\'attente des créneaux sans message "Pas de rendez-vous"', async () => {
            mockPage.waitForSelector.mockImplementation((selector) => {
                if (selector === '.agenda-event') {
                    throw new Error('Timeout waiting for slots');
                }
                return Promise.resolve();
            });

            mockPage.evaluate.mockImplementation(() => false); // Pas de message "Pas de rendez-vous"
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Timeout waiting for slots');
            expect((slotScraper as any).isRunning).toBe(false);
        });

        it('devrait gérer les créneaux invalides dans le DOM', async () => {
            mockPage.evaluate.mockImplementation((fn, baseUrl) => {
                const mockEvents = [
                    { href: "javascript:myFunctionRdv('Invalid Date', 'Invalid Time', '', '', '', '')" },
                    { href: "javascript:myFunctionRdv('15 Mars 2024', '14:30', '', '', '', 'http://test.com')" },
                    { href: "not_a_valid_function_call" }
                ];

                return mockEvents.map(event => {
                    const match = event.href.match(/myFunctionRdv\('([^']+)',\s*'([^']+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']+)'/);
                    if (match) {
                        const [_, dateStr, timeStr, url] = match;
                        const [day, month, year] = dateStr.split(' ');
                        const monthMap: { [key: string]: string } = {
                            'Mars': '03'
                        };
                        const monthNum = monthMap[month];
                        if (monthNum) {
                            return {
                                date: `${year}-${monthNum}-${day.padStart(2, '0')}`,
                                time: timeStr.substring(0, 5),
                                bookingUrl: url
                            };
                        }
                    }
                    return null;
                }).filter(Boolean);
            });

            const slots = await slotScraper.extractSlots();
            expect(slots).toHaveLength(1);
            expect(slots[0]).toEqual({
                date: '2024-03-15',
                time: '14:30',
                bookingUrl: 'http://test.com'
            });
        });

        it('devrait gérer les erreurs lors de l\'évaluation du DOM', async () => {
            mockPage.evaluate.mockRejectedValueOnce(new Error('DOM evaluation failed'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('DOM evaluation failed');
            expect((slotScraper as any).isRunning).toBe(false);
            expect(mockPage.close).toHaveBeenCalled();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('devrait gérer les erreurs lors de l\'initialisation du navigateur', async () => {
            (slotScraper as any).browser = null;
            await (slotScraper as any).initialize();
            
            mockPage.waitForSelector.mockRejectedValueOnce(new Error('Browser initialization failed'));
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Browser initialization failed');
            expect((slotScraper as any).isRunning).toBe(false);
        });

        it('devrait gérer les erreurs lors de la recherche des sélecteurs avec capture du contenu HTML', async () => {
            mockPage.waitForSelector.mockImplementation((selector) => {
                if (selector === '#validation-select') {
                    throw new Error('Selector not found');
                }
                return Promise.resolve();
            });

            const mockHtml = `
                <html>
                    <body>
                        <div id="different-selector">Contenu inattendu</div>
                    </body>
                </html>
            `;
            mockPage.content.mockResolvedValueOnce(mockHtml);
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Selector not found');
            expect(mockPage.content).toHaveBeenCalled();
            expect((slotScraper as any).isRunning).toBe(false);
        });

        it('devrait gérer les créneaux avec des formats de date variés', async () => {
            mockPage.evaluate.mockImplementation((fn, baseUrl) => {
                const mockEvents = [
                    { href: "javascript:myFunctionRdv('1 Janvier 2024', '09:00', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('15 Février 2024', '14:30', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('31 Décembre 2024', '18:45', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('Invalid Date', '25:00', '', '', '', 'http://test.com')" },
                    { href: "javascript:myFunctionRdv('1 InvalidMonth 2024', '14:30', '', '', '', 'http://test.com')" }
                ];

                return mockEvents.map(event => {
                    const match = event.href.match(/myFunctionRdv\('([^']+)',\s*'([^']+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']+)'/);
                    if (match) {
                        const [_, dateStr, timeStr, url] = match;
                        const [day, month, year] = dateStr.split(' ');
                        const monthMap: { [key: string]: string } = {
                            'Janvier': '01',
                            'Février': '02',
                            'Décembre': '12'
                        };
                        const monthNum = monthMap[month];
                        if (monthNum) {
                            return {
                                date: `${year}-${monthNum}-${day.padStart(2, '0')}`,
                                time: timeStr.substring(0, 5),
                                bookingUrl: url
                            };
                        }
                    }
                    return null;
                }).filter(Boolean);
            });

            const slots = await slotScraper.extractSlots();
            expect(slots).toHaveLength(3);
            expect(slots[0]).toEqual({
                date: '2024-01-01',
                time: '09:00',
                bookingUrl: 'http://test.com'
            });
            expect(slots[1]).toEqual({
                date: '2024-02-15',
                time: '14:30',
                bookingUrl: 'http://test.com'
            });
            expect(slots[2]).toEqual({
                date: '2024-12-31',
                time: '18:45',
                bookingUrl: 'http://test.com'
            });
        });

        it('devrait gérer les erreurs lors de l\'extraction des créneaux', async () => {
            mockPage.evaluate.mockImplementation(() => {
                throw new Error('Failed to extract slots from DOM');
            });
            
            await expect(slotScraper.extractSlots()).rejects.toThrow('Failed to extract slots from DOM');
            expect((slotScraper as any).isRunning).toBe(false);
            expect(mockPage.close).toHaveBeenCalled();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('devrait réinitialiser les références après la fermeture', async () => {
            await slotScraper.close();
            
            expect((slotScraper as any).page).toBeNull();
            expect((slotScraper as any).browser).toBeNull();
        });
    });

    describe('close', () => {
        beforeEach(async () => {
            slotScraper = new SlotScraper();
            await (slotScraper as any).initialize();
        });

        it('devrait gérer les erreurs lors de la fermeture de la page', async () => {
            mockPage.close.mockRejectedValueOnce(new Error('Failed to close page'));
            
            await expect(slotScraper.close()).rejects.toThrow('Failed to close page');
            expect(mockPage.close).toHaveBeenCalled();
            expect(mockBrowser.close).not.toHaveBeenCalled();
        });

        it('devrait gérer les erreurs lors de la fermeture du navigateur', async () => {
            mockBrowser.close.mockRejectedValueOnce(new Error('Failed to close browser'));
            
            await expect(slotScraper.close()).rejects.toThrow('Failed to close browser');
            expect(mockPage.close).toHaveBeenCalled();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('devrait réinitialiser les références après la fermeture', async () => {
            await slotScraper.close();
            
            expect((slotScraper as any).page).toBeNull();
            expect((slotScraper as any).browser).toBeNull();
    });
  });
});
