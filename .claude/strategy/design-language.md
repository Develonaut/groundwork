# Design Language - Swiss Design for Groundwork

**Date:** April 13, 2026  
**Status:** Canonical design direction  
**Inspiration:** International Typographic Style (Swiss Design)

---

## Core Philosophy

Groundwork follows **Swiss Design / International Typographic Style** principles:

> "What is new in this art is its almost mathematical clarity. Though full of striking details, it relies for effect not upon ornament but on the balance and tension of form and color."
>
> — Lukas Müller-Brockmann

**In practice:**

- **Typography does the talking** - Let the type fill the space
- **Whitespace is intentional** - Grid-based, mathematical clarity
- **High contrast** - Black, white, shades of grey
- **Form follows function** - Every element has a purpose
- **Asymmetric balance** - Not centered, but balanced

---

## UI Library Choice: shadcn/ui

We use **shadcn/ui** as our component primitive library:

**Why shadcn/ui:**

- Copy-paste components (not a dependency)
- Built on Radix UI (accessible, composable)
- Tailwind CSS based (perfect for Swiss Design customization)
- Unstyled by default - we apply Swiss Design principles
- No framework lock-in

**Our approach:**

1. Copy shadcn/ui components into `@groundwork/ui`
2. Apply Swiss Design styling (typography, spacing, colors)
3. Components enforce Swiss principles by default

---

## Typography

### Typeface System

Following Swiss Design tradition, we use **sans-serif typefaces**:

**Primary:** System font stack (no web fonts needed)

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
```

**Display/Headings:** Bold weights (700-900)  
**Body:** Regular weight (400)  
**Small text:** Light weight (300) when needed

### Type Scale

```
Hero: 64px / 4rem
H1: 48px / 3rem
H2: 36px / 2.25rem
H3: 24px / 1.5rem
Body: 18px / 1.125rem
Small: 14px / 0.875rem
```

Line height: 1.5 (body), 1.2 (headings)

### Swiss Design Principles

- **Flush left, ragged right** (never center large blocks of text)
- **Generous line-height** for readability
- **Sentence case** for headings (not ALL CAPS)
- **Prominent text** as visual element (not decoration)

---

## Layout & Grid

### Swiss Grid System

Everything snaps to an **8px baseline grid**:

- Spacing: 8, 16, 24, 32, 48, 64, 96px
- Margins: 24px mobile, 48px tablet, 96px desktop
- Max content width: 1200px

### Asymmetric Layouts

Swiss Design favors **asymmetric balance** over centered layouts:

- Content aligned left or right
- Whitespace creates balance
- Grid visible through structure

### Example Layout Pattern

```
[Sidebar]     [Content Area]              [Whitespace]
  20%             50%                         30%

Not centered, but balanced.
```

---

## Color System

### Core Palette (Monochrome)

```
Black:   #000000
Grey 90: #1a1a1a
Grey 70: #4a4a4a
Grey 50: #808080
Grey 30: #b3b3b3
Grey 10: #e6e6e6
White:   #ffffff
```

### Accent Colors (Minimal Use)

Pick ONE accent color for the entire app:

**Option 1: Belt Blue** (for BJJ context)

```
Primary: #0066cc (blue belt color)
Hover:   #004c99
Active:  #003366
```

**Option 2: Red** (classic Swiss accent)

```
Primary: #cc0000
Hover:   #990000
Active:  #660000
```

**Usage:** Buttons, links, important actions only. 95% of the app is black/white/grey.

---

## Spacing & Rhythm

### Vertical Rhythm (8px grid)

All spacing is a multiple of 8:

```
xs:  8px   (0.5rem)
sm:  16px  (1rem)
md:  24px  (1.5rem)
lg:  32px  (2rem)
xl:  48px  (3rem)
2xl: 64px  (4rem)
3xl: 96px  (6rem)
```

### Whitespace Philosophy

- **Don't fear empty space** - Whitespace = clarity
- **60-70% empty space is GOOD** - Like the sprooter.net example
- **Breathing room around type** - Never cramped
- **Generous margins** - Content doesn't touch edges

---

## Components (shadcn/ui + Swiss Design)

### Our Approach

shadcn/ui components are **unstyled primitives**. We style them with Swiss Design principles:

**Typography-first:**

- Large, bold headings
- High contrast text
- System font stack
- Generous line-height

**Grid-based:**

- 8px baseline
- Asymmetric layouts
- Intentional whitespace

**Minimal color:**

- Black/white/grey base
- Single accent color
- No gradients, no shadows

### Cards

Swiss-styled cards:

```tsx
// @groundwork/ui/card.tsx (shadcn base + Swiss styling)
<Card className="border-2 border-black bg-white p-6">
  <CardHeader>
    <CardTitle className="text-2xl font-bold">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-lg leading-relaxed">Content</p>
  </CardContent>
</Card>
```

**Styling:**

- 2px black border (high contrast)
- White background
- No rounded corners (or minimal: 4px)
- Generous padding (24px minimum)
- No shadows

### Buttons

**Primary:**

```tsx
<Button className="bg-black text-white hover:bg-gray-800 px-8 py-4 font-bold">Submit</Button>
```

**Secondary:**

```tsx
<Button
  variant="outline"
  className="border-2 border-black bg-white text-black hover:bg-black hover:text-white"
>
  Cancel
</Button>
```

### Forms

shadcn/ui form components with Swiss styling:

- **Labels above inputs** (flush left)
- **Full-width inputs** on mobile
- **Generous padding** (16px)
- **2px black borders**
- **Focus state:** Thicker border or outline

---

## Photography & Imagery

When we add images (future):

- **High contrast black & white** photography preferred
- **Photography over illustration** (Swiss principle)
- **Grid-aligned placement** (never arbitrary positioning)
- **Images serve content** (not decoration)

For now (MVP): **No images** - Pure typography.

---

## Animation & Motion

Swiss Design is **static by tradition**, but for web we add subtle motion:

- **Hover transitions:** 150ms ease-in-out
- **Page transitions:** None (instant, like paper)
- **Focus states:** Instant (accessibility)

**Never:**

- Fade-ins on page load
- Parallax scrolling
- Animated decorations

---

## shadcn/ui Component Selection

### MVP Components (Copy These First)

```
Button       - Primary/secondary actions
Card         - Session entries, containers
Input        - Text fields
Label        - Form labels
Textarea     - Journal notes (markdown)
Select       - Dropdowns
Separator    - Horizontal rules
```

### Future Components

```
Dialog       - Modals
DropdownMenu - Actions menu
Tabs         - Navigation
Calendar     - Date picker for sessions
Sheet        - Mobile drawer
```

All styled with Swiss Design principles.

---

## Tailwind Configuration

### Custom Swiss Design Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        // 8px baseline grid
        xs: "0.5rem", // 8px
        sm: "1rem", // 16px
        md: "1.5rem", // 24px
        lg: "2rem", // 32px
        xl: "3rem", // 48px
        "2xl": "4rem", // 64px
        "3xl": "6rem", // 96px
      },
      colors: {
        black: "#000000",
        white: "#ffffff",
        gray: {
          10: "#e6e6e6",
          30: "#b3b3b3",
          50: "#808080",
          70: "#4a4a4a",
          90: "#1a1a1a",
        },
        accent: {
          DEFAULT: "#0066cc", // Belt blue
          hover: "#004c99",
          active: "#003366",
        },
      },
      fontSize: {
        hero: ["4rem", { lineHeight: "1.2" }],
        h1: ["3rem", { lineHeight: "1.2" }],
        h2: ["2.25rem", { lineHeight: "1.2" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        body: ["1.125rem", { lineHeight: "1.5" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
      },
    },
  },
};
```

---

## Reference Examples

### Contemporary Swiss Design Web

- sprooter.net (uploaded example)
- Swiss Design Awards website
- Massimo Vignelli Archive
- Müller-Brockmann posters (digitized)

### Key Designers (Historical)

- **Josef Müller-Brockmann** - Grid systems, concert posters
- **Emil Ruder** - Typography, education
- **Ernst Keller** - Founder of Swiss Style
- **Armin Hofmann** - Geometric simplicity

---

## Mobile-First Considerations

Swiss Design translates beautifully to mobile:

- **Single column layouts** (natural for mobile)
- **Flush left text** (readable on small screens)
- **Generous tap targets** (48px minimum)
- **High contrast** (readable in sunlight)
- **System fonts** (fast loading, native feel)

---

## Summary

**Groundwork = shadcn/ui + Swiss Design**

- shadcn/ui provides accessible primitives
- We apply Swiss Design styling via Tailwind
- Typography-first, grid-based, intentional whitespace
- Black/white/grey + one accent
- 60-70% whitespace
- Asymmetric balance
- Form follows function

---

## Next Steps

1. Initialize `@groundwork/ui` package
2. Copy shadcn/ui components (Button, Card, Input, etc.)
3. Create `swiss-design.css` with base styles
4. Configure Tailwind with Swiss Design tokens
5. Document component patterns

---

**Further Reading:**

- _Grid Systems in Graphic Design_ - Josef Müller-Brockmann
- _Typography_ - Emil Ruder
- shadcn/ui: ui.shadcn.com
- Swiss Design Awards: swissdesignawards.ch
