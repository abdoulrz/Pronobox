# CHANGELOG

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.24.0] - 2026-08-19 ([Unification Pronostics, Automatisation 12:00 UTC & Cartes Vivantes Canaux])

### Ajouté
- **Moteur Unifié des Pronostics & Canaux** :
  - Unification de la création de pronostics depuis les canaux (`CreatePronoModal.tsx`) et le panneau d'administration (`AdminDashboard.tsx`). Tout pronostic est désormais inséré par *Upsert* dans MongoDB (`Prono`) avec son ID officiel API-Sports.
  - Sélecteur de date dans le modal de création de pronostics des canaux permettant de rechercher les matchs du jour ou du futur via `/api/football/matches?date=YYYY-MM-DD`.
  - Documentation d'architecture complète créée dans [`docs/10_UNIFIED_PRONOSTICS_ENGINE.md`](./10_UNIFIED_PRONOSTICS_ENGINE.md) avec diagrammes Mermaid détaillant le cycle de vie, les règles de vérification et la feuille de route Premium.
- **Cartes de Pronostic Vivantes ("Alive") dans les Canaux** :
  - Les cartes de pronostic dans `MessageCard.tsx` s'actualisent en direct lors de la validation du résultat (`[⏳ EN ATTENTE]` -> `[✅ GAGNÉ]` / `[❌ PERDU]`).
  - Intégration d'un bloc visuel **Score Final** sur chaque carte de pronostic vérifié (ex: `Score Final : 2-3` - `Validé`).
  - Publication automatique d'un message récapitulatif officiel dans le fil du canal lors de la vérification.
  - Actualisation dynamique de l'aperçu du dernier message (`channel.lastMessage`) sur `/channels`.
- **Automatisation Quotidienne de la Vérification à 12:00 PM UTC** :
  - Mise en place d'un ordonnanceur calculant le délai exact jusqu'à 12:00:00 UTC chaque jour (`scheduleDailyVerificationAt12PMUTC()`) pour exécuter la vérification par lot des matchs terminés.
- **Synchronisation Rétroactive à la Lecture ("On-Read Sync")** :
  - Les routes `GET /api/channels`, `GET /api/channels/:id` et `GET /api/pronos` actualisent automatiquement les messages et aperçus existants en base en les comparant aux pronostics validés.

### Corrigé
- **Élimination Définitive des Faux Identifiants et Doublons** :
  - Suppression des identifiants hexadécimaux de message (`6A8223FE...`) dans le flux de pronostics grâce à une déduplication stricte insensible aux émojis, accents et espaces (`cleanStr`).
  - Barrière de déduplication côté client dans `Pronos.tsx` pour garantir l'unicité absolue de chaque carte affichée.
  - Nettoyage des pronostics mockés résiduels dans `Pronos.tsx`.
- **Tri Chronologique Strict** :
  - Tous les flux de pronostics (`/pronos` et tableau de bord) sont strictement ordonnés du match le plus récent au plus ancien (`matchDate` / `createdAt`).

## [2.23.0] - 2026-06-14 ([Google Auth, Performance, Caching & Real Stats])

### Ajouté
- **Connexion Google (Google Auth)** :
  - Intégration du composant officiel `<GoogleLogin>` de `@react-oauth/google` dans le formulaire de connexion.
  - Implémentation du endpoint `POST /api/auth/google` pour vérifier le jeton d'identité Google (`verifyIdToken`) et créer automatiquement les comptes utilisateurs (mode standard gratuit `isPro: false` avec nom d'utilisateur unique et mot de passe sécurisé aléatoire).
  - Gestion automatique de la mise à jour de la dernière connexion (`lastLogin`) et synchronisation de la photo de profil Google pour les utilisateurs existants.
- **Statistiques réelles de l'administrateur** :
  - Création de la route de back-end `/api/admin/stats` pour calculer de vraies métriques à partir des collections MongoDB (`User`, `Channel`, `Transaction`, `Prono`).
  - Connexion du tableau de bord d'administration frontend (`AdminDashboard.tsx`) pour afficher en temps réel le total d'utilisateurs actifs/Pro, le nombre de canaux, les revenus réels de la plateforme (VIP et abonnements), et le taux de réussite exact des pronostics d'experts.
- **Cache côté serveur pour l'API Football** :
  - Implémentation d'un système de mise en cache en mémoire (`matchesCache`) dans `server.js` pour stocker les matchs du jour pendant **5 minutes**, réduisant les temps de chargement de 2s à **0ms** et protégeant les quotas de l'API.
- **Tri et Importance des Matchs** :
  - Tri dynamique du flux principal de matchs selon l'importance des ligues (Coupe du Monde en premier, puis Euro, Ligue des Champions, Ligue Europa, Premier League, etc.).
  - Réorganisation ergonomique de la liste des "Meilleures ligues" dans la barre latérale gauche.
- **Géolocalisation et Matchs Nationaux** :
  - Implémentation d'un détecteur de pays (`getUserCountry()`) basé sur le fuseau horaire et les langues du navigateur.
  - Priorisation des matchs du pays de l'utilisateur directement sous les ligues majeures (ex: matchs français en premier pour un utilisateur en France).
- **Traductions des Équipes en Français** :
  - Intégration d'un dictionnaire de traduction `TEAM_TRANSLATIONS` côté serveur dans `server.js` pour traduire automatiquement les noms d'équipes de l'anglais vers le français (ex: "Germany" -> "Allemagne", "Ivory Coast" -> "Côte d'Ivoire") sur toutes les pages de l'application (Matchs, Classement, Détails).
- **Navigation vers les Débats** :
  - Ajout d'un bouton de redirection rapide `Débats 💬` à côté du titre "Actualités" de la page d'accueil pour rediriger l'utilisateur vers le forum de discussion.

### Corrigé
- **Sécurité et Prototype Pollution** :
  - Sécurisation du cache matches en initialisant `matchesCache` avec `Object.create(null)` pour éliminer les risques d'exploitation de prototype pollution.
- **Bugs Mobiles sur LeagueDetails** :
  - Alignement responsive de l'en-tête de ligue pour éviter les coupures sur petits écrans.
  - Correction du blocage du défilement horizontal sur mobile pour le tableau de classement (`min-w-[650px]`) et la liste des matchs (`min-w-[550px]`) en injectant des conteneurs d'overflow.
- **Compilation Strict TypeScript** :
  - Résolution de toutes les erreurs de type sur les fichiers modifiés (suppression de la propriété `locale` invalide sur GoogleLogin, retrait de l'état inutilisé `isLoadingStats` dans AdminDashboard, et nettoyage des imports morts).
- **Inversion des clés de Revenus** :
  - Correction de l'association inverse des champs `subscriptions` et `channelFees` dans la réponse API des statistiques d'administration.
- **Traduction Espagnole** :
  - Traduction des textes espagnols restants (`Ocultar toutes` / `Mostrar toutes`) en français (`Masquer tout` / `Afficher tout`) sur le flux de matchs.

## [2.22.0] - 2026-05-23 ([Polissage du design & Corrections d'édition de canaux])

### Ajouté
- **Horodatage des messages de canaux** :
  - Implémentation de séparateurs de dates dynamiques (Aujourd'hui, Hier, Date complète) dans `ChannelView.tsx` pour regrouper logiquement les messages par jour.
- **Rendu visuel de l'en-tête & extraction de logo** :
  - Remplacement du logo textuel de l'en-tête par un logo image stylisé, recadré et extrait par programme en un PNG transparent pour une intégration responsive parfaite.
  - Refonte du style de l'en-tête avec un dégradé vert émeraude adapté et un badge Admin en glassmorphisme.
- **Édition par le propriétaire du canal** :
  - Ajout de la possibilité pour les propriétaires de canaux de modifier directement le nom et la description du canal depuis le panneau d'information.

### Corrigé
- **Redirection des notifications** :
  - Correction de la logique de routage des notifications dans `NotificationCenter.tsx` pour diriger directement les utilisateurs vers des débats ou canaux spécifiques selon les données de la notification.
- **Bug d'écran noir** :
  - Correction d'une exception de pointeur nul dans `ChannelView.tsx` où les variables d'état étaient initialisées avant la fin du chargement des données du canal.
- **État d'incertitude du thème** :
  - Résolution d'un bug visuel où `bg-slate-100 dark:bg-brand-navy` sur les éléments de layout surchargeait les arrière-plans de `body` en migrant `Layout.tsx` vers des arrière-plans transparents.
- **Contraste de fond des messages** :
  - Amélioration de l'arrière-plan de `MessageCard.tsx` avec un effet de glassmorphisme subtil au lieu d'un vert prononcé pour réduire la fatigue visuelle et améliorer le contraste.
- **Sécurité de mutation d'état** :
  - Correction d'un bug critique de mutation d'état React lors de la mise à jour locale du nom et de la description d'un canal.

## [2.21.0] - 2026-05-23 ([Persistance des médias de canaux & Sécurité CRUD Admin])

### Ajouté
- **Persistance des médias de canaux** :
  - Mise à niveau de `MessageSchema` dans MongoDB pour prendre officiellement en charge `imageUrl`, `audioUrl`, `isImage` et `isVoiceMessage`.
  - Refactoring de l'enregistreur audio de `ChannelView.tsx` pour convertir les URL de Blob locaux en DataURL Base64 universels avant la transmission au backend.
  - Implémentation d'une journalisation en temps réel des charges utiles dans le backend pour les requêtes de messages POST afin de surveiller la taille des médias.

### Corrigé
- **Protection du CRUD du Dashboard Admin** :
  - Élimination du bug sévère d'ID indéfini dans `AdminDashboard.tsx` qui rejetait silencieusement les requêtes de suppression et dupliquait les canaux en PUT/POST.
  - Standardisation de toutes les références à `c._id` en vérifications doublement sécurisées `(c.id || c._id)` à la suite des récentes règles de transformation JSON.
- **Rendu de l'historique des messages frontend** :
  - Restauration de l'extraction des médias dans l'appel GET principal de `ChannelView.tsx`, garantissant que les images et les notes vocales survivent aux rechargements complets.

## [2.20.0] - 2026-05-18 ([Stabilité des débats, population sécurisée & visuels de la barre latérale])

### Ajouté
- **Avatars de débat circulaires dans la barre latérale** :
  - Intégration d'images circulaires à gauche de chaque débat dans la barre latérale des canaux, s'alignant parfaitement avec le design de la liste des canaux.
  - Implémentation d'une résolution automatique de la première image téléversée du débat avec une photo sportive de couverture provenant d'Unsplash en cas de repli.

### Corrigé
- **Synchronisation des états et des actions** :
  - Résolution de l'incompatibilité de payload serveur-client dans `Box.tsx` lors de l'ajout de commentaires, garantissant que l'état local gère les payloads contenant uniquement des messages en mode MongoDB réel sans effacer les tableaux de likes ou de likedBy du débat.
  - Correction des filtres d'auto-notification et du bug de notification avec le titre de débat `"undefined"`.
- **Protections contre les crashs de rendu des enfants populés** :
  - Sécurisation de l'analyse de `messages.user` et `messages.replies.user` dans `DebateDetailView.tsx` pour gérer à la fois les objets utilisateur populés (mode réel) et les chaînes brutes (mode repli), éliminant les plantages de rendu React.

## [2.19.0] - 2026-05-18 ([Intégration de la barre latérale des débats dans Canaux (Box), nettoyage des redondances & gardes de création stricts])

### Ajouté
- **Barre latérale de débats intégrée dans Canaux (Box)** :
  - Transformation de la mise en page de `Box.tsx` en une grille moderne, en ajoutant les débats du forum directement dans une colonne latérale sur bureau pour une meilleure interaction utilisateur.
  - Création d'une magnifique boîte modale de détails avec un flou d'arrière-plan fluide (`backdrop-blur-sm`) pour permettre de lire, liker et commenter les débats sans quitter la page.
- **Garde strict pour la création de débats** :
  - Implémentation de vérifications client et masquage du bouton de création de débat "+ Nouveau" pour les utilisateurs qui ne possèdent aucun canal (à l'exclusion des administrateurs généraux).
  - Sécurisation de l'API backend `/api/debates` via une vérification en base de données (`Channel.exists`) retournant un statut `403 Forbidden` pour les publications non autorisées.

### Modifié
- **Nettoyage des redondances & restructuration de la navigation** :
  - Suppression de la page de pronostics autonome redondante (`Predictions.tsx`) et de la page de débats séparée (`News.tsx`).
  - Ajustement du menu de navigation inférieur mobile de `grid-cols-6` à un affichage propre en `grid-cols-4` pour un alignement esthétique parfait.
  - Configuration de redirections de routes transparentes dans `App.tsx` redirigeant les requêtes `/predictions` et `/news` vers `/` et `/box` pour préserver le référencement (SEO).

## [2.18.0] - 2026-05-18 ([Contrôle administrateur centralisé & compilation sécurisée sans défaut])

### Ajouté
- **Hub d'administration intégré** :
  - Centralisation de tous les processus d'administration (utilisateurs, transactions, retraits, chat de support, bilan financier global) dans un tableau de bord unique entièrement responsive `AdminDashboard.tsx`.
  - Création d'une file d'attente de modération des utilisateurs robuste permettant la recherche, l'attribution des rôles et l'activation/désactivation directe des statuts.
  - Conception d'onglets dédiés pour la validation des retraits en attente et l'audit détaillé de l'historique des transactions.
  - Connexion de la file d'attente de support WebSocket pour les conversations en temps réel avec les utilisateurs standard et Pro.

### Modifié
- **Élimination des redondances** :
  - Suppression des panneaux d'administration parallèles dans les paramètres de l'utilisateur standard, migration vers le tableau de bord principal.
  - Réduction de l'empreinte de `SettingsAdminUser.tsx` de plus de 1 700 lignes redondantes, rationalisant l'expérience utilisateur vers les paramètres personnels et le résumé financier de haut niveau.

### Corrigé
- **Sécurité de compilation stricte** :
  - Refactoring de toutes les déclarations de type implicites (les fonctions de rappel `any`, les paramètres du réducteur) vers des structures strictes.
  - Suppression des variables locales inutilisées (`useRef`, hooks d'état, gestionnaires de simulation) dans `AdminDashboard.tsx` et les paramètres, réussissant ainsi à obtenir zéro avertissement de compilation et à passer la vérification complète du code (`npx tsc --noEmit`).

## [2.17.0] - 2026-05-17 ([Déverrouillage persistant du Premium & Sécurité défensive])

### Ajouté
- **Architecture de déverrouillage de ressources persistantes** :
  - Implémentation du tableau de base de données `unlockedResources` référençant directement les modèles `BetEduc` dans le schéma `User`.
  - Configuration de `POST /api/transactions` pour ajouter automatiquement l'identifiant `itemId` de la ressource au document de l'utilisateur après un paiement réussi.
  - Extension de `/api/auth/register` et `/api/auth/login` pour sérialiser et renvoyer la liste des ressources déverrouillées au client.
  - Liaison des mises à jour de session via le hook `updateUser` dans `AuthContext.tsx` pour garantir les mises à jour des accès en temps réel.
  - Création d'une logique de validation des verrous en temps réel dans `BetEduc.tsx` contournant les invitations modales pour les administrateurs, les Pros et les détenteurs de la ressource persistante.
- **Sécurité défensive du lecteur & protection contre les plantages** :
  - Intégration de vérifications complètes (`content || ''`) sur tous les widgets intégrés (iframe YouTube, intégration PDF, vidéo et audio), protégeant complètement l'interface client de toute rupture si des contenus vides/non configurés sont chargés.

### Modifié
- **Logique de déduction du portefeuille** :
  - Modification du processus de transaction backend pour ne déduire les montants d'achat du solde du portefeuille que lorsque le mode de paiement est explicitement `'wallet'`, en ignorant les déductions pour les paiements externes par carte, mobile ou crypto.

## [2.16.0] - 2026-05-17 ([Lecteur de contenu universel, intégration des commentaires & téléversements asynchrones instantanés])

### Ajouté
- **Lecteur de contenu Premium intégré & lecteur média dynamique** :
  - Analyse automatique des liens vidéo YouTube standard pour les intégrer dans un conteneur sandbox iframe.
  - Ajout de balises `<video>` et `<audio>` chargant dynamiquement les formats de médias locaux en interne.
  - Configuration de la balise native `<embed>` pour le rendu des PDF en ligne pour les e-books.
  - Remplacement de la redirection d'action immédiate par un panneau visuel unifié contenant tous les liens, fichiers et ressources.
  - Implémentation d'options de repli dynamique "Visiter le site externe" et de téléchargement volontaire des ressources.
- **Forum de discussion interactif et système de commentaires** :
  - Création d'un panneau de discussion entièrement responsive au bas de chaque ressource éducative.
  - Liaison de l'interface des commentaires directement avec le schéma des sous-documents Mongoose, prenant en charge le nom d'utilisateur, le chargement d'avatars dynamiques, les horodatages formatés et le suivi d'état réactif.
  - Intégration de la route API des commentaires nécessitant une validation standard des jetons.
- **Pipeline de téléversement local asynchrone à haute vitesse** :
  - Refactoring du gestionnaire de backend `/api/upload` pour écrire les fichiers de manière asynchrone avec `fs.promises.writeFile`, garantissant l'absence de blocage de la boucle d'événements et une efficacité extrême des transferts de fichiers.
  - Modification du gestionnaire `FileReader.onload` dans le tableau de bord administratif pour isoler les rejets de réseau et de taille de charge utile dans des blocs try-catch imbriqués robustes, résolvant les gels de l'interface utilisateur.

### Modifié
- **Ergonomie des étiquettes de navigation** :
  - Raccourcissement du libellé de navigation inférieur de `BET-EDUC` à `EDUC` pour une compatibilité parfaite sur une seule ligne sur les écrans mobiles de toutes tailles.
- **Mises à jour de la feuille de route et du manuel d'administration** :
  - Mise à jour complète des guides stratégiques et de la feuille de route des jalons pour marquer BET-EDUC comme terminé et structurer les fonctionnalités avancées à venir.

---

## [2.15.0] - 2026-05-16 ([Modernisation de BET-EDUC & Efficacité administrative])

### Ajouté
- **Refonte de la gestion de BET-EDUC** :
  - Implémentation d'une correspondance automatique des icônes (📖, 🎬, 📝, 🎓) selon le type de contenu.
  - Ajout d'une barre de recherche/filtrage administratif en temps réel et rapide.
  - Développement d'une icône d'œil de "Prévisualisation rapide" pour vérifier le contenu (Markdown/URL) sans quitter le tableau de bord.
  - Standardisation du formulaire de saisie des données avec des sélections déroulantes et des cartes en glassmorphisme soignées.
- **Refonte du portail éducatif (Public)** :
  - Passage à une mise en page en grille responsive à 2 colonnes pour une meilleure densité de contenu.
  - Intégration du design de l'en-tête premium en glassmorphisme avec la typographie de la sous-marque.
  - Amélioration de l'expérience de lecture Markdown avec des largeurs de texte et une typographie optimisées.
  - Amélioration des badges de format pour une distinction plus claire entre les E-books, les vidéos et les articles.

### Modifié
- **Mise à jour du guide d'administration** : Documentation du nouveau flux de travail professionnel de BET-EDUC et des outils d'efficacité.
- **Cohérence de l'UI** : Application des jetons de conception Bleu Marine/Vert/Glassmorphisme de la plateforme à tous les composants éducatifs.

---

## [2.14.0] - 2026-05-16 ([UI des matchs du jour & Modernisation des diffuseurs])

### Ajouté
- **Info-bulle des diffuseurs Premium** :
  - Intégration des logos officiels des marques beIN SPORTS, DAZN et Canal+.
  - Implémentation d'une stratégie de chargement multi-couches robuste (Favicon Google CDN + repli d'avatars de l'interface utilisateur).
  - Ajout de liens cliquables directs vers les portails de chaque diffuseur.
- **Refonte des perspectives des matchs** :
  - Refonte de la section "Perspectives du match" avec du glassmorphisme, des motifs en arrière-plan et une typographie améliorée.
  - Obtention d'une parité visuelle 1:1 entre l'aperçu de l'éditeur d'administration et la page de détails publique.
- **Chronomètre en direct avancé** :
  - Refactoring du minuteur `MatchDetails` pour se caler sur les minutes écoulées fournies par l'API (prenant en compte la mi-temps).
  - Ajout d'un indicateur de direct vert clignotant et d'un formatage du temps de type FotMob `MM:SS`.

### Corrigé
- **Logique d'exclusion mutuelle Markdown** : Application d'une règle dans l'éditeur pour éviter les préfixes de ligne conflictuels (Citation vs Liste à puces).
- **Ressources défectueuses** : Résolution des problèmes de blocage du CDN en passant au service d'icônes fiable de Google.

---

## [2.13.0] - 2026-05-15 ([Détails des matchs & Moteur de pronostics])

### Ajouté
- **`MatchDetails.tsx`** : Redessiné avec un compte à rebours en temps réel, des informations sur l'arbitre et une barre dynamique "Programme TV".
- **`MatchPronostics.tsx`** : Implémentation d'une logique "Freemium" permettant à tous les utilisateurs de voir les pronostics de base tout en restreignant l'accès à l'analyse de l'IA pour les membres Pro.
- **Moteur de pronostics d'administration** : Ajout d'une interface CRUD dédiée dans le tableau de bord d'administration pour gérer directement les prédictions.
- **Persistance des données** : Création du modèle Mongoose `Prono` et des points de terminaison `/api/pronos`.

---

## [2.12.0] - 2026-05-14 ([Stabilisation des données de ligue & de match])

### Ajouté
- **Barre latérale de type FotMob** :
  - Ajout des "Meilleures ligues" codées en dur avec la liste exacte de FotMob et la localisation en français.
  - Réorganisation de "Toutes les ligues" avec un groupe "International" et des groupes de pays triés par ordre alphabétique.
  - Implémentation d'en-têtes de pays repliables dans la barre latérale pour une meilleure ergonomie.
- **Intelligence sur les détails des ligues** :
  - Implémentation du filtrage et du tri côté client pour les rencontres (10 passées / 10 à venir).
  - Ajout d'une limitation intelligente de la saison à 2024 pour se conformer aux restrictions de l'offre gratuite d'API-Football.

### Corrigé
- **Intégrité des données** :
  - Résolution des collisions de navigation dans la barre latérale en passant d'un mappage basé sur le nom à un mappage basé sur un identifiant unique (ID).
  - Résolution de l'absence de matchs dans le flux de matchs en supprimant les paramètres restreints de l'API (`next`) dans `server.js`.

---

## [2.11.0] - 2026-05-08 ([Fin de la Phase 2 : Refactoring & Glassmorphisme])

### Ajouté
- **Glassmorphisme global** : Implémentation d'une esthétique globale de verre dépoli à travers l'application.
  - Extraction de la classe `.glass-modal` appliquée à toutes les fenêtres modales de l'application.
  - Amélioration de l'opacité et des niveaux de flou de `.glass-sidebar`, `.glass-bottom-nav` et `.glass-panel`.
  - Conversion des styles en ligne de `MatchCard` et `DebateCard` en composants de conception centralisés `.card`.
- **Fonctionnalités sociales** :
  - Intégration de `emoji-picker-react` dans `DebateDetailView.tsx` pour permettre aux utilisateurs d'ajouter des emojis aux commentaires de débats.

### Modifié
- **Refactoring du code** :
  - Décomposition de la page monolithique `News.tsx` en extrayant la logique de mappage de la grille et les index carrousels d'images actifs dans un nouveau composant `NewsGrid.tsx`.

---

## [2.10.0] - 2026-05-03 ([Persistance des paramètres & Typage fort])

### À implémenter
- Phase 3 : Monétisation & Fonctionnalités Pro (intégration NowPayments/FedaPay)
- Phase 4 : Tableau de bord admin & Stabilité
- PWA & Notifications Push

---

## [2.9.0] - 2026-05-02 ([Architecture de chat modulaire & Logique de permissions])

### Ajouté
- **Types de chat centralisés** : Création de `src/types/chat.ts` regroupant `Message`, `Channel` et `UserFeatures` pour une cohérence entre les composants.
- **Hook de logique métier** : Implémentation de `useUserFeatures.ts` pour découpler la gestion des permissions (Utilisateur/Pro/Admin) des composants de l'interface utilisateur.

### Modifié
- **Décomposition des pages monolithiques** :
  - **`Box.tsx`** : Réduction de ~1500 à ~200 lignes. Extraction de `ChannelListItem`, `ChannelTabs`, `CreateChannelModal` et `SubscribeChannelModal`.
  - **`ChannelView.tsx`** : Réduction de ~1300 à ~180 lignes. Extraction de `ChannelHeader`, `MessageCard` et `MessageInput`.
- **Durcissement Zéro Défaut** :
  - Élimination des derniers styles en ligne dans `AdminDashboard.tsx` en utilisant des valeurs arbitraires Tailwind (`w-[78%]`).
  - Résolution de tous les avertissements TypeScript restants et des occurrences de types implicites `any` dans les modules de chat.

### Corrigé
- **Accessibilité** : Ajout d'attributs `title` et `aria-label` à tous les éléments interactifs dans les nouveaux composants modulaires.
- **Performance** : Optimisation du rendu en isolant les éléments de la liste de messages et les états de saisie.

---

## [2.8.0] - 2026-05-01 ([Modularisation architecturale & Nettoyage])

### Ajouté
- **Système de hooks modulaires** :
  - Extraction de `useWebSocket` vers `src/hooks/useWebSocket.ts`.
  - Extraction de `usePayment` vers `src/hooks/usePayment.ts`.
  - Création de types centralisés dans `src/types/payment.ts`.

### Modifié
- **Stabilisation architecturale** :
  - **Correction du "Fast Refresh"** : Séparation des hooks et des types des fichiers Context/Service pour résoudre les avertissements du serveur de développement.
  - **Refactoring des services** : Transformation de `WebSocketService` en un service singleton pur (déplacé vers un fichier `.ts`).
- **Nettoyage de la base de code** :
  - Suppression systématique des variables inutilisées, du code commenté et des importations redondantes dans `App.tsx`, `BetEduc.tsx`, `Predictions.tsx`, `SubscriptionModal.tsx`, `AdminDashboard.tsx` et `ThemeContext.tsx`.

### Corrigé
- **Sécurité des types** :
  - Résolution des erreurs complexes de contravariance générique dans la gestion des écouteurs de `WebSocketService`.
  - Suppression de `any` explicite dans l'aide aux abonnements `useWebSocket`.
- **Logique des composants** :
  - Refactoring de `BetEduc.tsx` pour utiliser le flux unifié `UnifiedPaymentModal` au lieu des appels directs aux services hérités.
- **Accessibilité** :
  - Balayage final des étiquettes de formulaires et des attributs aria-label dans `SettingsAdminUser.tsx` et `BetEduc.tsx`.

---

## [2.7.0] - 2026-05-01 ([Stabilisation Zéro Défaut & Sécurité des types])

### Ajouté
- **Typage centralisé (Core)** :
  - Création de `src/types/channel.ts` pour centraliser les interfaces `Channel`, `ChannelData` et `ChannelDetails`.
  - Intégration de `NavigateFunction` dans les contextes pour un routage typé.
- **Composants communs** :
  - `DynamicWidthBar` : Nouveau composant utilitaire pour injecter les largeurs de barres de progression via `useRef`, garantissant la conformité avec les règles strictes de non-utilisation de styles en ligne.

### Modifié
- **Refonte de la stabilisation des paramètres (Pro, Admin, Simple)** :
  - **Styles Zéro Défaut** : Suppression intégrale des styles en ligne (`style={{...}}`) dans les trois modules de paramètres.
  - **Utilitaire de barre de progression** : Implémentation d'une classe `.progress-bar-fill` dans `index.css` utilisant des variables CSS (`--progress-width`).
- **Refactoring du service WebSocket** :
  - Migration du fichier `.tsx` vers `.ts` pour résoudre les avertissements de "Fast Refresh".
  - Typage strict : Remplacement de tous les types `any` par `unknown` et utilisation d'unions de types strictes pour les événements.
- **Nettoyage d' `App.tsx`** :
  - Suppression des types `any` dans le `ChannelDataContext`.
  - Ajout de types de props (`ReactNode`) aux composants `AuthChecker` et `ChannelDataProvider`.

### Corrigé
- **Accessibilité (A11y)** : Ajout systématique d'attributs `title` sur tous les boutons interactifs (modales, rechargement, retrait) dans les paramètres.
- **Conformité TypeScript** : Résolution des erreurs de transtypage sur les Map de rappels WebSocket via des casts `unknown` sécurisés.

---

## [1.0.0] - 2026-01-20
### Ajouté
- **Version initiale** : Lancement du MVP PronosBox.
- **Fonctionnalités de base** : Authentification, Matchs, Box (flux), Pronostics, Canaux et fondations du portefeuille.
