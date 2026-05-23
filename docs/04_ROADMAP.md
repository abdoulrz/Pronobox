# PronosBox Finalization Roadmap

This document outlines the path to taking PronosBox from its current state to a professional, production-ready platform.

> [!TIP]
> **🚀 Quick Deployment Reference**
> Any time you make changes locally and push them to GitHub, log into your VPS (`ssh root@213.199.50.202`) and run:
> `/var/www/pronosbox/deploy.sh`
> This automatically rebuilds the frontend and restarts the backend!

---

## ✅ Phase 1: Core Foundation (Completed)

- [x] **Tech Stack Setup**: Node/React/MongoDB architecture.
- [x] **Auth System**: JWT-based Login/Register.
- [x] **Base UI**: Matches, Box, Predictions, and Channels.
- [x] **Wallet Foundation**: Transaction model and Pro status logic.
- [x] **Mock Data**: Pre-filled content for testing and demos.

---

## 🚀 Phase 2: UX/UI Excellence & Functionality (Current Focus)

*Goal: Make the website look premium and work flawlessly.*

- [x] **Component Refactoring**:
    - [x] Break down monoliths into maintainable sub-components (Box, News, Channels).
- [x] **Visual Overhaul (Design System)**:
    - [x] Implement **Glassmorphism** for Sidebar and TopNav.
    - [x] Standardize `border-radius` (12px) and `shadows`.
    - [x] Update color palette (Deep Navy + Vibrant Green).
- [x] **Zero Defaut Stabilization**:
    - [x] Full Accessibility audit and inline style removal.
    - [x] Asynchronous profile updates with database persistence.
- [x] **UI Rationalization**: Removed redundant Theme section.
- [x] **Type Safety**: Full audit of `AuthContext` and settings components.
- [x] **Social Enhancements**:
    - [x] Online Status indicators.
    - [x] Real-time DM updates via WebSocket.
    - [x] Emoji Pickers.
- [ ] **Mobile Optimization**:
    - [ ] Refine the Bottom Navigation Bar for better ergonomics.
    - [ ] Improve horizontal scrolling for Match lists.

---

## 🧪 Phase 3: Beta Testing & Pronos (Current Focus)

- [x] **API Integrations**:
    - [x] **Sports Data (API-Football)**:
        - [x] Implement fixtures proxy in `server.js` with Free Tier compliance.
        - [x] **Beta Testing**: Stabilize season fallbacks for cup tournaments and older data.
        - [x] Replicate FotMob sidebar navigation and categorization.
    - [x] **News Feed Integration**:
        - [x] Integrated real-time RSS feeds from sports.fr (Complete).
- [x] **Pronos**:
    - [x] **Free Version**: Connect real sports data API for basic predictions. Implemented a CRUD section in the Admin Dashboard to manage free predictions.
    - [x] **Premium Version**: Deep analysis combined with an AI opinion. Built a dedicated CRUD section in the Admin Dashboard.
    - [x] **UX & Rendering**: Modernized the match perspective UI and standardized markdown rendering for 1:1 editor parity.

---

## 🛠️ Phase 4: Admin & Stability

- [x] **Admin Dashboard**:
    - [x] User management (Ban/Pro status / Promotion).
    - [x] Transaction validation queue & manual withdrawal approvals.
    - [x] Channel moderation tools.
    - [x] **Pronos Management**: CRUD interfaces for Free and Premium predictions.
    - [x] **BET-EDUC Management**: CRUD interfaces for Free and Premium educational content (E-books, Videos, Articles) with internal async uploads.
    - [x] **Universal Media Player Integration**: Play videos, audios, and read PDFs directly inline with user commenting (Recommendation 4).
    - [x] **Persistent Premium Unlocking**: Keeps a permanent record of purchased/unlocked resources directly in the MongoDB User schema and React context session to ensure lifetime access.
    - [x] **Channel Moderation & Media**: Robust full-CRUD management for Channels (foolproof ID mappings) and resilient Blob-to-Base64 media persistence for images and voice notes.
- [x] **Structural Refactoring & Cleanup**:
    - [x] Removed the standalone predictions page ("Pronos") since match analyses are now directly integrated.
    - [x] Merged the standalone "Débats" page into "Canaux" (/box) as a dynamic side column with smooth detailed overlay and categorized filters.
    - [x] Enforced strict authorization rule: only users owning at least one channel (or admin) can create a debate, fully secured on both frontend and backend (MongoDB guards).
    - [x] **Debate Stability & Visuals**: Resolved all server-to-client payload mismatch bugs (likes and comments vanishing, self-notification filters, and Mongoose population child rendering crash guards) and integrated beautiful circular avatars for debates in the channels sidebar.
- [ ] **Performance**:
    - [ ] Implement image lazy loading.
    - [ ] Optimize MongoDB queries for the "Box" feed (Pagination).
    - [x] **Admin Dashboard Consolidation**: Merged all administrative panels (withdrawals, user lists, support chat, finance summary) into a central single-page dashboard with 100% type safety and Zero-Defect compiler checks.
- [ ] **Deployment**:
    - [ ] Finalize Contabo VPS setup (Nginx, PM2, MongoDB).
    - [ ] Set up SSL (Certbot).
    - [ ] Secure and exclude `.env` file from public repository tracking before final production launch.

---

## 💰 Phase 5: Payment & Monetization

- [ ] **Payment Integration**:
    - [ ] Connect **FedaPay** / **NowPayments.io** to the Wallet system.
    - [ ] Finalize "Buy Pro" flow with success/error states and automatic status update.
    - [ ] Implement Pro user commission logic (10% platform fee).
- [ ] **Social Authentication**:
    - [ ] Implement Google OAuth / Single Sign-On (SSO) login.

---

## 🤖 Phase 6: Advanced Pronos Automation

- [ ] **Admin UX**: Implement dynamic match search lookup for prono creation (Recommendation 1).
- [ ] **Broadcaster Logic**: Allow match-specific broadcaster overrides in the database (Recommendation 2).
- [ ] **Real-time Data**: Implement background syncing for live odds (Recommendation 3).

---

## 🃏 Future Ideas
- **Betting Competitions**: Weekly leaderboards for top tipsters.
- **Push Notifications**: For match goals and channel alerts.
- **PWA**: Make PronosBox installable on mobile.
