export interface NotificationPreference {
    navigator: boolean;
}
export interface Configuration {
    doctorUrl: string;
    monitoringInterval: number;
    autoRefresh: boolean;
    dateRange: {
        startDate: Date | null;
        endDate: Date | null;
    };
    notifications: {
        enabled: boolean;
        preferences: Map<string, NotificationPreference>;
    };
}
export declare class ConfigurationService {
    private static instance;
    private config;
    private readonly configPath;
    private constructor();
    static getInstance(): ConfigurationService;
    getConfiguration(): Configuration;
    updateConfiguration(config: Partial<Configuration>): void;
    updateDateRange(startDate: Date | null, endDate: Date | null): void;
    private saveConfig;
    resetConfiguration(): void;
    private loadConfig;
}
