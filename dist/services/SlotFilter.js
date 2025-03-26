"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotFilter = void 0;
const logger_1 = require("../utils/logger");
class SlotFilter {
    logger;
    constructor() {
        this.logger = (0, logger_1.createLogger)('SlotFilter');
    }
    filterByDateRange(slots, range) {
        try {
            const startDate = this.normalizeDate(range.startDate);
            const endDate = this.normalizeDate(range.endDate);
            if (startDate > endDate) {
                throw new Error('Start date must be before or equal to end date');
            }
            return slots.filter((slot) => {
                const [year, month, day] = slot.date.split('-').map(Number);
                const slotDate = new Date(year, month - 1, day);
                return slotDate >= startDate && slotDate <= endDate;
            });
        }
        catch (error) {
            this.logger.error('Error filtering slots by date range', { error });
            throw error;
        }
    }
    compareSlots(oldSlots, newSlots) {
        try {
            const oldSlotsMap = new Map(oldSlots.map((slot) => [this.getSlotKey(slot), slot]));
            const newSlotsMap = new Map(newSlots.map((slot) => [this.getSlotKey(slot), slot]));
            const added = [];
            const removed = [];
            const unchanged = [];
            // Find added and unchanged slots
            for (const [key, slot] of newSlotsMap) {
                if (oldSlotsMap.has(key)) {
                    unchanged.push(slot);
                }
                else {
                    added.push(slot);
                }
            }
            // Find removed slots
            for (const [key, slot] of oldSlotsMap) {
                if (!newSlotsMap.has(key)) {
                    removed.push(slot);
                }
            }
            return { added, removed, unchanged };
        }
        catch (error) {
            this.logger.error('Error comparing slots', { error });
            throw error;
        }
    }
    normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    getSlotKey(slot) {
        return `${slot.date}-${slot.time}`;
    }
}
exports.SlotFilter = SlotFilter;
//# sourceMappingURL=SlotFilter.js.map