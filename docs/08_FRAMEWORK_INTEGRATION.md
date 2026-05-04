# Tailwind Integration Strategy — PronosBox Design System

This document explains how PronosBox uses Tailwind CSS in a premium, design-system-driven way — without class soup.

## Core Philosophy: "Semantic Components, Not Utility Soup"

We use Tailwind for its **design tokens** (spacing scale, color palette), but we create **semantic component classes** in `index.css` so JSX remains clean.

**Bad (utility soup):**
```jsx
<button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 active:scale-95">
```

**Good (semantic):**
```jsx
<button className="btn-primary">
```

---

## Token Mapping Strategy

`tailwind.config.js` maps brand colors so they are available as Tailwind utilities:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        green:    '#22C55E',  // Primary action
        'green-dark': '#16A34A',
        gold:     '#F59E0B',  // Pro/Premium
        navy:     '#0B0F1A',  // Body bg
        'navy-2': '#151B2C',  // Sections
        'navy-3': '#1E293B',  // Cards
        slate:    '#334155',  // Borders
        'text-muted': '#64748B',
      },
    },
    backdropBlur: {
      xs: '4px',
    },
  },
},
```

---

## Component Extraction Strategy (in `index.css`)

Define reusable `@layer components` classes to keep JSX readable:

```css
@layer components {
  /* Primary CTA button */
  .btn-primary {
    @apply bg-gradient-to-r from-brand-green to-brand-green-dark
           text-white font-bold py-2 px-5 rounded-lg
           shadow-[0_4px_20px_rgba(34,197,94,0.35)]
           hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(34,197,94,0.45)]
           active:translate-y-0 transition-all duration-200;
  }

  /* Pro/Premium button (Gold) */
  .btn-pro {
    @apply bg-gradient-to-r from-brand-gold to-amber-600
           text-white font-bold py-2 px-5 rounded-lg
           shadow-[0_4px_20px_rgba(245,158,11,0.35)]
           hover:-translate-y-0.5 transition-all duration-200;
  }

  /* Standard data card */
  .card {
    @apply bg-brand-navy-3 border border-brand-slate rounded-xl
           hover:-translate-y-0.5 hover:border-brand-green/30
           transition-all duration-200;
  }

  /* Glassmorphism panel (Sidebar, Header) */
  .glass-panel {
    @apply bg-brand-navy-2/80 backdrop-blur-md
           border border-white/5
           shadow-[0_4px_30px_rgba(0,0,0,0.5)];
  }
}
```

---

## Step-by-Step Migration Plan (Per Section)

### Phase 1: Global Layout (Header + Navigation) ✅ Current Focus
* Apply `.glass-panel` to `Header.tsx` and `Navigation.tsx`.
* Update active states in Nav to use `brand-green` glow.

### Phase 2: Data Cards (Matches, Channels)
* Apply `.card` to `MatchCard.tsx` and channel rows in `Channels.tsx`.
* Add `brand-green` accent on hover borders.

### Phase 3: Buttons & CTAs (Pro Upgrade, Wallet)
* Replace all scattered button classes with `.btn-primary` and `.btn-pro`.
* Apply to `ProUpgradeModal.tsx`, `WalletRechargeModal.tsx`.

### Phase 4: Forms (Auth, Settings)
* Standardize input styles (dark background, green focus ring).
* Apply to `Auth.tsx` and `Settings.tsx` sub-components.

### Phase 5: Social Pages (Box, Channels)
* Standardize `PostCard` appearance.
* Ensure all premium content (Pro-only predictions) have the Gold accent treatment.
