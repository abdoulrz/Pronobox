# Guide de Gestion Administrateur - Pronobox

Ce guide détaille les principes stratégiques et opérationnels pour administrer avec succès la plateforme Pronobox. L'objectif est de maintenir un écosystème sain, engagé et monétisable.

## 1. La "Formule de Création" des Pronostics
La structure choisie pour les pronostics répond à un tunnel de conversion stratégique :

*   **Le Choix Gratuit (1X2 + Cotes) :** C'est "l'appât". Il donne une valeur immédiate et gratuite, créant un lien de confiance avec l'utilisateur dès sa première visite.
*   **Les Perspectives (Ex-Infos Clés) :** Ce sont les arguments factuels (absences, série de victoires, historique H2H). Ils prouvent que le pronostic n'est pas dû au hasard mais à une analyse rigoureuse, renforçant l'autorité de la plateforme.
*   **L'Analyse Premium :** C'est le produit central. Réservée aux membres Pro, elle détaille les aspects tactiques, les compositions probables et les "insider tips". C'est l'élément principal qui justifie le passage à l'abonnement payant.
*   **L'Avis de l'IA :** Une touche moderne qui agit comme une "contre-expertise" objective. Elle sert à rassurer l'utilisateur final et ajoute une dimension technologique unique à Pronobox.

## 2. Gestion des Utilisateurs et Modération
Le succès d'un réseau social de pronostics repose sur la qualité de sa communauté.

*   **Surveillance des Rôles :** Distinguez bien les utilisateurs **Standard** des membres **Pro**. Les membres Pro doivent bénéficier d'un support prioritaire et d'une visibilité accrue sur leurs propres pronostics s'ils gèrent des canaux.
*   **Modération Active :** Le bannissement doit être utilisé pour les comportements toxiques ou le spam publicitaire non autorisé. Un utilisateur banni perd instantanément l'accès aux fonctionnalités sociales mais garde (si Pro) son accès aux analyses jusqu'à expiration, pour éviter les litiges de paiement.
*   **Statut "Actif" vs "Banni" :** Utilisez le tableau de bord pour basculer rapidement le statut. Un débannissement est possible après examen.

## 3. Stratégie des Canaux
Les canaux sont le moteur de l'engagement.

*   **Canaux Officiels (Admin) :** Ils doivent servir de référence en termes de taux de réussite. Publiez-y les pronostics les plus sûrs ("Safe bets").
*   **Canaux Communautaires :** Encouragez les meilleurs parieurs à créer leurs canaux. Plus ils ont d'abonnés, plus la plateforme gagne en visibilité. En tant qu'admin, surveillez les canaux qui montent trop vite pour vérifier la véracité de leurs stats.

## 4. BET-EDUC : Rétention et Éducation
La section BET-EDUC n'est pas qu'une bibliothèque, c'est un outil de rétention.

*   **Valeur Éducative :** Un parieur éduqué est un parieur qui reste sur la plateforme. Utilisez cette section pour publier des guides sur la gestion de bankroll, l'explication des types de paris (Asian Handicap, etc.).
*   **Mix de Contenu :** Offrez des E-books gratuits pour attirer les nouveaux et du contenu vidéo exclusif pour les membres Pro.

## 5. L'Avis de l'IA (Intelligence Artificielle)
L'IA dans Pronobox n'est pas là pour remplacer l'humain, mais pour le compléter.

*   **Rédaction :** Lors de la création d'un prono, l'avis de l'IA doit être synthétique. Il doit souligner des tendances statistiques que l'œil humain pourrait rater (ex: "Équipe X encaisse 80% de ses buts sur coups de pied arrêtés").
*   **Confiance :** Toujours inclure un indice de confiance (ex: 78%) pour donner une échelle de valeur à l'utilisateur.

## 6. Flux de Monétisation
Pronobox utilise un modèle hybride :

1.  **Abonnement Pro :** Accès illimité aux analyses premium et à l'avis de l'IA.
2.  **Vente de Ressources (BET-EDUC) :** Possibilité de vendre des formations spécifiques.
3.  **Frais de Canal (Futur) :** Commission sur les abonnements aux canaux privés des utilisateurs.

## 7. Guide Technique : Gestion des Contenus
L'administration s'effectue via les onglets dédiés du tableau de bord.

### Création d'un Pronostic
1. **Identification du Match** : Utilisez l'ID de l'API Football (visible dans l'URL ou via la recherche intégrée).
2. **Configuration du Prono Gratuit** :
   - Sélectionnez l'équipe (1, X, ou 2).
   - Saisissez les cotes actuelles pour donner un repère à l'utilisateur.
3. **Rédaction des Perspectives** : Listez les faits marquants (absences, stats récentes). 
   - Chaque ligne apparaîtra comme une puce (bullet point) côté public si vous utilisez le format liste.
   - **Règle d'Exclusivité** : Une ligne ne peut pas être à la fois une citation (`> `) et une puce (`- `). L'éditeur appliquera automatiquement le dernier style choisi pour garantir une lisibilité optimale.
4. **Analyse Premium & IA** :
   - L'analyse doit être détaillée pour justifier l'abonnement.
   - L'avis de l'IA doit rester concis et axé sur les probabilités.
   - **Broadcasters (TV)** : La barre TV affiche automatiquement les logos officiels cliquables (beIN, DAZN, Canal+). Assurez-vous que les informations de match sont à jour pour aider les utilisateurs à trouver où regarder la rencontre.

### Vérification Automatique des Pronostics
Pronobox intègre un système de vérification automatique basé sur l'API Sports. Il détecte la fin des matchs et met à jour les statuts (Gagné/Perdu) des cartes gratuites et premium, tout en synchronisant les canaux en direct.

**Fonctionnement & Synchronisation Complète :**
1. **Exécution Quotidienne Automatisée (12:00 PM UTC) :** Le serveur planifie et exécute automatiquement une passe de vérification chaque jour à 12:00:00 UTC. Tous les matchs terminés sont actualisés sans intervention humaine.
2. **Délai de Sécurité (Vérification par lot) :** Le bouton "Vérifier Tout" applique automatiquement un délai de sécurité de **2h30** après l'heure de début programmée du match pour éviter les requêtes inutiles. Les matchs plus récents restent en "Attente".
   - *Astuce :* Pour **forcer la vérification** d'un match avant ce délai, utilisez le bouton de **Vérification Individuelle** (icône de rafraîchissement sur la ligne du match).
3. **Synchronisation en Direct des Canaux ("Alive") :** Dès qu'un statut est validé (Gagné/Perdu), les cartes dans les canaux s'actualisent instantanément avec le score final, l'aperçu du canal est mis à jour, et un message d'annonce officiel est publié dans le canal.
4. **Format des Choix (Standardisé) :**
   - *Double Chance* : `1X`, `2X`, `X2`, `12`.
   - *Issues Simples* : `1`, `2`, `X`, `V1`, `V2`, `Match nul`.
   - *Plus/Moins de buts* : `+2,5 buts`, `-1.5 buts`.
   - *BTTS* : `btts` ou `les deux équipes marquent`.
   - *Scores exacts* : `0-2`, `2-1`, `3-0`.
5. **Revue Manuelle :** Si un libellé non standard est rencontré, le score réel est enregistré et le pronostic passe en attente de validation manuelle via le menu déroulant du tableau de bord.
6. **Documentation Complète :** Pour une vue détaillée des diagrammes et des règles, consultez [`docs/10_UNIFIED_PRONOSTICS_ENGINE.md`](./10_UNIFIED_PRONOSTICS_ENGINE.md).

### Gestion BET-EDUC
La section BET-EDUC permet d'éduquer et de fidéliser vos utilisateurs via des ressources variées.

1.  **Typologie de Contenu** : L'interface mappe automatiquement des icônes selon le type saisi :
    *   📖 **E-book / Livre** : Pour les guides PDF et manuels.
    *   🎬 **Vidéo / Film** : Pour les tutoriels et analyses vidéo.
    *   📝 **Article / Texte** : Pour les analyses de fond via l'éditeur Markdown.
    *   🎓 **Formation / Cours** : Pour les parcours éducatifs structurés.

2.  **Délivrabilité** :
    *   **Lien externe** : Redirige vers un blog, une vidéo YouTube ou une plateforme tierce.
    *   **Fichier** : Lance le téléchargement direct (fournir une URL directe vers le fichier).
    *   **Analyse détaillée** : Ouvre une vue de lecture immersive sur Pronobox. Idéal pour garder l'utilisateur sur la plateforme.

3.  **Outils d'Efficacité Admin** :
    *   **Recherche en temps réel** : Utilisez la barre de recherche pour filtrer instantanément par titre ou type.
    *   **Aperçu Rapide (Icône Oeil)** : Permet de visualiser le rendu final (Markdown ou URL) sans quitter le tableau de bord ni entrer en mode édition.
    *   **Badges de Statut** : Identifiez d'un coup d'œil les ressources **GRATUITES** vs **PRO** (Premium).

4.  **Déblocage Persistant & Modèle Économique** :
    *   **Achat Unique (Pay-per-Content)** : Lorsqu'un utilisateur débloque une ressource Premium (par carte, paiement mobile CinetPay, crypto NowPayments ou solde de portefeuille), celle-ci est **définitivement liée à son compte**.
    *   **Accès à Vie** : La ressource reste accessible à vie pour cet utilisateur (statut `🔓 Débloqué` affiché sur la carte) même si son abonnement membre Pro expire ultérieurement.
    *   **Intégrité Comptable** : Le moteur comptable déduit le montant du solde local **uniquement** si le mode de paiement choisi est `'portefeuille'`. Pour tous les autres modes de paiement externes, la transaction de vente est validée et enregistrée en base sans altérer le solde local de l'utilisateur.

### 8. L'Administration Centrale & Modération

Le panneau d'administration centralisé regroupe toutes les commandes critiques pour piloter la plateforme de manière sécurisée et en temps réel.

1. **Tableau de Bord & Statistiques** :
   - Affiche les KPI en temps réel : nombre total d'utilisateurs inscrits, répartition (Pro vs Standard) et statistiques des canaux.
   - **Bilan Financier Global** : Affiche les fonds théoriques cumulés en temps réel, calculés dynamiquement sur la base des recharges terminées et des retraits validés.

2. **Gestion Unifiée des Utilisateurs & Canaux** :
   - Recherche en direct par pseudonyme ou adresse e-mail.
   - **Actions Directes (Utilisateurs)** :
     - **Bannissement** : Restreint instantanément les droits de publication et d'interaction sociale.
     - **Promotion Pro** : Attribue manuellement le statut Premium pour le test ou le support VIP.
   - **Modération & CRUD des Canaux** : 
     - Interface de gestion centralisée ("foolproof") permettant la création, modification (nom, description, avatar, prix) et la suppression immédiate de tout canal enfreignant les règles communautaires, avec synchronisation parfaite des identifiants base de données.

3. **Traitement des Transactions & Demandes de Retrait** :
   - **Validation Manuelle des Retraits** : Les parieurs peuvent soumettre des demandes de retrait depuis leur portefeuille personnel. Ces requêtes arrivent instantanément dans la file d'attente d'administration. L'administrateur valide ou rejette la demande d'un simple clic (les fonds sont ajustés en conséquence).

4. **Support Client Centralisé** :
   - Boîte de réception en temps réel par WebSockets. Permet d'ouvrir instantanément un chat privé avec tout utilisateur ayant initié une demande de support, éliminant ainsi le besoin de recourir à des emails ou messageries externes.

### 9. Modération & Règles des Débats

Le forum des débats est désormais directement intégré dans la page des **Canaux (Box)** pour maximiser l'interaction sociale sans disperser les parieurs.

1. **Règle Stricte de Création** :
   - Afin d'éviter le spam de bas niveau et d'assurer que seuls les analystes sérieux animent la communauté, **seuls les utilisateurs possédant au moins un canal actif (ou les administrateurs)** sont autorisés à créer des débats.
   - Les parieurs standards n'ont pas accès au bouton de création (il est masqué côté client) et toute tentative de forçage HTTP est bloquée côté serveur avec un statut `403 Forbidden`.

2. **Droit d'Interaction** :
   - Tous les parieurs (Pro, Standards, Admins) peuvent lire, liker, commenter et répondre aux débats pour stimuler l'interaction.
   - L'administrateur peut supprimer n'importe quel débat directement depuis le tableau de bord de modération ou en cliquant sur l'icône de suppression rouge au sein du débat concerné.

3. **Visuels des Débats** :
   - Chaque débat de la barre latérale affiche un avatar circulaire pour harmoniser l'interface avec la liste des canaux.
   - L'avatar affiche automatiquement la première image du débat. Si aucune image n'est fournie, un visuel de sport dynamique issu d'Unsplash est affiché en secours.

## 10. Sécurité, Robustesse & Production Ready (Back-End)

Pour préparer le déploiement public et accueillir des utilisateurs réels en toute sécurité, plusieurs mécanismes de protection ont été configurés sur le serveur back-end :

### 10.1. Helmet (En-têtes de Sécurité HTTP)
`helmet` est un middleware Express qui renforce la sécurité de l'application en configurant de manière appropriée divers en-têtes HTTP. Il protège contre plusieurs types d'attaques courantes :
*   **Content Security Policy (CSP) :** Empêche l'exécution de scripts non autorisés ou malveillants (attaques XSS) en définissant de façon stricte d'où peuvent provenir les scripts, les feuilles de style (CSS), les images, les polices de caractères, et les connexions (APIs/WebSockets).
*   **Protection Clickjacking :** Configure l'en-tête `X-Frame-Options` à `SAMEORIGIN` pour empêcher que notre site soit intégré dans des frames ou des iframes tierces à des fins malveillantes.
*   **Désactivation du reniflage MIME :** Configure l'en-tête `X-Content-Type-Options: nosniff` pour forcer le navigateur à respecter le type de contenu envoyé par le serveur, évitant ainsi l'exécution accidentelle de scripts déguisés en images.

### 10.2. Limitation du Taux de Requêtes (Rate Limiting)
Pour empêcher le déni de service (DDoS) et contrer les attaques de type force brute (tentatives de connexion répétées), un limiteur de débit (`express-rate-limit`) est en place :
*   **Limiteur API Général (`/api/`) :** Restreint chaque adresse IP à un maximum de **500 requêtes toutes les 15 minutes**. Si ce seuil est dépassé, l'utilisateur reçoit une erreur `429 Too Many Requests` avec un message d'avertissement.
*   **Limiteur Authentification Strict (`/api/auth/`) :** Restreint chaque adresse IP à un maximum de **30 tentatives de connexion ou d'inscription toutes les 15 minutes**. C'est une barrière robuste contre le piratage de comptes par dictionnaire ou force brute.

### 10.3. Sécurisation de la Configuration CORS (Cross-Origin Resource Sharing)
Le middleware `cors` a été configuré de façon à refuser les accès d'origines non autorisées en production :
*   **Configuration d'Origins Autorisées :** L'accès à l'API est restreint aux domaines déclarés dans la variable d'environnement `ALLOWED_ORIGINS` (séparés par des virgules). 
*   **Mode Développement :** Si aucune variable n'est définie ou si `NODE_ENV` est en mode développement, l'accès local (`http://localhost:5173`) reste pleinement fonctionnel pour faciliter les tests et l'intégration.

### 10.4. Système de Cache pour les Matchs (Optimisation des Performances)
Afin de résoudre les temps de chargement trop longs lors de la récupération des matchs (dûs à la latence des appels vers l'API-Sports externe), un système de cache serveur a été mis en œuvre :
*   **Fonctionnement :** La liste des matchs pour une date donnée est stockée en mémoire pendant **5 minutes**.
*   **Impact :** Le premier utilisateur qui demande une date déclenche le chargement API externe (environ 1-2s). Les utilisateurs suivants chargeant la même date obtiendront les données **instantanément (0ms)**, tout en économisant les quotas d'appels de l'API.

### 11. Comptes de Test pour l'Environnement de Staging / Développement
Pour faciliter les tests et la validation des différents rôles sur la plateforme sans devoir recréer des comptes à chaque fois, des identifiants de test pré-configurés sont disponibles en base de données de développement :

*   **Compte Administrateur (Admin) :**
    *   **Email :** `admin@pronosbox.com`
    *   **Mot de passe :** `admin123`
    *   *Rôle :* Accès complet au dashboard administrateur, gestion des utilisateurs, validation des pronostics, modération.
*   **Compte Pro (Expert) :**
    *   **Email :** `pro@pronosbox.com`
    *   **Mot de passe :** `pro123`
    *   *Rôle :* Accès aux fonctionnalités Pro, création de pronostics experts, gestion des canaux premium.
*   **Compte Standard (Utilisateur) :**
    *   **Email :** `user@pronosbox.com`
    *   **Mot de passe :** `user123`
    *   *Rôle :* Accès standard gratuit, visualisation des pronostics basiques, participation aux canaux gratuits et débats.

---
*Dernière mise à jour : Juin 2026*
*Document de référence pour l'administration Pronobox.*
