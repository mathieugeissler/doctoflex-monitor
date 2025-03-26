import { Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { SlotScraper } from './SlotScraper';
import { SlotNotifier } from './SlotNotifier';
import { ConfigurationService, Configuration } from './ConfigurationService';
import { SocketService } from './SocketService';
import { SlotStorageService } from './SlotStorageService';
import { SlotFilter } from './SlotFilter';
import { SlotStorage } from '@/types/Slot';

export class MonitoringService {
  private isMonitoringActive: boolean = false;
  private monitoringCronJob?: NodeJS.Timeout = undefined;

  private readonly slotScraper: SlotScraper;
  private readonly slotNotifier: SlotNotifier;
  private readonly configService: ConfigurationService;
  private readonly socketService: SocketService;
  private readonly slotStorageService: SlotStorageService;
  private readonly slotFilter: SlotFilter;


  public isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  public getMonitoringInterval(): number {
    return this.configService.getConfiguration().monitoringInterval;
  }

  private static instance: MonitoringService | null = null;

  private constructor() {
    this.slotScraper = new SlotScraper();
    this.slotNotifier = new SlotNotifier();
    this.configService = ConfigurationService.getInstance();
    this.socketService = SocketService.getInstance();
    this.slotStorageService = new SlotStorageService();
    this.slotFilter = new SlotFilter();
  }

  // Pour les tests uniquement
  public static resetInstance(): void {
    MonitoringService.instance = null;
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const io = this.socketService.getIO();
      io.on('connection', (socket: Socket) => {
        this.handleConnection(socket);
      });

      logger.info('MonitoringService initialized');
    } catch (error) {
      logger.error('Failed to initialize MonitoringService', { error });
      throw error;
    }
  }

  public async refreshSlots(): Promise<SlotStorage> {
    // Extraire les nouveaux créneaux
    const slots = await this.slotScraper.extractSlots();
    // Sauvegarder les nouveaux créneaux
    const slotStorage = await this.slotStorageService.saveSlots(slots);
    return slotStorage;
  }

  public async startMonitoring(): Promise<void> {
    try {
      if(this.isMonitoringActive) {
        logger.info('Monitoring global déjà démarré');
        return;
      }

      logger.info('Démarrage du monitoring...');

      // Démarrer le cron job immédiatement
      const intervalMs = this.getMonitoringInterval() * 60 * 1000;
      logger.info(`Configuration du cron job avec un intervalle de ${intervalMs}ms (${this.getMonitoringInterval()} minutes)`);
      
      this.monitoringCronJob = setInterval(async () => {
        logger.info('Exécution du cron job de rafraîchissement...');
        try {
          await this.refreshAndSendNewSlots();
          logger.info('Rafraîchissement périodique effectué avec succès');
        } catch (error) {
          logger.error('Erreur lors du rafraîchissement périodique:', error);
          // On ne stoppe pas le monitoring en cas d'erreur, on réessaiera au prochain intervalle
        }
      }, intervalMs);

      this.isMonitoringActive = true;
      this.slotNotifier.notifyMonitoringStatus(true);
      logger.info('État du monitoring mis à jour: actif');

      // Exécuter le premier rafraîchissement après avoir démarré le cron
      logger.info('Lancement du premier rafraîchissement...');
      try {
        await this.refreshAndSendNewSlots();
        logger.info('Premier rafraîchissement des créneaux effectué avec succès');
      } catch (error) {
        logger.error('Erreur lors du premier rafraîchissement:', error);
        // On ne stoppe pas le monitoring en cas d'erreur
      }

      logger.info('Monitoring global démarré avec succès');
    } catch (error) {
      logger.error('Erreur lors du démarrage du monitoring:', error);
      // En cas d'erreur, on s'assure de nettoyer
      if (this.monitoringCronJob) {
        logger.info('Nettoyage du cron job suite à une erreur');
        clearInterval(this.monitoringCronJob);
        this.monitoringCronJob = undefined;
      }
      this.isMonitoringActive = false;
      throw error;
    }
  }

  private async refreshAndSendNewSlots(): Promise<void> {
    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
      try {
        currentTry++;
        logger.info(`Tentative de rafraîchissement ${currentTry}/${maxRetries}`);

        // Charger les créneaux précédents
        const previousSlotStorage = await this.slotStorageService.loadSlots();
        logger.info('Créneaux précédents chargés');

        const slots = await this.refreshSlots();
        logger.info('Nouveaux créneaux extraits');
        
        if (slots.slots && slots.slots.length === 0) {
          logger.info('Aucun créneau trouvé, on réessaie...');
          if (currentTry < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes avant de réessayer
            continue;
          }
        }
        
        this.slotNotifier.notifyNewSlots(slots);
        logger.info('Notification des nouveaux créneaux envoyée');
        
        // Comparer avec les créneaux précédents
        const added = this.slotFilter.compareSlots(previousSlotStorage.slots, slots.slots);
        logger.info(`${added} nouveaux créneaux détectés`);
        
        // Si des changements sont détectés, envoyer une notification html5
        if (added > 0) {
          this.slotNotifier.notifySlotChanges(added);
          logger.info('Notification des changements envoyée');
        }

        // Si on arrive ici, tout s'est bien passé
        return;

      } catch (error) {
        logger.error(`Erreur lors du rafraîchissement des créneaux (tentative ${currentTry}/${maxRetries}):`, error);
        
        if (currentTry < maxRetries) {
          logger.info('Attente avant nouvelle tentative...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 secondes avant de réessayer
        } else {
          logger.error('Nombre maximum de tentatives atteint');
          throw error;
        }
      }
    }
  }

  public async stopMonitoring(): Promise<void> {
    try {
      if (!this.isMonitoringActive) {
        logger.info('Le monitoring est déjà arrêté');
        return;
      }

      if (this.monitoringCronJob) {
        clearInterval(this.monitoringCronJob);
        this.monitoringCronJob = undefined;
        logger.info('Cron job arrêté');
      }

      this.isMonitoringActive = false;
      this.slotNotifier.notifyMonitoringStatus(false);
      logger.info('Monitoring global arrêté avec succès');
    } catch (error) {
      logger.error('Erreur lors de l\'arrêt du monitoring:', error);
      throw error;
    }
  }

  public async handleConnection(socket: Socket): Promise<void> {
    const clientId = socket.id;
    logger.info(`Client connecté: ${clientId}`);

    // Envoyer l'état actuel de l'application
    const monitoringStatus = this.isMonitoringActive;
    logger.info(`Envoi de l'état du monitoring au client ${clientId}: ${monitoringStatus ? 'actif' : 'inactif'}`);
    socket.emit('monitoring:status', {
      active: monitoringStatus
    });

    // Charger les créneaux sauvegardés
    let slots = await this.slotStorageService.loadSlots();
    logger.info(`Envoi des créneaux sauvegardés au client ${clientId}`);
    socket.emit('slots:new', slots);

    socket.on('monitoring:start', async () => {
      logger.info(`Demande de démarrage du monitoring reçue du client ${clientId}`);
      if (!this.isMonitoringActive) {
        logger.info('Démarrage du monitoring global');
        try {
          await this.startMonitoring();
          this.slotNotifier.notifySuccess(clientId, 'Monitoring démarré');
          logger.info(`Notification de succès envoyée au client ${clientId}`);
        } catch(e: any) {
          logger.error(`Erreur lors du démarrage du monitoring pour le client ${clientId}:`, e);
          this.slotNotifier.notifyError(clientId, e);
        }
      } else {
        logger.info(`Le monitoring est déjà actif, notification au client ${clientId}`);
        this.slotNotifier.notifySuccess(clientId, 'Le monitoring est déjà actif');
      }
    });

    socket.on('monitoring:stop', async () => {
      logger.info(`Demande d'arrêt du monitoring reçue du client ${clientId}`);
      if (this.isMonitoringActive) {
        logger.info('Arrêt du monitoring global');
        try {
          await this.stopMonitoring();
          this.slotNotifier.notifySuccess(clientId, 'Monitoring arrêté');
          logger.info(`Notification de succès envoyée au client ${clientId}`);
        } catch(e: any) {
          logger.error(`Erreur lors de l'arrêt du monitoring pour le client ${clientId}:`, e);
          this.slotNotifier.notifyError(clientId, e);
        }
      } else {
        logger.info(`Le monitoring est déjà inactif, notification au client ${clientId}`);
        this.slotNotifier.notifySuccess(clientId, 'Le monitoring est déjà inactif');
      }
    });

    socket.on('config:update', async (settings: Configuration) => {
        logger.info('Mise à jour des paramètres globaux', settings);
        try {
          this.configService.updateConfiguration(settings);
          this.slotNotifier.notifySuccess(clientId, 'Configuration mise à jours');
          this.slotNotifier.notifyConfigChanged(settings);
        } catch(e: any) {
          this.slotNotifier.notifyError(clientId, e)
        }
    });

    socket.on('slots:refresh', async () => {
      logger.info('Réception de la demande de rafraîchissement des créneaux');
      try {
        const slots = await this.refreshSlots();
        this.slotNotifier.notifyNewSlots(slots);
        logger.info('Créneaux envoyés au client');
      } catch (error) {
        logger.error('Erreur lors du rafraîchissement manuel des créneaux:', error);
        socket.emit('error', { message: 'Erreur lors du rafraîchissement des créneaux' });
      }
    });
  }
}
