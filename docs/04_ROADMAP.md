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
    - [x] **Page Centrale des Pronostics (/pronos)** : Maintien et stabilisation de la page centrale `/pronos` accessible depuis la navigation, présentant la vitrine des pronostics publiés, filtres par ligue, cotes, taux de réussite et calcul de rentabilité.
    - [x] **Unification Navigation & Canaux (/channels & /box)** : Rapprochement de `/channels` (point d'entrée canonique) et `/box` (redirection fluide), partageant la même interface unifiée de Canaux & Débats avec le composant optimisé `ChannelListItem`.
    - [x] **Débats Intégrés** : Fusion de la page autonome "Débats" dans les Canaux sous forme de colonne latérale dynamique avec incrustations fluides, avatars circulaires et filtres par catégorie.
    - [x] **Contrôle d'Accès Créateur** : Seuls les propriétaires de canaux (ou les administrateurs) peuvent initier un débat officiel, sécurisé côté frontend et backend.
- [x] **Performance & Fiabilité Codebase** :
    - [x] **Découpage de Code & Chargement Différé (Code Splitting)** : Implémentation de `React.lazy()` et `Suspense` sur toutes les routes de l'application dans `App.tsx` générant des chunks légers et optimisés.
    - [x] **Sécurité des Types (TypeScript 0 Défaut)** : Résolution complète des 23 erreurs strictes du compilateur (`tsc --noEmit` avec code de retour 0).
    - [x] **Indexation Haute Performance MongoDB** : Ajout d'index simples et composés sur les collections `Prono`, `Channel`, `Transaction` et `User` pour accélérer le requêtage en production.
    - [x] **Migration Automatisée des Comptes** : Script de migration au démarrage du serveur garantissant `accountType: 'standard'` pour tous les utilisateurs existants.
    - [x] **Consolidation du Dashboard Admin** : Fusion de tous les panneaux d'administration (retraits, liste d'utilisateurs, chat de support, résumé financier) dans un tableau de bord centralisé unique avec vérifications strictes du compilateur TypeScript.
- [ ] **Déploiement VPS** :
    - [ ] Finaliser la configuration du VPS Contabo (Nginx, PM2, MongoDB).
    - [ ] Configurer SSL (Certbot).
    - [ ] Sécuriser et exclure le fichier `.env` du suivi du dépôt public avant le lancement final.

---

## 💰 Phase 5 : Paiements, Monétisation & Modèle Économique

- [ ] **Intégration des Passerelles de Paiement (Par Ordre de Priorité)** :
    - [ ] **Priorité 1 : FedaPay (Mobile Money & Cartes Bancaires - Afrique de l'Ouest)** :
        - Support direct des moyens de paiement régionaux : MTN Mobile Money, Moov Money, Orange Money, Wave et cartes bancaires (Visa / Mastercard).
        - Architecture API : Initialisation de transaction côté serveur (`POST /api/payments/fedapay/create`), redirection vers l'interface sécurisée FedaPay.
        - Webhook sécurisé (`POST /api/payments/fedapay/webhook`) : Vérification de la signature cryptographique, écoute des événements `transaction.approved`, et incrémentation atomique du portefeuille (`walletBalance`) avec journalisation `Transaction`.
        - Interface de gestion dans l'espace utilisateur pour le rechargement en devises locales (XOF / XAF / EUR).
    - [ ] **Priorité 2 : NowPayments.io (Crypto-monnaies & International)** :
        - Support des devises cryptographiques majeures : USDT (TRC20, Polygon, ERC20), BTC, ETH, LTC, SOL.
        - Architecture : Génération d'ordres de paiement via API NowPayments (`/v1/invoice`), affichage des QR codes et adresses de dépôt.
        - Webhook IPN (Instant Payment Notification) : Validation HMAC-SHA512, surveillance des confirmations de bloc et conversion en solde portefeuille PronosBox.
        - Gestion des expirations de session et réconciliations en cas de paiements partiels.
- [ ] **Accès Payant aux Contenus & Canaux VIP** :
    - [ ] **Canaux Premium / VIP** : Abonnement mensuel récurrent ou one-time débloquant l'accès au flux privé du Tipster (commission plateforme de 10-15%).
    - [ ] **Pronostics Exclusifs** : Déverrouillage à l'unité de pronostics à haute cote / analyses pointues.
    - [ ] **BET-EDUC Premium** : Vente d'E-books spécialisés, masterclasses vidéo et fiches méthodologiques.
- [ ] **Passerelle Wildcard → Tipster (Achat Unique)** :
    - [ ] Achat unique du "Pass Créateur" permettant à un utilisateur Wildcard de débloquer immédiatement la création de canaux et la publication de pronostics officiels.
    - [ ] **UI du bouton d'upgrade** : Composant dédié dans les paramètres utilisateur / profil Wildcard pour appeler `upgradeToTipster()` (logique backend déjà prête).
- [ ] **UX Google Re-Login (Edge Case)** :
    - [ ] Lors d'un login Google d'un utilisateur existant, si un `accountType` différent est sélectionné sur le formulaire d'inscription, afficher un message informatif expliquant que le rôle existant est conservé.
- [x] **Authentification Sociale** :
    - [x] Implémentation de la connexion via Google OAuth / Single Sign-On (SSO).

---

## 🎖️ Phase 6 : Système de Certification & Classement des Tipsters

- [ ] **Moteur d'Audit Automatisé de Certification** :
    - [ ] **Critères Stricts d'Éligibilité au Badge Certifié (★)** :
        - **Volume d'activité** : Minimum de 20 pronostics officiels publiés et validés au cours d'un mois calendaire.
        - **Rentabilité / Réussite** : Taux de réussite (Win-Rate) maintenu à au moins 50% sur l'ensemble des pronostics engagés.
        - **Vérification d'Identité & Engagement (KYC)** : Dès que les seuils statistiques sont atteints, déclenchement d'un formulaire de vérification d'identité pour certifier qu'il s'agit d'une personne physique réelle et engagée avec la communauté.
    - [ ] **Évaluation & Révocation Dynamique Continue** :
        - Script d'audit récurrent (Cron bi-hebdomadaire) calculant le taux de réussite sur fenêtre glissante de 30 jours.
        - Révocation automatique et immédiate du badge ★ si le win-rate chute en-dessous de 50%, avec notification explicative envoyée au Tipster.
    - [ ] **Valorisation Visuelle & UX** :
        - Badge officiel or ★ affiché sur les cartes de canaux (`ChannelListItem`), les en-têtes de canaux et les fiches de pronostics.
        - Priorisation de visibilité : 1. Canaux épinglés → 2. Canaux certifiés (Admins en tête, triés par win-rate décroissant) → 3. Canaux standards.

---

## 🎯 Phase 7 : Architecture & CRUD des Pronostics Premium

- [x] **Gating & Paywall API Robuste (Complété)** :
    - [x] Masquage côté serveur des informations sensibles VIP (`premiumExpectedResult`, `premiumOdds`, `premiumObservation`) dans `GET /api/pronos` et `GET /api/pronos/:matchId`.
    - [x] Remplacement systématique par des avertissements incitatifs (*"🔒 Réservé aux membres VIP"*) pour tout utilisateur non connecté ou n'ayant pas le statut Pro (`isPro: true` ou `accountType: 'pro'`).
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

