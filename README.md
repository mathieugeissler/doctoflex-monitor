# DoctofleX Monitor

Application de surveillance des créneaux de rendez-vous sur Doctoflex.fr

## Fonctionnalités

- Surveillance automatique des créneaux
- Filtrage par plage de dates
- Notifications en temps réel
- Interface utilisateur intuitive
- Configuration personnalisable

## Prérequis

- Node.js >= 18
- npm >= 9

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/username/doctoflex-monitor.git
cd doctoflex-monitor
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos paramètres :
```env
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=info
PUPPETEER_HEADLESS=true
LOG_FILE_DIR=./logs
LOG_MAX_FILES=14
LOG_MAX_SIZE=20m
DOCTOFLEX_URL=https://www.doctolib.fr/medecin/example
```

## Développement

Démarrer le serveur en mode développement :
```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Tests

Exécuter les tests unitaires :
```bash
npm test
```

Exécuter les tests d'intégration :
```bash
npm run test:integration
```

Vérifier la couverture de code :
```bash
npm run test:coverage
```

## Build

Compiler l'application pour la production :
```bash
npm run build
```

## Déploiement

1. Compiler l'application :
```bash
npm run build
```

2. Démarrer le serveur :
```bash
npm start
```

## Structure du Projet

```
doctoflex-monitor/
├── src/
│   ├── config/         # Configuration
│   ├── services/       # Services métier
│   ├── routes/         # Routes API
│   ├── utils/          # Utilitaires
│   └── server.ts       # Point d'entrée
├── public/             # Fichiers statiques
│   ├── css/           # Styles CSS
│   ├── js/            # JavaScript client
│   └── index.html     # Page principale
├── test/              # Tests
│   ├── unit/          # Tests unitaires
│   └── integration/   # Tests d'intégration
└── dist/              # Build production
```

## API

### Configuration

- `GET /api/config` - Récupérer la configuration
- `PUT /api/config` - Mettre à jour la configuration
- `POST /api/config/reset` - Réinitialiser la configuration

### WebSocket

- `slots:new` - Nouveaux créneaux disponibles
- `error` - Erreur de monitoring

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

MIT
