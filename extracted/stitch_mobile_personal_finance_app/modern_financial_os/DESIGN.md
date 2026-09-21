---
name: Modern Financial OS
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#ffb2b7'
  on-secondary: '#67001b'
  secondary-container: '#b50036'
  on-secondary-container: '#ffc2c4'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#9ba2bb'
  on-tertiary-container: '#31394d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  numeric-balance:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes an aura of quiet financial competence, precision, and tranquility. Geared toward mobile-first personal wealth tracking, budgeting, and investment aggregation, it replaces the stressful, anxiety-inducing ledger patterns of traditional banking with an architectural, calm, and highly legible visual hierarchy.

The aesthetic fuses **Modern Swiss Corporate** minimalism with tactile **Fintech Luminescence**:
- Ultra-clean spatial division paired with deep slate surfaces.
- Subtle inner glows and micro-gradients that emulate luxury metallic cards and matte glass surfaces.
- Frictionless scanability engineered for one-handed thumb interaction within 9:16 mobile viewports.
- Intentional tension between grounded slate neutrals and vivid, high-fidelity semantic accents (emerald for inflows, warm coral for outflows).

## Colors

The palette operates under a two-tiered system optimized for extreme clarity under dark and light environments, built on an authoritative slate infrastructure.

### Theme Modes

- **Dark Mode (Default)**: Deep midnight obsidian base (`#090D16`), structured with slate-tinted layered surfaces (`#0F172A`, `#1E293B`, `#334155`). Prevents eye strain during night-time budget reviews and accentuates card balance gradients.
- **Light Mode (High Contrast)**: Pure clean white (`#FFFFFF`) with cool porcelain surfaces (`#F8FAFC`, `#F1F5F9`) and charcoal-ink typographic tokens (`#020617`, `#0F172A`) ensuring WCAG AAA legibility in direct sunlight.

### Functional & Semantic Logic

- **Primary (Emerald Inflow)**: `#10B981` (Vibrant Emerald) anchored with `#059669` for light mode and `#34D399` for dark mode highlights. Used exclusively for positive balances, income receipts, growth indicators, and primary affirmative actions.
- **Secondary (Coral Outflow)**: `#F43F5E` (Warm Coral) anchored with `#E11D48`. Reserved for spending debits, budget overruns, alert states, and negative cash flows, avoiding abrasive pure neon red.
- **Base / Slate Accent**: `#0F172A` paired with rich indigo/teal undertones (`#1E1B4B` to `#064E3B`) for soft, 135-degree balance card gradients that lend an executive feel.
- **Neutral Scale**: `#94A3B8` (Slate-400) for secondary metadata, `#64748B` (Slate-500) for structural captions and borders, and `#E2E8F0` / `#1E293B` for hairline dividing rules.

## Typography

The type engine is powered uniformly by **Inter** to ensure maximum typographic cohesion, razor-sharp rendering on high-density OLED mobile screens, and full OpenType tabular figures support.

### Typographic Directives
- **Tabular Figures (`tnum`)**: All financial data, transactions, balance summaries, and percentages must enable `font-feature-settings: "tnum" 1` to guarantee vertical numeric alignment across transaction lists and charts.
- **Strict Hierarchy**: Display & Balance heroes dominate the top tier; labels utilize tight tracking at micro-sizes to maintain crisp legibility.
- **High Glanceability**: Numbers use a heavier weight (600 or 700) relative to their accompanying currency signs or contextual descriptors, reducing the cognitive load needed to parse monetary values in split seconds.

## Layout & Spacing

The spatial architecture prioritizes single-thumb ergonomics on 9:16 aspect ratio mobile viewports, extending down from modern notch/dynamic island safe areas into an accessible thumb-reach zone at the lower 45% of the screen.

### Mobile-First Ergonomic Layout
- **Vertical Navigation Stacking**: Primary interactions (Transfer, Add Expense, Scan Bill) anchor to a floating or docked bottom navigation bar within immediate thumb reach.
- **Safe Zone Pacing**: Screen boundaries maintain a default `margin-mobile` of `1rem` (16px) or `margin` of `1.25rem` (20px), ensuring cards never touch physical screen bevels.
- **8-Point Spatial Cadence**: Component gaps and structural margins follow a predictable base-8 rhythm (4px micro, 8px, 16px, 24px, 32px), creating disciplined alignment that mimics physical ledgers.
- **Tablet / Desktop Expansion**: Fluid 12-column grid maxing out at `640px` for mobile app shells or expanding to `1120px` split-view for tablet dashboard layouts, switching transaction sheets from modal drawers to persistent lateral panels.

## Elevation & Depth

Visual hierarchy uses a tactile, layered surface structure rather than conventional drop shadows.

### Depth Hierarchy
1. **Canvas (Level 0)**: 
   - Dark: `#090D16` flat obsidian.
   - Light: `#F8FAFC` crisp off-white.
2. **Surface Containers / Modules (Level 1)**:
   - Dark: `#0F172A` with a 1px border of `rgba(255, 255, 255, 0.07)`.
   - Light: `#FFFFFF` with a 1px border of `rgba(15, 23, 42, 0.06)`.
3. **Hero Balance Cards (Level 2)**:
   - Dark: Subtle diagonal gradients (e.g., `#0F172A` transitioning to `#1E293B` or tinted with `rgba(16, 185, 129, 0.12)`), backed by a faint ambient blur: `box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.35)`.
   - Light: `#FFFFFF` surface with an ambient drop: `box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08)`.
4. **Floating Action Trays & Bottom Sheets (Level 3)**:
   - Frosted Glassmorphism: `backdrop-filter: blur(16px)`, background set to `rgba(15, 23, 42, 0.82)` (dark) or `rgba(255, 255, 255, 0.88)` (light) with a fine top edge highlight border of `rgba(255, 255, 255, 0.15)`.

## Shapes

The design system implements modern rounded aesthetics with generous curvature that feels inviting and natural on handheld devices.

- **Standard Cards & Modules (`rounded-2xl` / 16px)**: Applied to recurring transaction rows, metric widgets, graph modules, and bottom sheet containers.
- **Hero Balance & Credit Cards (`rounded-3xl` / 24px)**: Applied to prominent account balance surfaces, interactive visual cards, and parent modal shells to highlight primary financial anchors.
- **Controls & Micro-surfaces (`rounded-xl` / 12px)**: Used for text input fields, transaction category chips, and filter selectors.
- **Pills & Quick-Action FABs (`rounded-full`)**: Applied to quick-transfer triggers, category badges, and pill-shaped status tags.

## Components

### Hero Balance Cards
- Encased in `rounded-3xl` with multi-layered subtle slate/emerald ambient gradients.
- Includes total balance formatted via `numeric-balance`, secondary trend badge (`+4.2%` in emerald pill), eye toggle for balance privacy, and sub-actions (Deposit, Transfer, Analytics) configured with ergonomic circular touch targets (minimum 48x48px).

### Buttons & Interactive CTAs
- **Primary Action**: Solid emerald `#10B981` text-filled with `#022C22` (dark) or white (light), height 52px, `rounded-2xl`, with bold 16px Inter typography. Provides a subtle scale-down bounce on mobile touch feedback (`transform: scale(0.98)`).
- **Secondary / Surface Action**: Slate tinted `rgba(255, 255, 255, 0.08)` (dark) or `rgba(15, 23, 42, 0.05)` (light) with crisp contrast typography.

### Transaction Lists & Feed Items
- Stretched horizontal containers with `rounded-2xl` hover/tap states.
- Left-aligned 44x44px rounded category iconography (emerald tint for deposits, coral tint for debits).
- Two-tier text stack: Merchant / Description in `body-md` bold, timestamp / category in `body-sm` neutral.
- Right-aligned tabular value formatted in coral with a minus symbol (`-R$ 142,50`) or emerald with a plus symbol (`+R$ 3.200,00`).

### Chips & Filter Pills
- Compact 32px height chips with `rounded-full` contours.
- Inactive state: Bordered in hairline slate with low-opacity fill.
- Active state: Saturated slate or subtle emerald background with high-contrast text.

### Input Fields & Monetary Keypad
- Inputs measure 56px in height to accommodate effortless thumb tapping.
- Floating currency label (`R$` or `$`) positioned alongside tabular input figures.
- Outline transitions dynamically from muted slate to emerald focus ring with `box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2)`.

### Spending Progress & Budget Bars
- Slender 8px track height with `rounded-full` geometry.
- Track backdrop uses muted slate (`#1E293B`), filled dynamically with single-stroke emerald or transitioning into coral as the budget approaches 90% capacity.