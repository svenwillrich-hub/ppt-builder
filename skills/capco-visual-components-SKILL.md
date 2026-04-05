---
name: capco-visual-components
description: "Bibliothek visuell anspruchsvoller Grafik-Komponenten für Consulting-Präsentationen im Capco-Stil. Enthält Donut-KPI-Widgets, Progress-Bars, VS-Vergleiche, Treppen-Diagramme, Pyramiden, SWOT-Layouts, Timelines, Venn-Diagramme, Pentagon-Strategien, Organigramme, Architektur-Layer-Stacks, native styled Charts und weitere parametrische Bausteine. Wird als Ergänzung zu capco-slides genutzt — jener Skill liefert das Deck-Gerüst (Farben, Fonts, Titel-Slides, Section-Divider), dieser Skill liefert die visuellen Inhalts-Komponenten. Trigger: Wenn eine Capco-Präsentation fortgeschrittene Visualisierungen braucht wie Donut-Charts, Progress-Bars, VS-Vergleiche, Treppen-/Stufen-Diagramme, Pyramiden, SWOT, Timelines, Venn-Diagramme, Quadranten-Layouts, Funnel/Ranking-Bars, Agile/Scrum-Diagramme, nummerierte Agenden, Organigramme, Hierarchie-Bäume, Technologie-Stacks, Schichtmodelle, Architekturdiagramme, oder native Balken-/Linien-/Kreis-/Donut-Charts im Capco-Stil."
---

# Capco Visual Components — Grafik-Baustein-Bibliothek

## Philosophie

Dieser Skill ist eine **Komponentenbibliothek**, kein eigenständiger Deck-Builder. Er liefert parametrische, wiederverwendbare JavaScript-Funktionen, die **innerhalb** des `capco-slides`-Workflows aufgerufen werden. Der bestehende `capco-slides`-Skill erstellt das Deck-Gerüst (Farben, Fonts, Slide-Master, Titel-Slides, Section-Divider, Content-Slide-Header), und **dieser Skill** fügt die konkreten visuellen Bausteine in die Content-Bereiche der Slides ein.

## Zusammenspiel mit capco-slides

**Workflow:**
1. Lies `/mnt/skills/user/capco-slides/SKILL.md` für das Deck-Gerüst (Palette, Typografie, Slide-Master)
2. Lies `/mnt/skills/public/pptx/pptxgenjs.md` für die PptxGenJS-API
3. Lies diese Datei für die visuellen Komponenten
4. Erstelle Slides mit `capco-slides`-Patterns (Title, Section Divider, Content-Slide-Header)
5. Füge visuelle Komponenten aus dieser Bibliothek in den Content-Bereich ein

**Typisches Code-Muster:**
```javascript
// 1. Erstelle Slide mit capco-slides Pattern
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "03", "DATA INSIGHTS", "KPI OVERVIEW", "Key performance metrics for Q3");

// 2. Füge visuelle Komponente aus dieser Bibliothek ein
addDonutKPIGrid(slide, pres, {
  x: 0.6, y: 1.5, w: 12.13, h: 5.5,
  items: [
    { value: 72, label: "COMPLETION", detail: "Project milestones achieved" },
    { value: 85, label: "SATISFACTION", detail: "Client satisfaction score" },
    { value: 45, label: "BUDGET USED", detail: "Of allocated resources" },
    { value: 93, label: "ON-TIME", detail: "Deliverables met deadline" },
  ]
});
```

## Referenz-Farbschema

Defaults aus der Graphic_forms.pptx Vorlage. Alle Funktionen akzeptieren `opts.primaryColor`, `opts.secondaryColor` etc. als Override.

```javascript
const VC_COLORS = {
  primary:      "00868C",  // Capco Teal
  primaryLight: "01B3BB",  // Lighter Teal
  dark:         "3F3F3F",  // Dark accent / text
  midGrey:      "7F7F7F",  // Mid grey
  lightTeal1:   "7CB7BA",  // Light teal variant
  lightTeal2:   "A8CFD1",  // Lighter teal
  lightTeal3:   "9DC9CB",  // Soft teal
  paleGrey:     "F2F2F2",  // Card backgrounds
  white:        "FFFFFF",
  black:        "000000",
  textBody:     "3F3F3F",
  textMuted:    "5B5D60",
  border:       "D8D8D8",
};
```

## Dependencies

```bash
npm install -g pptxgenjs
# Optional for icon-based components:
npm install -g react-icons react react-dom sharp
```

---

# Komponenten-Katalog

---

## Kategorie 1: Daten-Visualisierungen

---

### 1.1 Donut-KPI-Widget Grid

Donut-Ring mit Prozentzahl in der Mitte, darunter Label + Detail-Text. Anordnung als 2×2 oder 1×N Grid.

**Referenz-Slides:** 3, 12, 20

```javascript
/**
 * addDonutKPIGrid — Grid of Donut-Chart KPI widgets
 * @param {object} slide - PptxGenJS slide object
 * @param {object} pres - PptxGenJS presentation object
 * @param {object} opts
 * @param {number} opts.x - Left edge of grid area
 * @param {number} opts.y - Top edge of grid area
 * @param {number} opts.w - Total width of grid area
 * @param {number} opts.h - Total height of grid area
 * @param {Array} opts.items - Array of { value: 0-100, label: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"] - Filled arc color
 * @param {string} [opts.trackColor="D8D8D8"] - Unfilled arc color
 * @param {string} [opts.labelColor="000000"] - Label text color
 * @param {string} [opts.detailColor="5B5D60"] - Detail text color
 * @param {number} [opts.cols] - Override column count (auto-calculated if omitted)
 */
function addDonutKPIGrid(slide, pres, opts) {
  const items = opts.items || [];
  const n = items.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const track = opts.trackColor || "D8D8D8";
  const labelColor = opts.labelColor || "000000";
  const detailColor = opts.detailColor || "5B5D60";

  // Auto grid: 1-2 items → 1 row; 3-4 → 2×2; 5-6 → 2×3; 7-8 → 2×4
  const cols = opts.cols || (n <= 2 ? n : n <= 4 ? 2 : n <= 6 ? 3 : 4);
  const rows = Math.ceil(n / cols);
  const gap = 0.3;
  const cellW = (opts.w - gap * (cols - 1)) / cols;
  const cellH = (opts.h - gap * (rows - 1)) / rows;

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = opts.x + col * (cellW + gap);
    const cy = opts.y + row * (cellH + gap);

    // Donut chart dimensions
    const chartSize = Math.min(cellW * 0.7, cellH * 0.55);
    const chartX = cx + (cellW - chartSize) / 2;
    const chartY = cy + 0.1;

    // PptxGenJS Doughnut chart
    const val = Math.max(0, Math.min(100, item.value));
    slide.addChart(pres.charts.DOUGHNUT, [{
      name: "KPI",
      labels: ["Filled", "Remaining"],
      values: [val, 100 - val],
    }], {
      x: chartX, y: chartY, w: chartSize, h: chartSize,
      showLegend: false,
      showTitle: false,
      showValue: false,
      showPercent: false,
      showCatName: false,
      showSerName: false,
      chartColors: [primary, track],
      dataNoEffects: true,
      holeSize: 70,
    });

    // Big number in center of donut
    slide.addText(val + "%", {
      x: chartX, y: chartY, w: chartSize, h: chartSize,
      fontSize: Math.max(18, Math.min(28, chartSize * 14)),
      fontFace: "Century Gothic", color: primary,
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Label below donut
    const labelY = chartY + chartSize + 0.1;
    slide.addText(item.label || "", {
      x: cx + 0.1, y: labelY, w: cellW - 0.2, h: 0.35,
      fontSize: 10, fontFace: "Century Gothic", color: labelColor,
      bold: true, align: "center", valign: "top", margin: 0,
    });

    // Detail text
    if (item.detail) {
      slide.addText(item.detail, {
        x: cx + 0.1, y: labelY + 0.35, w: cellW - 0.2, h: 0.5,
        fontSize: 8, fontFace: "Century Gothic", color: detailColor,
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 1.2 Horizontale Progress-Bars mit Prozentanzeige

5 (oder variable Anzahl) horizontale Balken übereinander mit Teal-Füllung, grauem Track und Prozentwert rechts.

**Referenz-Slide:** 3

```javascript
/**
 * addProgressBars — Horizontal progress bars with percentage display
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x - Left edge
 * @param {number} opts.y - Top edge
 * @param {number} opts.w - Total width
 * @param {number} opts.h - Total height
 * @param {Array} opts.items - Array of { label: string, value: 0-100, detail?: string }
 * @param {string} [opts.primaryColor="00868C"]
 * @param {string} [opts.trackColor="D8D8D8"]
 * @param {number} [opts.barHeight=0.28] - Height of each bar in inches
 */
function addProgressBars(slide, pres, opts) {
  const items = opts.items || [];
  const n = items.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const trackColor = opts.trackColor || "D8D8D8";
  const barH = opts.barHeight || 0.28;
  const labelW = opts.w * 0.3;   // 30% for label area
  const percentW = 0.6;          // fixed width for percentage text
  const barW = opts.w - labelW - percentW - 0.2;
  const rowH = opts.h / n;

  items.forEach((item, i) => {
    const rowY = opts.y + i * rowH;
    const barY = rowY + (rowH - barH) / 2;

    // Label (left)
    slide.addText(item.label || "", {
      x: opts.x, y: rowY, w: labelW, h: rowH * 0.5,
      fontSize: 10, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "bottom", margin: 0,
    });

    // Detail text (below label)
    if (item.detail) {
      slide.addText(item.detail, {
        x: opts.x, y: rowY + rowH * 0.5, w: labelW, h: rowH * 0.45,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        valign: "top", margin: 0,
      });
    }

    // Track (background bar)
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: opts.x + labelW + 0.1, y: barY, w: barW, h: barH,
      fill: { color: trackColor }, rectRadius: barH / 2,
    });

    // Filled bar (proportional to value)
    const val = Math.max(0, Math.min(100, item.value));
    const fillW = Math.max(barH, barW * (val / 100)); // min width = radius
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: opts.x + labelW + 0.1, y: barY, w: fillW, h: barH,
      fill: { color: primary }, rectRadius: barH / 2,
    });

    // Percentage value (right)
    slide.addText(val + "%", {
      x: opts.x + opts.w - percentW, y: barY - 0.05, w: percentW, h: barH + 0.1,
      fontSize: 12, fontFace: "Century Gothic", color: primary,
      bold: true, align: "right", valign: "middle", margin: 0,
    });
  });
}
```

---

### 1.3 VS-Vergleich mit gespiegelten Balken

Mittig "VS", links Option 01 Balken, rechts Option 02 Balken, dazwischen Aspect-Labels.

**Referenz-Slide:** 21

```javascript
/**
 * addVSComparison — Mirrored bar comparison with central VS label
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x - Left edge
 * @param {number} opts.y - Top edge
 * @param {number} opts.w - Total width
 * @param {number} opts.h - Total height
 * @param {string} opts.leftLabel - "Option 01"
 * @param {string} opts.rightLabel - "Option 02"
 * @param {Array} opts.aspects - Array of { name: string, leftValue: 0-100, rightValue: 0-100 }
 * @param {string} [opts.leftColor="00868C"]
 * @param {string} [opts.rightColor="7F7F7F"]
 */
function addVSComparison(slide, pres, opts) {
  const aspects = opts.aspects || [];
  const n = aspects.length;
  if (n === 0) return;

  const leftColor = opts.leftColor || "00868C";
  const rightColor = opts.rightColor || "7F7F7F";
  const centerW = 1.4;  // width for VS + aspect labels
  const halfW = (opts.w - centerW) / 2;
  const centerX = opts.x + halfW;

  // VS circle in the center-top
  const vsY = opts.y;
  const vsCX = centerX + centerW / 2;
  slide.addShape(pres.shapes.OVAL, {
    x: vsCX - 0.5, y: vsY, w: 1.0, h: 1.0,
    fill: { color: "000000" },
  });
  slide.addText("VS", {
    x: vsCX - 0.5, y: vsY, w: 1.0, h: 1.0,
    fontSize: 22, fontFace: "Century Gothic", color: "FFFFFF",
    bold: true, align: "center", valign: "middle", margin: 0,
  });

  // Option labels
  slide.addText(opts.leftLabel || "Option 01", {
    x: opts.x, y: vsY + 0.15, w: halfW - 0.3, h: 0.7,
    fontSize: 16, fontFace: "Century Gothic", color: leftColor,
    bold: true, align: "right", valign: "middle", margin: 0,
  });
  slide.addText(opts.rightLabel || "Option 02", {
    x: centerX + centerW + 0.3, y: vsY + 0.15, w: halfW - 0.3, h: 0.7,
    fontSize: 16, fontFace: "Century Gothic", color: rightColor,
    bold: true, align: "left", valign: "middle", margin: 0,
  });

  // Aspect rows
  const rowStartY = opts.y + 1.3;
  const rowH = (opts.h - 1.3) / n;
  const barH = Math.min(0.35, rowH * 0.5);
  const maxBarW = halfW - 0.4;

  aspects.forEach((asp, i) => {
    const ry = rowStartY + i * rowH;
    const barY = ry + (rowH - barH) / 2;

    // Aspect label (center black box)
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: centerX + 0.05, y: ry + (rowH - 0.35) / 2,
      w: centerW - 0.1, h: 0.35,
      fill: { color: "000000" }, rectRadius: 0.04,
    });
    slide.addText(asp.name || "", {
      x: centerX + 0.05, y: ry + (rowH - 0.35) / 2,
      w: centerW - 0.1, h: 0.35,
      fontSize: 8, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Left bar (grows from center to left)
    const lVal = Math.max(0, Math.min(100, asp.leftValue));
    const lBarW = Math.max(0.15, maxBarW * (lVal / 100));
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: centerX - lBarW - 0.05, y: barY, w: lBarW, h: barH,
      fill: { color: leftColor }, rectRadius: barH / 2,
    });
    // Left percentage circle
    slide.addShape(pres.shapes.OVAL, {
      x: centerX - lBarW - 0.05 - 0.45, y: barY - 0.05, w: 0.45, h: barH + 0.1,
      fill: { color: leftColor },
    });
    slide.addText(lVal + "%", {
      x: centerX - lBarW - 0.05 - 0.45, y: barY - 0.05, w: 0.45, h: barH + 0.1,
      fontSize: 7, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Right bar (grows from center to right)
    const rVal = Math.max(0, Math.min(100, asp.rightValue));
    const rBarW = Math.max(0.15, maxBarW * (rVal / 100));
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: centerX + centerW + 0.05, y: barY, w: rBarW, h: barH,
      fill: { color: rightColor }, rectRadius: barH / 2,
    });
    // Right percentage circle
    slide.addShape(pres.shapes.OVAL, {
      x: centerX + centerW + 0.05 + rBarW, y: barY - 0.05, w: 0.45, h: barH + 0.1,
      fill: { color: rightColor },
    });
    slide.addText(rVal + "%", {
      x: centerX + centerW + 0.05 + rBarW, y: barY - 0.05, w: 0.45, h: barH + 0.1,
      fontSize: 7, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });
  });
}
```

---

### 1.4 Große Zahlen-Callouts mit Detail-Grid

3 große Dollar/Euro-Beträge in farbig codierten Spalten mit Kategorie-Tags und Detail-Zeilen darunter.

**Referenz-Slide:** 11

```javascript
/**
 * addBigNumberCallouts — Large currency/number callouts with detail grid
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.items - Array of { value: "$87,000", label: "Budget", details: ["Row 1", "Row 2", ...] }
 * @param {Array} [opts.colors] - Array of fill colors per column; defaults to [primary, dark, midGrey]
 */
function addBigNumberCallouts(slide, pres, opts) {
  const items = opts.items || [];
  const n = items.length;
  if (n === 0) return;

  const defaultColors = ["00868C", "3F3F3F", "7F7F7F", "01B3BB", "5B5D60"];
  const colors = opts.colors || defaultColors.slice(0, n);
  const gap = 0.25;
  const colW = (opts.w - gap * (n - 1)) / n;
  const tagH = 0.35;
  const numberH = 0.9;
  const detailStartY = opts.y + tagH + 0.1 + numberH + 0.2;
  const detailH = opts.h - tagH - 0.1 - numberH - 0.2;

  items.forEach((item, i) => {
    const cx = opts.x + i * (colW + gap);
    const col = colors[i % colors.length];

    // Category tag (colored rounded rect)
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: cx + colW * 0.15, y: opts.y, w: colW * 0.7, h: tagH,
      fill: { color: col }, rectRadius: 0.04,
    });
    slide.addText(item.label || "", {
      x: cx + colW * 0.15, y: opts.y, w: colW * 0.7, h: tagH,
      fontSize: 9, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Big number
    slide.addText(item.value || "", {
      x: cx, y: opts.y + tagH + 0.1, w: colW, h: numberH,
      fontSize: 32, fontFace: "Century Gothic", color: col,
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Detail rows
    const details = item.details || [];
    const detailRowH = details.length > 0 ? detailH / details.length : detailH;
    details.forEach((d, di) => {
      const dy = detailStartY + di * detailRowH;
      // Alternating background
      if (di % 2 === 0) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: cx, y: dy, w: colW, h: detailRowH,
          fill: { color: "F2F2F2" },
        });
      }
      slide.addText(d, {
        x: cx + 0.1, y: dy, w: colW - 0.2, h: detailRowH,
        fontSize: 8, fontFace: "Century Gothic", color: "3F3F3F",
        valign: "middle", margin: 0,
      });
    });
  });
}
```

---

### 1.5 Audit/Status-Dashboard (Multi-Chart Composite)

4 Chart-Bereiche auf einer Slide: Donut, Stacked-Bar, Pie, Donut — jeweils mit Titel und Legende.

**Referenz-Slide:** 25

```javascript
/**
 * addAuditDashboard — 4-panel multi-chart composite dashboard
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.panels - Array of 4 objects:
 *   { title: string, type: "doughnut"|"pie"|"bar", labels: [...], values: [...], colors: [...] }
 */
function addAuditDashboard(slide, pres, opts) {
  const panels = opts.panels || [];
  const gap = 0.3;
  const cols = 2, rows = 2;
  const cellW = (opts.w - gap) / cols;
  const cellH = (opts.h - gap) / rows;

  panels.slice(0, 4).forEach((panel, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = opts.x + col * (cellW + gap);
    const py = opts.y + row * (cellH + gap);

    // Panel border
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: py, w: cellW, h: cellH,
      fill: { color: "FFFFFF" },
      line: { color: "D8D8D8", width: 0.75 },
    });

    // Panel title
    slide.addText(panel.title || "", {
      x: px + 0.1, y: py + 0.05, w: cellW - 0.2, h: 0.3,
      fontSize: 9, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "middle", margin: 0,
    });

    // Chart
    const chartType = panel.type === "bar" ? pres.charts.BAR
                    : panel.type === "pie" ? pres.charts.PIE
                    : pres.charts.DOUGHNUT;
    const chartOpts = {
      x: px + 0.1, y: py + 0.4, w: cellW - 0.2, h: cellH - 0.55,
      showLegend: true, legendPos: "b", legendFontSize: 7,
      showTitle: false,
      chartColors: panel.colors || ["00868C", "01B3BB", "7CB7BA", "D8D8D8", "3F3F3F"],
      holeSize: panel.type === "bar" ? undefined : 65,
      showPercent: panel.type !== "bar",
      showValue: panel.type === "bar",
      dataLabelPosition: "outEnd",
      dataLabelFontSize: 7,
    };

    if (panel.type === "bar") {
      chartOpts.barDir = "col";
      chartOpts.catGridLine = { style: "none" };
      chartOpts.valGridLine = { color: "E2E8F0", size: 0.5 };
      delete chartOpts.holeSize;
      delete chartOpts.showPercent;
    }

    slide.addChart(chartType, [{
      name: panel.title || "Data",
      labels: panel.labels || [],
      values: panel.values || [],
    }], chartOpts);
  });
}
```

---

## Kategorie 2: Prozess & Flow-Diagramme

---

### 2.1 Treppen-/Stufen-Diagramm (Ascending Steps)

5 aufsteigende Stufen als Arrow-Shapes, jede Stufe leicht höher positioniert.

**Referenz-Slide:** 26

```javascript
/**
 * addStairSteps — Ascending step diagram with arrows
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.steps - Array of { label: string, milestone: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 * @param {string} [opts.secondaryColor="3F3F3F"]
 */
function addStairSteps(slide, pres, opts) {
  const steps = opts.steps || [];
  const n = steps.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const secondary = opts.secondaryColor || "3F3F3F";
  const stepW = (opts.w - 0.3) / n;
  const maxStepH = opts.h * 0.35;
  const minStepH = opts.h * 0.18;
  const baseY = opts.y + opts.h * 0.55;  // bottom of arrow area

  steps.forEach((step, i) => {
    const sx = opts.x + i * stepW + i * (0.3 / (n - 1 || 1));
    const stepH = minStepH + (maxStepH - minStepH) * (i / (n - 1 || 1));
    const sy = baseY - stepH;
    const color = i % 2 === 0 ? primary : secondary;

    // Arrow shape (using CHEVRON for connected look)
    slide.addShape(pres.shapes.CHEVRON, {
      x: sx, y: sy, w: stepW, h: stepH,
      fill: { color: color },
    });

    // Step label inside arrow
    slide.addText("STEP " + (i + 1), {
      x: sx + 0.15, y: sy + 0.05, w: stepW - 0.3, h: stepH * 0.4,
      fontSize: 8, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });
    slide.addText(step.label || "", {
      x: sx + 0.15, y: sy + stepH * 0.4, w: stepW - 0.3, h: stepH * 0.55,
      fontSize: 7, fontFace: "Century Gothic", color: "FFFFFF",
      align: "center", valign: "top", margin: 0,
    });

    // Milestone + detail below arrow
    const detailY = baseY + 0.15;
    slide.addText(step.milestone || "", {
      x: sx, y: detailY, w: stepW, h: 0.3,
      fontSize: 9, fontFace: "Century Gothic", color: "000000",
      bold: true, align: "center", valign: "top", margin: 0,
    });
    if (step.detail) {
      slide.addText(step.detail, {
        x: sx, y: detailY + 0.3, w: stepW, h: 0.6,
        fontSize: 7, fontFace: "Century Gothic", color: "5B5D60",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 2.5 Nummerierte Agenda (2-Spalten)

8 Agenda-Punkte in 2 Spalten (01-04 links, 05-08 rechts) mit großer Nummer, Titel und Detail.

**Referenz-Slide:** 5

```javascript
/**
 * addNumberedAgenda — Two-column numbered agenda
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.items - Array of { title: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 */
function addNumberedAgenda(slide, pres, opts) {
  const items = opts.items || [];
  const n = items.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const cols = 2;
  const perCol = Math.ceil(n / cols);
  const colW = (opts.w - 0.5) / cols;
  const rowH = opts.h / perCol;
  const numW = 0.65;

  items.forEach((item, i) => {
    const colIdx = i < perCol ? 0 : 1;
    const rowIdx = colIdx === 0 ? i : i - perCol;
    const ix = opts.x + colIdx * (colW + 0.5);
    const iy = opts.y + rowIdx * rowH;

    // Large number
    const numStr = String(i + 1).padStart(2, "0") + ".";
    slide.addText(numStr, {
      x: ix, y: iy, w: numW, h: rowH * 0.9,
      fontSize: 22, fontFace: "Century Gothic", color: primary,
      bold: true, valign: "top", margin: 0,
    });

    // Title
    slide.addText(item.title || "", {
      x: ix + numW + 0.05, y: iy, w: colW - numW - 0.05, h: 0.35,
      fontSize: 11, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "top", margin: 0,
    });

    // Detail
    if (item.detail) {
      slide.addText(item.detail, {
        x: ix + numW + 0.05, y: iy + 0.35, w: colW - numW - 0.05, h: rowH * 0.9 - 0.4,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        valign: "top", margin: 0,
      });
    }

    // Separator line (except last in each column)
    if (rowIdx < perCol - 1 && i < n - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: ix, y: iy + rowH - 0.05, w: colW, h: 0,
        line: { color: "D8D8D8", width: 0.5 },
      });
    }
  });
}
```

---

### 2.6 Chevron-Prozess-Kette mit Details

5 Chevron/homePlate-Shapes horizontal verbunden, Teal/Grau alternierend, mit Details darunter.

**Referenz-Slide:** 8

```javascript
/**
 * addChevronProcess — Horizontal chevron process chain with detail rows
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.steps - Array of { title: string, details: [string, string, string] }
 * @param {string} [opts.primaryColor="00868C"]
 * @param {string} [opts.secondaryColor="3F3F3F"]
 * @param {string} [opts.additionalDetails] - Text for bottom row
 */
function addChevronProcess(slide, pres, opts) {
  const steps = opts.steps || [];
  const n = steps.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const secondary = opts.secondaryColor || "3F3F3F";
  const chevronH = 0.65;
  const chevGap = 0.04;
  const chevW = (opts.w - chevGap * (n - 1)) / n;
  const detailAreaH = opts.h - chevronH - 0.2;

  steps.forEach((step, i) => {
    const sx = opts.x + i * (chevW + chevGap);
    const color = i % 2 === 0 ? primary : secondary;

    // Chevron shape
    slide.addShape(pres.shapes.CHEVRON, {
      x: sx, y: opts.y, w: chevW, h: chevronH,
      fill: { color: color },
    });

    // Title inside chevron
    slide.addText(step.title || "", {
      x: sx + chevW * 0.15, y: opts.y, w: chevW * 0.7, h: chevronH,
      fontSize: 8, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Detail rows below
    const details = step.details || [];
    const detailRowH = details.length > 0 ? detailAreaH / details.length : detailAreaH;
    details.forEach((d, di) => {
      const dy = opts.y + chevronH + 0.2 + di * detailRowH;
      slide.addText(d, {
        x: sx + 0.05, y: dy, w: chevW - 0.1, h: detailRowH,
        fontSize: 7, fontFace: "Century Gothic", color: "3F3F3F",
        valign: "top", margin: 0,
      });
    });
  });

  // Additional details bar at bottom
  if (opts.additionalDetails) {
    const adY = opts.y + opts.h - 0.35;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: opts.x, y: adY, w: opts.w, h: 0.3,
      fill: { color: "F2F2F2" },
    });
    slide.addText(opts.additionalDetails, {
      x: opts.x + 0.1, y: adY, w: opts.w - 0.2, h: 0.3,
      fontSize: 8, fontFace: "Century Gothic", color: "3F3F3F",
      valign: "middle", margin: 0,
    });
  }
}
```

---

### 2.2 Agile-Halbkreis mit nummerierten Schritten

Halbbogen links mit Knotenpunkten, rechts 5 nummerierte Schritte.

**Referenz-Slide:** 7

```javascript
/**
 * addAgileArc — Semi-circle arc with numbered steps
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.steps - Array of { title: string, detail: string }
 * @param {string} [opts.arcLabel="Agile\nMethods"]
 * @param {string} [opts.primaryColor="00868C"]
 */
function addAgileArc(slide, pres, opts) {
  const steps = opts.steps || [];
  const n = steps.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const arcAreaW = opts.w * 0.35;
  const stepsAreaX = opts.x + arcAreaW + 0.2;
  const stepsAreaW = opts.w - arcAreaW - 0.2;

  // Draw arc using a large oval (only the left half is visible via positioning)
  const arcCX = opts.x + arcAreaW * 0.6;
  const arcCY = opts.y + opts.h * 0.5;
  const arcR = Math.min(arcAreaW * 0.9, opts.h * 0.45);

  // Semi-circle as a large oval with half clipped (using transparency trick)
  // We draw individual dots on the arc path + connecting lines
  for (let i = 0; i < n; i++) {
    const angle = Math.PI * 0.15 + (Math.PI * 0.7 / (n - 1)) * i;
    const dotX = arcCX - Math.cos(angle) * arcR;
    const dotY = arcCY - Math.sin(angle) * arcR + arcR * 0.5;
    const dotSize = 0.3;
    const color = i % 2 === 0 ? primary : "7F7F7F";

    // Dot on arc
    slide.addShape(pres.shapes.OVAL, {
      x: dotX - dotSize / 2, y: dotY - dotSize / 2, w: dotSize, h: dotSize,
      fill: { color: color },
    });

    // Connecting line from dot to step row
    const stepY = opts.y + (opts.h / n) * i + (opts.h / n) * 0.5;
    slide.addShape(pres.shapes.LINE, {
      x: dotX + dotSize / 2, y: dotY,
      w: stepsAreaX - dotX - dotSize / 2, h: stepY - dotY,
      line: { color: "D8D8D8", width: 0.5, dashType: "dash" },
    });
  }

  // Arc label
  slide.addText(opts.arcLabel || "Agile\nMethods", {
    x: opts.x, y: arcCY - 0.3, w: arcAreaW * 0.5, h: 0.6,
    fontSize: 11, fontFace: "Century Gothic", color: primary,
    bold: true, align: "center", valign: "middle", margin: 0,
  });

  // Numbered steps on the right
  const stepRowH = opts.h / n;
  steps.forEach((step, i) => {
    const sy = opts.y + i * stepRowH;
    const color = i % 2 === 0 ? primary : "7F7F7F";
    const circleSize = 0.38;

    // Number circle
    slide.addShape(pres.shapes.OVAL, {
      x: stepsAreaX, y: sy + (stepRowH - circleSize) / 2, w: circleSize, h: circleSize,
      fill: { color: color },
    });
    slide.addText(String(i + 1), {
      x: stepsAreaX, y: sy + (stepRowH - circleSize) / 2, w: circleSize, h: circleSize,
      fontSize: 12, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Title
    slide.addText(step.title || "", {
      x: stepsAreaX + circleSize + 0.15, y: sy + 0.05, w: stepsAreaW - circleSize - 0.3, h: stepRowH * 0.45,
      fontSize: 10, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "bottom", margin: 0,
    });

    // Detail
    if (step.detail) {
      slide.addText(step.detail, {
        x: stepsAreaX + circleSize + 0.15, y: sy + stepRowH * 0.5, w: stepsAreaW - circleSize - 0.3, h: stepRowH * 0.45,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        valign: "top", margin: 0,
      });
    }
  });
}
```

---

## Kategorie 3: Strukturelle Diagramme

---

### 3.1 Pyramide/Dreieck-Diagramm

Dreieck mit überlagerten horizontalen Schichten, Beschreibungstext rechts.

**Referenz-Slides:** 35, 54

```javascript
/**
 * addPyramid — Layered pyramid/triangle diagram
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.layers - Array of { label: string, detail: string } (top to bottom)
 * @param {string} [opts.primaryColor="00868C"]
 */
function addPyramid(slide, pres, opts) {
  const layers = opts.layers || [];
  const n = layers.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const pyramidW = opts.w * 0.45;
  const pyramidH = opts.h;
  const pyramidX = opts.x;
  const detailX = opts.x + pyramidW + 0.4;
  const detailW = opts.w - pyramidW - 0.4;
  const layerH = pyramidH / n;

  // Color gradient: darker at top, lighter at bottom
  const colorSteps = [
    primary,
    "01B3BB",
    "7CB7BA",
    "A8CFD1",
    "9DC9CB",
    "D8D8D8",
  ];

  layers.forEach((layer, i) => {
    const ly = opts.y + i * layerH;
    const color = colorSteps[i % colorSteps.length];

    // Each layer: a trapezoid approximated as a rectangle with proportional width
    // Top layer is narrow, bottom is wide
    const topWidthRatio = (i + 0.5) / n;
    const bottomWidthRatio = (i + 1.5) / n;
    const avgWidth = pyramidW * ((topWidthRatio + bottomWidthRatio) / 2);
    const lx = pyramidX + (pyramidW - avgWidth) / 2;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: lx, y: ly + 0.02, w: avgWidth, h: layerH - 0.04,
      fill: { color: color },
    });

    // Layer label inside
    slide.addText(layer.label || "", {
      x: lx + 0.1, y: ly + 0.02, w: avgWidth - 0.2, h: layerH - 0.04,
      fontSize: 9, fontFace: "Century Gothic", color: i < 2 ? "FFFFFF" : "000000",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Connector line to detail
    slide.addShape(pres.shapes.LINE, {
      x: lx + avgWidth, y: ly + layerH / 2,
      w: detailX - (lx + avgWidth), h: 0,
      line: { color: "D8D8D8", width: 0.5, dashType: "dash" },
    });

    // Detail text on the right
    if (layer.detail) {
      slide.addText(layer.detail, {
        x: detailX, y: ly, w: detailW, h: layerH,
        fontSize: 9, fontFace: "Century Gothic", color: "3F3F3F",
        valign: "middle", margin: 0,
      });
    }
  });
}
```

---

### 3.2 SWOT-Analyse Layout

4 Reihen mit Icon-Kreis, Buchstabe, und Beschreibungstext.

**Referenz-Slide:** 40

```javascript
/**
 * addSWOT — SWOT analysis layout with icon circles
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {object} opts.strengths  - { text: string }
 * @param {object} opts.weaknesses - { text: string }
 * @param {object} opts.opportunities - { text: string }
 * @param {object} opts.threats    - { text: string }
 * @param {string} [opts.primaryColor="00868C"]
 * @param {object} [opts.icons] - { s: base64, w: base64, o: base64, t: base64 } icon data
 */
function addSWOT(slide, pres, opts) {
  const primary = opts.primaryColor || "00868C";
  const items = [
    { letter: "S", label: "STRENGTHS", text: opts.strengths?.text || "", color: primary },
    { letter: "W", label: "WEAKNESSES", text: opts.weaknesses?.text || "", color: "3F3F3F" },
    { letter: "O", label: "OPPORTUNITIES", text: opts.opportunities?.text || "", color: "01B3BB" },
    { letter: "T", label: "THREATS", text: opts.threats?.text || "", color: "7F7F7F" },
  ];

  const rowH = opts.h / 4;
  const circleSize = Math.min(0.7, rowH * 0.8);
  const letterW = 0.5;
  const labelW = 1.8;

  items.forEach((item, i) => {
    const ry = opts.y + i * rowH;

    // Icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: opts.x, y: ry + (rowH - circleSize) / 2, w: circleSize, h: circleSize,
      fill: { color: item.color },
    });

    // Icon image inside circle (if provided)
    if (opts.icons && opts.icons[item.letter.toLowerCase()]) {
      slide.addImage({
        data: opts.icons[item.letter.toLowerCase()],
        x: opts.x + circleSize * 0.2,
        y: ry + (rowH - circleSize) / 2 + circleSize * 0.2,
        w: circleSize * 0.6, h: circleSize * 0.6,
      });
    } else {
      // Fallback: letter inside circle
      slide.addText(item.letter, {
        x: opts.x, y: ry + (rowH - circleSize) / 2, w: circleSize, h: circleSize,
        fontSize: 22, fontFace: "Century Gothic", color: "FFFFFF",
        bold: true, align: "center", valign: "middle", margin: 0,
      });
    }

    // Label
    slide.addText(item.label, {
      x: opts.x + circleSize + 0.2, y: ry + 0.05, w: labelW, h: rowH * 0.45,
      fontSize: 12, fontFace: "Century Gothic", color: item.color,
      bold: true, valign: "bottom", margin: 0,
    });

    // Description text
    slide.addText(item.text, {
      x: opts.x + circleSize + 0.2 + labelW + 0.15, y: ry + 0.05,
      w: opts.w - circleSize - 0.2 - labelW - 0.15, h: rowH - 0.1,
      fontSize: 9, fontFace: "Century Gothic", color: "3F3F3F",
      valign: "middle", margin: 0,
    });

    // Separator
    if (i < 3) {
      slide.addShape(pres.shapes.LINE, {
        x: opts.x, y: ry + rowH, w: opts.w, h: 0,
        line: { color: "D8D8D8", width: 0.5 },
      });
    }
  });
}
```

---

### 3.4 Venn/Überlappende Kreise

3 gestaffelt überlappende Kreise mit Labels und Detail-Text.

**Referenz-Slide:** 42

```javascript
/**
 * addVennDiagram — 3 overlapping circles with labels
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.circles - Array of 3: { label: string, detail: string }
 * @param {string} [opts.centerLabel] - Label for the overlap area
 */
function addVennDiagram(slide, pres, opts) {
  const circles = opts.circles || [];
  const colors = [
    { fill: "00868C", transparency: 30 },
    { fill: "01B3BB", transparency: 30 },
    { fill: "3F3F3F", transparency: 30 },
  ];

  const centerCX = opts.x + opts.w / 2;
  const centerCY = opts.y + opts.h * 0.45;
  const radius = Math.min(opts.w * 0.25, opts.h * 0.35);
  const spread = radius * 0.65;  // how far apart the circles are

  // 3 circles arranged in a triangle
  const positions = [
    { cx: centerCX, cy: centerCY - spread * 0.6 },             // top
    { cx: centerCX - spread * 0.9, cy: centerCY + spread * 0.5 }, // bottom-left
    { cx: centerCX + spread * 0.9, cy: centerCY + spread * 0.5 }, // bottom-right
  ];

  // Draw circles (back to front for overlap visibility)
  positions.forEach((pos, i) => {
    if (i >= circles.length) return;
    const c = colors[i % colors.length];
    slide.addShape(pres.shapes.OVAL, {
      x: pos.cx - radius, y: pos.cy - radius, w: radius * 2, h: radius * 2,
      fill: { color: c.fill, transparency: c.transparency },
      line: { color: c.fill, width: 1.5 },
    });

    // Label inside circle (offset away from center)
    const labelOffsetX = (pos.cx - centerCX) * 0.5;
    const labelOffsetY = (pos.cy - centerCY) * 0.5;
    slide.addText(circles[i].label || String.fromCharCode(65 + i), {
      x: pos.cx + labelOffsetX - 0.6, y: pos.cy + labelOffsetY - 0.25,
      w: 1.2, h: 0.5,
      fontSize: 14, fontFace: "Century Gothic", color: i < 2 ? "FFFFFF" : "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });
  });

  // Center overlap label
  if (opts.centerLabel) {
    slide.addText(opts.centerLabel, {
      x: centerCX - 0.5, y: centerCY - 0.2, w: 1.0, h: 0.4,
      fontSize: 8, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });
  }

  // Detail texts below or beside
  const detailY = opts.y + opts.h * 0.8;
  const detailColW = opts.w / Math.min(circles.length, 3);
  circles.forEach((c, i) => {
    if (c.detail) {
      slide.addText(c.detail, {
        x: opts.x + i * detailColW, y: detailY, w: detailColW, h: opts.h * 0.2,
        fontSize: 8, fontFace: "Century Gothic", color: "3F3F3F",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 3.5 Pentagon/5-Faktor Strategie-Diagramm

5 Kreise in Halbkreis-Anordnung mit Verbindungslinien und Details.

**Referenz-Slide:** 24

```javascript
/**
 * addPentagonStrategy — 5 circles in semi-circle arrangement
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.factors - Array of { label: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 */
function addPentagonStrategy(slide, pres, opts) {
  const factors = opts.factors || [];
  const n = factors.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const colors = [primary, "01B3BB", "3F3F3F", "7CB7BA", "7F7F7F"];
  const centerCX = opts.x + opts.w / 2;
  const centerCY = opts.y + opts.h * 0.35;
  const arcRadius = Math.min(opts.w * 0.38, opts.h * 0.3);
  const circleSize = 0.7;

  // Calculate positions on a semi-circle (top)
  const positions = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.PI + (Math.PI / (n - 1 || 1)) * i;  // from left to right
    positions.push({
      cx: centerCX + Math.cos(angle) * arcRadius,
      cy: centerCY + Math.sin(angle) * arcRadius,
    });
  }

  // Draw connecting lines between all circles
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      slide.addShape(pres.shapes.LINE, {
        x: positions[i].cx, y: positions[i].cy,
        w: positions[j].cx - positions[i].cx,
        h: positions[j].cy - positions[i].cy,
        line: { color: "D8D8D8", width: 0.75 },
      });
    }
  }

  // Draw circles and labels
  positions.forEach((pos, i) => {
    if (i >= factors.length) return;
    const color = colors[i % colors.length];

    slide.addShape(pres.shapes.OVAL, {
      x: pos.cx - circleSize / 2, y: pos.cy - circleSize / 2,
      w: circleSize, h: circleSize,
      fill: { color: color },
    });
    slide.addText(factors[i].label || "", {
      x: pos.cx - circleSize / 2, y: pos.cy - circleSize / 2,
      w: circleSize, h: circleSize,
      fontSize: 7, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Detail text below circle
    if (factors[i].detail) {
      const detailY = pos.cy + circleSize / 2 + 0.1;
      slide.addText(factors[i].detail, {
        x: pos.cx - 1.0, y: detailY, w: 2.0, h: 0.8,
        fontSize: 7, fontFace: "Century Gothic", color: "5B5D60",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 3.7 Projekt-Dimensions-Pentagon

5 verbundene Buchstaben-Kreise: T, S, R, Q, E mit "Project" in der Mitte.

**Referenz-Slide:** 32

```javascript
/**
 * addProjectPentagon — 5 connected letter-circles with center label
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.dimensions - Array of 5: { letter: "T", label: "Time", detail: string }
 * @param {string} [opts.centerLabel="Project"]
 * @param {string} [opts.primaryColor="00868C"]
 */
function addProjectPentagon(slide, pres, opts) {
  const dims = opts.dimensions || [];
  const n = dims.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const colors = [primary, "01B3BB", "3F3F3F", "7CB7BA", "7F7F7F"];
  const centerCX = opts.x + opts.w / 2;
  const centerCY = opts.y + opts.h / 2;
  const radius = Math.min(opts.w, opts.h) * 0.33;
  const circleSize = 0.65;

  // Pentagon positions
  const positions = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI / n) * i;
    positions.push({
      cx: centerCX + Math.cos(angle) * radius,
      cy: centerCY + Math.sin(angle) * radius,
    });
  }

  // Connecting lines
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      slide.addShape(pres.shapes.LINE, {
        x: positions[i].cx, y: positions[i].cy,
        w: positions[j].cx - positions[i].cx,
        h: positions[j].cy - positions[i].cy,
        line: { color: "D8D8D8", width: 0.75 },
      });
    }
  }

  // Center label
  slide.addShape(pres.shapes.OVAL, {
    x: centerCX - 0.5, y: centerCY - 0.35, w: 1.0, h: 0.7,
    fill: { color: "F2F2F2" },
    line: { color: primary, width: 1.5 },
  });
  slide.addText(opts.centerLabel || "Project", {
    x: centerCX - 0.5, y: centerCY - 0.35, w: 1.0, h: 0.7,
    fontSize: 10, fontFace: "Century Gothic", color: primary,
    bold: true, align: "center", valign: "middle", margin: 0,
  });

  // Dimension circles with letters
  positions.forEach((pos, i) => {
    if (i >= dims.length) return;
    const color = colors[i % colors.length];
    const dim = dims[i];

    slide.addShape(pres.shapes.OVAL, {
      x: pos.cx - circleSize / 2, y: pos.cy - circleSize / 2,
      w: circleSize, h: circleSize,
      fill: { color: color },
    });
    slide.addText(dim.letter || "", {
      x: pos.cx - circleSize / 2, y: pos.cy - circleSize / 2,
      w: circleSize, h: circleSize,
      fontSize: 18, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Label + detail outside the circle
    const dirX = pos.cx - centerCX;
    const dirY = pos.cy - centerCY;
    const labelDist = circleSize / 2 + 0.1;
    const norm = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const lx = pos.cx + (dirX / norm) * labelDist;
    const ly = pos.cy + (dirY / norm) * labelDist;

    const alignH = dirX > 0.1 ? "left" : dirX < -0.1 ? "right" : "center";
    const textX = alignH === "left" ? lx : alignH === "right" ? lx - 1.4 : lx - 0.7;

    slide.addText(dim.label || "", {
      x: textX, y: ly - 0.15, w: 1.4, h: 0.3,
      fontSize: 9, fontFace: "Century Gothic", color: "000000",
      bold: true, align: alignH, valign: "middle", margin: 0,
    });
    if (dim.detail) {
      slide.addText(dim.detail, {
        x: textX, y: ly + 0.15, w: 1.4, h: 0.5,
        fontSize: 7, fontFace: "Century Gothic", color: "5B5D60",
        align: alignH, valign: "top", margin: 0,
      });
    }
  });
}
```

---

## Kategorie 4: Timeline-Varianten

---

### 4.1 Horizontale Timeline mit Kreis-Markern

Horizontale Linie mit Jahres-Kreisen und Details unterhalb.

**Referenz-Slides:** 28, 29

```javascript
/**
 * addHorizontalTimeline — Timeline with circle markers and details
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.events - Array of { year: "2020", title: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 */
function addHorizontalTimeline(slide, pres, opts) {
  const events = opts.events || [];
  const n = events.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const colors = [primary, "3F3F3F", primary, "3F3F3F", primary, "3F3F3F"];
  const lineY = opts.y + 0.5;  // timeline line y-position
  const circleSize = 0.55;

  // Horizontal line
  slide.addShape(pres.shapes.LINE, {
    x: opts.x, y: lineY, w: opts.w, h: 0,
    line: { color: "D8D8D8", width: 2 },
  });

  const spacing = n > 1 ? opts.w / (n - 1) : 0;

  events.forEach((event, i) => {
    const cx = n === 1 ? opts.x + opts.w / 2 : opts.x + i * spacing;
    const color = colors[i % colors.length];

    // Circle marker on the line
    slide.addShape(pres.shapes.OVAL, {
      x: cx - circleSize / 2, y: lineY - circleSize / 2,
      w: circleSize, h: circleSize,
      fill: { color: color },
    });
    slide.addText(event.year || "", {
      x: cx - circleSize / 2, y: lineY - circleSize / 2,
      w: circleSize, h: circleSize,
      fontSize: 9, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Vertical connector down
    slide.addShape(pres.shapes.LINE, {
      x: cx, y: lineY + circleSize / 2,
      w: 0, h: 0.3,
      line: { color: color, width: 1 },
    });

    // Title below
    const detailY = lineY + circleSize / 2 + 0.35;
    const colW = opts.w / n;
    const textX = cx - colW / 2;

    slide.addText(event.title || "", {
      x: textX, y: detailY, w: colW, h: 0.35,
      fontSize: 10, fontFace: "Century Gothic", color: "000000",
      bold: true, align: "center", valign: "top", margin: 0,
    });

    // Detail text
    if (event.detail) {
      slide.addText(event.detail, {
        x: textX, y: detailY + 0.35, w: colW, h: opts.h - (detailY - opts.y) - 0.4,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 4.2 Vertikale Timeline mit KPI-Bubbles

Vertikale Achse mit Jahreszahlen, rechts farbige Kreise mit großer Zahl + Detail.

**Referenz-Slide:** 27

```javascript
/**
 * addVerticalTimeline — Vertical timeline with KPI bubbles
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.events - Array of { year: "2021", value: "458", detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 */
function addVerticalTimeline(slide, pres, opts) {
  const events = opts.events || [];
  const n = events.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const colors = [primary, "01B3BB", "3F3F3F"];
  const axisX = opts.x + 1.0;  // x-position of the vertical axis
  const rowH = opts.h / n;
  const bubbleSize = Math.min(1.0, rowH * 0.7);

  // Vertical line
  slide.addShape(pres.shapes.LINE, {
    x: axisX, y: opts.y, w: 0, h: opts.h,
    line: { color: "D8D8D8", width: 2 },
  });

  events.forEach((event, i) => {
    const ry = opts.y + i * rowH + rowH / 2;
    const color = colors[i % colors.length];

    // Year label (left of axis)
    slide.addText(event.year || "", {
      x: opts.x, y: ry - 0.2, w: 0.9, h: 0.4,
      fontSize: 14, fontFace: "Century Gothic", color: "000000",
      bold: true, align: "right", valign: "middle", margin: 0,
    });

    // Dot on axis
    slide.addShape(pres.shapes.OVAL, {
      x: axisX - 0.1, y: ry - 0.1, w: 0.2, h: 0.2,
      fill: { color: color },
    });

    // KPI bubble (right of axis)
    const bubbleX = axisX + 0.5;
    slide.addShape(pres.shapes.OVAL, {
      x: bubbleX, y: ry - bubbleSize / 2, w: bubbleSize, h: bubbleSize,
      fill: { color: color },
    });
    slide.addText(event.value || "", {
      x: bubbleX, y: ry - bubbleSize / 2, w: bubbleSize, h: bubbleSize,
      fontSize: 16, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Detail text
    if (event.detail) {
      slide.addText(event.detail, {
        x: bubbleX + bubbleSize + 0.2, y: ry - 0.3,
        w: opts.w - (bubbleX - opts.x) - bubbleSize - 0.3, h: 0.6,
        fontSize: 9, fontFace: "Century Gothic", color: "3F3F3F",
        valign: "middle", margin: 0,
      });
    }
  });
}
```

---

## Kategorie 5: Spezial-Layouts

---

### 5.4 Gestapelte Info-Streifen (Funnel/Bar-Ranking)

7 horizontale Balken, zunehmend breiter, mit farbigem Label-Tag und Detail-Text.

**Referenz-Slide:** 22

```javascript
/**
 * addFunnelBars — Stacked info strips / funnel ranking bars
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.items - Array of { label: string, leftDetail: string, rightDetail: string }
 *   Items ordered from narrowest (top) to widest (bottom)
 * @param {string} [opts.primaryColor="00868C"]
 */
function addFunnelBars(slide, pres, opts) {
  const items = opts.items || [];
  const n = items.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const gap = 0.08;
  const barH = (opts.h - gap * (n - 1)) / n;
  const minW = opts.w * 0.35;
  const maxW = opts.w;

  items.forEach((item, i) => {
    const barW = minW + (maxW - minW) * (i / (n - 1 || 1));
    const bx = opts.x + (opts.w - barW) / 2;  // center each bar
    const by = opts.y + i * (barH + gap);

    // Bar background
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: bx, y: by, w: barW, h: barH,
      fill: { color: "F2F2F2" }, rectRadius: barH / 2,
    });

    // Center label tag
    const tagW = barW * 0.25;
    const tagX = bx + (barW - tagW) / 2;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: tagX, y: by + 0.03, w: tagW, h: barH - 0.06,
      fill: { color: primary }, rectRadius: (barH - 0.06) / 2,
    });
    slide.addText(item.label || "", {
      x: tagX, y: by + 0.03, w: tagW, h: barH - 0.06,
      fontSize: 7, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Left detail
    if (item.leftDetail) {
      slide.addText(item.leftDetail, {
        x: bx + 0.15, y: by, w: (barW - tagW) / 2 - 0.25, h: barH,
        fontSize: 7, fontFace: "Century Gothic", color: "3F3F3F",
        align: "right", valign: "middle", margin: 0,
      });
    }

    // Right detail
    if (item.rightDetail) {
      slide.addText(item.rightDetail, {
        x: tagX + tagW + 0.1, y: by, w: (barW - tagW) / 2 - 0.25, h: barH,
        fontSize: 7, fontFace: "Century Gothic", color: "3F3F3F",
        align: "left", valign: "middle", margin: 0,
      });
    }
  });
}
```

---

### 5.5 2×2 Quadranten mit großen Nummern

4 große farbige Blöcke mit Nummer, Titel und Details.

**Referenz-Slide:** 33

```javascript
/**
 * addQuadrants — 2x2 grid of large numbered blocks
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.blocks - Array of 4: { number: "1", title: string, detail: string }
 * @param {Array} [opts.colors] - 4 fill colors
 */
function addQuadrants(slide, pres, opts) {
  const blocks = opts.blocks || [];
  const defaultColors = ["00868C", "3F3F3F", "01B3BB", "7F7F7F"];
  const colors = opts.colors || defaultColors;
  const gap = 0.15;
  const cellW = (opts.w - gap) / 2;
  const cellH = (opts.h - gap) / 2;

  blocks.slice(0, 4).forEach((block, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = opts.x + col * (cellW + gap);
    const by = opts.y + row * (cellH + gap);
    const color = colors[i % colors.length];

    // Block background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: cellW, h: cellH,
      fill: { color: color },
    });

    // Large number (top-left of block)
    slide.addText(block.number || String(i + 1), {
      x: bx + 0.2, y: by + 0.1, w: cellW * 0.4, h: cellH * 0.5,
      fontSize: 36, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, valign: "top", margin: 0,
    });

    // Title
    slide.addText(block.title || "", {
      x: bx + 0.2, y: by + cellH * 0.45, w: cellW - 0.4, h: 0.35,
      fontSize: 12, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, valign: "top", margin: 0,
    });

    // Detail
    if (block.detail) {
      slide.addText(block.detail, {
        x: bx + 0.2, y: by + cellH * 0.45 + 0.4, w: cellW - 0.4, h: cellH * 0.45,
        fontSize: 8, fontFace: "Century Gothic", color: "FFFFFF",
        valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 5.1 Icon-Karten-Grid

4-5 Karten mit Icon, Section Title und Detail-Text.

**Referenz-Slides:** 1, 13, 17

```javascript
/**
 * addIconCardGrid — Grid of icon cards with title and detail
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.cards - Array of { icon: base64Data, title: string, detail: string }
 * @param {number} [opts.cols] - Override column count
 * @param {string} [opts.primaryColor="00868C"]
 */
function addIconCardGrid(slide, pres, opts) {
  const cards = opts.cards || [];
  const n = cards.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const cols = opts.cols || Math.min(n, 5);
  const rows = Math.ceil(n / cols);
  const gap = 0.2;
  const cardW = (opts.w - gap * (cols - 1)) / cols;
  const cardH = (opts.h - gap * (rows - 1)) / rows;
  const iconSize = Math.min(0.55, cardW * 0.3, cardH * 0.25);

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = opts.x + col * (cardW + gap);
    const cy = opts.y + row * (cardH + gap);

    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: cardH,
      fill: { color: "F2F2F2" },
    });

    // Top accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: cardW, h: 0.05,
      fill: { color: primary },
    });

    // Icon (as image or circle placeholder)
    if (card.icon) {
      slide.addImage({
        data: card.icon,
        x: cx + (cardW - iconSize) / 2, y: cy + 0.2,
        w: iconSize, h: iconSize,
      });
    } else {
      // Placeholder circle
      slide.addShape(pres.shapes.OVAL, {
        x: cx + (cardW - iconSize) / 2, y: cy + 0.2,
        w: iconSize, h: iconSize,
        fill: { color: primary },
      });
    }

    // Title
    slide.addText(card.title || "", {
      x: cx + 0.1, y: cy + 0.2 + iconSize + 0.15, w: cardW - 0.2, h: 0.35,
      fontSize: 10, fontFace: "Century Gothic", color: "000000",
      bold: true, align: "center", valign: "top", margin: 0,
    });

    // Detail
    if (card.detail) {
      slide.addText(card.detail, {
        x: cx + 0.1, y: cy + 0.2 + iconSize + 0.55,
        w: cardW - 0.2, h: cardH - iconSize - 0.85,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 5.3 Sprechblasen-Layout (Callout Bubbles)

4 Teal-gefüllte Ellipsen mit Werte-Text.

**Referenz-Slide:** 6

```javascript
/**
 * addCalloutBubbles — Elliptical callout bubbles
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.bubbles - Array of { value: string, detail: string }
 * @param {string} [opts.primaryColor="00868C"]
 */
function addCalloutBubbles(slide, pres, opts) {
  const bubbles = opts.bubbles || [];
  const n = bubbles.length;
  if (n === 0) return;

  const primary = opts.primaryColor || "00868C";
  const cols = Math.min(n, 4);
  const rows = Math.ceil(n / cols);
  const gap = 0.3;
  const cellW = (opts.w - gap * (cols - 1)) / cols;
  const cellH = (opts.h - gap * (rows - 1)) / rows;
  const bubbleW = cellW * 0.85;
  const bubbleH = cellH * 0.55;

  bubbles.forEach((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = opts.x + col * (cellW + gap) + cellW / 2;
    const cy = opts.y + row * (cellH + gap) + cellH * 0.35;

    // Elliptical bubble
    slide.addShape(pres.shapes.OVAL, {
      x: cx - bubbleW / 2, y: cy - bubbleH / 2, w: bubbleW, h: bubbleH,
      fill: { color: primary },
    });

    // Value text inside
    slide.addText(b.value || "", {
      x: cx - bubbleW / 2, y: cy - bubbleH / 2, w: bubbleW, h: bubbleH,
      fontSize: 14, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Detail below
    if (b.detail) {
      slide.addText(b.detail, {
        x: cx - cellW / 2, y: cy + bubbleH / 2 + 0.1, w: cellW, h: cellH * 0.35,
        fontSize: 8, fontFace: "Century Gothic", color: "3F3F3F",
        align: "center", valign: "top", margin: 0,
      });
    }
  });
}
```

---

### 5.6 Gestapelte Karten mit Trennlinien (2-Panel)

2 große Panels mit farbigem Rahmen, Title und Detail.

**Referenz-Slide:** 52

```javascript
/**
 * addDualPanel — Two stacked or side-by-side panels
 * @param {object} slide
 * @param {object} pres
 * @param {object} opts
 * @param {number} opts.x, opts.y, opts.w, opts.h
 * @param {Array} opts.panels - Array of 2: { title: string, subtitle: string, detail: string }
 * @param {string} [opts.layout="horizontal"] - "horizontal" (side by side) or "vertical" (stacked)
 * @param {string} [opts.primaryColor="00868C"]
 */
function addDualPanel(slide, pres, opts) {
  const panels = opts.panels || [];
  const primary = opts.primaryColor || "00868C";
  const colors = [primary, "3F3F3F"];
  const layout = opts.layout || "horizontal";
  const gap = 0.2;

  panels.slice(0, 2).forEach((panel, i) => {
    let px, py, pw, ph;
    if (layout === "horizontal") {
      pw = (opts.w - gap) / 2;
      ph = opts.h;
      px = opts.x + i * (pw + gap);
      py = opts.y;
    } else {
      pw = opts.w;
      ph = (opts.h - gap) / 2;
      px = opts.x;
      py = opts.y + i * (ph + gap);
    }

    const color = colors[i % colors.length];

    // Panel background with colored left border
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: py, w: pw, h: ph,
      fill: { color: "FFFFFF" },
      line: { color: "D8D8D8", width: 0.75 },
    });
    // Left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: px, y: py, w: 0.06, h: ph,
      fill: { color: color },
    });

    // Title
    slide.addText(panel.title || "", {
      x: px + 0.2, y: py + 0.15, w: pw - 0.4, h: 0.35,
      fontSize: 12, fontFace: "Century Gothic", color: color,
      bold: true, valign: "top", margin: 0,
    });

    // Subtitle
    if (panel.subtitle) {
      slide.addText(panel.subtitle, {
        x: px + 0.2, y: py + 0.5, w: pw - 0.4, h: 0.3,
        fontSize: 9, fontFace: "Century Gothic", color: "000000",
        bold: true, valign: "top", margin: 0,
      });
    }

    // Detail
    if (panel.detail) {
      slide.addText(panel.detail, {
        x: px + 0.2, y: py + 0.85, w: pw - 0.4, h: ph - 1.0,
        fontSize: 9, fontFace: "Century Gothic", color: "3F3F3F",
        valign: "top", margin: 0,
      });
    }
  });
}
```

---

## Kategorie 6: Organisation & Architektur

---

### 6.1 Organigramm (Hierarchie-Baum)

Hierarchische Struktur mit Personen/Rollen in Karten, verbunden durch rechtwinklige Connector-Linien. Unterstützt 1-3 Ebenen mit automatischem Layout.

```javascript
/**
 * addOrgChart — Hierarchical org chart with person cards and connector lines
 * @param {object} slide - PptxGenJS slide object
 * @param {object} pres - PptxGenJS presentation object
 * @param {object} opts
 * @param {number} opts.x - Left edge of chart area
 * @param {number} opts.y - Top edge of chart area
 * @param {number} opts.w - Total width of chart area
 * @param {number} opts.h - Total height of chart area
 * @param {object} opts.root - Root node: { name, role, children: [{ name, role, children: [...] }] }
 * @param {string} [opts.primaryColor="00868C"] - Root card accent color
 * @param {string} [opts.secondaryColor="3F3F3F"] - Level 2 card accent color
 * @param {string} [opts.tertiaryColor="7F7F7F"] - Level 3 card accent color
 * @param {string} [opts.connectorColor="D8D8D8"] - Line color between cards
 * @param {string} [opts.cardBg="FFFFFF"] - Card background color
 */
function addOrgChart(slide, pres, opts) {
  const root = opts.root;
  if (!root) return;

  const primary = opts.primaryColor || "00868C";
  const secondary = opts.secondaryColor || "3F3F3F";
  const tertiary = opts.tertiaryColor || "7F7F7F";
  const connColor = opts.connectorColor || "D8D8D8";
  const cardBg = opts.cardBg || "FFFFFF";
  const levelColors = [primary, secondary, tertiary];

  // Card dimensions
  const cardW = 2.0;
  const cardH = 0.75;
  const levelGap = 0.6;   // vertical gap between levels
  const siblingGap = 0.25; // horizontal gap between siblings

  // Flatten tree into array with level + parent info
  const flat = [];
  function walkTree(node, level) {
    const idx = flat.length;
    flat.push({ node, level, childIndices: [] });
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const childIdx = flat.length;
        flat[idx].childIndices.push(childIdx);
        walkTree(child, level + 1);
      });
    }
  }
  walkTree(root, 0);

  // Group by level
  const levels = {};
  flat.forEach((entry, i) => {
    if (!levels[entry.level]) levels[entry.level] = [];
    levels[entry.level].push(i);
  });
  const maxLevel = Math.max(...Object.keys(levels).map(Number));

  // Position nodes bottom-up: leaves evenly, parents centered over children
  const positions = {};

  for (let level = maxLevel; level >= 0; level--) {
    const nodesAtLevel = levels[level] || [];
    nodesAtLevel.forEach((ni, i) => {
      const entry = flat[ni];
      const ly = opts.y + level * (cardH + levelGap);

      if (entry.childIndices.length > 0 && positions[entry.childIndices[0]] !== undefined) {
        // Center parent over its children
        const childXs = entry.childIndices.map(ci => positions[ci].x);
        const minX = Math.min(...childXs);
        const maxX = Math.max(...childXs);
        positions[ni] = { x: (minX + maxX + cardW) / 2 - cardW / 2, y: ly };
      } else {
        // Leaf: distribute evenly across width
        const totalW = nodesAtLevel.length * cardW + (nodesAtLevel.length - 1) * siblingGap;
        const startX = opts.x + (opts.w - totalW) / 2;
        positions[ni] = { x: startX + i * (cardW + siblingGap), y: ly };
      }
    });
  }

  // Draw connector lines (parent → children)
  flat.forEach((entry, i) => {
    if (entry.childIndices.length === 0) return;
    const pPos = positions[i];
    const pCenterX = pPos.x + cardW / 2;
    const pBottomY = pPos.y + cardH;
    const midY = pBottomY + levelGap / 2;

    // Vertical line down from parent
    slide.addShape(pres.shapes.LINE, {
      x: pCenterX, y: pBottomY, w: 0, h: levelGap / 2,
      line: { color: connColor, width: 1.5 },
    });

    if (entry.childIndices.length > 1) {
      // Horizontal bar spanning all children
      const childCenters = entry.childIndices.map(ci => positions[ci].x + cardW / 2);
      const leftX = Math.min(...childCenters);
      const rightX = Math.max(...childCenters);
      slide.addShape(pres.shapes.LINE, {
        x: leftX, y: midY, w: rightX - leftX, h: 0,
        line: { color: connColor, width: 1.5 },
      });
    }

    // Vertical lines down to each child
    entry.childIndices.forEach((ci) => {
      const cCenterX = positions[ci].x + cardW / 2;
      slide.addShape(pres.shapes.LINE, {
        x: cCenterX, y: midY, w: 0, h: levelGap / 2,
        line: { color: connColor, width: 1.5 },
      });
    });
  });

  // Draw cards (on top of lines)
  flat.forEach((entry, i) => {
    const pos = positions[i];
    if (!pos) return;
    const accentColor = levelColors[Math.min(entry.level, levelColors.length - 1)];

    // Card background with subtle shadow
    slide.addShape(pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: cardW, h: cardH,
      fill: { color: cardBg },
      line: { color: "D8D8D8", width: 0.75 },
      shadow: { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.08 },
    });

    // Left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: 0.06, h: cardH,
      fill: { color: accentColor },
    });

    // Name
    slide.addText(entry.node.name || "", {
      x: pos.x + 0.18, y: pos.y + 0.08, w: cardW - 0.3, h: 0.32,
      fontSize: 10, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "middle", margin: 0,
    });

    // Role
    slide.addText(entry.node.role || "", {
      x: pos.x + 0.18, y: pos.y + 0.38, w: cardW - 0.3, h: 0.3,
      fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
      valign: "top", margin: 0,
    });
  });
}
```

---

### 6.2 Horizontaler Layer-Stack (Architektur-Schichten)

Gleichbreite horizontale Schichten übereinander — ideal für Architekturdiagramme, Technologie-Stacks, Schichtmodelle. Jede Schicht kann optional Komponenten-Boxen enthalten. Optionaler seitlicher Streifen für Cross-Cutting Concerns.

```javascript
/**
 * addLayerStack — Horizontal stacked layers for architecture / technology diagrams
 * @param {object} slide - PptxGenJS slide object
 * @param {object} pres - PptxGenJS presentation object
 * @param {object} opts
 * @param {number} opts.x - Left edge
 * @param {number} opts.y - Top edge
 * @param {number} opts.w - Total width
 * @param {number} opts.h - Total height
 * @param {Array} opts.layers - Array of layer objects (top to bottom):
 *   { label: string, detail?: string, components?: [{ name: string, detail?: string }], color?: string }
 * @param {string} [opts.primaryColor="00868C"] - Default color palette base
 * @param {string} [opts.borderColor="D8D8D8"] - Layer border color
 * @param {string} [opts.componentBg="FFFFFF"] - Component box background
 * @param {string} [opts.sideLabel] - Optional cross-cutting label on the right side
 * @param {string} [opts.sideLabelColor="3F3F3F"] - Side label strip color
 */
function addLayerStack(slide, pres, opts) {
  const layers = opts.layers || [];
  const n = layers.length;
  if (n === 0) return;

  const borderColor = opts.borderColor || "D8D8D8";
  const componentBg = opts.componentBg || "FFFFFF";

  // Reserve space for side label if present
  const sideW = opts.sideLabel ? 0.7 : 0;
  const stackW = opts.w - sideW - (sideW > 0 ? 0.15 : 0);
  const stackX = opts.x;

  const gap = 0.08;
  const layerH = (opts.h - gap * (n - 1)) / n;

  // Teal-gradient shades top-to-bottom (dark → light)
  const tealShades = ["00868C", "01B3BB", "7CB7BA", "A8CFD1", "9DC9CB", "D8D8D8"];

  layers.forEach((layer, i) => {
    const ly = opts.y + i * (layerH + gap);
    const layerColor = layer.color || tealShades[Math.min(i, tealShades.length - 1)];

    // Layer background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: stackX, y: ly, w: stackW, h: layerH,
      fill: { color: layerColor, transparency: 15 },
      line: { color: borderColor, width: 0.75 },
    });

    if (layer.components && layer.components.length > 0) {
      // Layout: label on left, component boxes on right
      const labelW = stackW * 0.22;
      const compAreaX = stackX + labelW + 0.1;
      const compAreaW = stackW - labelW - 0.2;

      // Layer label (left side)
      slide.addText(layer.label || "", {
        x: stackX + 0.15, y: ly, w: labelW - 0.15, h: layer.detail ? layerH * 0.55 : layerH,
        fontSize: 10, fontFace: "Century Gothic", color: "000000",
        bold: true, valign: "middle", margin: 0,
      });

      if (layer.detail) {
        slide.addText(layer.detail, {
          x: stackX + 0.15, y: ly + layerH * 0.55, w: labelW - 0.15, h: layerH * 0.4,
          fontSize: 7, fontFace: "Century Gothic", color: "5B5D60",
          valign: "top", margin: 0,
        });
      }

      // Component boxes (distributed evenly)
      const comps = layer.components;
      const compGap = 0.12;
      const compW = (compAreaW - compGap * (comps.length - 1)) / comps.length;
      const compH = layerH * 0.6;
      const compY = ly + (layerH - compH) / 2;

      comps.forEach((comp, ci) => {
        const cx = compAreaX + ci * (compW + compGap);

        slide.addShape(pres.shapes.RECTANGLE, {
          x: cx, y: compY, w: compW, h: compH,
          fill: { color: componentBg },
          line: { color: borderColor, width: 0.5 },
          shadow: { type: "outer", color: "000000", blur: 3, offset: 1, angle: 135, opacity: 0.06 },
        });

        slide.addText(comp.name || "", {
          x: cx + 0.05, y: compY + 0.03, w: compW - 0.1, h: compH * 0.5,
          fontSize: 8, fontFace: "Century Gothic", color: "000000",
          bold: true, align: "center", valign: "middle", margin: 0,
        });

        if (comp.detail) {
          slide.addText(comp.detail, {
            x: cx + 0.05, y: compY + compH * 0.5, w: compW - 0.1, h: compH * 0.45,
            fontSize: 7, fontFace: "Century Gothic", color: "5B5D60",
            align: "center", valign: "top", margin: 0,
          });
        }
      });

    } else {
      // Simple layer: label centered
      slide.addText(layer.label || "", {
        x: stackX + 0.2, y: ly, w: stackW - 0.4, h: layer.detail ? layerH * 0.55 : layerH,
        fontSize: 11, fontFace: "Century Gothic", color: "000000",
        bold: true, align: "center", valign: "middle", margin: 0,
      });

      if (layer.detail) {
        slide.addText(layer.detail, {
          x: stackX + 0.2, y: ly + layerH * 0.55, w: stackW - 0.4, h: layerH * 0.4,
          fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
          align: "center", valign: "top", margin: 0,
        });
      }
    }
  });

  // Optional cross-cutting side strip
  if (opts.sideLabel) {
    const sideX = stackX + stackW + 0.15;
    const sideLabelColor = opts.sideLabelColor || "3F3F3F";

    slide.addShape(pres.shapes.RECTANGLE, {
      x: sideX, y: opts.y, w: sideW, h: opts.h,
      fill: { color: sideLabelColor },
    });

    slide.addText(opts.sideLabel, {
      x: sideX, y: opts.y, w: sideW, h: opts.h,
      fontSize: 9, fontFace: "Century Gothic", color: "FFFFFF",
      bold: true, align: "center", valign: "middle",
      rotate: 270, margin: 0,
    });
  }
}
```

---

### 6.3 Native Chart im Capco-Stil (Styled Chart Wrapper)

Wrapper für native PptxGenJS-Charts (BAR, LINE, PIE, DOUGHNUT, SCATTER, RADAR), der automatisch Capco-Farben, Century Gothic und konsistentes Styling anwendet. Erzeugt echte editierbare PowerPoint-Charts — der Empfänger kann Daten noch ändern.

```javascript
/**
 * addStyledChart — Native PptxGenJS chart with Capco styling applied
 * @param {object} slide - PptxGenJS slide object
 * @param {object} pres - PptxGenJS presentation object
 * @param {object} opts
 * @param {number} opts.x - Left edge
 * @param {number} opts.y - Top edge
 * @param {number} opts.w - Total width
 * @param {number} opts.h - Total height
 * @param {string} opts.type - "bar"|"col"|"line"|"pie"|"doughnut"|"scatter"|"radar"
 * @param {Array} opts.data - PptxGenJS chart data: [{ name, labels, values }]
 * @param {string} [opts.title] - Title above chart
 * @param {string} [opts.subtitle] - Subtitle below title
 * @param {Array} [opts.colors] - Override chart colors; defaults to Capco teal palette
 * @param {boolean} [opts.showLegend=true] - Show legend
 * @param {string} [opts.legendPos="b"] - Legend position: "b"|"t"|"l"|"r"
 * @param {boolean} [opts.showValue=false] - Show data labels on elements
 * @param {boolean} [opts.showPercent=false] - Show percent labels (pie/doughnut)
 * @param {boolean} [opts.lineSmooth=false] - Smooth lines (line chart)
 * @param {object} [opts.extraChartOpts] - Additional PptxGenJS chart options (merged last)
 */
function addStyledChart(slide, pres, opts) {
  const data = opts.data || [];
  if (data.length === 0) return;

  const capcoColors = opts.colors || [
    "00868C", "01B3BB", "3F3F3F", "7CB7BA", "A8CFD1",
    "9DC9CB", "7F7F7F", "5B5D60", "D8D8D8",
  ];

  // Map type string to pres.charts enum
  const typeMap = {
    bar: pres.charts.BAR,
    col: pres.charts.BAR,
    line: pres.charts.LINE,
    pie: pres.charts.PIE,
    doughnut: pres.charts.DOUGHNUT,
    scatter: pres.charts.SCATTER,
    radar: pres.charts.RADAR,
  };
  const chartType = typeMap[(opts.type || "col").toLowerCase()] || pres.charts.BAR;

  // Reserve space for title
  const titleH = opts.title ? 0.55 : 0;
  const chartX = opts.x;
  const chartY = opts.y + titleH;
  const chartW = opts.w;
  const chartH = opts.h - titleH;

  // Title above chart (drawn as text, not native chart title)
  if (opts.title) {
    slide.addText(opts.title, {
      x: opts.x, y: opts.y, w: opts.w, h: 0.3,
      fontSize: 11, fontFace: "Century Gothic", color: "000000",
      bold: true, valign: "bottom", margin: 0,
    });
    if (opts.subtitle) {
      slide.addText(opts.subtitle, {
        x: opts.x, y: opts.y + 0.28, w: opts.w, h: 0.25,
        fontSize: 8, fontFace: "Century Gothic", color: "5B5D60",
        valign: "top", margin: 0,
      });
    }
  }

  // Capco-styled chart options
  const isBar = opts.type === "bar" || opts.type === "col";
  const isPie = opts.type === "pie" || opts.type === "doughnut";

  const chartOpts = {
    x: chartX, y: chartY, w: chartW, h: chartH,
    chartColors: capcoColors,
    chartArea: { fill: { color: "FFFFFF" }, roundedCorners: false },
    showTitle: false,
    showLegend: opts.showLegend !== false,
    legendPos: opts.legendPos || "b",
    legendFontSize: 8,
    legendFontFace: "Century Gothic",
    legendColor: "3F3F3F",
    catAxisLabelColor: "5B5D60",
    catAxisLabelFontSize: 8,
    catAxisLabelFontFace: "Century Gothic",
    valAxisLabelColor: "5B5D60",
    valAxisLabelFontSize: 8,
    valAxisLabelFontFace: "Century Gothic",
    valGridLine: { color: "E8E8E8", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: opts.showValue || false,
    showPercent: opts.showPercent || false,
    dataLabelColor: "3F3F3F",
    dataLabelFontSize: 8,
    dataLabelFontFace: "Century Gothic",
    dataLabelPosition: "outEnd",
    dataNoEffects: true,
  };

  // Type-specific overrides
  if (isBar) {
    chartOpts.barDir = opts.type === "bar" ? "bar" : "col";
    chartOpts.barGapWidthPct = 80;
  }

  if (isPie) {
    if (opts.type === "doughnut") chartOpts.holeSize = 65;
    delete chartOpts.catAxisLabelColor;
    delete chartOpts.valAxisLabelColor;
    delete chartOpts.valGridLine;
    delete chartOpts.catGridLine;
  }

  if (opts.type === "line") {
    chartOpts.lineSize = 2;
    chartOpts.lineSmooth = opts.lineSmooth || false;
    chartOpts.lineDataSymbol = "circle";
    chartOpts.lineDataSymbolSize = 6;
  }

  if (opts.type === "radar") {
    delete chartOpts.catGridLine;
  }

  // Merge user overrides last
  if (opts.extraChartOpts) {
    Object.assign(chartOpts, opts.extraChartOpts);
  }

  slide.addChart(chartType, data, chartOpts);
}
```

---

## Kompositions-Beispiele

### Beispiel 4: Org-Chart + Layer-Stack Kombination

```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "06", "ORGANIZATION", "TEAM & ARCHITECTURE",
  "Team structure and technology stack overview");

// Left: Org Chart
addOrgChart(slide, pres, {
  x: 0.6, y: 1.5, w: 6.0, h: 5.5,
  root: {
    name: "Sarah Chen", role: "CTO",
    children: [
      { name: "Marcus Weber", role: "VP Engineering",
        children: [
          { name: "Lisa Park", role: "Lead Backend" },
          { name: "Tom Rivera", role: "Lead Frontend" },
        ]
      },
      { name: "Anna Schmidt", role: "VP Data",
        children: [
          { name: "James Liu", role: "Lead ML" },
          { name: "Kate Brown", role: "Lead Analytics" },
        ]
      },
    ]
  },
});

// Right: Tech Stack
addLayerStack(slide, pres, {
  x: 7.0, y: 1.5, w: 5.73, h: 5.5,
  layers: [
    { label: "PRESENTATION", components: [
      { name: "React", detail: "SPA Framework" },
      { name: "Next.js", detail: "SSR / Routing" },
    ]},
    { label: "API LAYER", components: [
      { name: "GraphQL", detail: "API Gateway" },
      { name: "REST", detail: "Legacy APIs" },
    ]},
    { label: "BUSINESS LOGIC", components: [
      { name: "Node.js", detail: "Core Services" },
      { name: "Python", detail: "ML Pipeline" },
    ]},
    { label: "DATA", components: [
      { name: "PostgreSQL", detail: "Primary DB" },
      { name: "Redis", detail: "Cache Layer" },
      { name: "S3", detail: "Object Store" },
    ]},
  ],
  sideLabel: "SECURITY & MONITORING",
});
```

### Beispiel 5: Styled Native Charts

```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "07", "FINANCIALS", "REVENUE ANALYSIS",
  "Quarterly revenue breakdown and trend analysis");

// Left: Column chart
addStyledChart(slide, pres, {
  x: 0.6, y: 1.5, w: 5.8, h: 4.5,
  type: "col",
  title: "Quarterly Revenue",
  subtitle: "FY 2024 in millions USD",
  data: [{
    name: "Revenue",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    values: [4.2, 5.1, 6.3, 7.8],
  }],
  showValue: true,
  showLegend: false,
});

// Right: Doughnut chart
addStyledChart(slide, pres, {
  x: 6.8, y: 1.5, w: 5.93, h: 4.5,
  type: "doughnut",
  title: "Revenue by Segment",
  data: [{
    name: "Segments",
    labels: ["Consulting", "Technology", "Managed Services", "Training"],
    values: [42, 28, 20, 10],
  }],
  showPercent: true,
});
```

---

### Beispiel 1: KPI-Dashboard-Slide (Donuts + Progress Bars)

Kombiniert Donut-KPIs oben mit Progress-Bars unten auf einer Slide.

```javascript
// Create slide with capco-slides header
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "04", "PERFORMANCE", "KPI DASHBOARD",
  "Quarterly performance metrics and team progress");

// Top: 4 Donut KPIs
addDonutKPIGrid(slide, pres, {
  x: 0.6, y: 1.5, w: 12.13, h: 2.8,
  items: [
    { value: 92, label: "CLIENT SATISFACTION", detail: "Based on 247 surveys" },
    { value: 78, label: "PROJECT DELIVERY", detail: "On-time completion rate" },
    { value: 65, label: "UTILIZATION", detail: "Billable hours ratio" },
    { value: 88, label: "QUALITY SCORE", detail: "Defect-free deliverables" },
  ],
  cols: 4,
});

// Bottom: Progress Bars
addProgressBars(slide, pres, {
  x: 0.6, y: 4.6, w: 12.13, h: 2.5,
  items: [
    { label: "Revenue Growth", value: 85, detail: "vs. target $4.2M" },
    { label: "New Clients", value: 72, detail: "18 of 25 target" },
    { label: "Employee Retention", value: 94, detail: "Annual rate" },
    { label: "Training Hours", value: 60, detail: "Avg per employee" },
  ],
});
```

### Beispiel 2: Strategie-Übersicht (Pyramide + SWOT)

```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "02", "STRATEGY", "FRAMEWORK",
  "Strategic positioning and competitive analysis");

// Left: Pyramid
addPyramid(slide, pres, {
  x: 0.6, y: 1.5, w: 6.0, h: 5.5,
  layers: [
    { label: "VISION", detail: "Long-term strategic direction and market positioning" },
    { label: "STRATEGY", detail: "Core business strategies and competitive advantages" },
    { label: "PROCESSES", detail: "Operational workflows and efficiency improvements" },
    { label: "RESOURCES", detail: "People, technology, and infrastructure investments" },
  ],
});

// Right: SWOT (compact)
addSWOT(slide, pres, {
  x: 7.0, y: 1.5, w: 5.73, h: 5.5,
  strengths:     { text: "Market leadership in digital transformation consulting" },
  weaknesses:    { text: "Limited presence in APAC markets" },
  opportunities: { text: "Growing demand for AI/ML integration services" },
  threats:       { text: "Increasing competition from technology firms" },
});
```

### Beispiel 3: Timeline + Quadrants

```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "05", "ROADMAP", "IMPLEMENTATION PLAN",
  "Key milestones and strategic priorities");

// Top: Timeline
addHorizontalTimeline(slide, pres, {
  x: 0.6, y: 1.4, w: 12.13, h: 2.5,
  events: [
    { year: "Q1", title: "FOUNDATION", detail: "Setup infrastructure and governance" },
    { year: "Q2", title: "BUILD", detail: "Core platform development" },
    { year: "Q3", title: "PILOT", detail: "Selected client rollout" },
    { year: "Q4", title: "SCALE", detail: "Full market deployment" },
  ],
});

// Bottom: 2×2 Priority Quadrants
addQuadrants(slide, pres, {
  x: 0.6, y: 4.2, w: 12.13, h: 3.0,
  blocks: [
    { number: "1", title: "HIGH IMPACT", detail: "Focus on digital transformation projects" },
    { number: "2", title: "QUICK WINS", detail: "Automate reporting and compliance" },
    { number: "3", title: "STRATEGIC", detail: "Build AI/ML center of excellence" },
    { number: "4", title: "OPTIMIZE", detail: "Streamline delivery methodology" },
  ],
});
```

---

## Komponenten-Übersicht (Quick Reference)

| # | Funktion | Kategorie | Priorität |
|---|----------|-----------|-----------|
| 1.1 | `addDonutKPIGrid()` | Daten | Muss |
| 1.2 | `addProgressBars()` | Daten | Muss |
| 1.3 | `addVSComparison()` | Daten | Muss |
| 1.4 | `addBigNumberCallouts()` | Daten | Soll |
| 1.5 | `addAuditDashboard()` | Daten | Kann |
| 2.1 | `addStairSteps()` | Prozess | Muss |
| 2.2 | `addAgileArc()` | Prozess | Kann |
| 2.5 | `addNumberedAgenda()` | Prozess | Muss |
| 2.6 | `addChevronProcess()` | Prozess | Soll |
| 3.1 | `addPyramid()` | Struktur | Muss |
| 3.2 | `addSWOT()` | Struktur | Muss |
| 3.4 | `addVennDiagram()` | Struktur | Soll |
| 3.5 | `addPentagonStrategy()` | Struktur | Soll |
| 3.7 | `addProjectPentagon()` | Struktur | Soll |
| 4.1 | `addHorizontalTimeline()` | Timeline | Muss |
| 4.2 | `addVerticalTimeline()` | Timeline | Soll |
| 5.1 | `addIconCardGrid()` | Spezial | Kann |
| 5.3 | `addCalloutBubbles()` | Spezial | Kann |
| 5.4 | `addFunnelBars()` | Spezial | Muss |
| 5.5 | `addQuadrants()` | Spezial | Muss |
| 5.6 | `addDualPanel()` | Spezial | Kann |
| 6.1 | `addOrgChart()` | Organisation | Muss |
| 6.2 | `addLayerStack()` | Organisation | Muss |
| 6.3 | `addStyledChart()` | Organisation | Muss |

---

## Anti-Patterns

1. **NEVER hardcode text** — All text comes from `opts` parameters
2. **NEVER use `#` in hex colors** — PptxGenJS will corrupt the file
3. **NEVER reuse option objects** — Create fresh objects for each `addShape`/`addText` call
4. **NEVER skip position calculations** — Functions must adapt to `x, y, w, h`
5. **NEVER mix fonts** — Use Century Gothic throughout (Arial only as dense-text fallback)
6. **NEVER exceed content area** — Respect 0.6" margins (content area: 0.6 to 12.73 horizontal, 1.5 to 7.1 vertical on a content slide with header)
7. **NEVER forget to import pres.shapes/pres.charts** — Reference them via the `pres` parameter
8. **NEVER assume fixed item count** — All functions handle variable array lengths

---

## Zusammenfassung

Dieser Skill liefert **24 parametrische Komponenten-Funktionen** die als Bausteine in Capco-Präsentationen verwendet werden. Jede Funktion:

- Hat eine konsistente Signatur: `(slide, pres, opts)` mit `opts.x, opts.y, opts.w, opts.h`
- Verwendet die Teal/Grau-Farbpalette als Default
- Akzeptiert parametrische Farb- und Inhalt-Overrides
- Berechnet Positionen dynamisch basierend auf dem verfügbaren Raum
- Ist lauffähig mit PptxGenJS ohne zusätzliche Abhängigkeiten (außer react-icons für Icon-Karten)

**Kategorien:** Daten-Visualisierungen (1.x), Prozess & Flow (2.x), Struktur (3.x), Timeline (4.x), Spezial (5.x), Organisation & Architektur (6.x)

**Workflow:** Immer zuerst `/mnt/skills/user/capco-slides/SKILL.md` für das Deck-Gerüst lesen, dann diese Datei für die visuellen Komponenten.
