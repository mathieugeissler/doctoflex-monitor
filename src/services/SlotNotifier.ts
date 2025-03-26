// Suppression de l'import inutilisé
import { logger } from '../utils/logger';
import { SlotStorage } from '../types/Slot';
import { SocketService } from './SocketService';
import { Configuration } from './ConfigurationService';

export class SlotNotifier {
  private socketService: SocketService;

  constructor() {
    this.socketService = SocketService.getInstance();
    if (!this.socketService) {
      throw new Error('Socket service not available');
    }
  }

  public initialize(): void {
    try {
      logger.info('SlotNotifier initialized');
    } catch (error) {
      logger.error('Failed to initialize SlotNotifier', { error });
      throw error;
    }
  }

  // slots
  public notifyNewSlots(slots: SlotStorage): void {
      this.notifyAll('slots:new', slots);
  }
  public notifySlotChanges(added: number): void {
    this.notifyAll('slots:changes', { added });
  }

  // monitoring status
  public notifyMonitoringStatus(isActive: boolean): void {
    this.notifyAll('monitoring:status', { isActive });
  }

  // config
  public notifyConfigChanged(config: Configuration): void {
    this.notifyAll('config:changed', config);
  }
  
  public notifyError(clientId: string, error: Error): void {
      this.socketService.getIO().to(clientId).emit('notification:error', {
        message: error.message,
      });
  }

  public notifySuccess(clientId: string, message: string): void {
    this.socketService.getIO().to(clientId).emit('notification:success', { message });
  }

  private notifyAll(topic: string, data?: any): void {
    try {
      this.socketService.getIO().emit(topic, data);
      logger.info(`Notified clients of ${topic}`, { data });
    } catch (error) {
      logger.error(`Failed to notify ${topic}`, { error });
      throw error;
    }
  }
}
