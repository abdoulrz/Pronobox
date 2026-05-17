# CHANGELOG

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.16.0] - 2026-05-17 ([Universal Content Reader, Comments Integration & Instant Asynchronous Uploads])

### Added
- **Premium Inline Content Reader & Dynamic Media Player**:
  - Implemented automatic parsing of standard YouTube video links to embeddable formats, rendering directly inside an iframe sandbox wrapper.
  - Added native dynamic `<video>` and `<audio>` dynamically loading local media formats internally.
  - Set up native `<embed>` inline PDF rendering for e-books.
  - Replaced immediate action redirection with a unified visual overlay holding all links, files, and resources.
  - Implemented dynamic fallback "Visiter le site externe" and voluntary resource download handlers.
- **Interactive Discussion & Commenting Board**:
  - Created a fully responsive bottom discussion board on each educational resource.
  - Linked commenting interface directly with Mongoose sub-document schema, supporting full username, dynamic avatar loading, formatted timestamps, and reactive state tracking.
  - Integrated comments API route securely requiring standard token validation.
- **High-Speed Asynchronous Local Upload Pipeline**:
  - Refactored server-side `/api/upload` handler to write files asynchronously using `fs.promises.writeFile`, ensuring zero event-loop blocks and extreme file transfer efficiency.
  - Re-routed `FileReader` onload handler in the administrative dashboard to isolate network and payload size rejections inside robust nested try-catch blocks, resolving UI freeze bugs.

### Changed
- **Navigation Label Spacing Ergonomics**:
  - Shortened bottom navigation label from `BET-EDUC` to `EDUC` for seamless single-line compatibility across small and large mobile viewports.
- **Roadmap & Admin Manual Updates**:
  - Fully updated strategic guides and milestone roadmap to mark BET-EDUC complete and structure upcoming advanced features.

---

## [2.15.0] - 2026-05-16 ([BET-EDUC Modernization & Admin Efficiency])

### Added
- **BET-EDUC Management Overhaul**:
  - Implemented automated iconography mapping (📖, 🎬, 📝, 🎓) based on content type.
  - Added a real-time, high-speed administrative search/filter bar.
  - Developed a "Quick Preview" eye icon to verify content (Markdown/URL) without leaving the dashboard.
  - Standardized the data entry form with dropdown selections and polished glassmorphism cards.
- **Educational Portal Redesign (Public)**:
  - Transitioned to a 2-column responsive grid layout for better content density.
  - Integrated the premium glassmorphic header design with sub-brand typography.
  - Polished the Markdown reading experience with optimized prose widths and typography.
  - Improved the "Format" badges for clearer distinction between E-books, Videos, and Articles.

### Changed
- **Admin Guide Update**: Documented the new professional BET-EDUC workflow and efficiency tools.
- **UI Consistency**: Applied the platform's Navy/Green/Glassmorphism design tokens to all educational components.

---

## [2.14.0] - 2026-05-16 ([Match Day UI & Broadcaster Modernization])

### Added
- **Premium Broadcaster Tooltip**:
  - Integrated official brand logos for beIN SPORTS, DAZN, and Canal+.
  - Implemented a robust multi-layer loading strategy (Google Favicon CDN + UI Avatars fallback).
  - Added direct, clickable portal links for each broadcaster.
- **Match Perspectives Redesign**:
  - Revamped "Perspectives du match" with glassmorphism, pattern backgrounds, and improved typography.
  - Achieved 1:1 visual parity between the Admin Editor preview and the public detail page.
- **Advanced Live Timer**:
  - Refactored `MatchDetails` timer to anchor to API-provided `elapsed` minutes (halftime-aware).
  - Added a pulsing green live indicator and FotMob-style `MM:SS` formatting.

### Fixed
- **Markdown Mutex Logic**: Enforced a rule in the editor to prevent conflicting line prefixes (Citation vs. Bullet Point).
- **Broken Assets**: Resolved CDN blocking issues by switching to Google's reliable icon service.

---

## [2.13.0] - 2026-05-15 ([Match Details & Pronostics Engine])

### Added
- **MatchDetails.tsx**: Redesigned with a real-time countdown, referee info, and a dynamic "TV Program" bar.
- **MatchPronostics.tsx**: Implemented a "Freemium" logic allowing all users to see basic picks while gating AI Analysis for Pro members.
- **Admin Pronos Engine**: Added a dedicated CRUD interface in the Admin Dashboard to manage predictions directly.
- **Data Persistence**: Created the `Prono` Mongoose model and `/api/pronos` endpoints.

---

## [2.12.0] - 2026-05-14 ([League & Match Data Stabilization])

### Added
- **FotMob-Style Sidebar**:
  - Hardcoded "Meilleures ligues" with exact FotMob curated list and French localization.
  - Reorganized "Toutes les ligues" with an "International" group and alphabetical country groups.
  - Implemented collapsible country headers in the sidebar for better ergonomics.
- **League Details Intelligence**:
  - Implemented client-side filtering and sorting for fixtures (10 past / 10 upcoming).
  - Added smart "Season Capping" at 2024 to comply with API-Football Free Tier limits.
- **Data Integrity**:
  - Resolved sidebar navigation collisions by switching from name-based mapping to unique ID-based mapping.
  - Fixed Match Feed emptiness by removing restricted API parameters (`next`) in `server.js`.

---

## [2.11.0] - 2026-05-08 ([Phase 2 Completion: Refactoring & Glassmorphism])

### Added
- **Global Glassmorphism**: Implemented a comprehensive frosted-glass aesthetic across the application. 
  - Extracted `.glass-modal` class and applied it to all modals in the application.
  - Enhanced the opacity and blur levels of `.glass-sidebar`, `.glass-bottom-nav`, and `.glass-panel`.
  - Converted `MatchCard` and `DebateCard` inline styles to a centralized `.card` design system component.
- **Social Features**:
  - Integrated `emoji-picker-react` into `DebateDetailView.tsx` to allow users to add emojis to debate comments.

### Changed
- **Code Refactoring**:
  - Broken down the monolithic `News.tsx` page by extracting grid mapping logic and active image carousel indexes into a new `NewsGrid.tsx` component.

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
