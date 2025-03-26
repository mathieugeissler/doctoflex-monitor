class SocketService {
    constructor() {
        if (SocketService.instance) {
            return SocketService.instance;
        }
        this.socket = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });
        this.listeners = new Map();
        SocketService.instance = this;
    }

    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        this.socket.on(event, callback);
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }

    removeAllListeners() {
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket.off(event, callback);
            });
        });
        this.listeners.clear();
    }
}

export default SocketService;
