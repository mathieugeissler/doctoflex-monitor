import { App } from '../../public/js/app';
import { SlotService } from '../../public/js/services/SlotService';
import { SocketService } from '../../public/js/services/SocketService';
import { NotificationService } from '../../public/js/services/NotificationService';
import { SlotDisplay } from '../../public/js/ui/SlotDisplay';
import { MonitoringControls } from '../../public/js/ui/MonitoringControls';
import { SettingsModal } from '../../public/js/ui/SettingsModal';
import { DateFilter } from '../../public/js/ui/DateFilter';

// Mock des services
jest.mock('../../public/js/services/SlotService', () => {
    const SlotService = jest.fn().mockImplementation(() => ({
        updateDateRange: jest.fn(),
        getSlots: jest.fn(),
        onSlotsUpdate: jest.fn(),
        initialize: jest.fn(),
        setSlotUpdateCallback: jest.fn()
    }));
    return { __esModule: true, default: SlotService };
});
jest.mock('../../public/js/services/SocketService', () => {
    const SocketService = jest.fn().mockImplementation(() => ({
        emit: jest.fn(),
        on: jest.fn(),
        getIO: jest.fn().mockReturnValue({
            on: jest.fn(),
            emit: jest.fn()
        })
    }));
    SocketService.getInstance = jest.fn();
    return { __esModule: true, default: SocketService };
});
jest.mock('../../public/js/services/NotificationService', () => {
    const NotificationService = jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        showNotification: jest.fn()
    }));
    return { __esModule: true, default: NotificationService };
});
jest.mock('../../public/js/services/NotificationPreferencesService', () => {
    const NotificationPreferencesService = jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        getPreferences: jest.fn(),
        setPreferences: jest.fn()
    }));
    return { __esModule: true, default: NotificationPreferencesService };
});

// Mock des composants UI
jest.mock('../../public/js/ui/SlotDisplay', () => {
    const SlotDisplay = jest.fn().mockImplementation(() => ({
        updateSlots: jest.fn(),
        showError: jest.fn(),
        showSuccess: jest.fn()
    }));
    return { __esModule: true, default: SlotDisplay };
});
jest.mock('../../public/js/ui/MonitoringControls', () => {
    const MonitoringControls = jest.fn().mockImplementation(() => ({
        updateMonitoringStatus: jest.fn(),
        showError: jest.fn(),
        showSuccess: jest.fn()
    }));
    return { __esModule: true, MonitoringControls };
});
jest.mock('../../public/js/ui/SettingsModal', () => {
    const SettingsModal = jest.fn().mockImplementation(() => ({
        show: jest.fn(),
        hide: jest.fn(),
        updateSettings: jest.fn(),
        showError: jest.fn(),
        showSuccess: jest.fn()
    }));
    return { __esModule: true, default: SettingsModal };
});
jest.mock('../../public/js/ui/DateFilter', () => {
    const DateFilter = jest.fn().mockImplementation(() => ({
        updateDateRange: jest.fn(),
        showError: jest.fn(),
        showSuccess: jest.fn()
    }));
    return { __esModule: true, default: DateFilter };
});

describe('App', () => {
    let app;
    let mockSlotService;
    let mockSocketService;
    let mockNotificationService;
    let mockSlotDisplay;
    let mockMonitoringControls;
    let mockSettingsModal;
    let mockDateFilter;

    beforeEach(() => {
        // Reset des mocks
        jest.clearAllMocks();

        // Mock des services
        mockSlotService = {
            updateDateRange: jest.fn(),
            getSlots: jest.fn(),
            onSlotsUpdate: jest.fn(),
            initialize: jest.fn(),
            setSlotUpdateCallback: jest.fn()
        };
        const SlotServiceMock = jest.requireMock('../../public/js/services/SlotService').default;
        SlotServiceMock.mockImplementation(() => mockSlotService);

        mockSocketService = {
            emit: jest.fn(),
            on: jest.fn(),
            getIO: jest.fn().mockReturnValue({
                on: jest.fn(),
                emit: jest.fn()
            })
        };
        const SocketServiceMock = jest.requireMock('../../public/js/services/SocketService').default;
        SocketServiceMock.getInstance.mockReturnValue(mockSocketService);

        mockNotificationService = {
            initialize: jest.fn(),
            showNotification: jest.fn()
        };
        const NotificationServiceMock = jest.requireMock('../../public/js/services/NotificationService').default;
        NotificationServiceMock.mockImplementation(() => mockNotificationService);

        // Mock des composants UI
        mockSlotDisplay = {
            updateSlots: jest.fn(),
            showError: jest.fn(),
            showSuccess: jest.fn()
        };
        const SlotDisplayMock = jest.requireMock('../../public/js/ui/SlotDisplay').default;
        SlotDisplayMock.mockImplementation(() => mockSlotDisplay);

        mockMonitoringControls = {
            updateMonitoringStatus: jest.fn(),
            showError: jest.fn(),
            showSuccess: jest.fn()
        };
        const { MonitoringControls: MonitoringControlsMock } = jest.requireMock('../../public/js/ui/MonitoringControls');
        MonitoringControlsMock.mockImplementation(() => mockMonitoringControls);

        mockSettingsModal = {
            show: jest.fn(),
            hide: jest.fn(),
            updateSettings: jest.fn(),
            showError: jest.fn(),
            showSuccess: jest.fn()
        };
        const SettingsModalMock = jest.requireMock('../../public/js/ui/SettingsModal').default;
        SettingsModalMock.mockImplementation(() => mockSettingsModal);

        mockDateFilter = {
            updateDateRange: jest.fn(),
            showError: jest.fn(),
            showSuccess: jest.fn()
        };
        const DateFilterMock = jest.requireMock('../../public/js/ui/DateFilter').default;
        DateFilterMock.mockImplementation(() => mockDateFilter);

        // Mock du DOM
        document.body.innerHTML = `
            <div id="slot-display"></div>
            <div id="monitoring-controls"></div>
            <div id="settings-modal"></div>
            <div id="date-filter"></div>
            <div id="refresh-progress"></div>
        `;

        // Initialisation de l'application
        app = new App();
    });

    it('devrait initialiser tous les composants', () => {
        const SlotDisplayMock = jest.requireMock('../../public/js/ui/SlotDisplay').default;
        const { MonitoringControls: MonitoringControlsMock } = jest.requireMock('../../public/js/ui/MonitoringControls');
        const SettingsModalMock = jest.requireMock('../../public/js/ui/SettingsModal').default;
        const DateFilterMock = jest.requireMock('../../public/js/ui/DateFilter').default;
        const SlotServiceMock = jest.requireMock('../../public/js/services/SlotService').default;
        const SocketServiceMock = jest.requireMock('../../public/js/services/SocketService').default;
        const NotificationServiceMock = jest.requireMock('../../public/js/services/NotificationService').default;

        expect(SlotDisplayMock).toHaveBeenCalled();
        expect(MonitoringControlsMock).toHaveBeenCalled();
        expect(SettingsModalMock).toHaveBeenCalled();
        expect(DateFilterMock).toHaveBeenCalled();
        expect(SlotServiceMock).toHaveBeenCalled();
        expect(SocketServiceMock.getInstance).toHaveBeenCalled();
        expect(NotificationServiceMock).toHaveBeenCalled();
    });
}); 