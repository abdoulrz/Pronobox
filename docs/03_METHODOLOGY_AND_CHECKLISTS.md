# Development System: PronosBox Engineering Framework

Based on the principles of *The Pragmatic Programmer* and *Spec-Driven Development*.

---

## 1. Project Philosophy

### A. "Tracer Bullets" — End-to-End Slices First

PronosBox is complex (Social + Betting + Real-time). Do not build isolated modules in isolation.

* **The Rule:** Build a thin slice that touches the entire system immediately.
* **Application:** Before perfecting the AI Pronos page, ensure a user can: Login → See a Match → Join a Channel → Post a Comment. This validates the Auth → MongoDB → API → React chain from Day 1.

### B. DRY — Single Source of Truth

* **Colors/Spacing:** Defined once in `tailwind.config.js` and `index.css`. Never hardcode hex values in JSX.
* **API Calls:** All backend communication goes through `src/services/api.js`. No raw `fetch()` in component files.
* **Docs:** Live in the `docs/` folder. Never in emails or external documents.

### C. Spec-Driven Development

* A Spec is a Markdown file that defines **Context**, **Intent**, and **Success Criteria** of a feature before coding begins.
* Use `SPEC_TEMPLATE.md` for every significant new feature.

---

## 2. Design System — Atomic Structure

Structure all UI by complexity:

1. **Atoms:** Buttons, Inputs, Badges, Avatars (Tailwind tokens).
2. **Molecules:** `MatchCard`, `ChannelRow`, `PostCard`, `PronoBadge`.
3. **Organisms:** `Header`, `Navigation`, `PostFeed`, `ChannelList`.
4. **Pages:** Full views assembled from organisms (`Box.tsx`, `Channels.tsx`).

---

## 3. Technical Architecture — React + Node

### Frontend (React/Vite)
* **Contexts First:** Before building a component, check if its data exists in a Context (`AuthContext`, `PaymentContext`). Avoid prop-drilling.
* **Fallback Mode:** The app must be demonstrable offline. `api.js` handles this automatically.

### Backend (Node/Express)
* **Route Security:** Every route that touches user data MUST use `authenticateToken` middleware.
* **Circuit Breaker:** If the MongoDB connection fails, the server retries with `connectWithRetry()`. The frontend's Fallback Mode ensures users can still login and use the app.

---

## 4. Managing Technical Debt

* **Rule:** "Don't live with broken windows." If a CSS element is misaligned, fix it or log it immediately.
* Log all known issues in `04_ROADMAP.md` under the appropriate phase.

---

# The Checklist Manifesto

## 🟢 PHASE 1: Before Coding (The "Spec Check")

* [ ] Have I checked `00_SPEC.md` for alignment?
* [ ] Do I understand the user persona this feature serves?
* [ ] Will my change break the MongoDB schema or an existing API route?
* [ ] Is there a known bug in this module I should fix while I'm here?

## 🟡 PHASE 2: During Development (The "Dev Check")

* [ ] **DRY:** Have I copy-pasted code? If yes, extract into a reusable component or helper.
* [ ] **Tokens:** Am I using Tailwind classes/CSS variables, not hardcoded colors?
* [ ] **Security:**
  * [ ] No API keys in the code (use `.env`).
  * [ ] Every protected route uses `authenticateToken`.
  * [ ] User inputs are not used in raw MongoDB queries without validation.
* [ ] **Performance:**
  * [ ] Are images using lazy loading?
  * [ ] Is the list data paginated if it could grow large?

## 🔴 PHASE 3: Before Deployment (The "Flight Check")

* [ ] **Environment:** Are all new `.env` variables added to the Contabo VPS `.env` file?
* [ ] **Backend:** Has `node src/server.js` been tested with a fresh MongoDB connection?
* [ ] **Frontend:** Has `npm run build` completed without TypeScript errors?
* [ ] **PM2:** Has the process been restarted (`pm2 restart pronosbox`)?
* [ ] **Backup:** Is there a recent MongoDB dump before the deployment?

## 🔵 Specific Checklist: Adding a New Feature to the Box (Feed)

* [ ] Does the post schema in MongoDB support the new content type?
* [ ] Is the new post type gated correctly (Free vs. Pro)?
* [ ] Does the `PostCard` component render the new content type?
* [ ] Has it been tested on mobile (375px) and desktop (1280px)?
