"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotNotifier = void 0;
const logger_1 = require("../utils/logger");
const SocketService_1 = require("./SocketService");
class SlotNotifier {
    socketService;
    initialized = false;
    constructor() {
        this.socketService = SocketService_1.SocketService.getInstance();
    }
    initialize() {
        try {
            const io = this.socketService.getIO();
            io.on('connection', (socket) => {
                logger_1.logger.info('Client connected to SlotNotifier', { socketId: socket.id });
            });
            this.initialized = true;
            logger_1.logger.info('SlotNotifier initialized');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize SlotNotifier', { error });
            throw error;
        }
    }
    notifyNewSlots(slots) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        try {
            this.socketService.getIO().emit('slots:new', {
                slots,
                lastUpdate: new Date().toISOString()
            });
            logger_1.logger.info('Notified clients of new slots', { slotsCount: slots.length });
        }
        catch (error) {
            logger_1.logger.error('Failed to notify new slots', { error });
            throw error;
        }
    }
    notifyError(error) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        try {
            this.socketService.getIO().emit('slots:error', {
                message: error.message,
                timestamp: new Date().toISOString(),
            });
            logger_1.logger.error('Notified clients of error', { error });
        }
        catch (error) {
            logger_1.logger.error('Failed to notify error', { error });
            throw error;
        }
    }
    notifyMonitoringStarted(clientId) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        this.socketService.getIO().to(clientId).emit('monitoring:started');
        logger_1.logger.info('Notified client of monitoring start', { clientId });
    }
    notifyMonitoringStopped(clientId) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        this.socketService.getIO().to(clientId).emit('monitoring:stopped');
        logger_1.logger.info('Notified client of monitoring stop', { clientId });
    }
    notifyMonitoringUpdated(clientId) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        this.socketService.getIO().to(clientId).emit('monitoring:updated');
        logger_1.logger.info('Notified client of monitoring update', { clientId });
    }
    notifySlotChanges(update) {
        if (!this.initialized) {
            throw new Error('SlotNotifier not initialized');
        }
        try {
            this.socketService.getIO().emit('slots:changes', update);
            logger_1.logger.info('Notified clients of slot changes', { update });
        }
        catch (error) {
            logger_1.logger.error('Failed to notify slot changes', { error });
            throw error;
        }
    }
}
exports.SlotNotifier = SlotNotifier;
//# sourceMappingURL=SlotNotifier.js.map