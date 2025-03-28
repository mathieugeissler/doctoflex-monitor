# DoctofleX Monitor

Application de surveillance des créneaux de rendez-vous sur Doctoflex.fr

## Fonctionnalités

- Surveillance automatique des créneaux de rendez-vous
- Filtrage par plage de dates
- Notifications en temps réel dans le navigateur
- Interface utilisateur moderne avec Tailwind CSS
- Configuration personnalisable (intervalle, notifications)
- Mode sombre/clair automatique
- Indicateurs de statut en temps réel
- Historique des créneaux

## Prérequis

- Node.js >= 18
- npm >= 9
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)

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

3. Configurer l'environnement :
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos paramètres :
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Développement

Démarrer le serveur en mode développement :
```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

Les modifications du code TypeScript et des styles Tailwind sont automatiquement rechargées.

## Tests

Exécuter tous les tests :
```bash
npm test
```

Exécuter les tests d'intégration :
```bash
npm run test:integration
```

Exécuter les tests unitaires :
```bash
npm run test:unit
```

## Structure du Projet

```
doctoflex-monitor/
├── src/
│   ├── config/         # Configuration
│   ├── services/       # Services métier
│   │   ├── SlotScraper.ts      # Extraction des créneaux
│   │   ├── MonitoringService.ts # Gestion du monitoring
│   │   ├── SlotNotifier.ts     # Notifications
│   │   └── SlotStorage.ts      # Stockage des créneaux
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires
│   └── server.ts       # Point d'entrée
├── public/
│   ├── css/           # Styles compilés
│   ├── js/            # JavaScript client
│   │   ├── services/  # Services client
│   │   └── ui/        # Composants UI
│   └── index.html     # Page principale
└── test/
    ├── unit/          # Tests unitaires
    └── integration/   # Tests d'intégration
```

## Événements WebSocket

### Client vers Serveur

- `monitoring:start` - Démarrer la surveillance
- `monitoring:stop` - Arrêter la surveillance
- `slots:refresh` - Rafraîchir manuellement les créneaux
- `config:update` - Mettre à jour la configuration

### Serveur vers Client

- `monitoring:status` - État de la surveillance (actif/inactif)
- `slots:new` - Nouveaux créneaux disponibles
- `slots:refresh:complete` - Rafraîchissement terminé
- `config:changed` - Configuration mise à jour
- `error` - Erreur de monitoring

## Configuration

La configuration est stockée dans `config.json` et peut être modifiée via l'interface :

```json
{
  "monitoringInterval": 1,
  "autoRefresh": true,
  "notifications": {
    "enabled": true
  },
  "dateRange": {
    "startDate": null,
    "endDate": null
  },
  "doctorUrl": "https://www.doctoflex.fr/details/213049"
}
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

MIT
