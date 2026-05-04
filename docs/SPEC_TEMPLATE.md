# Feature Specification Template — PronosBox

*Copy to `docs/specs/SPEC-00X-Feature-Name.md` before starting development.*

---

## 1. Metadata

* **Title:** (e.g., "Premium Channel Subscription Payment")
* **Status:** [ Draft | In Progress | Done ]
* **Priority:** [ High | Medium | Low ]
* **Roadmap Phase:** [ Phase 2 UX | Phase 3 Monetization | Phase 4 Admin ]

---

## 2. Context & Intent ("The Why")

*Why are we building this? What user problem does it solve?*

**Example:** Pro users want to monetize their betting expertise by creating subscription channels. Without this, PronosBox cannot reach its revenue goal of 100k users.

---

## 3. Product Description ("The What")

*What does it look like? Reference screenshots/images from the project brief if possible.*

### User Stories

* [ ] As a **Pro User**, I want to set a monthly subscription price for my channel.
* [ ] As a **Regular User**, I want to see a "Subscribe" button on premium channels with the price.
* [ ] As an **Admin**, I want to see the 10% commission collected per payment.

### UI/UX Constraints (Based on Design System)

* Use the `.btn-pro` (Gold) button for the Subscribe CTA.
* Locked content should show a blurred preview with a padlock icon overlay.
* Use the `ProUpgradeModal` pattern for the payment confirmation flow.

---

## 4. Technical Description ("The How")

### Data Schema Impact

```js
// Existing Channel model — no schema change needed for basic version.
// subscriptionPrice field already exists.
```

### API Endpoints Needed

* `POST /api/channels/:id/subscribe` — Deduct from wallet + add user to members.
* `GET /api/channels/:id/subscription-status` — Check if current user is subscribed.

### Dependencies

* Requires `PaymentContext` to access wallet balance.
* Requires `authenticateToken` middleware on both new routes.
* No new npm packages needed.

---

## 5. Success Criteria ("Definition of Done")

* [ ] A non-Pro user clicking "Subscribe" on a Premium channel triggers the payment flow.
* [ ] The user's wallet is debited correctly.
* [ ] The platform's 10% commission is logged as a `Transaction` of type `commission`.
* [ ] After successful payment, the user can see channel messages.
* [ ] The UI shows an error if the wallet balance is insufficient.
* [ ] Tested on mobile (375px) and desktop (1280px).

---
