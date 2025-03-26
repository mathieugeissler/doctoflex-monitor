import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { env } from '@/config/environment';

export interface NotificationPreference {
  navigator: boolean;
}

export interface Configuration {
  doctorUrl: string;
  monitoringInterval: number;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private config: Configuration;
  private readonly configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'data', 'config.json');
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  public getConfiguration(): Configuration {
    return this.config;
  }

  public updateConfiguration(config: Partial<Configuration>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this.saveConfig();
  }

  public updateDateRange(startDate: Date | null, endDate: Date | null): void {
    this.config.dateRange = {
      startDate,
      endDate,
    };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, (_key, value) => {
          if (value instanceof Map) {
            return Object.fromEntries(value);
          }
          return value;
        }, 2)
      );
      logger.info('Configuration sauvegardée');
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de la configuration', { error });
    }
  }

  private loadConfig(): Configuration {
    try {
      if (fs.existsSync(this.configPath)) {
        const rawConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        const config = {
          ...rawConfig,
          dateRange: {
            startDate: rawConfig.dateRange?.startDate ? new Date(rawConfig.dateRange.startDate) : null,
            endDate: rawConfig.dateRange?.endDate ? new Date(rawConfig.dateRange.endDate) : null,
          },
        };
        logger.info('Configuration chargée depuis le fichier', { config });
        return config;
      }
    } catch (error) {
      logger.error('Erreur lors du chargement de la configuration', { error });
    }

    // Configuration par défaut
    const defaultConfig: Configuration = {
      doctorUrl: env.DOCTOFLEX_URL,
      monitoringInterval: 5,
      dateRange: {
        startDate: new Date('2025-03-26T00:00:00.000Z'),
        endDate: new Date('2025-03-27T00:00:00.000Z')
      },
    };
    return defaultConfig;
  }
}
