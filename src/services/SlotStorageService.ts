import fs from 'fs/promises';
import path from 'path';
import { Slot, SlotStorage } from '../types/Slot';

export class SlotStorageService {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'data', 'slots.json');
  }

  async saveSlots(slots: Slot[]): Promise<SlotStorage> {
    const data : SlotStorage = {
      lastUpdate: new Date().toISOString(),
      slots: slots
    };
    try {
      // Assurer que le dossier data existe
      await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
      
      // Sauvegarder les créneaux dans le fichier
      await fs.writeFile(
        this.storagePath,
        JSON.stringify(data, null, 2)
      );

      return data;
    } catch (error) {
      throw new Error('Failed to save slots');
    }
  }

  async getLastUpdate(): Promise<string | null> {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      const parsedData = JSON.parse(data);
      return parsedData.lastUpdate || null;
    } catch (error) {
      return null;
    }
  }

  async loadSlots(): Promise<SlotStorage> {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      const parsedData = JSON.parse(data) as SlotStorage;
      return parsedData;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Le fichier n'existe pas encore
        return { lastUpdate: undefined, slots: [] };
      }
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse slots data');
      }
      throw error;
    }
  }
}
