import { MonitoringService } from '../../src/services/MonitoringService';
import { SocketService } from '../../src/services/SocketService';
import { SlotScraper } from '../../src/services/SlotScraper';
import { ConfigurationService } from '../../src/services/ConfigurationService';
import { SlotNotifier } from '../../src/services/SlotNotifier';

jest.mock('../../src/services/SocketService');
jest.mock('../../src/services/SlotScraper');
jest.mock('../../src/services/ConfigurationService');
jest.mock('../../src/services/SlotNotifier');

describe('MonitoringService', () => {
  beforeEach(() => {
    MonitoringService.resetInstance();

    // Mock ConfigurationService
    (ConfigurationService.getInstance as jest.Mock).mockReturnValue({
      updateConfiguration: jest.fn(),
      updateDateRange: jest.fn(),
      getConfiguration: jest.fn().mockReturnValue({
        monitoringInterval: 1,
        dateRange: { 
          startDate: new Date('2025-03-26T00:00:00.000Z'),
          endDate: new Date('2025-03-27T00:00:00.000Z')
        },
        doctorUrl: 'https://www.doctoflex.fr/details/213049'
      })
    });

    // Mock SlotNotifier
    (SlotNotifier as jest.Mock).mockImplementation(() => ({
      notifyNewSlots: jest.fn(),
      notifyError: jest.fn(),
      notifySuccess: jest.fn(),
      notifyMonitoringStatus: jest.fn(),
      notifyConfigChanged: jest.fn(),
      notifySlotChanges: jest.fn()
    }));

    // Mock SlotScraper
    (SlotScraper as jest.Mock).mockImplementation(() => ({
      isInitialized: jest.fn().mockReturnValue(true),
      extractSlots: jest.fn().mockResolvedValue([]),
      close: jest.fn().mockResolvedValue(undefined)
    }));

    // Mock SocketService
    const mockSocketService = {
      getIO: jest.fn().mockReturnValue({
        on: jest.fn(),
        emit: jest.fn()
      })
    };
    jest.spyOn(SocketService, 'getInstance').mockReturnValue(mockSocketService as any);
  });

  afterEach(() => {
    MonitoringService.resetInstance();
  });

  it('should be a singleton', () => {
    const instance1 = MonitoringService.getInstance();
    const instance2 = MonitoringService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize successfully', async () => {
    const monitoringService = MonitoringService.getInstance();
    await expect(monitoringService.initialize()).resolves.not.toThrow();
  });

  it('should start monitoring', async () => {
    const monitoringService = MonitoringService.getInstance();
    await monitoringService.initialize();
    
    await monitoringService.startMonitoring();
    expect(monitoringService.isMonitoring()).toBe(true);
    expect(monitoringService.getMonitoringInterval()).toBe(1);
  });

  it('should stop monitoring', async () => {
    const monitoringService = MonitoringService.getInstance();
    await monitoringService.initialize();
    
    await monitoringService.startMonitoring();
    expect(monitoringService.isMonitoring()).toBe(true);

    await monitoringService.stopMonitoring();
    expect(monitoringService.isMonitoring()).toBe(false);
  });

  it('should handle socket connection', async () => {
    const monitoringService = MonitoringService.getInstance();
    await monitoringService.initialize();

    const mockSocket = {
      id: 'test-socket-id',
      on: jest.fn(),
      emit: jest.fn()
    };

    // Simulate socket connection
    await monitoringService.handleConnection(mockSocket as any);

    expect(mockSocket.on).toHaveBeenCalledWith('monitoring:start', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('monitoring:stop', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('config:update', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('slots:refresh', expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith('monitoring:status', expect.any(Object));
  });
});
