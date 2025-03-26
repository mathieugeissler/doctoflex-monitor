import { Slot, SlotUpdate } from '../types/Slot';
export declare class SlotNotifier {
    private socketService;
    private initialized;
    constructor();
    initialize(): void;
    notifyNewSlots(slots: Slot[]): void;
    notifyError(error: Error): void;
    notifyMonitoringStarted(clientId: string): void;
    notifyMonitoringStopped(clientId: string): void;
    notifyMonitoringUpdated(clientId: string): void;
    notifySlotChanges(update: SlotUpdate): void;
}
