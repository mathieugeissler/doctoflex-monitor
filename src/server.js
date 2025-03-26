const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./api/routes');
const notificationService = require('./services/notification');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/src')));

// Routes API
app.use('/api', apiRoutes);

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/src/index.html'));
});

// Configurer Socket.IO
io.on('connection', (socket) => {
    console.log('Nouveau client connecté');
    
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

// Injecter Socket.IO dans le service de notification
notificationService.setSocketIO(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
