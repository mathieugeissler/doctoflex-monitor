import { Socket } from 'socket.io';
import { Configuration } from './ConfigurationService';
type MonitoringSettings = Pick<Configuration, 'monitoringInterval' | 'autoRefresh'>;
export declare class MonitoringService {
    private monitoringInterval;
    private monitoringSettings;
    private isMonitoringActive;
    private readonly slotScraper;
    private readonly slotNotifier;
    private readonly configService;
    private readonly socketService;
    private readonly slotStorageService;
    private readonly slotFilter;
    isMonitoring(): boolean;
    getMonitoringSettings(): MonitoringSettings | null;
    private static instance;
    private constructor();
    static resetInstance(): void;
    static getInstance(): MonitoringService;
    initialize(): Promise<void>;
    startMonitoring(settings: MonitoringSettings): Promise<void>;
    stopMonitoring(): Promise<void>;
    handleConnection(socket: Socket): Promise<void>;
}
export {};
