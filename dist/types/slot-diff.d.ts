import { Slot } from './Slot';
export interface SlotDiff {
    added: Slot[];
    removed: Slot[];
    unchanged: Slot[];
}
