import express from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { MonitoringService } from './services/MonitoringService';
import { SocketService } from './services/SocketService';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import configRoutes from './routes/config';

const app = express();
const httpServer = createServer(app);

// Configuration des middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
app.use('/api/config', configRoutes);

// Route principale
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware de gestion des erreurs (doit être le dernier middleware)
app.use(errorHandler);

// Initialiser les services
async function initializeServices() {
  try {
    // Initialiser Socket.IO
    SocketService.getInstance().initialize(httpServer);

    // Initialiser le service de monitoring
    const monitoringService = MonitoringService.getInstance();
    await monitoringService.initialize();

    logger.info('Tous les services sont initialisés');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation des services', { error });
    process.exit(1);
  }
}

// Démarrer le serveur HTTP
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  logger.info(`Serveur démarré sur le port ${port}`);
  // Initialiser les services après le démarrage du serveur
  initializeServices();
});
