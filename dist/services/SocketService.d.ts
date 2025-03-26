import { Server } from 'socket.io';
export declare class SocketService {
    private static instance;
    private io;
    private constructor();
    static getInstance(): SocketService;
    initialize(server: any): Promise<void>;
    getIO(): Server;
}
