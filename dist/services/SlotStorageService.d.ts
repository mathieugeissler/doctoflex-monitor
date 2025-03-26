import { Slot } from '../types/Slot';
export declare class SlotStorageService {
    private readonly storagePath;
    constructor();
    saveSlots(slots: Slot[]): Promise<void>;
    getLastUpdate(): Promise<string | null>;
    loadSlots(): Promise<Slot[]>;
}
