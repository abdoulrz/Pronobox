# PronosBox Finalization Roadmap

This document outlines the path to taking PronosBox from its current state to a professional, production-ready platform.

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
    - [x] Break down `Box.tsx` into `ChannelListItem`, `ChannelTabs`, `CreateChannelModal`, and `SubscribeChannelModal`.
    - [x] Break down `ChannelView.tsx` into `ChannelHeader`, `MessageCard`, and `MessageInput`.
    - [ ] Break down `News.tsx` into `CategoryFilter`, `FeaturedNews`, and `NewsGrid`.
- [ ] **Visual Overhaul (Design System)**:
    - [ ] Implement **Glassmorphism** for Sidebar and TopNav.
    - [x] Standardize `border-radius` (12px) and `shadows` across all cards.
    - [x] Update color palette to match `PRONOBOX_DESIGN_SYSTEM.md` (Deep Navy + Vibrant Green).
- [x] **Zero Defaut Stabilization**:
    - [x] Eliminate all inline styles in Settings modules.
    - [x] Full Accessibility audit (labels, aria-labels) for Settings and Payment modules.
    - [x] Convert core services (WebSocket) to strict TypeScript (.ts).
    - [x] **Modularization**: Extract hooks (`usePayment`, `useWebSocket`) to resolve Fast Refresh warnings.
    - [x] **UI Hardening**: Resolve input visibility in Auth/Settings and fix notification feedback.
    - [x] **Settings Stabilization**: Implement asynchronous, state-driven profile updates (Bio, Avatar, Notifications) with real cross-session persistence.
- [x] **UI Rationalization**: Removed redundant Theme section from parameters to streamline the interface.
- [x] **Type Safety**: Full audit of `AuthContext` and settings components, resolving all implicit `any` and props mismatches.
- [ ] **Social Enhancements**:
    - [ ] Add Online Status indicator (green dot) on avatars.
    - [ ] Implement Real-time updates for DMs (using existing `WebSocketService`).
    - [ ] Add Emoji Picker to Chat and Comments.
- [ ] **Mobile Optimization**:
    - [ ] Refine the Bottom Navigation Bar for better ergonomics.
    - [ ] Improve horizontal scrolling for Match lists.

---

## 💰 Phase 3: Monetization & Pro Features

- [ ] **Payment Integration**:
    - [ ] Connect **NowPayments.io** or **FedaPay** to the existing Wallet system.
    - [ ] Finalize "Buy Pro" flow with success/error states.
- [ ] **IA Pronos (AI Predictions)**:
    - [ ] Connect real sports data API (Fotmob/Opta) to the Prediction engine.
    - [ ] Implement "Premium Only" filter for expert analyses.
- [ ] **Channel Monetization**:
    - [ ] Allow Pro users to set a subscription price for their channels.
    - [ ] Implement the 10% commission logic for the platform.

---

## 🛠️ Phase 4: Admin & Stability

- [ ] **Admin Dashboard**:
    - [ ] User management (Ban/Pro status).
    - [ ] Transaction validation queue.
    - [ ] Channel moderation tools.
- [ ] **Performance**:
    - [ ] Implement image lazy loading.
    - [ ] Optimize MongoDB queries for the "Box" feed (Pagination).
- [ ] **Deployment**:
    - [ ] Finalize Contabo VPS setup (Nginx, PM2, MongoDB).
    - [ ] Set up SSL (Certbot).

---

## 🃏 Future Ideas
- **Betting Competitions**: Weekly leaderboards for top tipsters.
- **Push Notifications**: For match goals and channel alerts.
- **PWA**: Make PronosBox installable on mobile.
