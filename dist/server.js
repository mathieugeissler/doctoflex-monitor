"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const MonitoringService_1 = require("./services/MonitoringService");
const SocketService_1 = require("./services/SocketService");
const errorHandler_1 = require("./utils/errorHandler");
const logger_1 = require("./utils/logger");
const config_1 = __importDefault(require("./routes/config"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Configuration des middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes API
app.use('/api/config', config_1.default);
// Route principale
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Middleware de gestion des erreurs (doit être le dernier middleware)
app.use(errorHandler_1.errorHandler);
// Initialiser les services
async function initializeServices() {
    try {
        // Initialiser Socket.IO
        SocketService_1.SocketService.getInstance().initialize(httpServer);
        // Initialiser le service de monitoring
        const monitoringService = MonitoringService_1.MonitoringService.getInstance();
        await monitoringService.initialize();
        logger_1.logger.info('Tous les services sont initialisés');
    }
    catch (error) {
        logger_1.logger.error('Erreur lors de l\'initialisation des services', { error });
        process.exit(1);
    }
}
// Démarrer le serveur HTTP
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    logger_1.logger.info(`Serveur démarré sur le port ${port}`);
    // Initialiser les services après le démarrage du serveur
    initializeServices();
});
//# sourceMappingURL=server.js.map