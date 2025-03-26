import { Slot } from '../types/Slot';
export declare class SlotScraper {
    private browser;
    private page;
    private isRunning;
    private configService;
    constructor();
    isInitialized(): boolean;
    initialize(): Promise<void>;
    close(): Promise<void>;
    extractSlots(): Promise<Slot[]>;
}
