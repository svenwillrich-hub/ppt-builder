---
name: capco-slides
description: "Create professional presentations in the Capco consulting style — accent colors from the selected palette, Century Gothic typography, high-density content grids, and a structured section-based narrative. No section dividers — rhythm comes from consistent headers with numbered prefixes and accent underlines on every content slide. Visual components are always embedded in richer layouts with context strips. Colors are defined externally via the palette setting — do not hardcode color values. Creates widescreen (13.33\" × 7.5\") decks with structured content grids and professional information density."
---

# Capco-Style PPTX Skill

## Philosophy

**Corporate density meets clean structure.** Every slide communicates through structured grids, card layouts, and categorized information — not bullet walls. The Capco style balances high information density with visual clarity through consistent headers, embedded visual components, and key-message anchors on every slide.

**Core principles:**
- **Consistent header on EVERY content slide:** Numbered section prefix + pipe separator + accent underline + description line — this is the #1 structural rule
- Content slides use white/light backgrounds with structured multi-column grids
- The primary accent color (from the selected palette) is used for bars, highlights, labels, and category headers
- Century Gothic is the dominant typeface throughout — clean, geometric, modern
- High density: 6-12 data points per content slide, organized in card grids
- Numbered section prefixes (01., 02., 03.) create navigational hierarchy
- **NO section dividers** — they waste space and break content flow. Rhythm comes from the consistent header structure. The title slide uses a light background per the 2026 Capco template
- **Visual components are embedded, not standalone** — when using visual components (pyramids, chevrons, quadrants, etc.), always surround them with contextual elements: info grids, source cards, or actor chains. A visual component should never be the ONLY element on a slide

---

## Quick Reference

| Task | Action |
|------|--------|
| Create Capco-style deck | Read this file fully, then use PptxGenJS |
| PptxGenJS API | Read `/mnt/skills/public/pptx/pptxgenjs.md` |
| Visual components | Read `/mnt/skills/user/capco-visual-components/SKILL.md` → embed with Pattern 12 |
| Visual QA | Read `/mnt/skills/public/pptx/SKILL.md` → QA section |
| Icon rendering | Read `/mnt/skills/public/pptx/pptxgenjs.md` → Icons section |

**IMPORTANT:** Always read `/mnt/skills/public/pptx/pptxgenjs.md` before writing any code. It contains the full PptxGenJS API reference, icon rendering setup, and critical pitfalls to avoid.

**THREE GOLDEN RULES (always apply):**
1. **Header on EVERY content slide** — `addSlideHeader()` with numbered prefix + pipe separator + accent line + description
2. **Visual components embedded, not standalone** — Always surround with context cards, info grids, or source cards (Pattern 12)

---

## Color Palette

**IMPORTANT: Colors are provided externally via the Color Palette setting.** Do not hardcode any specific color values. Instead, use the palette colors passed in the `## Color & Typography Customization` section of the prompt.

Map the externally provided palette colors to these semantic roles:

```javascript
const palette = {
  lightBg:     "FFFFFF",  // White for content slide backgrounds
  lightGray:   "F2F2F2",  // Light gray for subtle card backgrounds
  primary:     "<Color 1 from palette>",  // Main accent — section headers, bars, highlights, category labels
  primaryLight:"<Color 1, lightened>",    // Secondary accent — lighter fills, hover states
  primaryPale: "<Color 1, very light>",   // Subtle accent backgrounds
  accent:      "<Color 2 from palette>",  // Highlights, section labels
  textDark:    "000000",  // Primary text on light backgrounds
  textBody:    "3F3F3F",  // Body text on light backgrounds
  textMuted:   "5B5D60",  // Secondary/caption text
  textSubtle:  "57677A",  // Muted descriptive text
  textLight:   "FFFFFF",  // Text inside accent shapes
  cardBg:      "FFFFFF",  // Card background
  border:      "D8D8D8",  // Subtle borders
};
```

### Color Usage Rules

```
primary (Color 1)     → Section header bars, accent bars on cards, category labels,
                        accent rectangles behind section titles, key highlights
primaryLight           → Secondary accent elements, lighter fills (derive from Color 1)
primaryPale            → Pale accent backgrounds for subtle card sections (derive from Color 1)
accent (Color 2)       → Highlights, section labels, secondary visual encoding
lightBg (FFFFFF)       → Content slide backgrounds
textDark (000000)      → Slide titles, bold headers on light backgrounds
textBody (3F3F3F)      → Body text, descriptions
textMuted (5B5D60)     → Captions, secondary info
textLight (FFFFFF)     → Text inside accent shapes
```

### Category Color Encoding

When a framework has distinct categories, derive category fills from the provided palette colors:

```javascript
// Map palette colors to categories in order
const categories = {
  category1: { fill: "<Color 1>", text: palette.textLight },
  category2: { fill: "<Color 2>", text: palette.textLight },
  category3: { fill: "<Color 3>", text: palette.textLight },
  neutral:   { fill: palette.textBody,    text: palette.textLight },
};
```

---

## Typography

### Font Pairing

| Role | Font | Notes |
|------|------|-------|
| **Primary / Headers** | `Century Gothic` | Used for slide titles, section headers, card headers |
| **Body** | `Century Gothic` | Same font at smaller sizes for body text |
| **Fallback Body** | `Arial` or `Calibri` | Used in dense text areas where Century Gothic is too wide |
| **Data/Labels** | `Century Gothic` | Numbers, labels, KPIs |

### Size Hierarchy

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Slide title (numbered) | 26pt | Bold | textDark |
| Slide title pipe suffix | 26pt | Regular | textDark |
| Subtitle / description | 16pt | Regular | textBody |
| Card/column header | 12-14pt | Bold | textDark or textLight |
| Body text | 11pt | Regular | textBody |
| Caption / source | 10pt | Regular | textMuted |
| Big number callout | 51pt | Bold | primary |
| KPI label | 12pt | Regular | textMuted |
| Section number prefix | 26pt | Bold | textDark |

### Text Rules
- **Left-align** all body text
- **Center** only: big number callouts
- Section titles use format: `"01. TOPIC NAME"` with bold number prefix
- Sub-section titles use pipe separator: `"03. DATA STRATEGY | OUR KEY OFFERINGS"`
- Maximum **4 lines** of body text per content block
- Prefer **sentence fragments** and key phrases over full sentences
- Use **UPPERCASE** for section names and category labels

---

## Slide Pattern Library

---

### Pattern 1: Title Slide (Light Background with Watermark)

**Use for:** Opening slide, first slide of the deck

**Design:** Light/white background with a subtle CAPCO watermark (large greyed-out logo letters). Title and subtitle are placed in the lower-left area. Bottom bar contains copyright text (left) and "a wipro company" logo (center). Optional placeholders for location/date, author name, and client logo.

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         C  A  P  C  O   (large watermark, ~10% opacity) │
│         (light gray, fills upper 2/3 of slide)          │
│                                                         │
│                                                         │
│  Title                                                  │
│                                                         │
│  Subtitle                                               │
│                                                         │
│  Location, Date          Author       [CLIENT LOGO]     │
│  © 2026 ...                    a wipro company          │
└─────────────────────────────────────────────────────────┘
```

**Key design details (from 2026 Capco template):**
- Background: White/light with subtle wave pattern image (grayscale, 70% alpha)
- Title: Century Gothic (`+mj-lt`), **36pt**, bold, left-aligned, bottom-anchored at y ≈ 4.32" (EMU: 4320000)
- Subtitle: Century Gothic, **20pt**, regular, at y ≈ 5.11" (EMU: 5112000)
- Location/Date: Century Gothic, **14pt**, `palette.textMuted`, at y ≈ 6.06"
- Author: Century Gothic, **14pt**, accent2 color, at x ≈ 4.1", y ≈ 6.06"
- Client Logo area: right-aligned, at x ≈ 8.4", y ≈ 5.25"
- Copyright: Calibri, **8pt**, at bottom-left y ≈ 6.48"
- Wipro logo: centered at bottom, at x ≈ 5.5", y ≈ 6.44"
- No dark background, no accent subtitle bar — clean, corporate white aesthetic

**Implementation:**
```javascript
function createTitleSlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title text (bold, black, lower-left)
  slide.addText(opts.title || "Presentation Title", {
    x: 0.58, y: 4.32, w: 7.87, h: 0.78,
    fontSize: 36, fontFace: "Century Gothic", color: palette.textBody,
    bold: true, valign: "bottom", margin: 0,
  });

  // Subtitle text (regular, below title)
  slide.addText(opts.subtitle || "", {
    x: 0.58, y: 5.11, w: 7.87, h: 0.29,
    fontSize: 20, fontFace: "Century Gothic", color: palette.textBody,
    valign: "top", margin: 0,
  });

  // Location/Date (small, muted)
  if (opts.location || opts.date) {
    slide.addText(opts.location || opts.date || "", {
      x: 0.58, y: 6.06, w: 2.5, h: 0.2,
      fontSize: 14, fontFace: "Century Gothic", color: palette.textMuted,
      valign: "top", margin: 0,
    });
  }

  // Author / Presenter name
  if (opts.author) {
    slide.addText(opts.author, {
      x: 4.27, y: 6.06, w: 2.5, h: 0.2,
      fontSize: 14, fontFace: "Century Gothic", color: palette.textMuted,
      valign: "top", margin: 0,
    });
  }

  // Copyright text (bottom-left)
  slide.addText("© 2026 The Capital Markets Company Sàrl. Capco Confidential. All rights reserved.", {
    x: 0.58, y: 6.48, w: 4, h: 0.15,
    fontSize: 8, fontFace: "Calibri", color: palette.border,
    valign: "top", margin: 0,
  });

  return slide;
}
```

**Notes:**
- The actual 2026 template uses a layout-level background image (CAPCO watermark) — this is baked into `slideLayout1` and cannot be replicated via PptxGenJS `addShape`. When using the template file with the editing workflow, the watermark is inherited automatically. When creating from scratch, use a clean white background.
- If you have the template `.pptx`, prefer the editing workflow (unpack → manipulate → pack) to preserve the watermark, Wipro logo, and all layout styling.

---

### Pattern 2: Agenda Slide (Image + Content Split)

**Use for:** Agenda slide, deck navigation, table of contents

**Design:** Left ~1/3 is a full-bleed image (typically a black & white architectural or abstract photo). The right ~2/3 is a white content area with a bold "Agenda" title, a dark blue accent line below it, and the agenda items listed below. Copyright at bottom-left.

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ ██████████│                                             │
│ ██████████│  Agenda                                     │
│ ██ IMAGE ██│  ─────── (dark blue accent line)           │
│ ██ (B&W)  ██│                                            │
│ ██████████│  01  TOPIC ONE                              │
│ ██████████│  02  TOPIC TWO                              │
│ ██████████│  03  TOPIC THREE                            │
│ ██████████│  04  TOPIC FOUR                             │
│ ██████████│                                             │
│  © 2026 ...                                             │
└─────────────────────────────────────────────────────────┘
```

**Key design details (from 2026 Capco template):**
- Left image: Full-bleed, spans x=0 to x ≈ 4.11" (EMU: 3947888), y=0 to y ≈ 6.52" (EMU: 6257925)
- Title "Agenda": Century Gothic, **28pt**, bold, letter-spacing 50 (≈ 0.5pt), at x ≈ 5.06" (EMU: 4860000), y ≈ 0.37" (EMU: 360000)
- Accent line: color `palette.primary`, **2.5pt** thick (EMU: 31750), square cap, at x ≈ 5.06", y ≈ 0.84" (EMU: 810000), width ≈ 1.63" (EMU: 1566545)
- Content area starts at x ≈ 5.06", below the accent line
- Copyright: Calibri, 8pt, at bottom-left x ≈ 0.58", y ≈ 6.48"

**Implementation:**
```javascript
function createAgendaSlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Left image (full-bleed, ~1/3 of slide)
  // If you have an image path, use slide.addImage():
  if (opts.imagePath) {
    slide.addImage({
      path: opts.imagePath,
      x: 0, y: 0, w: 4.11, h: 6.52,
      sizing: { type: "cover", w: 4.11, h: 6.52 },
    });
  } else {
    // Fallback: gray placeholder for left panel
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 4.11, h: 6.52,
      fill: { color: palette.textBody },
    });
  }

  // "Agenda" title (bold, dark, right panel)
  slide.addText(opts.title || "Agenda", {
    x: 5.06, y: 0.37, w: 4, h: 0.4,
    fontSize: 28, fontFace: "Century Gothic", color: palette.textBody,
    bold: true, valign: "top", margin: 0,
    charSpacing: 0.5,
  });

  // Dark blue accent line below title
  slide.addShape(pres.shapes.LINE, {
    x: 5.06, y: 0.84, w: 1.63, h: 0,
    line: { color: palette.primary, width: 2.5 },
  });

  // Agenda items
  const items = opts.items || [];
  const startX = 5.06;
  const startY = 1.2;
  const rowH = 0.55;
  const numW = 0.55;

  items.forEach((item, i) => {
    const y = startY + i * rowH;
    // Number (bold, dark blue)
    slide.addText(String(item.num || i + 1).padStart(2, "0"), {
      x: startX, y, w: numW, h: rowH,
      fontSize: 14, fontFace: "Century Gothic", color: palette.primary,
      bold: true, valign: "middle", margin: 0,
    });
    // Topic name
    slide.addText(item.title.toUpperCase(), {
      x: startX + numW + 0.15, y, w: 6.5, h: rowH,
      fontSize: 14, fontFace: "Century Gothic", color: palette.textBody,
      bold: true, valign: "middle", margin: 0,
    });
  });

  // Copyright text (bottom-left)
  slide.addText("© 2026 The Capital Markets Company Sàrl. Capco Confidential. All rights reserved.", {
    x: 0.58, y: 6.48, w: 4, h: 0.15,
    fontSize: 8, fontFace: "Calibri", color: palette.border,
    valign: "top", margin: 0,
  });

  return slide;
}
```

**Notes:**
- When using the template file with the editing workflow, the left image and accent line are inherited from `slideLayout3` ("Agenda Slide"). You only need to populate the title placeholder text and add agenda items.
- The accent line uses `palette.primary` — derived from the externally selected color palette.
- For best results with the full template aesthetic (image, Wipro logo, etc.), use the editing workflow rather than creating from scratch.

---

---

### Pattern 4: Content Slide — Introduction / Text Block

**Use for:** Introduction text, descriptions, overviews with a bold statement + body paragraph

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  01. SLIDE TITLE                                        │
│  ──────────────── (thin accent line)                      │
│  Bold tagline / key statement                           │
│                                                         │
│  Body paragraph text with detailed description          │
│  spanning multiple lines...                             │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createIntroSlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Section number + title
  slide.addText([
    { text: opts.sectionNum + ". ", options: { bold: true, color: palette.textDark } },
    { text: opts.title, options: { bold: false, color: palette.textDark } },
  ], {
    x: 0.6, y: 0.4, w: 10, h: 0.6,
    fontSize: 26, fontFace: "Century Gothic", valign: "bottom", margin: 0,
  });

  // Accent line under title
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.1, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // Bold tagline
  slide.addText(opts.tagline, {
    x: 0.6, y: 1.4, w: 10, h: 0.5,
    fontSize: 18, fontFace: "Century Gothic", color: palette.textDark,
    bold: true, valign: "top", margin: 0,
  });

  // Body text
  slide.addText(opts.body, {
    x: 0.6, y: 2.1, w: 10, h: 3.5,
    fontSize: 13, fontFace: "Century Gothic", color: palette.textBody,
    valign: "top", margin: 0, lineSpacingMultiple: 1.3,
  });

  return slide;
}
```

---

### Pattern 5: Executive Summary — Multi-Column with Sidebar

**Use for:** Executive summaries, overview slides with 2-3 content columns and a sidebar

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  03. TOPIC | EXECUTIVE SUMMARY                          │
│  ──────────────────────────────────────                 │
│  Subtitle description text                              │
│  ┌──────────┐ │ ┌─────────┐┌─────────┐┌─────────┐     │
│  │          │ │ │ Col 1   ││ Col 2   ││ Col 3   │     │
│  │ SIDEBAR  │ │ │ Header  ││ Header  ││ Header  │     │
│  │ with key │ │ │         ││         ││         │     │
│  │ points   │ │ │ Text    ││ Text    ││ Text    │     │
│  │          │ │ │ blocks  ││ blocks  ││ blocks  │     │
│  └──────────┘ │ └─────────┘└─────────┘└─────────┘     │
│  ┌──────────┐   ┌──────────────────────────────────┐   │
│  │ CTA box  │   │ Summary / key insights box       │   │
│  └──────────┘   └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createExecSummarySlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title with pipe separator
  slide.addText([
    { text: opts.sectionNum + ". " + opts.title + " ", options: { bold: true } },
    { text: "| " + opts.subtitle, options: { bold: false } },
  ], {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", color: palette.textDark,
    valign: "bottom", margin: 0,
  });

  // Accent line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.9, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // Description
  slide.addText(opts.description, {
    x: 0.6, y: 1.0, w: 12, h: 0.4,
    fontSize: 13, fontFace: "Century Gothic", color: palette.textBody,
    valign: "top", margin: 0,
  });

  // Sidebar (left column)
  const sideX = 0.6;
  const sideW = 2.9;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: sideX, y: 1.5, w: sideW, h: 3.7,
    fill: { color: palette.lightGray },
  });

  // Sidebar content
  const sideItems = opts.sidebar || [];
  sideItems.forEach((item, i) => {
    const yOff = 1.65 + i * 0.85;
    slide.addText(item.label, {
      x: sideX + 0.15, y: yOff, w: sideW - 0.3, h: 0.3,
      fontSize: 12, fontFace: "Century Gothic", color: palette.primary,
      bold: true, valign: "top", margin: 0,
    });
    slide.addText(item.text, {
      x: sideX + 0.15, y: yOff + 0.3, w: sideW - 0.3, h: 0.5,
      fontSize: 11, fontFace: "Century Gothic", color: palette.textBody,
      valign: "top", margin: 0,
    });
  });

  // Vertical divider
  slide.addShape(pres.shapes.LINE, {
    x: 3.57, y: 1.5, w: 0, h: 5.3,
    line: { color: palette.border, width: 0.75 },
  });

  // Three content columns
  const colStartX = 3.8;
  const colW = 2.76;
  const colGap = 0.34;
  const columns = opts.columns || [];

  columns.forEach((col, i) => {
    const x = colStartX + i * (colW + colGap);
    // Column header with accent icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: x, y: 1.5, w: 0.47, h: 0.47,
      fill: { color: palette.primary },
    });
    slide.addText(col.header, {
      x: x, y: 2.1, w: colW, h: 0.3,
      fontSize: 14, fontFace: "Century Gothic", color: palette.textDark,
      bold: true, valign: "top", margin: 0,
    });
    slide.addText(col.body, {
      x: x, y: 2.45, w: colW, h: 2.5,
      fontSize: 11, fontFace: "Century Gothic", color: palette.textBody,
      valign: "top", margin: 0,
    });
  });

  // Bottom insight bar
  if (opts.insight) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 3.8, y: 5.45, w: 9, h: 1.4,
      fill: { color: palette.lightGray },
    });
    slide.addText(opts.insight, {
      x: 3.95, y: 5.55, w: 8.7, h: 1.2,
      fontSize: 12, fontFace: "Century Gothic", color: palette.textBody,
      valign: "top", margin: 0,
    });
  }

  return slide;
}
```

---

### Pattern 6: Multi-Column Card Grid (Key Offerings)

**Use for:** Service offerings, capability grids, feature lists — 4-7 columns with title + description

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  03. TOPIC | OUR KEY OFFERINGS                          │
│  ──────────────────────────────────────                 │
│  Description text                                       │
│  ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐   │
│  │Header  ││Header  ││Header  ││Header  ││Header  │   │
│  │        ││        ││        ││        ││        │   │
│  │ • item ││ • item ││ • item ││ • item ││ • item │   │
│  │ • item ││ • item ││ • item ││ • item ││ • item │   │
│  │ • item ││ • item ││ • item ││ • item ││ • item │   │
│  │        ││        ││        ││        ││        │   │
│  └────────┘└────────┘└────────┘└────────┘└────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createOfferingsGrid(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title
  slide.addText([
    { text: opts.sectionNum + ". " + opts.title + " ", options: { bold: true } },
    { text: "| " + opts.subtitle, options: { bold: false } },
  ], {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", color: palette.textDark,
    valign: "bottom", margin: 0,
  });

  // Accent line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.9, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // Description
  slide.addText(opts.description, {
    x: 0.6, y: 1.0, w: 12, h: 0.35,
    fontSize: 13, fontFace: "Century Gothic", color: palette.textBody,
    valign: "top", margin: 0,
  });

  // Card grid
  const cols = opts.offerings.length;
  const gap = 0.2;
  const startX = 0.6;
  const totalW = 12.13;
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const cardY = 1.55;
  const cardH = 5.2;

  opts.offerings.forEach((offering, i) => {
    const x = startX + i * (cardW + gap);

    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: cardY, w: cardW, h: cardH,
      fill: { color: palette.lightGray },
    });

    // Card header with accent top bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: cardY, w: cardW, h: 0.06,
      fill: { color: palette.primary },
    });

    // Header text
    slide.addText(offering.title, {
      x: x + 0.1, y: cardY + 0.15, w: cardW - 0.2, h: 0.35,
      fontSize: 12, fontFace: "Century Gothic", color: palette.textDark,
      bold: true, valign: "top", margin: 0,
    });

    // Body items
    const itemsText = offering.items.map((item, idx) => ({
      text: item,
      options: {
        bullet: true,
        breakLine: idx < offering.items.length - 1,
        fontSize: 11,
        color: palette.textBody,
      },
    }));

    slide.addText(itemsText, {
      x: x + 0.1, y: cardY + 0.6, w: cardW - 0.2, h: cardH - 0.8,
      fontFace: "Century Gothic", valign: "top", margin: 0,
      paraSpaceAfter: 4,
    });
  });

  return slide;
}
```

---

### Pattern 7: Four-Column Service Overview with Icons

**Use for:** Service/practice overview with 4 equal columns, each with an icon, header, and description

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  02. DATA PRACTICE | OVERVIEW                           │
│  ──────────────────────────────────────                 │
│  800+ Practitioners | 5 continents | 100+ clients       │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐     │
│  │ [icon]   ││ [icon]   ││ [icon]   ││ [icon]   │     │
│  │ TITLE    ││ TITLE    ││ TITLE    ││ TITLE    │     │
│  │ KEY OFF: ││ KEY OFF: ││ KEY OFF: ││ KEY OFF: │     │
│  │ • item   ││ • item   ││ • item   ││ • item   │     │
│  │ • item   ││ • item   ││ • item   ││ • item   │     │
│  └──────────┘└──────────┘└──────────┘└──────────┘     │
│  PARTNERSHIPS: [logo] [logo] [logo]                     │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createFourColumnOverview(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title
  slide.addText([
    { text: opts.sectionNum + ". " + opts.title + " ", options: { bold: true } },
    { text: "| " + opts.subtitle, options: { bold: false } },
  ], {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", color: palette.textDark,
    valign: "bottom", margin: 0,
  });

  // Accent stats bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.95, w: 12.13, h: 0.35,
    fill: { color: palette.primary },
  });
  const statsText = opts.stats.map((s, i) => ({
    text: s + (i < opts.stats.length - 1 ? "    |    " : ""),
    options: { bold: true },
  }));
  slide.addText(statsText, {
    x: 0.6, y: 0.95, w: 12.13, h: 0.35,
    fontSize: 13, fontFace: "Century Gothic", color: palette.textLight,
    align: "center", valign: "middle", margin: 0,
  });

  // Four columns
  const colCount = 4;
  const gap = 0.08;
  const startX = 0.5;
  const totalW = 12.33;
  const colW = (totalW - gap * (colCount - 1)) / colCount;
  const colY = 1.5;

  opts.columns.forEach((col, i) => {
    const x = startX + i * (colW + gap);

    // Column background
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: colY, w: colW, h: 3.5,
      fill: { color: palette.lightGray },
    });

    // Column header (accent top area)
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: colY, w: colW, h: 0.75,
      fill: { color: palette.primary },
    });

    // Title in header
    slide.addText(col.title, {
      x: x + 0.1, y: colY + 0.1, w: colW - 0.2, h: 0.55,
      fontSize: 13, fontFace: "Century Gothic", color: palette.textLight,
      bold: true, valign: "middle", margin: 0,
    });

    // "KEY OFFERINGS:" label
    slide.addText("KEY OFFERINGS:", {
      x: x + 0.1, y: colY + 0.85, w: colW - 0.2, h: 0.25,
      fontSize: 10, fontFace: "Century Gothic", color: palette.primary,
      bold: true, valign: "top", margin: 0,
    });

    // Offering items
    const itemsText = col.items.map((item, idx) => ({
      text: item,
      options: {
        bullet: true,
        breakLine: idx < col.items.length - 1,
        fontSize: 10,
        color: palette.textBody,
      },
    }));

    slide.addText(itemsText, {
      x: x + 0.1, y: colY + 1.1, w: colW - 0.2, h: 2.3,
      fontFace: "Century Gothic", valign: "top", margin: 0,
      paraSpaceAfter: 3,
    });
  });

  return slide;
}
```

---

### Pattern 8: Services Matrix Grid

**Use for:** Service/solution matrices with row labels and column category headers

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  01. SLIDE TITLE                                        │
│  ──────────────────────────────────────                 │
│        │ Cat 1  │ Cat 2  │ Cat 3  │ Cat 4  │ Cat 5    │
│  ──────┼────────┼────────┼────────┼────────┼──────    │
│  Row 1 │┌─────┐ │┌─────┐ │┌─────┐ │        │          │
│ (accent)│┌─────┐ │┌─────┐ │┌─────┐ │        │          │
│        │└─────┘ │└─────┘ │└─────┘ │        │          │
│  ──────┼────────┼────────┼────────┼────────┤          │
│  Row 2 │┌─────┐ │┌─────┐ │        │┌─────┐ │          │
│  (grn) ││item │ ││item │ │        ││item │ │          │
│        │└─────┘ │└─────┘ │        │└─────┘ │          │
│  ──────┼────────┼────────┼────────┼────────┤          │
│  Row 3 │┌─────┐ │        │┌─────┐ │        │          │
│  (red) ││item │ │        ││item │ │        │          │
│        │└─────┘ │        │└─────┘ │        │          │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createServicesMatrix(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title
  slide.addText([
    { text: opts.sectionNum + ". ", options: { bold: true } },
    { text: opts.title, options: { bold: true } },
  ], {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", color: palette.textDark,
    valign: "bottom", margin: 0,
  });

  // Accent line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.9, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // Description
  if (opts.description) {
    slide.addText(opts.description, {
      x: 0.6, y: 1.0, w: 12, h: 0.35,
      fontSize: 12, fontFace: "Century Gothic", color: palette.textBody,
      valign: "top", margin: 0,
    });
  }

  // Column headers
  const headerY = 1.5;
  const rowLabelW = 2.9;
  const startX = 0.6;
  const gridStartX = startX + rowLabelW;
  const gridW = 12.13 - rowLabelW;
  const colCount = opts.columnHeaders.length;
  const colW = gridW / colCount;

  // Column header background bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: startX, y: headerY, w: 12.13, h: 0.34,
    fill: { color: palette.border },
  });

  opts.columnHeaders.forEach((header, i) => {
    slide.addText(header, {
      x: gridStartX + i * colW, y: headerY, w: colW, h: 0.34,
      fontSize: 11, fontFace: "Century Gothic", color: palette.textDark,
      bold: true, align: "center", valign: "middle", margin: 0,
    });
  });

  // Rows
  const rowColors = [palette.primary, palette.darkGreen, palette.alertRed];
  const rowH = 1.13;
  const rowStartY = headerY + 0.34;

  opts.rows.forEach((row, ri) => {
    const y = rowStartY + ri * rowH;
    const rowColor = rowColors[ri % rowColors.length];

    // Row label cell
    slide.addShape(pres.shapes.RECTANGLE, {
      x: startX, y, w: rowLabelW, h: rowH,
      fill: { color: rowColor },
    });
    slide.addText(row.label, {
      x: startX + 0.15, y, w: rowLabelW - 0.3, h: rowH,
      fontSize: 14, fontFace: "Century Gothic", color: palette.textLight,
      bold: true, valign: "middle", margin: 0,
    });

    // Row content cells
    slide.addShape(pres.shapes.RECTANGLE, {
      x: gridStartX, y, w: gridW, h: rowH,
      fill: { color: palette.lightGray },
    });

    // Items in grid cells
    row.items.forEach((item) => {
      if (item.col !== undefined && item.text) {
        const cellX = gridStartX + item.col * colW + 0.1;
        slide.addShape(pres.shapes.RECTANGLE, {
          x: cellX, y: y + 0.15, w: colW - 0.2, h: 0.45,
          fill: { color: rowColor },
        });
        slide.addText(item.text, {
          x: cellX + 0.05, y: y + 0.15, w: colW - 0.3, h: 0.45,
          fontSize: 10, fontFace: "Century Gothic", color: palette.textLight,
          valign: "middle", margin: 0,
        });
      }
    });
  });

  return slide;
}
```

---

### Pattern 9: Big Number / KPI Callouts

**Use for:** Key statistics, impact numbers, metrics

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  01. SLIDE TITLE                                        │
│  ──────────────────────────────────────                 │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  199     │ │  35      │ │  25      │ │  700+    │  │
│  │  OFFICES │ │  OFFICES │ │  YEAR    │ │  CULTURE │  │
│  │          │ │ WORLDWIDE│ │  EXP     │ │  EXPERTS │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**
```javascript
function createKPISlide(pres, opts) {
  const slide = pres.addSlide();
  slide.background = { color: palette.lightBg };

  // Title
  slide.addText([
    { text: opts.sectionNum + ". ", options: { bold: true } },
    { text: opts.title, options: { bold: true } },
  ], {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", color: palette.textDark,
    valign: "bottom", margin: 0,
  });

  // Accent line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.9, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // KPI cards
  const kpis = opts.kpis || [];
  const cardCount = kpis.length;
  const gap = 0.4;
  const totalW = 12.13;
  const cardW = (totalW - gap * (cardCount - 1)) / cardCount;
  const cardY = 2.5;

  kpis.forEach((kpi, i) => {
    const x = 0.6 + i * (cardW + gap);

    // Big number
    slide.addText(kpi.value, {
      x, y: cardY, w: cardW, h: 1.5,
      fontSize: 51, fontFace: "Century Gothic", color: palette.primary,
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Label
    slide.addText(kpi.label.toUpperCase(), {
      x, y: cardY + 1.6, w: cardW, h: 0.6,
      fontSize: 13, fontFace: "Century Gothic", color: palette.textBody,
      bold: true, align: "center", valign: "top", margin: 0,
    });

    // Sub-label
    if (kpi.sublabel) {
      slide.addText(kpi.sublabel, {
        x, y: cardY + 2.1, w: cardW, h: 0.4,
        fontSize: 11, fontFace: "Century Gothic", color: palette.textMuted,
        align: "center", valign: "top", margin: 0,
      });
    }
  });

  return slide;
}
```

---

### Pattern 12: Embedded Visual Component Layout

**Use for:** Any slide that uses a visual component from `capco-visual-components` (pyramids, chevrons, quadrants, stair steps, VS comparisons, progress bars, timelines, etc.)

**CRITICAL RULE: Visual components must NEVER be the only element on a slide.** Always embed them within a richer layout that includes contextual elements above, below, or beside the component.

**Embedding strategies:**

```
Strategy A: Component + Context Strip
┌─────────────────────────────────────────────────────────┐
│  04. TITLE | SUBTITLE                                    │
│  ──────────────── (accent line)                           │
│  Description text                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │         VISUAL COMPONENT (e.g., pyramid)           │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌──────────┬──────────┬──────────┬──────────┐          │
│  │ Stat 1   │ Stat 2   │ Stat 3   │ Stat 4   │  (strip)│
│  └──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────┘

Strategy B: Source Cards Above + Component Below
┌─────────────────────────────────────────────────────────┐
│  03. TITLE | SUBTITLE                                    │
│  ──────────────── (accent line)                           │
│  Description text                                        │
│  ┌────────┐┌────────┐┌────────┐  (source/context cards) │
│  │Card 1  ││Card 2  ││Card 3  │                         │
│  └────────┘└────────┘└────────┘                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │     VISUAL COMPONENT (e.g., progress bars)         │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Strategy C: Component + Section Divider Line + Second Component/Grid
┌─────────────────────────────────────────────────────────┐
│  04. TITLE | SUBTITLE                                    │
│  ──────────────── (accent line)                           │
│  Description text                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │     COMPONENT 1 (e.g., role cards)                 │  │
│  └────────────────────────────────────────────────────┘  │
│  ─────────── (accent section divider line) ──────────────  │
│  SUBSECTION TITLE | SUBTITLE                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │     COMPONENT 2 (e.g., numbered agenda)            │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Strategy D: Big Number + Component Side-by-Side
┌─────────────────────────────────────────────────────────┐
│  01. TITLE | SUBTITLE                                    │
│  ──────────────── (accent line)                           │
│  Description text                                        │
│  ┌──────────┐  ┌──────────────────────────────────────┐  │
│  │          │  │                                      │  │
│  │  >70%    │  │  Card grid (2×2 or 2×3)              │  │
│  │  BIG NUM │  │                                      │  │
│  └──────────┘  └──────────────────────────────────────┘  │
│  ████ KEY MESSAGE BAR ██████████████████████████████████  │
│  ┌──────────┬──────────┬──────────┬──────────┐  (strip) │
│  │ Stat 1   │ Stat 2   │ Stat 3   │ Stat 4   │          │
│  └──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Mid-slide section divider (for Strategy C):**
```javascript
function addMidSlideDivider(slide, pres, y, title, subtitle) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1 },
  });
  const parts = [];
  parts.push({ text: title + " ", options: { bold: true, color: palette.textDark } });
  if (subtitle) parts.push({ text: "| " + subtitle, options: { bold: false, color: palette.textDark } });
  slide.addText(parts, {
    x: 0.6, y: y + 0.08, w: 12, h: 0.35,
    fontSize: 16, fontFace: "Century Gothic", valign: "top", margin: 0,
  });
}
```

**Consolidation rule:** When two related topics can fit on one slide using Strategy C (component + divider + component), prefer one dense slide over two thin slides. This increases information density and reduces deck length. Good candidates for consolidation:
- Role cards + process steps
- Roadmap timeline + lifecycle chevrons
- Framework pyramid + implementation details
- Comparison + risk summary

---

## Content Density Principles

**Management-consulting slides carry weight.** Every slide should feel like it earns its place in the deck. Follow these density guidelines:

### Minimum Content Per Slide
- At least **3 distinct information elements** (e.g., header + visual component + context cards)
- Visual components must be accompanied by **explanatory context** (cards, labels, or detail text)

### Slide Composition Formula
Every content slide follows this vertical structure:
```
HEADER ZONE (y: 0.3-1.4)
  → Section number + title + pipe separator
  → Accent underline
  → Description line

CONTENT ZONE (y: 1.4-6.9)
  → Primary content: cards, grids, visual components
  → Optional: mid-slide divider + secondary content
```

### Consolidation Triggers
Merge two slides into one when:
- Both slides share the same section number
- One slide has a visual component and the other has a list/grid
- Both slides are under 60% of vertical space used
- The two topics are closely related (e.g., roles + processes, framework + implementation)

---

## Spacing & Layout Rules

### Slide Dimensions (LAYOUT_WIDE)
- **Canvas: 13.33" × 7.5"** (NOT standard 10" × 5.625")
- This is `LAYOUT_WIDE` in PptxGenJS
- Safe area: 0.6" margins → content area: 12.13" × 6.3"

### Consistent Spacing

| Element | Spacing |
|---------|---------|
| Title top margin | 0.3" from top |
| Title to accent line | 0.6" from top of title |
| Accent line to content | 0.1-0.15" gap |
| Between card columns | 0.08-0.2" |
| Between card rows | 0.1-0.2" |
| Card internal padding | 0.1-0.15" |
| Bottom margin | 0.4" minimum |
| Left margin | 0.6" |
| Right margin | 0.6" |

### Grid Calculations

```javascript
function gridLayout(startX, startY, totalW, totalH, cols, rows, gap) {
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const cardH = (totalH - gap * (rows - 1)) / rows;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: startX + c * (cardW + gap),
        y: startY + r * (cardH + gap),
        w: cardW,
        h: cardH,
      });
    }
  }
  return { positions, cardW, cardH };
}
```

---

## Deck Structure Template

Recommended slide order (NO section dividers — rhythm comes from consistent headers):

```
1. Title Slide (Pattern 1: light bg, CAPCO watermark, title + subtitle lower-left)
2. Agenda Slide (Pattern 2: left image panel + agenda items on right with dark blue accent line)
3. Introduction / Relevance (Pattern 9 KPIs + Pattern 12 embedding)
   → Big number + card grid + context strip
4. Deep-Dive Cards (Pattern 6: multi-column card grid)
5. Framework Visual (Pattern 12: visual component + info grid below)
6. Technology/Process Overview (Pattern 7: four-column overview)
7. Comparison/Spectrum (Pattern 12: chevrons or VS + risk gradient bar)
8. Challenges Overview (Pattern 12: quadrants + contextual detail)
9. Detail Slide (Pattern 12: source cards + progress bars/dual panel)
10. Combined Slide (Pattern 12 Strategy C: component + divider + component)
11. Recommendations (numbered agenda)
12. Landscape/Matrix (Pattern 8 or Pattern 6 deep cards)
13. Conclusion (6-insight grid + emerging challenges strip)
```

**Key differences from traditional consulting decks:**
- NO section dividers between sections (they waste slides and break flow)
- NO dark background slides — all slides use light/white backgrounds for a clean, modern look
- Section transitions are signaled by the numbered prefix changing (01→02→03)
- Visual components are always embedded in richer layouts (Pattern 12)
- Prefer fewer, denser slides over many thin slides

---

## Anti-Patterns (What NOT to Do)

1. **No standard 10" width** — Always use `LAYOUT_WIDE` (13.33" × 7.5")
2. **No fonts other than Century Gothic** — Use Century Gothic for everything; Arial only as fallback in dense text
3. **No colors outside the palette** — Only use colors from the externally provided palette and the neutral text/background colors
4. **No text-only slides** — Every content slide needs structural elements (cards, grids, bars)
5. **No bullet walls** — Max 5 items per bullet list; prefer card grids instead
6. **No centered body text** — Left-align all body copy; center only big number callouts
7. **No rounded rectangles for cards** — Use `RECTANGLE` (square corners match the Capco aesthetic)
8. **No excessive shadows** — Keep it clean and flat; subtle shadows only if needed
9. **No gradients** — Use solid fills throughout
10. **No dark background slides** — Do NOT create any dark background slides (no section dividers, no dark closing slides). All slides use white/light backgrounds. Section transitions are signaled by the numbered prefix changing (01→02→03)
11. **No missing section numbers** — Every slide title must start with "XX." section prefix
12. **No missing pipe separators** — Sub-topics use "| SUBTITLE" format after the main title
13. **NEVER use `#` prefix in hex colors** — PptxGenJS pitfall
14. **NEVER reuse option objects** — Create fresh objects for each `addShape`/`addText` call
15. **No standalone visual components** — When using visual components (pyramids, chevrons, quadrants, etc. from capco-visual-components), NEVER let them be the only element on a slide. Always embed them with surrounding context: info grids, source cards, actor chains, or a second component via mid-slide divider
16. **No thin slides** — If a slide uses less than 60% of vertical space, consolidate it with a related slide using Strategy C (mid-slide divider). Prefer fewer, denser slides over many sparse ones

---

## Complete Code Skeleton

```javascript
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// --- Icon Utilities ---
function renderIconSvg(IconComponent, color = "#" + palette.textDark, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// --- Palette ---
// IMPORTANT: Replace the placeholder values below with the actual colors
// from the "Color & Typography Customization" section provided in the prompt.
// Map Color 1 → primary, Color 2 → accent, Color 3+ → additional categories.
// Derive primaryLight (lighten primary ~20%) and primaryPale (lighten primary ~60%).
const palette = {
  lightBg: "FFFFFF",
  lightGray: "F2F2F2",
  primary: "COLOR_1_FROM_PALETTE",      // ← Replace with Color 1
  primaryLight: "COLOR_1_LIGHTENED",     // ← Derive: lighten Color 1 ~20%
  primaryPale: "COLOR_1_VERY_LIGHT",     // ← Derive: lighten Color 1 ~60%
  accent: "COLOR_2_FROM_PALETTE",        // ← Replace with Color 2
  textDark: "000000",
  textBody: "3F3F3F",
  textMuted: "5B5D60",
  textSubtle: "57677A",
  textLight: "FFFFFF",
  alertRed: "COLOR_3_OR_CC0000",         // ← Replace with Color 3 or use a red
  darkGreen: "COLOR_4_OR_2D6A2E",        // ← Replace with Color 4 or use a green
  cardBg: "FFFFFF",
  border: "D8D8D8",
};

// --- Helper: Fresh shadow/style factory ---
const makeShadow = () => ({
  type: "outer", blur: 4, offset: 1, angle: 135, color: palette.textDark, opacity: 0.08,
});

// --- Slide Master Definitions ---
function setupMasters(pres) {
  pres.defineSlideMaster({
    title: "LIGHT_BG",
    background: { color: palette.lightBg },
  });
}

// --- Content Slide Header Helper ---
function addSlideHeader(slide, pres, sectionNum, title, subtitle, description) {
  // Title with pipe separator
  const titleParts = [];
  titleParts.push({ text: sectionNum + ". " + title + " ", options: { bold: true, color: palette.textDark } });
  if (subtitle) {
    titleParts.push({ text: "| " + subtitle, options: { bold: false, color: palette.textDark } });
  }
  slide.addText(titleParts, {
    x: 0.6, y: 0.3, w: 12, h: 0.5,
    fontSize: 26, fontFace: "Century Gothic", valign: "bottom", margin: 0,
  });

  // Accent line
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 0.9, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1.5 },
  });

  // Description
  if (description) {
    slide.addText(description, {
      x: 0.6, y: 1.0, w: 12, h: 0.4,
      fontSize: 13, fontFace: "Century Gothic", color: palette.textBody,
      valign: "top", margin: 0,
    });
  }
}

// --- Mid-Slide Divider (accent line + sub-heading for combined slides) ---
function addMidSlideDivider(slide, pres, y, title, subtitle) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y, w: 12.13, h: 0,
    line: { color: palette.primary, width: 1 },
  });
  const parts = [];
  parts.push({ text: title + " ", options: { bold: true, color: palette.textDark } });
  if (subtitle) parts.push({ text: "| " + subtitle, options: { bold: false, color: palette.textDark } });
  slide.addText(parts, {
    x: 0.6, y: y + 0.08, w: 12, h: 0.35,
    fontSize: 16, fontFace: "Century Gothic", valign: "top", margin: 0,
  });
}

// --- Grid Layout Helper ---
function gridLayout(startX, startY, totalW, totalH, cols, rows, gap) {
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const cardH = (totalH - gap * (rows - 1)) / rows;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: startX + c * (cardW + gap),
        y: startY + r * (cardH + gap),
        w: cardW,
        h: cardH,
      });
    }
  }
  return { positions, cardW, cardH };
}

// --- Main Presentation Builder ---
async function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";  // 13.33" x 7.5" — CRITICAL
  pres.author = "Consulting Team";
  pres.title = "Presentation Title";

  setupMasters(pres);

  // === Build slides using patterns ===
  // createTitleSlide(pres, { ... });
  // createTOCSlide(pres, [ ... ]);
  // --- NO section dividers by default ---
  // Build content slides with addSlideHeader() on every slide
  // When using visual components, embed them with Strategy A/B/C/D (Pattern 12)
  // Use addMidSlideDivider() to combine two related topics on one slide

  await pres.writeFile({ fileName: "/home/claude/output.pptx" });
  console.log("Presentation saved!");
}

buildPresentation().catch(console.error);
```

---

## QA Checklist (Capco-Style Specific)

After generating the deck, verify:

- [ ] **LAYOUT_WIDE used**: Slides are 13.33" × 7.5" (not 10" × 5.625")
- [ ] **Century Gothic everywhere**: All text uses Century Gothic (or Arial as body fallback)
- [ ] **Primary accent line on every content slide**: Horizontal line at y ≈ 0.9" using palette.primary
- [ ] **Section numbers present**: All titles start with "XX." prefix
- [ ] **No dark slides**: All slides use white/light backgrounds — no dark section dividers or closing slides
- [ ] **Visual components embedded**: No visual component (pyramid, chevron, quadrant, etc.) is the sole element on a slide — always paired with context cards, info grids, or source cards
- [ ] **No text overlaps**: Cards and text boxes have proper padding
- [ ] **Color palette compliance**: Only palette colors used
- [ ] **Grid alignment**: Cards in grids are evenly spaced
- [ ] **Pipe separator format**: Sub-section titles use "TITLE | SUBTITLE" format
- [ ] **Content density**: No slide uses less than 60% of vertical space
- [ ] **No `#` in hex colors**: PptxGenJS pitfall check
- [ ] **No shared option objects**: Each addShape/addText uses fresh style objects

Follow the full Visual QA process from `/mnt/skills/public/pptx/SKILL.md`:
1. Convert to images: `soffice.py --headless --convert-to pdf` → `pdftoppm`
2. Inspect every slide image
3. Fix issues and re-verify

---

## Dependencies

```bash
# Core PPTX creation
npm install -g pptxgenjs

# Icons
npm install -g react-icons react react-dom sharp

# QA tools
pip install "markitdown[pptx]" Pillow --break-system-packages
```
