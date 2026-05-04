# CHANGELOG

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Added
- **Cross-Session Persistence (Settings)**:
  - **Avatars**: Implemented base64 persistence for user avatars via `AuthContext.updateUser`.
  - **Bio & Profile**: Fixed bio persistence issue and ensured all profile fields sync with the database.
  - **Notification Preferences**: Stabilized the notification toggle states with real persistence.
  - **Payment Methods**: Extended `User` model to persist payment method IDs across sessions.
- **UI & Type Hardening**:
  - **Theme Cleanup**: Removed the Theme section from all user roles (Simple, Pro, Admin) to simplify the UX.
  - **TS Refactoring**: Resolved critical TypeScript errors in `Settings.tsx`, `AuthContext.tsx`, and `SettingsAdminUser.tsx` (props mismatch, implicit any).
  - **WebSocket Security**: Restored `send` function in Admin settings for real-time user management broadcasting.

---

## [2.10.0] - 2026-05-03 ([Settings Persistence & Type Safety])

### To Be Implemented
- Phase 3: Monetization & Pro Features (NowPayments/FedaPay integration)
- Phase 4: Admin Dashboard & Stability
- PWA & Push Notifications

---

## [2.9.0] - 2026-05-02 ([Modular Chat Architecture & Permission Logic])

### Added
- **Centralized Chat Types**: Created `src/types/chat.ts` regrouping `Message`, `Channel`, and `UserFeatures` for cross-component consistency.
- **Business Logic Hook**: Implemented `useUserFeatures.ts` to decouple permission management (User/Pro/Admin) from the UI components.

### Changed
- **Decomposition of Monolithic Pages**:
  - **Box.tsx**: Reduced from ~1500 to ~200 lines. Extracted `ChannelListItem`, `ChannelTabs`, `CreateChannelModal`, and `SubscribeChannelModal`.
  - **ChannelView.tsx**: Reduced from ~1300 to ~180 lines. Extracted `ChannelHeader`, `MessageCard`, and `MessageInput`.
- **Zero Defaut Hardening**:
  - Eliminated final inline styles in `AdminDashboard.tsx` using Tailwind arbitrary values (`w-[78%]`).
  - Resolved all remaining TypeScript warnings and "Unexpected any" in chat modules.

### Fixed
- **Accessibility**: Added `title` and `aria-label` to all interactive elements in the new modular components.
- **Performance**: Optimized rendering by isolating message list items and input states.

---

## [2.8.0] - 2026-05-01 ([Architectural Modularization & Cleanup])

### Added
- **Modular Hooks System**:
  - Extracted `useWebSocket` to `src/hooks/useWebSocket.ts`.
  - Extracted `usePayment` to `src/hooks/usePayment.ts`.
  - Created centralized types in `src/types/payment.ts`.

### Changed
- **Architectural Stabilization**:
  - **Fast Refresh Fix**: Separated hooks and types from Context/Service files to resolve development server warnings.
  - **Service Refactor**: Transformed `WebSocketService` into a pure singleton service (moved to `.ts`).
- **Codebase Sanitization**:
  - Systematic removal of unused variables, commented-out code, and redundant imports in `App.tsx`, `BetEduc.tsx`, `Predictions.tsx`, `SubscriptionModal.tsx`, `AdminDashboard.tsx`, and `ThemeContext.tsx`.

### Fixed
- **Type Safety**:
  - Resolved complex generic contravariance errors in `WebSocketService` listener management.
  - Removed explicit `any` in `useWebSocket` subscription helper.
- **Component Logic**:
  - Refactored `BetEduc.tsx` to use the unified `UnifiedPaymentModal` flow instead of legacy direct service calls.
- **Accessibility**:
  - Final sweep of form labels and aria-labels in `SettingsAdminUser.tsx` and `BetEduc.tsx`.

---

## [2.7.0] - 2026-05-01 ([Zero Defaut Stabilization & Type Safety])

### Added
- **Typage Centralisé (Core)** :
  - Création de `src/types/channel.ts` pour centraliser les interfaces `Channel`, `ChannelData` et `ChannelDetails`.
  - Intégration de `NavigateFunction` dans les contextes pour un routage typé.
- **Composants Communs** :
  - `DynamicWidthBar` : Nouveau composant utilitaire pour injecter les largeurs de barres de progression via `useRef`, garantissant la conformité avec les règles strictes de non-utilisation de styles inline.

### Changed
- **Refonte Stabilization Settings (Pro, Admin, Simple)** :
  - **Zero Defaut Styles** : Suppression intégrale des styles inline (`style={{...}}`) dans les trois modules de paramètres.
  - **Progress Bar Utility** : Implémentation d'une classe `.progress-bar-fill` dans `index.css` utilisant des variables CSS (`--progress-width`).
- **WebSocket Service Refactor** :
  - Migration du fichier de `.tsx` vers `.ts` pour résoudre les avertissements de "Fast Refresh".
  - Typage strict : Remplacement de tous les types `any` par `unknown` et utilisation d'unions de types strictes pour les événements.
- **App.tsx Clean-up** :
  - Suppression des types `any` dans le `ChannelDataContext`.
  - Ajout de types de props (`ReactNode`) aux composants `AuthChecker` et `ChannelDataProvider`.

### Fixed
- **Accessibilité (A11y)** : Ajout systématique d'attributs `title` sur tous les boutons interactifs (modales, rechargement, retrait) dans les paramètres.
- **TypeScript Compliance** : Résolution des erreurs de transtypage sur les Map de callbacks WebSocket via des casts `unknown` sécurisés.

---

## [1.0.0] - 2026-01-20
### Added
- **Initial Release** : Lancement du MVP PronosBox.
- **Core Features** : Auth, Matches, Box, Predictions, Channels, and Wallet foundation.
