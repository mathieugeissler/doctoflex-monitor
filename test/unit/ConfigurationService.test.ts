import fs from 'fs';
import path from 'path';
import { ConfigurationService } from '../../src/services/ConfigurationService';
import { env } from '../../src/config/environment';

jest.mock('fs');
jest.mock('path');
jest.mock('@/config/environment', () => ({
  env: {
    DOCTOFLEX_URL: 'https://example.com',
  },
}));

describe('ConfigurationService', () => {
  let configService: ConfigurationService;
  const mockConfigPath = '/mock/path/config.json';

  beforeEach(() => {
    jest.resetAllMocks();
    (path.join as jest.Mock).mockReturnValue(mockConfigPath);
    configService = ConfigurationService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ConfigurationService.getInstance();
      const instance2 = ConfigurationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getConfiguration', () => {
    it('should return default configuration when no file exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const config = configService.getConfiguration();
      expect(config).toEqual({
        doctorUrl: env.DOCTOFLEX_URL,
        monitoringInterval: 5,
        dateRange: {
          startDate: new Date('2025-03-26T00:00:00.000Z'),
          endDate: new Date('2025-03-27T00:00:00.000Z'),
        },
      });
    });

    it('should load configuration from file when it exists', () => {
      const mockConfig = {
        doctorUrl: 'https://example.com',
        monitoringInterval: 5,
        dateRange: {
          startDate: '2025-03-26T00:00:00.000Z',
          endDate: '2025-03-27T00:00:00.000Z',
        },
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      const config = configService.getConfiguration();
      expect(config).toEqual({
        ...mockConfig,
        dateRange: {
          startDate: new Date(mockConfig.dateRange.startDate),
          endDate: new Date(mockConfig.dateRange.endDate),
        },
      });
    });
  });

  describe('updateConfiguration', () => {
    it('should update and save configuration', () => {
      const newConfig = {
        monitoringInterval: 10,
      };

      configService.updateConfiguration(newConfig);
      const savedConfig = configService.getConfiguration();

      expect(savedConfig.monitoringInterval).toBe(newConfig.monitoringInterval);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigPath,
        expect.any(String)
      );
    });

    it('should handle errors during save', () => {
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Write error');
      });

      expect(() => {
        configService.updateConfiguration({ monitoringInterval: 5 });
      }).not.toThrow();
    });
  });

  describe('updateDateRange', () => {
    it('should update date range and save configuration', () => {
      const startDate = new Date('2025-03-26T00:00:00.000Z');
      const endDate = new Date('2025-03-27T00:00:00.000Z');

      configService.updateDateRange(startDate, endDate);
      const config = configService.getConfiguration();

      expect(config.dateRange).toEqual({
        startDate,
        endDate,
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigPath,
        expect.any(String)
      );
    });

    it('should handle null dates', () => {
      configService.updateDateRange(null, null);
      const config = configService.getConfiguration();

      expect(config.dateRange).toEqual({
        startDate: null,
        endDate: null,
      });
    });
  });
});
