# Architecture & File Structure — PronosBox

This structure separates concerns to make the project scalable and maintainable.

## Project Tree

```text
pronobox_codebase/
├── docs/                         # DOCS AS CODE
│   ├── 00_SPEC.md                # Vision & Pre-requisites
│   ├── 01_RULES.md               # Pragmatic Architect rules & AI constraints
│   ├── 02_ARCHITECTURE.md        # This file
│   ├── 03_METHODOLOGY_AND_CHECKLISTS.md
│   ├── 04_ROADMAP.md             # Global finalization roadmap
│   ├── 05_ARCHITECTURE_RECOMMENDATIONS.md
│   ├── 07_DEPLOYMENT.md          # Deployment scripts
│   ├── 08_FRAMEWORK_INTEGRATION.md
│   ├── 09_ADMIN_GUIDE.md         # Admin panel operational guide
│   ├── 10_UNIFIED_PRONOSTICS_ENGINE.md # Unified Pronostics & Channels Engine
│   ├── CHANGELOG.md              # Version history
│   └── PRONOBOX_DESIGN_SYSTEM.md # Colors, Typography, Components
│
├── src/
│   ├── components/               # REUSABLE UI COMPONENTS
│   │   ├── Layout.tsx            # Main wrapper (Header + Nav + Content)
│   │   ├── Header.tsx            # Top bar (Logo, Search, User menu)
│   │   ├── Navigation.tsx        # Sidebar (desktop) & Bottom Bar (mobile)
│   │   ├── ProtectedRoute.tsx    # Auth guard for private routes
│   │   ├── AdminDashboard.tsx    # Admin management panel
│   │   ├── SearchBar.tsx         # Global search component
│   │   ├── NotificationCenter.tsx# In-app notification bell
│   │   ├── ProUpgradeModal.tsx   # "Go Pro" conversion modal
│   │   ├── WalletRechargeModal.tsx # Wallet top-up flow
│   │   ├── BetEduc.tsx           # BET-EDUC sidebar panel
│   │   ├── MatchCard.tsx         # Individual match result card
│   │   ├── settings/             # Settings sub-components
│   │   └── payment/              # Payment sub-components
│   │
│   ├── contexts/                 # GLOBAL STATE (React Context API)
│   │   ├── AuthContext.tsx       # User session (JWT, login/logout, isPro)
│   │   ├── ThemeContext.tsx      # Dark/Light mode + accent color
│   │   ├── PaymentContext.tsx    # Wallet balance & transaction state
│   │   └── NotificationContext.tsx # In-app notification state
│   │
│   ├── pages/                    # FULL PAGE VIEWS (one per route)
│   │   ├── Auth.tsx              # Login & Register
│   │   ├── Matches.tsx           # Live scores & match results (Fotmob-like)
│   │   ├── Predictions.tsx       # AI Pronos (Free + Premium)
│   │   ├── Box.tsx               # Social Feed (Facebook-like)
│   │   ├── News.tsx              # Debates & News Forum
│   │   ├── Channels.tsx          # Channel list (Telegram-like)
│   │   ├── ChannelView.tsx       # Individual channel view & chat
│   │   ├── Profile.tsx           # User profile & stats
│   │   ├── Settings.tsx          # User settings & wallet
│   │   ├── Transactions.tsx      # Payment history
│   │   └── CompareAccounts.tsx   # Free vs Pro comparison
│   │
│   ├── services/                 # COMMUNICATION LAYER
│   │   ├── api.js                # Axios instance + all API calls + Fallback Mode
│   │   └── WebSocketService.tsx  # Real-time connection (DMs, Live updates)
│   │
│   ├── models/                   # MONGODB SCHEMAS (Mongoose — Backend only)
│   │   ├── User.js               # User: auth, wallet, isPro, role
│   │   ├── Channel.js            # Channel: name, members, messages, premium
│   │   └── Transaction.js        # Transaction: amount, type, status, method
│   │
│   ├── server.js                 # EXPRESS BACKEND — All API routes
│   ├── App.tsx                   # Root: Providers + Router + Routes
│   ├── index.tsx                 # React entry point
│   └── index.css                 # Global CSS (Tailwind + Design Tokens)
│
├── index.html                    # Vite HTML entry point
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite build config
├── tailwind.config.js            # Tailwind customization
├── start_pronosbox.bat           # One-click launcher (Frontend + Backend)
└── stop_pronosbox.bat            # One-click stopper
```

---

## Key Modules Detail

### 1. `src/pages/Box.tsx` — The Social Heart
The "Facebook" of PronosBox. Users post picks, react, comment, and follow other tipsters.
* **Refactor Goal:** Break into `BoxHeader`, `PostCreator`, `PostCard`, `CommentSection` sub-components.

### 2. `src/pages/Channels.tsx` + `ChannelView.tsx` — Telegram Core
Telegram-style channels where Pro users broadcast predictions to their subscribers.
* **Key Logic:** `adminOnly` flag controls who can post. Premium channels require payment to join.

### 3. `src/pages/Matches.tsx` — Fotmob Core
Displays live scores and past results (last 7 days). Grouped by league with odds display.
* **Future:** Connect to a real sports data API (e.g., API-Football).

### 4. `src/pages/Predictions.tsx` — The AI Engine
Two-column layout: Free (general tips) and Premium (expert AI analysis).
* **Gate:** Premium column requires `user.isPro === true`.

### 5. `src/server.js` — The Express Backend
Single-file backend handling all REST endpoints. Key route groups:
- `/api/auth/*` — Login, Register
- `/api/users/*` — Profile management
- `/api/transactions/*` — Wallet operations
- `/api/channels/*` — Channel CRUD & messaging
- `/api/admin/*` — Admin-only user management

---

## Data Integrity & Security Notes

* **Cascades:** MongoDB references use `ObjectId`. Deleting a user should set channel `owner` to null, not delete the channel.
* **Auth Guard:** All sensitive routes use the `authenticateToken` middleware (JWT verification).
* **Fallback Mode:** `src/services/api.js` has a built-in fallback to `localStorage` when the backend is unreachable — ensuring demos always work.
