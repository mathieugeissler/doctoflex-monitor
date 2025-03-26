"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class ConfigurationService {
    static instance;
    config;
    configPath;
    constructor() {
        this.configPath = path_1.default.join(process.cwd(), 'config.json');
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!ConfigurationService.instance) {
            ConfigurationService.instance = new ConfigurationService();
        }
        return ConfigurationService.instance;
    }
    getConfiguration() {
        return this.config;
    }
    updateConfiguration(config) {
        this.config = {
            ...this.config,
            ...config,
        };
        this.saveConfig();
    }
    updateDateRange(startDate, endDate) {
        this.config.dateRange = {
            startDate,
            endDate,
        };
        this.saveConfig();
    }
    saveConfig() {
        try {
            fs_1.default.writeFileSync(this.configPath, JSON.stringify(this.config, (_key, value) => {
                if (value instanceof Map) {
                    return Object.fromEntries(value);
                }
                return value;
            }, 2));
            logger_1.logger.info('Configuration sauvegardée');
        }
        catch (error) {
            logger_1.logger.error('Erreur lors de la sauvegarde de la configuration', { error });
        }
    }
    resetConfiguration() {
        const defaultConfig = {
            doctorUrl: 'https://example.com',
            monitoringInterval: 5,
            autoRefresh: false,
            dateRange: {
                startDate: new Date('2025-03-26T00:00:00.000Z'),
                endDate: new Date('2025-03-27T00:00:00.000Z')
            },
            notifications: {
                enabled: true,
                preferences: new Map()
            }
        };
        this.config = defaultConfig;
        this.saveConfig();
    }
    loadConfig() {
        try {
            if (fs_1.default.existsSync(this.configPath)) {
                const rawConfig = JSON.parse(fs_1.default.readFileSync(this.configPath, 'utf-8'));
                const config = {
                    ...rawConfig,
                    dateRange: {
                        startDate: rawConfig.dateRange?.startDate ? new Date(rawConfig.dateRange.startDate) : null,
                        endDate: rawConfig.dateRange?.endDate ? new Date(rawConfig.dateRange.endDate) : null,
                    },
                    notifications: {
                        enabled: rawConfig.notifications?.enabled ?? true,
                        preferences: new Map(Object.entries(rawConfig.notifications?.preferences || {})),
                    },
                };
                logger_1.logger.info('Configuration chargée depuis le fichier', { config });
                return config;
            }
        }
        catch (error) {
            logger_1.logger.error('Erreur lors du chargement de la configuration', { error });
        }
        // Configuration par défaut
        const defaultConfig = {
            doctorUrl: 'https://example.com',
            monitoringInterval: 5,
            autoRefresh: false,
            dateRange: {
                startDate: new Date('2025-03-26T00:00:00.000Z'),
                endDate: new Date('2025-03-27T00:00:00.000Z')
            },
            notifications: {
                enabled: true,
                preferences: new Map()
            }
        };
        logger_1.logger.info('Utilisation de la configuration par défaut', { config: defaultConfig });
        return defaultConfig;
    }
}
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=ConfigurationService.js.map