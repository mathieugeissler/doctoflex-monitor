# Plan de Développement - DoctofleX Monitor

## Standards de Développement
1. Architecture et Principes
   - Utilisation de TypeScript pour un typage fort
   - Application des principes SOLID, en particulier SRP (Single Responsibility Principle)
   - Architecture en couches :
     * Controllers : Gestion des requêtes HTTP
     * Services : Logique métier
     * Repositories : Accès aux données/fichiers
     * Models : Interfaces et types TypeScript

2. Qualité de Code
   - Tests unitaires et d'intégration avec Jest
   - Couverture de code minimale de 90%
   - Utilisation d'ESLint et Prettier
   - Documentation des interfaces et fonctions

3. Gestion des Erreurs
   - Utilisation de types personnalisés pour les erreurs
   - Gestion centralisée des erreurs
   - Logging structuré

## Phase 1: Configuration Initiale
1. Initialiser le projet Node.js avec TypeScript
   - Créer package.json
   - Configurer TypeScript (tsconfig.json)
     * strict: true
     * esModuleInterop: true
     * Autres options de sécurité de type
   - Configurer les dépendances
     * express, socket.io, puppeteer
     * typescript, @types/*
     * jest, ts-jest, @types/jest
     * winston, winston-daily-rotate-file
   - Mettre en place la structure des dossiers
     * src/
       - controllers/
       - services/
       - models/
       - types/
       - utils/
     * test/
       - unit/
       - integration/
       - fixtures/

2. Configurer l'environnement de développement
   - Configurer ESLint et Prettier
     * Configuration TypeScript stricte
     * Règles de formatage cohérentes
     * Import sorting
     * Lint des tests
   - Mettre en place les variables d'environnement système
     ```typescript
     interface Environment {
       PORT: number;
       NODE_ENV: 'development' | 'production';
       CORS_ORIGINS: string[];
       LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
       PUPPETEER_HEADLESS: boolean;
       LOG_FILE_DIR: string;
       LOG_MAX_FILES: number;
       LOG_MAX_SIZE: string;
     }
     ```
   - Configurer Winston Logger
     ```typescript
     interface LoggerConfig {
       level: string;
       format: winston.Logform.Format;
       transports: winston.transport[];
       exceptionHandlers: winston.transport[];
       rejectionHandlers: winston.transport[];
     }
     ```
     * Formats personnalisés pour dev/prod
     * Rotation des fichiers de logs
     * Gestion des exceptions non capturées
     * Niveaux de log adaptés à l'environnement
   - Mettre en place la configuration utilisateur (config.json)
     ```typescript
     interface NotificationPreference {
       navigator: boolean;
     }

     interface DateRange {
       startDate?: Date;
       endDate?: Date;
     }

     interface AppConfig {
       doctorUrl: string;
       monitoringInterval: number;
       dateRange: DateRange;
       notifications: {
         enabled: boolean;
         preferences: Map<string, NotificationPreference>;
       };
     }
     ```
   - Configurer Jest et la couverture de code
     * Configuration ts-jest
     * Seuils de couverture :
       - Statements: 90%
       - Branches: 90%
       - Functions: 90%
       - Lines: 90%
     * Reporter de couverture HTML
   - Configurer les scripts npm
     * build: Compilation TypeScript
     * dev: Nodemon avec ts-node
     * test: Jest avec couverture
     * test:watch: Jest en mode watch
     * lint: ESLint avec --fix
     * format: Prettier

## Phase 2: Backend Core
1. Service de Configuration (ConfigService)
   - Écrire les tests unitaires du service
   - Définir l'interface de configuration
     * doctorUrl: URL du médecin
     * monitoringInterval: Intervalle de vérification
     * dateRange: Plage de dates de surveillance
     * notifications: {
       enabled: boolean,
       preferences: Map<socketId, {
         navigator: boolean
       }>
     }
   - Implémenter le service
     * Définir les configurations par défaut
     * Chargement/Sauvegarde du fichier config.json
     * Validation des configurations
     * Gestion des modifications
   - Écrire les tests des routes API
     * GET /api/config
       - Entrée: Aucune
       - Sortie: Configuration actuelle
     * PUT /api/config
       - Entrée: Configuration partielle ou complète
       - Sortie: Nouvelle configuration complète

2. Système de Scraping (SlotScraper)
   - Définir l'interface des créneaux
     ```typescript
     interface Slot {
       date: string;      // Format: YYYY-MM-DD
       time: string;      // Format: HH:mm
       bookingUrl: string; // URL directe de réservation
     }
     ```
   - Écrire les tests unitaires du scraper
     * Utiliser test/fixture/calendar.html comme page de test
     * Tester l'extraction des créneaux et URLs depuis le HTML
     * Tester le parsing des dates et heures
     * Tester la validité des URLs de réservation
     * Tester les cas d'erreur (page invalide, pas de créneaux)
   - Écrire les tests d'intégration avec Doctoflex
     * Tester la navigation sur le site réel
     * Tester la sélection du type de rendez-vous
     * Tester la récupération du calendrier et des liens
   - Implémenter la navigation automatisée
   - Développer l'extraction des créneaux et URLs
   - Gérer le parsing des dates

3. Gestionnaire de Créneaux (SlotFilter)
   - Écrire les tests unitaires du filtre
   - Implémenter le filtrage par date
   - Développer la logique de comparaison
   - Gérer la validation des créneaux

4. Système de Notification (SlotNotifier)
   - Définir l'interface des créneaux disponibles
     ```typescript
     interface AvailableSlots {
       slots: Slot[];
       timestamp: Date;
     }
     ```
   - Écrire les tests unitaires du notifier
     * Tester la détection des créneaux disponibles
     * Vérifier le format des notifications
   - Écrire les tests d'intégration Socket.IO
     * Tester l'envoi des notifications
     * Vérifier la réception par les clients
   - Implémenter l'intégration Socket.IO
     * Envoyer les créneaux disponibles
     * Inclure l'horodatage de la dernière vérification
   - Gérer les connexions WebSocket

5. Serveur Express
   - Écrire les tests des routes API
     * GET /api/slots
       - Entrée: Query params (startDate?: Date, endDate?: Date, forceRefresh?: boolean)
       - Sortie: {
           slots: Array<{ date: string, time: string, bookingUrl: string }>,
           lastCheck: Date,
           nextCheck?: Date
         }
     * POST /api/monitor
       - Entrée: { startDate?: Date, endDate?: Date, interval?: number }
       - Sortie: { status: 'started' | 'updated', monitorId: string }
     * DELETE /api/monitor/:monitorId
       - Entrée: monitorId dans l'URL
       - Sortie: { status: 'stopped' }
     * GET /api/status
       - Entrée: Aucune
       - Sortie: {
           isMonitoring: boolean,
           lastCheck: Date,
           nextCheck?: Date,
           config: {
             monitoringInterval: number,
             notifications: {
               enabled: boolean,
               sound: boolean
             }
           }
         }
     * PUT /api/config
       - Entrée: Partial<ConfigFormData>
       - Sortie: ConfigFormData
   - Implémenter les routes API avec validation des entrées
   - Intégrer les middlewares (cors, error handling, logging)
   - Implémenter la gestion d'erreurs
     * 400: Bad Request (paramètres invalides)
     * 404: Not Found (monitorId invalide)
     * 500: Internal Server Error
   - Mettre en place la documentation OpenAPI/Swagger

## Phase 3: Frontend
1. Structure de Base
   - Configurer l'environnement de test frontend (Jest + Testing Library)
   - Mettre en place Tailwind CSS et ses plugins
     * @tailwindcss/forms pour des formulaires élégants
     * @tailwindcss/typography pour une typographie soignée
     * tailwindcss/aspect-ratio pour les layouts responsifs
   - Configurer le thème Tailwind
     ```typescript
     // tailwind.config.js
     module.exports = {
       theme: {
         extend: {
           colors: {
             primary: {...}, // Palette moderne
             secondary: {...},
             accent: {...}
           },
           fontFamily: {
             sans: ['Inter var', ...defaultTheme.fontFamily.sans],
           },
           borderRadius: {
             'xl': '1rem',
             '2xl': '2rem'
           }
         }
       }
     }
     ```
   - Configurer le bundling avec Vite

2. Interface Utilisateur
   - Écrire les tests des composants UI
   - Implémenter le chargement initial
     * Skeleton loader élégant pendant le chargement
     * Animation de transition fluide
     * Indicateur de progression discret
   - Concevoir le layout principal
     * Navigation épurée en haut
       - Bouton de configuration avec icône
       - Indicateur de statut de connexion
     * Conteneur principal centré avec largeur maximale
     * Espacement et marges harmonieux
   - Implémenter la modale de configuration
     * Interface simple
       ```typescript
       interface ConfigFormData {
         monitoringInterval: number; // en secondes
         notifications: {
           enabled: boolean;
           sound: boolean;
         };
       }
       ```
     * Modale compacte et épurée
       - Fréquence de vérification
         * Select avec options : 30s, 1min, 2min, 5min
       - Notifications
         * Switch principal activer/désactiver
         * Checkbox pour le son
       - Actions
         * Bouton Sauvegarder
         * Bouton Annuler
   - Créer le tableau des créneaux
     * États du tableau
       - État de chargement
         * Skeleton loader animé pour chaque ligne
         * Indicateur de progression en haut
         * Message "Recherche des créneaux disponibles..."
       - État vide
         * Illustration moderne "Aucun créneau disponible"
         * Message informatif
         * Bouton de rafraîchissement visible
         * Date de la dernière vérification
       - État avec données
         * Design de carte moderne pour chaque créneau
         * Ombres douces et coins arrondis
         * Transitions au survol
         * Boutons d'action avec icônes
         * Étiquettes de statut colorées
     * Barre de statut
       * Affichage de la dernière vérification en format relatif
       * Compte à rebours circulaire et animé
       * Indicateur de statut de la connexion
   - Implémenter les filtres de date
     * Calendrier flottant moderne
     * Sélection de plage intuitive
     * Animations de transition
   - Concevoir les notifications
     * Toast notifications minimalistes
     * Animation d'entrée/sortie fluide
     * Son discret et option de désactivation

3. Intégration Socket.IO Client
   - Écrire les tests d'intégration WebSocket
     * Tester la réception des créneaux disponibles
     * Vérifier l'affichage des notifications
   - Gérer les connexions WebSocket
     * Indicateur de statut discret
     * Reconnexion automatique silencieuse
   - Implémenter la réception des créneaux
     * Animation subtile des nouveaux créneaux
     * Badge de notification élégant
     * Son de notification personnalisable
     * Transition fluide dans la liste

## Phase 4: Tests E2E et Optimisation
1. Tests End-to-End
   - Configurer Cypress ou Playwright
   - Écrire les scénarios de test E2E
   - Tester le flux complet de l'application
   - Valider les cas d'erreur

2. Optimisation
   - Profiler les performances
   - Optimiser les performances du scraping
   - Améliorer la gestion de la mémoire
   - Optimiser les requêtes réseau

## Phase 5: Déploiement
1. Préparation au Déploiement
   - Configurer l'intégration continue (CI)
   - Configurer les variables d'environnement
   - Optimiser pour la production
   - Préparer la documentation

2. Mise en Production
   - Mettre en place les tests de pré-production
   - Déployer l'application
   - Configurer le monitoring
   - Mettre en place les logs
