# Theming — Swiss Design System

**Last Updated:** April 13, 2026

Groundwork uses **Tailwind v4 defaults** with minimal customization. The Swiss Design aesthetic is achieved through restraint — monochrome colors, typography-first layouts, no shadows — not through custom tokens.

**Design Language:** See [strategy/design-language.md](../strategy/design-language.md) for philosophy.

---

## What's Custom

Only three things are customized from Tailwind v4 defaults:

```css
/* apps/web/app/globals.css */
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-switzer);
  --font-mono: var(--font-ibm-plex-mono);
  --color-accent: #0066cc;
  --color-accent-hover: #004c99;
  --color-accent-active: #003366;
}
```

| Custom Token       | Why                                                                     |
| ------------------ | ----------------------------------------------------------------------- |
| `--font-sans`      | Switzer (self-hosted variable font via next/font) replaces default sans |
| `--font-mono`      | IBM Plex Mono (Google Fonts via next/font) replaces default mono        |
| `--color-accent-*` | Belt Blue (#0066cc) — the one accent color for interactive elements     |

Everything else — type scale, spacing, grays, border radius — uses Tailwind's built-in defaults.

**There is no `tailwind.config.ts`.** Tailwind v4 is CSS-native. All config lives in `globals.css`.

---

## Fonts

- **Sans:** Switzer (variable, self-hosted) — loaded in `apps/web/app/layout.tsx` via `next/font/local`
- **Mono:** IBM Plex Mono (Google Fonts) — loaded via `next/font/google`
- Font files: `apps/web/app/fonts/Switzer-Variable.woff2`, `Switzer-VariableItalic.woff2`
- CSS vars set by next/font: `--font-switzer`, `--font-ibm-plex-mono`

---

## Swiss Design Constraints

These aren't token configs — they're rules for how you use Tailwind's defaults:

### Color: Monochrome + One Accent

- **95% of the app** is `black`, `white`, and Tailwind's default `gray-*` scale
- **5% accent** (`bg-accent`, `text-accent`) for buttons and links only
- Never use Tailwind's color palette (blue-500, red-400, etc.) for UI elements

```tsx
// WRONG
<div className="bg-blue-500 text-yellow-300">

// CORRECT
<div className="bg-white text-black border-2 border-black">
```

### Typography: Bold and Generous

- Use Tailwind's default type scale (`text-sm` through `text-6xl`)
- Headings: `font-bold` or `font-black`
- Body: `font-normal`
- Generous line height (Tailwind defaults handle this)

```tsx
<h1 className="text-5xl font-bold">Page Title</h1>
<p className="text-lg text-gray-600">Body text</p>
<span className="text-sm text-gray-400">Timestamp</span>
```

### Spacing: Generous Whitespace

- Use Tailwind's default spacing scale (`p-1` through `p-96`)
- Don't cramp elements — prefer more space over less
- 60-70% whitespace is good

### Borders: High Contrast, Flat

- **2px black borders:** `border-2 border-black`
- **No rounded corners** by default: `rounded-none`
- Buttons can use `rounded-sm` (subtle)
- **No shadows** — ever

```tsx
// WRONG
<div className="shadow-lg rounded-2xl">

// CORRECT
<div className="border-2 border-black rounded-none">
```

### Motion: Minimal

- Hover transitions: `transition-colors duration-150`
- No animations, no fade-ins, no parallax
- Swiss Design is static by tradition

---

## Component Patterns

### Button (Primary)

```tsx
<button className="bg-black text-white px-8 py-3 text-lg font-bold rounded-sm hover:bg-gray-800 transition-colors duration-150">
  Submit
</button>
```

### Button (Accent)

```tsx
<button className="bg-accent hover:bg-accent-hover active:bg-accent-active text-white px-8 py-3 text-lg font-bold rounded-sm transition-colors duration-150">
  Save Session
</button>
```

### Button (Secondary)

```tsx
<button className="border-2 border-black bg-white text-black px-8 py-3 text-lg font-bold rounded-sm hover:bg-black hover:text-white transition-colors duration-150">
  Cancel
</button>
```

### Card

```tsx
<div className="border-2 border-black bg-white p-6 space-y-4">
  <h3 className="text-xl font-bold">Card Title</h3>
  <p className="text-gray-600">Card content.</p>
  <span className="text-sm text-gray-400">12 minutes ago</span>
</div>
```

### Input

```tsx
<input
  type="text"
  className="w-full border-2 border-black rounded-none px-4 py-3 text-lg focus:outline-none focus:border-accent"
  placeholder="Enter session notes..."
/>
```

### Page Layout

```tsx
<main className="max-w-4xl mx-auto px-6 py-12">
  <h1 className="text-5xl font-bold mb-8">Journal</h1>
  <div className="space-y-6">{/* Content */}</div>
</main>
```

---

## Rules for Agents

1. **Monochrome palette** — `black`, `white`, `gray-*`. No color utilities (blue-500, etc.)
2. **Accent sparingly** — `bg-accent` only on interactive elements. Never decorative
3. **No shadows** — Use `border-2 border-black` instead
4. **No gradients** — Flat colors only
5. **No rounded corners** — `rounded-none` default, `rounded-sm` for buttons
6. **No arbitrary values** — Use Tailwind's default scale, not `p-[23px]`
7. **No custom font loading** — Fonts configured in `layout.tsx`, don't add `<link>` tags
