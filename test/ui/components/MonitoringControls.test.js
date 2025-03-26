import { MonitoringControls } from '../../../public/js/ui/MonitoringControls.js';
import NotificationService from '../../../public/js/services/NotificationService.js';
import SocketService from '../../../public/js/services/SocketService.js';

jest.mock('../../../public/js/services/SocketService.js', () => {
  const mockSocketService = {
    getInstance: jest.fn()
  };
  return {
    __esModule: true,
    default: mockSocketService
  };
});

jest.mock('../../../public/js/services/NotificationService.js', () => {
  const mockNotificationService = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  };
  return {
    __esModule: true,
    default: mockNotificationService
  };
});

describe('MonitoringControls', () => {
    let monitoringControls;
    let mockSocketService;

    beforeEach(() => {
        // Initialisation des mocks
        mockSocketService = {
            on: jest.fn(),
            emit: jest.fn()
        };

        // Configuration des mocks
        SocketService.getInstance.mockReturnValue(mockSocketService);

        // Set up DOM elements
        document.body.innerHTML = `
            <button id="toggle-monitoring">Démarrer</button>
            <button id="refresh-slots">Rafraîchir</button>
            <span id="monitoring-status" class="text-gray-500">Surveillance inactive</span>
            <div id="refresh-progress" class="hidden"></div>
        `;

        // Initialize component
        monitoringControls = new MonitoringControls(mockSocketService);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('should initialize with correct event listeners', () => {
        expect(document.getElementById('toggle-monitoring').onclick).toBeDefined();
        expect(document.getElementById('refresh-slots').onclick).toBeDefined();
        expect(mockSocketService.on).toHaveBeenCalledWith('monitoring:status', expect.any(Function));
        expect(mockSocketService.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockSocketService.on).toHaveBeenCalledWith('slots:refresh:complete', expect.any(Function));
    });

    it('should toggle monitoring when button is clicked', () => {
        // When
        document.getElementById('toggle-monitoring').click();

        // Then
        expect(mockSocketService.emit).toHaveBeenCalledWith('monitoring:start');
    });

    it('should stop monitoring when button is clicked while active', () => {
        // Given
        document.getElementById('toggle-monitoring').textContent = 'Arrêter';

        // When
        document.getElementById('toggle-monitoring').click();

        // Then
        expect(mockSocketService.emit).toHaveBeenCalledWith('monitoring:stop');
    });

    it('should refresh slots when refresh button is clicked', () => {
        // When
        document.getElementById('refresh-slots').click();

        // Then
        expect(document.getElementById('refresh-progress').classList.contains('hidden')).toBe(false);
        expect(mockSocketService.emit).toHaveBeenCalledWith('slots:refresh');
    });

    it('should update monitoring status when receiving status event', () => {
        // Given
        const statusCallback = mockSocketService.on.mock.calls.find(call => call[0] === 'monitoring:status')[1];

        // When
        statusCallback({ active: true });

        // Then
        expect(document.getElementById('toggle-monitoring').textContent).toBe('Arrêter');
        expect(document.getElementById('monitoring-status').textContent).toBe('Surveillance active');
        expect(document.getElementById('monitoring-status').className).toBe('text-green-500');
    });

    it('should handle error event', () => {
        // Given
        const errorCallback = mockSocketService.on.mock.calls.find(call => call[0] === 'error')[1];
        const error = new Error('Test error');

        // When
        errorCallback(error);

        // Then
        expect(NotificationService.error).toHaveBeenCalledWith('Erreur de surveillance: Test error');
        expect(document.getElementById('toggle-monitoring').textContent).toBe('Démarrer');
        expect(document.getElementById('monitoring-status').textContent).toBe('Surveillance inactive');
        expect(document.getElementById('monitoring-status').className).toBe('text-gray-500');
    });

    it('should hide progress indicator when refresh is complete', () => {
        // Given
        const completeCallback = mockSocketService.on.mock.calls.find(call => call[0] === 'slots:refresh:complete')[1];

        // When
        completeCallback();

        // Then
        expect(document.getElementById('refresh-progress').classList.contains('hidden')).toBe(true);
    });
});
