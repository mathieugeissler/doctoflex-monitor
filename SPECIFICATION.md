# DoctofleX Monitor - Spécification Fonctionnelle

## Description Générale
DoctofleX Monitor est une application web qui surveille automatiquement la disponibilité des créneaux de rendez-vous sur le site Doctoflex.fr pour un médecin spécifique. L'application notifie les utilisateurs en temps réel lorsque de nouveaux créneaux deviennent disponibles.

## Architecture
- Frontend: Application web en JavaScript vanilla avec Socket.IO pour les notifications temps réel
- Backend: Serveur Node.js/Express avec Socket.IO
- Scraping: Utilisation de Puppeteer pour l'extraction des données

## Composants Principaux

### 1. Système de Scraping (SlotScraper)
- Utilise Puppeteer pour naviguer sur le site Doctoflex
- Automatise la sélection du type de rendez-vous
- Extrait les créneaux disponibles du calendrier
- Parse les dates et heures des créneaux

### 2. Gestion des Créneaux (SlotFilter)
- Filtre les créneaux par plage de dates
- Vérifie la validité des créneaux
- Compare les nouveaux créneaux avec les précédents

### 3. Système de Notification (SlotNotifier)
- Notifie en temps réel via Socket.IO
- Envoie les détails des nouveaux créneaux disponibles

### 4. Interface Utilisateur
- Affichage des créneaux disponibles
- Réception des notifications en temps réel
- Configuration des filtres de dates

## Fonctionnalités Clés
1. Surveillance automatique des créneaux
2. Filtrage par plage de dates
3. Notifications en temps réel
4. Interface utilisateur intuitive
5. Gestion des sessions WebSocket
