# SkillShare Academy - Style Guide

## Aesthetic Direction

SkillShare Academy’s design is inspired by modern SaaS products rather than traditional school platforms. The default look uses a dark theme with deep navy backgrounds, subtle depth, and glowing emerald accents with touches of amber for emphasis. There is also a light theme, which uses a cool grey background with white cards while keeping the same accent colors for consistency.

The goal is to keep the interface clean, clear, and easy to use. Simple geometric typography, consistent spacing, and strong contrast help users focus on what matters. Every design choice should support a smooth, straightforward experience that feels modern and reliable.

## Logo Usage

SkillShare Academy uses two logo versions to ensure clarity across themes: a dark version for light backgrounds and a light version for dark backgrounds. The correct version should always be used to maintain contrast and readability.

The logo must not be stretched, rotated, recolored, or altered in any way. Always keep enough clear space around the logo so it remains easy to see and does not feel crowded by other elements.

## Typography

SkillShare Academy uses a simple, intentional typography system built for clarity and a modern SaaS feel.

### Font Families

| Variable         | Font    | Use                                    |
| ---------------- | ------- | -------------------------------------- |
| `--font-display` | Syne    | Headings (h1–h3), logo text, labels    |
| `--font-body`    | DM Sans | Body copy, buttons, inputs, paragraphs |

_Never use Inter, Roboto, Arial, system-ui, or any default system font stack._

### Type Scale

| Element       | Size       | Weight | Notes                               |
| ------------- | ---------- | ------ | ----------------------------------- |
| h1            | `2.4rem`   | `700`  | letter-spacing: `-0.02em`           |
| h2            | `1.8rem`   | `700`  | letter-spacing: `-0.02em`           |
| h3            | `1.3rem`   | `600`  | letter-spacing: `-0.02em`           |
| Page title    | `2rem`     | `700`  | —                                   |
| Section label | `0.8rem`   | `600`  | uppercase, letter-spacing: `0.08em` |
| Body          | `1rem`     | `400`  | line-height: `1.6`                  |
| Small / meta  | `0.875rem` | `400`  | —                                   |
| Micro label   | `0.72rem`  | `500`  | uppercase, letter-spacing: `0.06em` |

## Color System

SkillShare Academy’s color system is built around a dark-first experience with a complementary light theme. Each color role has a consistent meaning across both themes to keep the interface familiar and easy to read.

Accents (emerald and amber) stay consistent in both themes to maintain brand recognition. Background and surface colors shift to support readability and reduce eye strain depending on the mode.

### Backgrounds

| Variable              | Dark Theme | Light Theme | Usage                           |
| --------------------- | ---------- | ----------- | ------------------------------- |
| `--color-bg-dark`     | `#040810`  | `#dce4f0`   | Header underlay, modal backdrop |
| `--color-bg`          | `#070d1b`  | `#eef2fb`   | Page / body background          |
| `--color-bg-surface`  | `#0d1526`  | `#ffffff`   | Cards, panels                   |
| `--color-bg-elevated` | `#131e35`  | `#e4ecf7`   | Inputs, elevated controls       |

### Brand colors

| Variable                 | Color                   | Usage                                      |
| ------------------------ | ----------------------- | ------------------------------------------ |
| `--color-primary`        | `#10b981`               | Primary actions, active states, highlights |
| `--color-primary-dark`   | `#059669`               | Gradient end, hover darkening              |
| `--color-primary-glow`   | `rgba(16,185,129,0.22)` | Box-shadow glow, focus rings               |
| `--color-secondary`      | `#f59e0b`               | Credits, badges, secondary actions         |
| `--color-secondary-dark` | `#d97706`               | Gradient end for amber buttons             |
| `--color-secondary-glow` | `rgba(245,158,11,0.2)`  | Amber glow                                 |
| `--color-accent`         | `#818cf8`               | Tertiary decorative use only               |

### Semantic colors

| Variable             | Color                 | Usage                       |
| -------------------- | --------------------- | --------------------------- |
| `--color-success`    | `#10b981`             | Same as primary             |
| `--color-warning`    | `#f59e0b`             | Same as secondary           |
| `--color-error`      | `#f43f5e`             | Errors, destructive actions |
| `--color-error-glow` | `rgba(244,63,94,0.2)` | Error glow                  |

### Text

| Variable                 | Dark Theme | Light Theme | Usage                         |
| ------------------------ | ---------- | ----------- | ----------------------------- |
| `--color-text`           | `#e8edf5`  | `#0f1829`   | Primary body text, headings   |
| `--color-text-secondary` | `#8899b4`  | `#3d5070`   | Labels, descriptions          |
| `--color-text-muted`     | `#4a5a72`  | `#3d5070`   | Placeholders, disabled states |

### Borders

| Variable                | Dark Theme               | Light Theme             | Usage                         |
| ----------------------- | ------------------------ | ----------------------- | ----------------------------- |
| `--color-border`        | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)`      | Default card/input borders    |
| `--color-border-subtle` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.04)`      | Subtle dividers               |
| `--color-border-hover`  | `rgba(16,185,129,0.45)`  | `rgba(16,185,129,0.45)` | Emerald border on hover/focus |

## Spacing

SkillShare Academy uses consistent spacing and rounded corners to create a clean, structured layout that feels modern and easy to scan.

### Border Radius

| Variable    | Value     | Usage                         |
| ----------- | --------- | ----------------------------- |
| --radius-sm | `0.4rem`  | Buttons, inputs, small badges |
| --radius    | `0.75rem` | Cards, panels                 |
| --radius-lg | `1.25rem` |                               |
| --radius-xl | `1.75rem` |                               |

### Page Layout

The main content area is centered and constrained to a maximum width of `1200px` to keep reading comfortable on large screens. On smaller screens, the layout maintains a minimum side padding of `1.75rem` to avoid content touching the edges.

Vertical spacing between sections is consistent, with a standard `2rem` gap to keep the interface breathable and easy to navigate without feeling cluttered.

## Shadows & Glow

Shadows and glow effects in SkillShare Academy are used to create depth and guide attention. They should stay subtle and consistent, reinforcing hierarchy rather than distracting from content.

| Variable         | Dark Theme                                                        | Light Theme                                                        | Use                        |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| `--shadow-card`  | `0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset | `0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset` | All card elements          |
| `--shadow-glow`  | `0 0 30px var(--color-primary-glow), 0 4px 16px rgba(0,0,0,0.4)`  | `0 0 30px var(--color-primary-glow), 0 4px 16px rgba(0,0,0,0.1)`   | Card hover state           |
| `--shadow-amber` | `0 0 30px var(--color-secondary-glow)`                            | `0 0 30px var(--color-secondary-glow)`                             | Amber-highlighted elements |

Hover interactions are a key part of the interface. When a user hovers over a card, the border should smoothly transition to the hover state color, and the glow shadow is applied. This creates a clear sense of interactivity while keeping the effect subtle and controlled.

## Background Atmosphere

The body uses a fixed gradient mesh to create depth. Apply to the root `body`:

```css
body {
  background-color: var(--color-bg);
  background-image:
    radial-gradient(
      ellipse at 15% 40%,
      rgba(16, 185, 129, 0.06) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse at 85% 10%,
      rgba(129, 140, 248, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 60% 90%,
      rgba(245, 158, 11, 0.04) 0%,
      transparent 45%
    );
  background-attachment: fixed;
}
```

The same three radial gradients as dark mode are applied in light mode, with **slightly higher opacity** so the emerald / indigo / amber tints remain visible on the pale background:

```css
body {
  background-image:
    radial-gradient(
      ellipse at 15% 40%,
      rgba(16, 185, 129, 0.08) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse at 85% 10%,
      rgba(129, 140, 248, 0.07) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 60% 90%,
      rgba(245, 158, 11, 0.05) 0%,
      transparent 45%
    );
}
```

## Components

### Card

Cards are the core content container. They are used to group related information and create clear separation between sections.

A card has a soft surface background, a thin border, and a subtle shadow to create separation from the page. Padding is generous to keep content readable, and corners are moderately rounded for a modern SaaS feel.

On hover, the border shifts to a highlighted state and a glow shadow is applied.

### Buttons

Buttons use a shared base style with modifier classes that define their purpose and importance.

| Type      | Appearance                      | Use                                |
| --------- | ------------------------------- | ---------------------------------- |
| Primary   | Emerald gradient with glow      | Main call-to-action                |
| Secondary | Amber gradient with glow        | Secondary actions                  |
| Outline   | Transparent with emerald border | Tertiary or less important actions |
| Danger    | Red-toned gradient              | Destructive actions                |
| Disabled  | Muted grey, no interaction      | Unavailable actions                |

All buttons use the same typography and sizing rules: medium-weight body font, small rounded corners, and a slight lift on hover. When hovered, buttons shift upward slightly and their shadow becomes more pronounced to reinforce interactivity.

### Navigation Header

The navigation header is a sticky top bar that stays visible while scrolling. It has a fixed height of `64px`, uses `position: sticky` with `top: 0`, and sits above content with `z-index: 100`. A **1px bottom border** (`var(--color-border)`) separates it from the page, and `backdrop-filter: blur(20px)` is applied in both themes for a soft glass effect.

In dark mode, the background is a translucent deep navy: `rgba(7, 13, 27, 0.85)`. In light mode, it switches to a subtle page tint instead of dark glass: `rgba(238, 242, 251, 0.85)`, while keeping the same blur and border behavior.

At **900px and below**, the header switches to a compact hamburger menu layout for mobile devices. The visual styling and height remain consistent across breakpoints to maintain a stable experience.

### Badges

Status badges are small, translucent chips used to communicate state (such as success, warning, or error). They should always use subtle tinted backgrounds instead of solid fills to maintain a lightweight, modern SaaS feel.

| Variant           | Background                | Text Color           | Border Color               |
| ----------------- | ------------------------- | -------------------- | -------------------------- |
| Success           | `rgba(16, 185, 129, 0.1)` | `#34d399`            | `rgba(16, 185, 129, 0.25)` |
| Warning / Pending | `rgba(245, 158, 11, 0.1)` | `#fbbf24`            | `rgba(245, 158, 11, 0.25)` |
| Error / Rejected  | `rgba(244, 63, 94, 0.1)`  | `var(--color-error)` | `rgba(244, 63, 94, 0.25)`  |

All badges use the following shared styling:

- Border radius: `var(--radius-sm)`
- Font size: `0.82rem`
- Font weight: `600`
- Letter spacing: `0.03em`

### Section Labels

Section labels are used to introduce and separate content areas. They are always styled in an uppercase, small-caps-like format to create clear structure and hierarchy without being visually heavy.

They use the display font, with the color set to `--color-text-secondary` to keep them subtle but readable.

Each label also includes a thin bottom border and a small spacing below (`0.5rem`) to clearly separate it from the content that follows.
