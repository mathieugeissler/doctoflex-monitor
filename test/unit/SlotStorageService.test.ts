import { SlotStorageService } from '../../src/services/SlotStorageService';
import { SlotStorage } from '../../src/types/Slot';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('data/slots.json'),
  dirname: jest.fn().mockReturnValue('data')
}));

describe('SlotStorageService', () => {
  let service: SlotStorageService;
  const mockSlotStorage: SlotStorage = {
    lastUpdate: new Date().toISOString(),
    slots: [
      { date: '2025-03-26', time: '09:00', bookingUrl: '/booking/123' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SlotStorageService();
  });

  describe('saveSlots', () => {
    it('should save slots to file', async () => {
      // Given
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      // When
      const result = await service.saveSlots(mockSlotStorage.slots);

      // Then
      expect(fs.mkdir).toHaveBeenCalledWith('data', { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        'data/slots.json',
        expect.stringContaining('"lastUpdate"')
      );
      expect(result).toEqual({
        lastUpdate: expect.any(String),
        slots: mockSlotStorage.slots
      });
    });

    it('should throw error when save fails', async () => {
      // Given
      const error = new Error('Save failed') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      // When/Then
      await expect(service.saveSlots(mockSlotStorage.slots)).rejects.toThrow('Failed to save slots');
    });
  });

  describe('loadSlots', () => {
    it('should load slots from file', async () => {
      // Given
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockSlotStorage));

      // When
      const result = await service.loadSlots();

      // Then
      expect(fs.readFile).toHaveBeenCalledWith('data/slots.json', 'utf-8');
      expect(result).toEqual(mockSlotStorage);
    });

    it('should return empty data when file does not exist', async () => {
      // Given
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      // When
      const result = await service.loadSlots();

      // Then
      expect(result).toEqual({
        lastUpdate: undefined,
        slots: []
      });
    });

    it('should throw error when load fails', async () => {
      // Given
      const error = new Error('Load failed') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      // When/Then
      await expect(service.loadSlots()).rejects.toThrow('Load failed');
    });
  });
});
