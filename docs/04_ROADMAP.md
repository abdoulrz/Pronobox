# Feuille de Route pour la Finalisation de PronosBox

Ce document décrit les étapes nécessaires pour faire passer PronosBox de son état actuel à une plateforme professionnelle prête pour la production.

> [!TIP]
> **🚀 Référence de Déploiement Rapide**
> Chaque fois que vous apportez des modifications locales et les poussez sur GitHub, connectez-vous à votre VPS (`ssh root@213.199.50.202`) et exécutez :
> `/var/www/pronosbox/deploy.sh`
> Cela reconstruit automatiquement le frontend et redémarre le backend !

---

## ✅ Phase 1 : Fondations Core (Complétée)

- [x] **Configuration de la Stack Technique** : Architecture Node/React/MongoDB.
- [x] **Système d'Authentification** : Connexion/Inscription basées sur JWT.
- [x] **Interface de Base** : Matchs, Box, Pronostics et Canaux.
- [x] **Fondation du Portefeuille** : Modèle de transaction et logique du statut Pro.
- [x] **Données de Test (Mock)** : Contenu pré-rempli pour les tests et démonstrations.

---

## ✅ Phase 2 : Excellence UX/UI & Fonctionnalités (Complétée)

*Objectif : Rendre le site web premium et parfaitement fonctionnel.*

- [x] **Refactoring des Composants** :
    - [x] Découpage des monolithes en sous-composants maintenables (Box, Actualités, Canaux).
- [x] **Refonte Visuelle (Design System)** :
    - [x] Implémentation du **Glassmorphisme** pour la barre latérale et le menu supérieur.
    - [x] Standardisation de la propriété `border-radius` (12px) et des ombres (`shadows`).
    - [x] Mise à jour de la palette de couleurs (Bleu Marine Profond + Vert Vibrant).
- [x] **Stabilisation Zéro Défaut** :
    - [x] Audit complet de l'accessibilité et suppression des styles en ligne (inline).
    - [x] Mises à jour asynchrones du profil avec persistance en base de données.
- [x] **Rationalisation de l'UI** : Suppression de la section Thème redondante.
- [x] **Sécurité des Types (Type Safety)** : Audit complet de `AuthContext` et des composants de paramètres.
- [x] **Améliorations Sociales** :
    - [x] Indicateurs de statut en ligne.
    - [x] Mises à jour des messages privés en temps réel via WebSocket.
    - [x] Sélecteurs d'emojis.
- [x] **Optimisation Mobile** :
    - [x] Amélioration de la barre de navigation inférieure pour une meilleure ergonomie.
    - [x] Amélioration du défilement horizontal pour les listes de matchs.

---

## ✅ Phase 3 : Tests Bêta & Pronostics (Complétée)

- [x] **Intégrations d'API** :
    - [x] **Données Sportives (API-Football)** :
        - [x] Implémentation du proxy de calendrier dans `server.js` conforme à l'offre gratuite.
        - [x] **Tests Bêta** : Stabilisation des solutions de secours pour les tournois de coupe et les données anciennes.
        - [x] Réplication de la navigation latérale et de la catégorisation de FotMob.
    - [x] **Intégration du Flux d'Actualités** :
        - [x] Intégration en temps réel des flux RSS de sports.fr (Complété).
- [x] **Pronostics** :
    - [x] **Version Gratuite** : Connexion à l'API de données sportives réelles pour les prédictions de base. Implémentation d'une section CRUD dans le Dashboard Admin pour gérer les pronostics gratuits.
    - [x] **Version Premium** : Analyse approfondie combinée à l'avis d'une IA. Création d'une section CRUD dédiée dans le Dashboard Admin.
    - [x] **UX & Rendu** : Modernisation de l'interface des perspectives de match et standardisation du rendu markdown pour une parité 1:1 avec l'éditeur.

---

## 🛠️ Phase 4 : Administration & Stabilité (Focus Actuel)

- [x] **Dashboard Admin** :
    - [x] Gestion des utilisateurs (Bannissement / Statut Pro / Promotion).
    - [x] File d'attente de validation des transactions & approbations manuelles des retraits.
    - [x] Outils de modération des canaux.
    - [x] **Gestion des Pronostics** : Interfaces CRUD pour les pronostics gratuits et premium.
    - [x] **Gestion de BET-EDUC** : Interfaces CRUD pour les contenus éducatifs gratuits et premium (E-books, Vidéos, Articles) avec téléversements internes asynchrones.
    - [x] **Intégration d'un Lecteur Média Universel** : Lecture de vidéos, d'audios et de PDF directement en ligne avec commentaires des utilisateurs.
    - [x] **Déverrouillage Premium Persistant** : Enregistrement permanent des ressources achetées/déverrouillées directement dans le schéma Utilisateur MongoDB et la session du contexte React pour garantir un accès à vie.
    - [x] **Modération des Canaux & Médias** : Gestion complète en CRUD des canaux (mappage robuste des ID) et persistance résiliente des médias (images et notes vocales) convertis de Blob en Base64.
- [x] **Refactoring Structurel & Nettoyage** :
    - [x] Suppression de la page autonome de pronostics ("Pronos") car les analyses de matchs sont désormais intégrées directement.
    - [x] Fusion de la page autonome "Débats" dans "Canaux" (/box) sous forme de colonne latérale dynamique avec incrustations fluides et filtres par catégorie.
    - [x] Application de la règle d'autorisation stricte : seuls les propriétaires de canaux (ou les admins) peuvent créer un débat, sécurisée côté frontend et backend (MongoDB).
    - [x] **Stabilité & Visuel des Débats** : Résolution de tous les bugs de divergence de données serveur-client (disparition des likes/commentaires, filtres d'auto-notification et crashs de rendu Mongoose) et intégration de jolis avatars circulaires pour les débats.
- [ ] **Performance** :
    - [ ] Implémentation du lazy loading des images.
    - [ ] Optimisation des requêtes MongoDB pour le flux de la "Box" (Pagination).
    - [x] **Consolidation du Dashboard Admin** : Fusion de tous les panneaux d'administration (retraits, liste d'utilisateurs, chat de support, résumé financier) dans un tableau de bord centralisé unique avec vérifications strictes du compilateur TypeScript.
- [ ] **Déploiement** :
    - [ ] Finaliser la configuration du VPS Contabo (Nginx, PM2, MongoDB).
    - [ ] Configurer SSL (Certbot).
    - [ ] Sécuriser et exclure le fichier `.env` du suivi du dépôt public avant le lancement final.

---

## 💰 Phase 5 : Paiements & Monétisation

- [ ] **Intégration des Paiements** :
    - [ ] Connecter **FedaPay** / **NowPayments.io** au système de portefeuille.
    - [ ] Finaliser le flux "Acheter Pro" avec gestion des états de succès/erreur et mise à jour automatique du statut.
    - [ ] Implémenter la logique de commission pour les utilisateurs Pro (frais de plateforme de 10%).
- [x] **Authentification Sociale** :
    - [x] Implémentation de la connexion via Google OAuth / Single Sign-On (SSO).

---

## ✅ Phase 6 : Moteur Unifié des Pronostics & Automatisation 12:00 UTC (Complétée)

- [x] **Unification Complète des Données (Canaux ↔ Pronostics ↔ Administration)** :
    - [x] Modèle canonique unique basé sur un *Upsert* intelligent dans MongoDB (`Prono`).
    - [x] Élimination définitive des faux identifiants de message (`6A8223FE...`) et des doublons d'affichage grâce à la normalisation insensible aux émojis/espaces (`cleanStr`).
    - [x] Double barrière de déduplication (Serveur + Navigateur `Pronos.tsx`).
    - [x] Tri chronologique strict du plus récent au plus ancien (`matchDate` / `createdAt`).
- [x] **Recherche Assistée des Matchs par Date** :
    - [x] Sélecteur de date interactif (`<input type="date">`) dans `CreatePronoModal.tsx` et `AdminDashboard.tsx` pour charger les matchs du jour ou futurs via `/api/football/matches?date=YYYY-MM-DD`.
- [x] **Vérification Automatique Quotidienne à 12:00 PM UTC** :
    - [x] Ordonnanceur quotidien précis (`scheduleDailyVerificationAt12PMUTC()`) vérifiant automatiquement les matchs terminés.
    - [x] Algorithme d'évaluation (`determinePronoResult`) gérant 1X2, Double Chance (1X, 2X, 12), V1/V2, Nul, Plus/Moins de buts (+X.5, -X.5), BTTS et Scores exacts.
    - [x] Détection du délai de sécurité (2h30) et bascule en revue manuelle si l'intitulé est complexe.
- [x] **Cartes Vivantes ("Alive") & Synchronisation Rétroactive des Canaux** :
    - [x] Mise à jour en direct des cartes de messages (`MessageCard.tsx`) avec badges verts/rouges et bloc **Score Final** (`Score Final: 2-3` - `Validé`).
    - [x] Actualisation automatique de l'aperçu du canal (`channel.lastMessage`) sur `/channels`.
    - [x] Publication automatique d'un message d'annonce officiel récapitulant le résultat dans le canal.
    - [x] Synchronisation On-Read sur `GET /api/channels`, `GET /api/channels/:id` et `GET /api/pronos`.
- [x] **Documentation d'Architecture Dédiée** :
    - [x] Rédaction de [`docs/10_UNIFIED_PRONOSTICS_ENGINE.md`](./10_UNIFIED_PRONOSTICS_ENGINE.md) avec diagrammes Mermaid.

---

## 🎯 Phase 7 : Architecture & Roadmap pour le CRUD des Pronostics Premium (Futur)

- [ ] **Gating & Paywall API Robuste** :
    - [ ] Masquage conditionnel des champs `premiumExpectedResult`, `premiumOdds` et `premiumObservation` dans `GET /api/pronos` pour les utilisateurs sans abonnement Pro (`user.isPro !== true`).
    - [ ] Retour de messages incitatifs au passage Pro (*"🔒 Réservé aux membres VIP"*).
- [ ] **Gestion Multi-Tipsters & Canaux Privés Payants** :
    - [ ] Publication de pronostics Premium par les créateurs de canaux Pro avec définition de cotes (`premiumOdds`) et d'indices de confiance.
    - [ ] Liaison automatique avec le prix d'abonnement au canal (`subscriptionPrice`).
- [ ] **Calcul Automatisé du ROI & Taux de Réussite (Win-Rate)** :
    - [ ] Calcul automatique du ROI (%) et du bénéfice net en unités basé sur les cotes enregistrées.
    - [ ] Affichage de graphiques de performance historique sur les profils de tipsters et les canaux.
- [ ] **Notifications VIP Instantanées** :
    - [ ] Envoi d'alertes push / in-app aux abonnés lors de la publication d'un nouveau pronostic Premium ou de la validation d'un gain.

---

## 🃏 Idées Futures
- **Compétitions de Pronostics** : Classements hebdomadaires pour les meilleurs pronostiqueurs.
- **Notifications Push Générales** : Pour les buts de matchs et les alertes de canaux.
- **PWA** : Rendre PronosBox installable sur mobile.
