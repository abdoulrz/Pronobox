# PronosBox Design System

This document is the single source of truth for the PronosBox UI/UX. It aims for a **Premium, High-Performance, and Immersive** sports betting experience.

---

## 1. Design Principles

- **Immersion**: Dark mode by default to highlight scores and statistics.
- **Precision**: Clean typography and clear information hierarchy (Data is king).
- **Social**: Friendly, interactive elements (Glassmorphism) to encourage community engagement.
- **Premium**: High-quality gradients and subtle animations (Neumorphism) to justify the "Pro" experience.

---

## 2. Color Palette

### Backgrounds
- **Body**: `#0B0F1A` (Deep Midnight Blue/Black)
- **Sections**: `#151B2C` (Dark Navy)
- **Cards/Popovers**: `#1E293B` (Slate Navy)
- **Inputs**: `#0F172A` (Deep Slate)

### Accents (Brand Identity)
- **Primary**: `#22C55E` (Vibrant Green - Success, Money, Field)
- **Primary Gradient**: `linear-gradient(135deg, #22C55E 0%, #16A34A 100%)`
- **Secondary (Pro)**: `#F59E0B` (Amber/Gold - Premium status)
- **Danger**: `#EF4444` (Red - Live/Alerts)

### Text
- **Primary**: `#F8FAFC` (Almost White)
- **Secondary**: `#94A3B8` (Slate Gray)
- **Muted**: `#64748B` (Muted Blue/Gray)

---

## 3. Typography

- **Interface**: `'Inter'`, sans-serif. Modern, highly readable for data.
- **Numbers/Scores**: Medium/Bold weights for quick scanning.

---

## 4. UI Components

### Glassmorphism (Sidebars & Nav)
- **Background**: `rgba(21, 27, 44, 0.8)`
- **Blur**: `backdrop-filter: blur(12px)`
- **Border**: `1px solid rgba(255, 255, 255, 0.05)`

### Cards (Match & Channel Blocks)
- **Background**: `#1E293B`
- **Border**: `1px solid #334155`
- **Radius**: `12px` (Standard)
- **Hover**: Subtle lift (`translateY(-2px)`) + Border Glow (`#22C55E`).

### Buttons
- **Primary**: Green Gradient, Bold text.
- **Pro**: Gold Gradient with a subtle shine animation.
- **Action**: Ghost/Outline for secondary interactions.

---

## 5. Mobile First Strategy

- **Touch Targets**: Min 48x48px.
- **Navigation**: Bottom Bar for primary sections (Matches, Box, Predictions, Channels).
- **Data Display**: Horizontal scrolls for match lists to keep vertical space clean.
- **Feedback**: Immediate visual response on tap (active states).

---

## 6. Icons
- Use **Lucide React** for consistency.
- Icons should use the `Secondary` text color until hovered/active, then switch to `Primary` or `Brand` color.
