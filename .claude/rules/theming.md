# Theming & Design Tokens - Swiss Design System

**Last Updated:** April 13, 2026

This document defines the design tokens (colors, typography, spacing, etc.) for Groundwork's Swiss Design system. All UI code MUST use these tokens via Tailwind CSS. Never hardcode values.

**Design Language:** See [strategy/design-language.md](../strategy/design-language.md) for philosophy and principles.

---

## Overview

Groundwork follows **Swiss Design / International Typographic Style** principles:

- **Typography-first:** Large, bold type as visual element
- **High contrast:** Black, white, shades of grey
- **Monochrome base:** 95% of the app is black/white/grey
- **Single accent:** Belt Blue (#0066cc) for actions only
- **8px baseline grid:** All spacing is a multiple of 8
- **No shadows, no gradients:** Pure, flat design
- **Minimal borders:** 2px black borders, 0-4px border-radius

---

## 1. Font System

### 1.1 Typeface

**System font stack** (no web fonts, instant loading):

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
```

**Why:**

- Native feel on every platform
- Zero load time (no web font downloads)
- Optimized for readability
- Swiss Design tradition (Helvetica lineage)

**Tailwind config:**

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ],
    },
  },
}
```

**Usage:**

```tsx
// Default - no need to specify
<p>Body text</p>

// Explicit (if needed)
<p className="font-sans">Body text</p>
```

---

### 1.2 Type Scale

All sizes use `rem` units (16px = 1rem).

| Name  | Size          | Line Height | Tailwind Class | Use Case                 |
| ----- | ------------- | ----------- | -------------- | ------------------------ |
| Hero  | 64px/4rem     | 1.2         | `text-hero`    | Landing page headlines   |
| H1    | 48px/3rem     | 1.2         | `text-h1`      | Page titles              |
| H2    | 36px/2.25rem  | 1.2         | `text-h2`      | Section headings         |
| H3    | 24px/1.5rem   | 1.3         | `text-h3`      | Card titles, subsections |
| Body  | 18px/1.125rem | 1.5         | `text-body`    | Paragraphs, default text |
| Small | 14px/0.875rem | 1.5         | `text-small`   | Captions, timestamps     |

**Tailwind config:**

```js
// tailwind.config.js
theme: {
  extend: {
    fontSize: {
      hero: ['4rem', { lineHeight: '1.2' }],        // 64px
      h1: ['3rem', { lineHeight: '1.2' }],          // 48px
      h2: ['2.25rem', { lineHeight: '1.2' }],       // 36px
      h3: ['1.5rem', { lineHeight: '1.3' }],        // 24px
      body: ['1.125rem', { lineHeight: '1.5' }],    // 18px
      small: ['0.875rem', { lineHeight: '1.5' }],   // 14px
    },
  },
}
```

**Usage:**

```tsx
<h1 className="text-h1 font-bold">Page Title</h1>
<h2 className="text-h2 font-bold">Section Heading</h2>
<p className="text-body">Body paragraph with comfortable line height.</p>
<span className="text-small text-gray-50">12 minutes ago</span>
```

---

### 1.3 Font Weights

| Weight  | Value | Tailwind Class | Use Case           |
| ------- | ----- | -------------- | ------------------ |
| Light   | 300   | `font-light`   | Small text (rare)  |
| Regular | 400   | `font-normal`  | Body text          |
| Bold    | 700   | `font-bold`    | Headings, emphasis |
| Black   | 900   | `font-black`   | Hero text (rare)   |

**Swiss Design principle:** Use bold for headings (700-900), regular for body (400).

---

## 2. Color System

### 2.1 Monochrome Palette (Primary)

**95% of the app** uses these colors:

| Name    | Hex     | Tailwind Token | Use Case                   |
| ------- | ------- | -------------- | -------------------------- |
| Black   | #000000 | `black`        | Text, borders, backgrounds |
| Grey 90 | #1a1a1a | `gray-90`      | Dark text on light bg      |
| Grey 70 | #4a4a4a | `gray-70`      | Secondary text             |
| Grey 50 | #808080 | `gray-50`      | Muted text, timestamps     |
| Grey 30 | #b3b3b3 | `gray-30`      | Borders, dividers          |
| Grey 10 | #e6e6e6 | `gray-10`      | Subtle backgrounds         |
| White   | #ffffff | `white`        | Backgrounds, reversed text |

**Tailwind config:**

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      black: '#000000',
      white: '#ffffff',
      gray: {
        10: '#e6e6e6',
        30: '#b3b3b3',
        50: '#808080',
        70: '#4a4a4a',
        90: '#1a1a1a',
      },
    },
  },
}
```

**Usage:**

```tsx
<div className="bg-white text-black border-2 border-black">
  <h2 className="text-h2 font-bold">High Contrast Title</h2>
  <p className="text-body text-gray-70">Secondary text</p>
  <span className="text-small text-gray-50">Muted timestamp</span>
</div>
```

---

### 2.2 Accent Color (Belt Blue)

**5% of the app** uses the accent color:

| Name    | Hex     | Tailwind Token  | Use Case               |
| ------- | ------- | --------------- | ---------------------- |
| Primary | #0066cc | `accent`        | Primary buttons, links |
| Hover   | #004c99 | `accent-hover`  | Button hover states    |
| Active  | #003366 | `accent-active` | Button active/pressed  |

**Tailwind config:**

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      accent: {
        DEFAULT: '#0066cc',  // Belt blue
        hover: '#004c99',
        active: '#003366',
      },
    },
  },
}
```

**Usage:**

```tsx
// Primary button
<button className="bg-accent hover:bg-accent-hover active:bg-accent-active text-white">
  Save Session
</button>

// Link
<a href="/journal" className="text-accent hover:underline">
  View Journal
</a>
```

**Rule:** Use accent color ONLY for interactive elements (buttons, links). Never for decoration.

---

### 2.3 Dark Mode (Future)

**Not implemented in MVP.** Plan for future:

| Light Mode | Dark Mode  |
| ---------- | ---------- |
| White bg   | Black bg   |
| Black text | White text |
| Grey scale | Inverted   |

**Tailwind config (future):**

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
  },
}
```

---

## 3. Spacing (8px Baseline Grid)

**All spacing** is a multiple of 8px.

| Name | Value | Tailwind Token | Use Case             |
| ---- | ----- | -------------- | -------------------- |
| xs   | 8px   | `space-xs`     | Tight spacing, icons |
| sm   | 16px  | `space-sm`     | Element padding      |
| md   | 24px  | `space-md`     | Card padding, gaps   |
| lg   | 32px  | `space-lg`     | Section spacing      |
| xl   | 48px  | `space-xl`     | Large gaps, margins  |
| 2xl  | 64px  | `space-2xl`    | Page margins         |
| 3xl  | 96px  | `space-3xl`    | Hero sections        |

**Tailwind config:**

```js
// tailwind.config.js
theme: {
  extend: {
    spacing: {
      xs: '0.5rem',   // 8px
      sm: '1rem',     // 16px
      md: '1.5rem',   // 24px
      lg: '2rem',     // 32px
      xl: '3rem',     // 48px
      '2xl': '4rem',  // 64px
      '3xl': '6rem',  // 96px
    },
  },
}
```

**Usage:**

```tsx
// Card with consistent spacing
<div className="p-md space-y-md">  {/* 24px padding, 24px vertical gap */}
  <h3 className="text-h3">Card Title</h3>
  <p className="text-body">Card content</p>
</div>

// Page layout
<main className="px-md py-xl max-w-screen-lg mx-auto">
  {/* 24px horizontal padding, 48px vertical padding */}
</main>
```

**Rule:** Never hardcode spacing values (e.g., `p-[23px]`). Always use tokens.

---

## 4. Layout & Grid

### 4.1 Max Content Width

**Desktop:** 1200px (Tailwind's `max-w-screen-xl`)

```tsx
<main className="max-w-screen-xl mx-auto px-md">
  {/* Content constrained to 1200px, centered */}
</main>
```

---

### 4.2 Responsive Margins

| Breakpoint | Margin | Tailwind Class |
| ---------- | ------ | -------------- |
| Mobile     | 24px   | `px-md`        |
| Tablet     | 48px   | `md:px-xl`     |
| Desktop    | 96px   | `lg:px-3xl`    |

**Usage:**

```tsx
<main className="px-md md:px-xl lg:px-3xl">{/* Responsive horizontal margins */}</main>
```

---

### 4.3 Grid System

**Asymmetric layouts** (Swiss Design principle):

```tsx
// Example: 20% sidebar, 50% content, 30% whitespace
<div className="grid grid-cols-10 gap-md">
  <aside className="col-span-2">Sidebar</aside>
  <main className="col-span-5">Content</main>
  <div className="col-span-3">{/* Intentional whitespace */}</div>
</div>
```

**Mobile:** Single column (full width)

```tsx
<div className="grid grid-cols-1 md:grid-cols-10 gap-md">
  {/* Stack on mobile, grid on tablet+ */}
</div>
```

---

## 5. Borders & Corners

### 5.1 Border Width

**Default:** 2px borders (high contrast, Swiss Design)

```tsx
<div className="border-2 border-black">{/* 2px black border */}</div>
```

**Tailwind config (already default):**

```js
// No custom config needed - use Tailwind's default border-2
```

---

### 5.2 Border Radius

**Minimal or none** (Swiss Design avoids rounded corners):

| Size | Value | Tailwind Class | Use Case          |
| ---- | ----- | -------------- | ----------------- |
| None | 0px   | `rounded-none` | Cards, containers |
| Sm   | 4px   | `rounded-sm`   | Buttons (subtle)  |

**Usage:**

```tsx
// Card - no rounded corners
<div className="border-2 border-black rounded-none">
  <p>Pure Swiss Design</p>
</div>

// Button - minimal rounding (4px)
<button className="bg-accent text-white rounded-sm">
  Submit
</button>
```

**Rule:** Default to `rounded-none`. Use `rounded-sm` (4px) only for interactive elements if needed.

---

## 6. Shadows

**None.** Swiss Design avoids shadows.

```tsx
// NEVER use shadow-* classes
<div className="shadow-lg">  {/* WRONG */}

// Use borders instead
<div className="border-2 border-black">  {/* CORRECT */}
```

**Tailwind config:**

```js
// Disable shadows (future)
theme: {
  extend: {
    boxShadow: {
      none: 'none',
    },
  },
}
```

---

## 7. Animation & Motion

### 7.1 Transitions

**Subtle, instant feel** (not flashy):

| Property  | Duration | Easing      | Tailwind Class                      |
| --------- | -------- | ----------- | ----------------------------------- |
| Colors    | 150ms    | ease-in-out | `transition-colors duration-150`    |
| Transform | 150ms    | ease-in-out | `transition-transform duration-150` |

**Usage:**

```tsx
// Button hover
<button className="bg-accent hover:bg-accent-hover transition-colors duration-150">
  Click Me
</button>

// Scale on hover (subtle)
<div className="hover:scale-105 transition-transform duration-150">
  Card
</div>
```

---

### 7.2 No Animations

**Never use:**

- Fade-ins on page load
- Parallax scrolling
- Animated decorations
- Loading spinners (use static "Loading..." text)

**Swiss Design is static by tradition.** Motion should be minimal and purposeful.

---

## 8. Tailwind Configuration Reference

**Full config for Groundwork:**

```js
// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Font System
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },

      // Type Scale
      fontSize: {
        hero: ['4rem', { lineHeight: '1.2' }],        // 64px
        h1: ['3rem', { lineHeight: '1.2' }],          // 48px
        h2: ['2.25rem', { lineHeight: '1.2' }],       // 36px
        h3: ['1.5rem', { lineHeight: '1.3' }],        // 24px
        body: ['1.125rem', { lineHeight: '1.5' }],    // 18px
        small: ['0.875rem', { lineHeight: '1.5' }],   // 14px
      },

      // Colors
      colors: {
        black: '#000000',
        white: '#ffffff',
        gray: {
          10: '#e6e6e6',
          30: '#b3b3b3',
          50: '#808080',
          70: '#4a4a4a',
          90: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#0066cc',  // Belt blue
          hover: '#004c99',
          active: '#003366',
        },
      },

      // Spacing (8px baseline grid)
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem',     // 32px
        xl: '3rem',     // 48px
        '2xl': '4rem',  // 64px
        '3xl': '6rem',  // 96px
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 9. Rules for Claude Code

When writing UI code, you MUST:

1. **Use design tokens** - Never hardcode values

   ```tsx
   // WRONG
   <div className="text-[18px] p-[24px]">

   // CORRECT
   <div className="text-body p-md">
   ```

2. **Follow 8px grid** - All spacing is a multiple of 8

   ```tsx
   // WRONG
   <div className="p-[23px]">

   // CORRECT
   <div className="p-md">  {/* 24px */}
   ```

3. **Use monochrome colors** - Black/white/grey by default

   ```tsx
   // WRONG
   <div className="bg-blue-500">

   // CORRECT
   <div className="bg-white border-2 border-black">
   ```

4. **Accent color sparingly** - Only for interactive elements

   ```tsx
   // WRONG
   <h1 className="text-accent">Title</h1>

   // CORRECT
   <button className="bg-accent text-white">Submit</button>
   ```

5. **No shadows, no gradients**

   ```tsx
   // WRONG
   <div className="shadow-lg bg-gradient-to-r">

   // CORRECT
   <div className="border-2 border-black">
   ```

6. **Minimal rounded corners**

   ```tsx
   // WRONG
   <div className="rounded-3xl">

   // CORRECT
   <div className="rounded-none">  {/* or rounded-sm for buttons */}
   ```

7. **System font stack** - No web fonts

   ```tsx
   // WRONG
   <link href="https://fonts.googleapis.com/css?family=...">

   // CORRECT
   {/* Use default font-sans */}
   ```

---

## 10. Component Examples

### Button (Primary)

```tsx
<button className="bg-black text-white px-lg py-sm text-body font-bold rounded-sm hover:bg-gray-90 transition-colors duration-150">
  Submit
</button>
```

### Button (Secondary)

```tsx
<button className="border-2 border-black bg-white text-black px-lg py-sm text-body font-bold rounded-sm hover:bg-black hover:text-white transition-colors duration-150">
  Cancel
</button>
```

### Card

```tsx
<div className="border-2 border-black bg-white p-md space-y-md">
  <h3 className="text-h3 font-bold">Card Title</h3>
  <p className="text-body text-gray-70">Card content with comfortable line height.</p>
  <span className="text-small text-gray-50">12 minutes ago</span>
</div>
```

### Input

```tsx
<input
  type="text"
  className="w-full border-2 border-black rounded-none px-sm py-sm text-body focus:outline-none focus:border-accent"
  placeholder="Enter session notes..."
/>
```

### Page Layout

```tsx
<main className="max-w-screen-xl mx-auto px-md md:px-xl lg:px-3xl py-xl">
  <h1 className="text-h1 font-bold mb-lg">Journal</h1>
  <div className="space-y-md">{/* Content */}</div>
</main>
```

---

## Summary

**Swiss Design Tokens:**

- **Font:** System font stack (no web fonts)
- **Type Scale:** Hero 64px, H1 48px, H2 36px, H3 24px, Body 18px, Small 14px
- **Colors:** Black/white/grey (95%) + Belt Blue accent (5%)
- **Spacing:** 8px baseline grid (xs=8, sm=16, md=24, lg=32, xl=48, 2xl=64, 3xl=96)
- **Borders:** 2px black borders, 0-4px border-radius
- **Shadows:** None (Swiss Design avoids shadows)
- **Motion:** Minimal (150ms transitions for hover)

**Always use tokens. Never hardcode values.**

---

**Next Steps:**

1. Copy this config to `tailwind.config.js`
2. Use tokens in all UI code
3. Build shadcn/ui components with Swiss styling
4. Review [strategy/design-language.md](../strategy/design-language.md) for philosophy
