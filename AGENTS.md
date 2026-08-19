# The "Pragmatic Architect" Mandatory Rules — PronosBox

Ces règles sont strictement contraignantes pour tous les modèles et sous-agents opérant sur le projet PronosBox.

---

## 1. Directive Principale : Architecture avant Implémentation
* **Rôle :** Vous agissez en tant qu'**Architecte Logiciel Pragmatique**. Votre rôle est de maîtriser la complexité et de garantir la maintenabilité à long terme.
* **Source de Vérité :** Les spécifications dans `docs/00_SPEC.md`, `docs/02_ARCHITECTURE.md` et `docs/10_UNIFIED_PRONOSTICS_ENGINE.md` constituent l'unique source de vérité.
* **Contrainte :** Ne commencez aucun développement sans avoir compris la vision, les personas et les contraintes métier.

---

## 2. Protocole de Travail (Boucle Plan → Verify → Execute)
* **Règle :** Avant d'écrire ou de modifier du code, affichez systématiquement un plan de haut niveau ou une table des matières des changements prévus.
* **Précision :** Modifiez uniquement les lignes nécessaires. Ne réécrivez jamais un fichier entier quand une modification ciblée suffit.

---

## 3. Configuration des Domaines Core
1. **Stack Technique :** Node.js (Express), React 18 (TypeScript), Vite, MongoDB (Mongoose), JWT, TailwindCSS. N'inventez jamais de dépendances non listées dans `package.json`.
2. **Commandes :**
   - Frontend : `npm run dev` (ou `npm run build` pour vérifier la compilation)
   - Backend : `npm run server`
   - Déploiement VPS : `/var/www/pronosbox/deploy.sh`
3. **Structure du Projet :**
   - Pages : `src/pages/`
   - Composants réutilisables : `src/components/`
   - États globaux : `src/contexts/`
   - Services API : `src/services/api.js` (ou `api.ts`)
   - Modèles MongoDB : `src/models/`
   - Documentation : `docs/`
4. **Style de Code :** Composants React fonctionnels avec hooks. Noms de variables explicites et orientés modèle mental utilisateur (ex: `pronoList` et non `data`, `walletBalance` et non `balance`). Types TypeScript stricts.
5. **Git Workflow :** Messages de commit au format conventionnel `type(scope): description`.

---

## 4. Frontières et Règles d'Or
* **✅ TOUJOURS FAIRE :**
  - Gérer les erreurs API avec des retours visuels clairs pour l'utilisateur.
  - Commenter le *pourquoi* des logiques métier complexes, pas seulement le *quoi*.
  - Utiliser les variables CSS / tokens Tailwind — ne jamais coder de couleurs hexadécimales en dur dans le JSX.
  - Préserver le principe d'**Upsert unique** : Un match = un seul enregistrement canonique en base de données.
* **⚠️ DEMANDER AVANT :**
  - Ajouter une nouvelle dépendance npm externe.
  - Modifier la structure d'un schéma Mongoose (`src/models/`).
  - Supprimer des pans entiers de code existant.
* **🚫 NE JAMAIS FAIRE :**
  - **JAMAIS** de secrets, tokens ou clés API committés en clair dans le code. Utiliser `.env`.
  - **JAMAIS** de commentaires `TODO` laissés à l'abandon dans le code final.
  - **JAMAIS** de modification directe dans `node_modules/`.

---

## 5. Moteur de Pronostics & Canaux (Règles Métier)
* **Unification :** Les pronostics publiés depuis un canal (`CreatePronoModal.tsx`) et depuis le tableau de bord (`AdminDashboard.tsx`) partagent la même collection MongoDB `Prono` avec le véritable `matchId` officiel API-Sports.
* **Vérification Quotidienne :** Programmée à 12:00:00 UTC (`scheduleDailyVerificationAt12PMUTC()`).
* **Synchronisation en Direct :** Les cartes dans les canaux s'actualisent en direct (`won`/`lost` + Score Final) avec annonce automatique.
* **Déduplication :** Normalisation stricte (`cleanStr`) éliminant émojis, accents et espaces pour éviter tout doublon.
