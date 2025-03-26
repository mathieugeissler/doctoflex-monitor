import { SocketService } from '../../src/services/SocketService';
import { Server } from 'socket.io';
import { createServer } from 'http';

jest.mock('socket.io', () => ({
  Server: jest.fn(),
}));

describe('SocketService', () => {
  let socketService: SocketService;
  let mockServer: any;

  beforeEach(() => {
    // Reset singleton instance
    (SocketService as any).instance = null;
    socketService = SocketService.getInstance();
    mockServer = createServer();

    // Reset Socket.io mock
    (Server as jest.Mock).mockClear();
  });

  it('should be a singleton', () => {
    const instance1 = SocketService.getInstance();
    const instance2 = SocketService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize socket.io server', async () => {
    await socketService.initialize(mockServer);
    expect(Server).toHaveBeenCalledWith(mockServer, {
      cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST'],
      },
    });
  });

  it('should not reinitialize if already initialized', async () => {
    await socketService.initialize(mockServer);
    await socketService.initialize(mockServer);
    expect(Server).toHaveBeenCalledTimes(1);
  });

  it('should throw error when getting IO before initialization', () => {
    expect(() => socketService.getIO()).toThrow('SocketService not initialized');
  });

  it('should get IO after initialization', async () => {
    const mockIO = {};
    (Server as jest.Mock).mockReturnValue(mockIO);

    await socketService.initialize(mockServer);
    expect(socketService.getIO()).toBe(mockIO);
  });

  it('should handle initialization error', async () => {
    const error = new Error('Test error');
    (Server as jest.Mock).mockImplementationOnce(() => {
      throw error;
    });

    await expect(socketService.initialize(mockServer)).rejects.toThrow(error);
  });

  it('should handle custom CORS origins from environment', async () => {
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://example.com';
    await socketService.initialize(mockServer);
    expect(Server).toHaveBeenCalledWith(mockServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://example.com'],
        methods: ['GET', 'POST'],
      },
    });
    delete process.env.CORS_ORIGINS;
  });
});
