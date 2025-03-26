import { SlotNotifier } from '../../src/services/SlotNotifier';
import { SocketService } from '../../src/services/SocketService';
import { Slot, SlotStorage } from '../../src/types/Slot';
import { Configuration } from '../../src/services/ConfigurationService';

jest.mock('../../src/services/SocketService');

describe('SlotNotifier', () => {
  let notifier: SlotNotifier;
  let mockSocketService: jest.Mocked<SocketService>;
  let mockSocket: any;

  const mockSlotStorage = {
    lastUpdate: new Date().toISOString(),
    slots: [
      { date: '2025-03-27', time: '10:00', bookingUrl: '/booking/123' }
    ]
  };

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis()
    };

    mockSocketService = {
      getIO: jest.fn().mockReturnValue(mockSocket),
      initialize: jest.fn().mockResolvedValue(undefined)
    } as any;

    (SocketService.getInstance as jest.Mock).mockReturnValue(mockSocketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize successfully', () => {
    notifier = new SlotNotifier();
    expect(() => notifier.initialize()).not.toThrow();
  });

  it('should notify new slots', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    notifier.notifyNewSlots(mockSlotStorage);
    expect(mockSocket.emit).toHaveBeenCalledWith('slots:new', mockSlotStorage);
  });

  it('should notify error', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    const error = new Error('Test error');
    notifier.notifyError('test-client', error);
    expect(mockSocket.to).toHaveBeenCalledWith('test-client');
    expect(mockSocket.emit).toHaveBeenCalledWith('notification:error', { message: error.message });
  });

  it('should notify success', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    notifier.notifySuccess('test-client', 'Test success');
    expect(mockSocket.to).toHaveBeenCalledWith('test-client');
    expect(mockSocket.emit).toHaveBeenCalledWith('notification:success', { message: 'Test success' });
  });

  it('should notify monitoring status', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    notifier.notifyMonitoringStatus(true);
    expect(mockSocket.emit).toHaveBeenCalledWith('monitoring:status', { isActive: true });
  });

  it('should notify config changes', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    const config: Configuration = {
      monitoringInterval: 5,
      dateRange: {
        startDate: new Date('2025-03-26T00:00:00.000Z'),
        endDate: new Date('2025-03-27T00:00:00.000Z'),
      },
      doctorUrl: 'https://example.com'
    };
    notifier.notifyConfigChanged(config);
    expect(mockSocket.emit).toHaveBeenCalledWith('config:changed', config);
  });

  it('should notify slot changes', () => {
    notifier = new SlotNotifier();
    notifier.initialize();
    const addedSlots = 2;
    notifier.notifySlotChanges(addedSlots);
    expect(mockSocket.emit).toHaveBeenCalledWith('slots:changes', { added: addedSlots });
  });

  it('should throw error when socket service is not available', () => {
    (SocketService.getInstance as jest.Mock).mockReturnValue(null);
    expect(() => new SlotNotifier()).toThrow('Socket service not available');
  });

  it('should initialize without errors', () => {
    notifier = new SlotNotifier();
    expect(() => notifier.initialize()).not.toThrow();
    expect(mockSocketService.getIO).toBeDefined();
  });
});
