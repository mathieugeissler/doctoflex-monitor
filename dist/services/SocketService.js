"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
class SocketService {
    static instance;
    io = null;
    constructor() { }
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    async initialize(server) {
        if (this.io) {
            return;
        }
        try {
            this.io = new socket_io_1.Server(server, {
                cors: {
                    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
                    methods: ['GET', 'POST'],
                },
            });
            logger_1.logger.info('SocketService initialized');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize SocketService', { error });
            throw error;
        }
    }
    getIO() {
        if (!this.io) {
            throw new Error('SocketService not initialized');
        }
        return this.io;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=SocketService.js.map