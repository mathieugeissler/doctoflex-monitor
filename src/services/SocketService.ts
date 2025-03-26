import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async initialize(server: any): Promise<void> {
    if (this.io) {
      return;
    }

    try {
      this.io = new Server(server, {
        cors: {
          origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
          methods: ['GET', 'POST'],
        },
      });

      logger.info('SocketService initialized');
    } catch (error) {
      logger.error('Failed to initialize SocketService', { error });
      throw error;
    }
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('SocketService not initialized');
    }
    return this.io;
  }
}
