class NotificationService {
    constructor() {
        this.io = null;
        this.userConfigs = new Map(); // Stocke les configurations par socket ID
    }

    setSocketIO(io) {
        this.io = io;
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            console.log(`Client connecté: ${socket.id}`);
            
            // Initialiser la configuration pour ce client
            this.userConfigs.set(socket.id, {
                browser: false
            });

            // Gérer la mise à jour de la configuration
            socket.on('updateNotificationConfig', (config) => {
                console.log(`Mise à jour de la configuration pour ${socket.id}:`, config);
                this.updateConfig(socket.id, config);
            });

            // Nettoyer la configuration à la déconnexion
            socket.on('disconnect', () => {
                console.log(`Client déconnecté: ${socket.id}`);
                this.userConfigs.delete(socket.id);
            });
        });
    }

    updateConfig(socketId, config) {
        const currentConfig = this.userConfigs.get(socketId) || { browser: false };
        this.userConfigs.set(socketId, { ...currentConfig, ...config });
    }

    async sendNotification(message) {
        if (!this.io) {
            console.error('Socket.IO n\'est pas initialisé');
            return;
        }

        // Envoyer la notification uniquement aux utilisateurs qui l'ont activée
        for (const [socketId, config] of this.userConfigs.entries()) {
            if (config.browser) {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.emit('notification', {
                        title: 'Doctoflex Monitor',
                        body: message
                    });
                    console.log(`Notification envoyée au client ${socketId}`);
                }
            }
        }
    }
}

module.exports = new NotificationService();
