---
name: capco-svg-diagrams
description: "SVG-Diagramm-Komponenten im Capco-Stil für Visualisierungen die native PowerPoint nicht kann. Enthält Flowcharts mit Rauten/Pfeilspitzen, Netzwerk-Graphen mit Bézier-Kurven, Zyklus-Diagramme, Konzentrische Kreise, Mindmaps, Swimlanes und Architektur-Datenfluss-Diagramme mit Zonen und 6 Shape-Typen (Service, Database-Zylinder, Queue, API, Client, Storage). Ergänzt capco-visual-components (nativ) um SVG-basierte Diagramme. Trigger: Flowchart, Entscheidungsdiagramm, Netzwerkdiagramm, Microservice-Architektur, Systemlandschaft, Cloud-Architektur, Zyklus (PDCA/DevOps/Agile), Kreismodell, Mindmap, Swimlane, Architekturdiagramm, Datenfluss, Data Pipeline, Integration Landscape, oder Diagramme mit Pfeilen, Kurven, Rauten, Zylinder-Shapes, Zonen oder kreisförmigen Layouts."
---

# Capco SVG Diagrams — Komplexe Diagramme als SVG für PPTX

## Philosophie

Dieser Skill ist das **SVG-Gegenstück** zu `capco-visual-components`. Während jener Skill native PptxGenJS-Shapes nutzt (Rechtecke, Ovale, Linien, Charts), deckt dieser Skill die **Diagrammtypen ab, die native PowerPoint-Mittel nicht abbilden können**: Flowcharts mit Rauten und Pfeilspitzen, Netzwerk-Graphen mit Kurven, Zyklen mit Bögen, Mindmaps mit radialer Verzweigung und Swimlanes mit Cross-Lane-Flows.

Die Funktionen erzeugen **SVG-Strings**, die via `sharp` zu PNG konvertiert und dann mit `slide.addImage()` in PptxGenJS-Slides eingebettet werden. Transparenter Hintergrund ist Standard — die Grafiken schweben nahtlos über jedem Slide-Hintergrund.

## Zusammenspiel mit den anderen Skills

**Workflow:**
1. Lies `/mnt/skills/user/capco-slides/SKILL.md` für das Deck-Gerüst
2. Lies `/mnt/skills/public/pptx/pptxgenjs.md` für die PptxGenJS-API
3. Lies `/mnt/skills/user/capco-visual-components/SKILL.md` für native Komponenten
4. Lies **diese Datei** für SVG-basierte Diagramme
5. Erstelle Slides mit `capco-slides`-Patterns, füge native Komponenten + SVG-Diagramme ein

**Wann welchen Skill nutzen:**

| Brauche ich... | Skill |
|---|---|
| Rechtecke, Grids, Stacks, Charts, KPIs, Organigramme | `capco-visual-components` (nativ) |
| Flowcharts, Netzwerke, Zyklen, Mindmaps, Architektur-Datenflüsse | **Dieser Skill** (SVG) |
| Deck-Gerüst, Titel, Section-Divider | `capco-slides` |

## Referenz-Farbschema

Identisch mit `capco-visual-components` — Farben hier mit `#`-Prefix für SVG:

```javascript
const SVG_COLORS = {
  primary:      "#00868C",  // Capco Teal
  primaryLight: "#01B3BB",  // Lighter Teal
  dark:         "#3F3F3F",  // Dark accent / text
  midGrey:      "#7F7F7F",  // Mid grey
  lightTeal1:   "#7CB7BA",  // Light teal variant
  lightTeal2:   "#A8CFD1",  // Lighter teal
  lightTeal3:   "#9DC9CB",  // Soft teal
  paleGrey:     "#F2F2F2",  // Card backgrounds
  white:        "#FFFFFF",
  black:        "#000000",
  textBody:     "#3F3F3F",
  textMuted:    "#5B5D60",
  border:       "#D8D8D8",
};
```

## Dependencies

```bash
npm install -g pptxgenjs sharp
```

---

## SVG-zu-Slide Helper

Zentrale Funktion die **jede** SVG-Komponente dieses Skills auf eine PptxGenJS-Slide bringt:

```javascript
const sharp = require("sharp");

/**
 * addSvgDiagram — Converts an SVG string to PNG and places it on a slide
 * @param {object} slide - PptxGenJS slide object
 * @param {object} pres - PptxGenJS presentation object (unused, kept for signature consistency)
 * @param {string} svgString - Complete SVG markup string
 * @param {object} pos - Position on slide: { x, y, w, h } in inches
 * @param {number} [renderWidth=1600] - PNG render width in pixels (higher = sharper)
 */
async function addSvgDiagram(slide, pres, svgString, pos, renderWidth = 1600) {
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize({ width: renderWidth })
    .png()
    .toBuffer();
  const base64 = "image/png;base64," + pngBuffer.toString("base64");
  slide.addImage({
    data: base64,
    x: pos.x, y: pos.y, w: pos.w, h: pos.h,
  });
}
```

**Typisches Code-Muster:**
```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "04", "PROCESS", "APPROVAL WORKFLOW", "End-to-end request flow");

// 1. Build SVG string
const svgString = buildFlowchartSvg({ ... });

// 2. Place on slide
await addSvgDiagram(slide, pres, svgString, { x: 0.6, y: 1.5, w: 12.13, h: 5.5 });
```

## SVG Basis-Elemente

Jedes SVG dieses Skills verwendet diese gemeinsamen Defs. Die Build-Funktionen fügen sie automatisch ein:

```xml
<defs>
  <!-- Pfeilspitze (Standard) -->
  <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#7F7F7F"/>
  </marker>
  <!-- Pfeilspitze (Teal) -->
  <marker id="arrow-teal" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#00868C"/>
  </marker>
  <!-- Schatten -->
  <filter id="shadow-sm">
    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/>
  </filter>
  <filter id="shadow-md">
    <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.12"/>
  </filter>
</defs>
```

**Font-Standard:** `font-family="Century Gothic, CenturyGothic, AppleGothic, sans-serif"`

---

# Komponenten-Katalog

---

## Kategorie 1: Flow-Diagramme

---

### 1.1 Flowchart (Entscheidungs-Diagramm)

Vertikaler oder horizontaler Prozessfluss mit Prozess-Boxen, Entscheidungs-Rauten, Start/End-Ovalen und Pfeilen mit Routing. Die Funktion berechnet Positionen und Verbindungen automatisch.

```javascript
/**
 * buildFlowchartSvg — Generates a flowchart SVG string
 * @param {object} opts
 * @param {number} [opts.width=1000] - SVG viewBox width
 * @param {number} [opts.height=700] - SVG viewBox height
 * @param {Array} opts.nodes - Array of node objects:
 *   { id: string, type: "start"|"end"|"process"|"decision", label: string, detail?: string }
 * @param {Array} opts.edges - Array of edge objects:
 *   { from: string, to: string, label?: string ("Ja"/"Nein"), direction?: "down"|"right"|"left" }
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {string} [opts.decisionColor="#F2F2F2"] - Decision diamond fill
 * @param {string} [opts.decisionBorder="#01B3BB"] - Decision diamond border
 * @param {string} [opts.processColor="#FFFFFF"] - Process box fill
 * @param {string} [opts.direction="vertical"] - "vertical" (top→bottom) or "horizontal" (left→right)
 * @returns {string} Complete SVG markup
 */
function buildFlowchartSvg(opts) {
  const W = opts.width || 1000;
  const H = opts.height || 700;
  const primary = opts.primaryColor || "#00868C";
  const processColor = opts.processColor || "#FFFFFF";
  const decisionColor = opts.decisionColor || "#F2F2F2";
  const decisionBorder = opts.decisionBorder || "#01B3BB";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const nodes = opts.nodes || [];
  const edges = opts.edges || [];
  const dir = opts.direction || "vertical";

  // Auto-layout: assign positions to nodes
  // Simple sequential layout — nodes positioned in order with spacing
  const nodeW = 160, nodeH = 56;
  const diamondW = 100, diamondH = 60;
  const ovalRx = 70, ovalRy = 26;
  const spacingX = 200, spacingY = 110;
  const positions = {};
  let col = 0, row = 0;

  nodes.forEach((node, i) => {
    if (dir === "vertical") {
      positions[node.id] = {
        x: W / 2,
        y: 50 + i * spacingY,
      };
    } else {
      positions[node.id] = {
        x: 120 + i * spacingX,
        y: H / 2,
      };
    }
  });

  // Allow user-provided positions to override
  nodes.forEach((node) => {
    if (node.x !== undefined && node.y !== undefined) {
      positions[node.id] = { x: node.x, y: node.y };
    }
  });

  let svgContent = '';

  // Draw edges first (behind nodes)
  edges.forEach((edge) => {
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    if (!fromPos || !toPos) return;

    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);

    // Calculate connection points based on relative position
    let x1 = fromPos.x, y1 = fromPos.y;
    let x2 = toPos.x, y2 = toPos.y;

    // Offset from node edges
    const dy = y2 - y1, dx = x2 - x1;
    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical connection
      y1 += dy > 0 ? (fromNode.type === "decision" ? diamondH / 2 + 5 : nodeH / 2 + 5) : -(fromNode.type === "decision" ? diamondH / 2 + 5 : nodeH / 2 + 5);
      y2 += dy > 0 ? -(toNode.type === "decision" ? diamondH / 2 + 5 : nodeH / 2 + 5) : (toNode.type === "decision" ? diamondH / 2 + 5 : nodeH / 2 + 5);
    } else {
      // Horizontal connection
      x1 += dx > 0 ? (fromNode.type === "decision" ? diamondW / 2 + 5 : nodeW / 2 + 5) : -(fromNode.type === "decision" ? diamondW / 2 + 5 : nodeW / 2 + 5);
      x2 += dx > 0 ? -(toNode.type === "decision" ? diamondW / 2 + 5 : nodeW / 2 + 5) : (toNode.type === "decision" ? diamondW / 2 + 5 : nodeW / 2 + 5);
    }

    // Orthogonal routing for non-straight connections
    if (Math.abs(dx) > 20 && Math.abs(dy) > 20) {
      // L-shaped route via midpoint
      const midY = y1 + (y2 - y1) / 2;
      svgContent += `<path d="M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}" `
        + `fill="none" stroke="#7F7F7F" stroke-width="1.8" marker-end="url(#arrow)"/>`;
    } else {
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" `
        + `stroke="#7F7F7F" stroke-width="1.8" marker-end="url(#arrow)"/>`;
    }

    // Edge label
    if (edge.label) {
      const labelX = (x1 + x2) / 2 + (Math.abs(dx) > Math.abs(dy) ? 0 : 14);
      const labelY = (y1 + y2) / 2 + (Math.abs(dx) > Math.abs(dy) ? -10 : 0);
      const labelColor = edge.label.toLowerCase() === "ja" || edge.label.toLowerCase() === "yes" ? "#00868C" : "#3F3F3F";
      svgContent += `<text x="${labelX}" y="${labelY}" text-anchor="middle" `
        + `fill="${labelColor}" font-size="12" font-weight="bold" font-family="${font}">${edge.label}</text>`;
    }
  });

  // Draw nodes
  nodes.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;
    const cx = pos.x, cy = pos.y;

    if (node.type === "start" || node.type === "end") {
      // Oval
      const fill = node.type === "start" ? primary : "#3F3F3F";
      svgContent += `<ellipse cx="${cx}" cy="${cy}" rx="${ovalRx}" ry="${ovalRy}" fill="${fill}" filter="url(#shadow-sm)"/>`;
      svgContent += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#FFFFFF" `
        + `font-size="13" font-weight="bold" font-family="${font}">${node.label}</text>`;

    } else if (node.type === "decision") {
      // Diamond / Raute
      svgContent += `<polygon points="${cx},${cy - diamondH / 2} ${cx + diamondW / 2},${cy} ${cx},${cy + diamondH / 2} ${cx - diamondW / 2},${cy}" `
        + `fill="${decisionColor}" stroke="${decisionBorder}" stroke-width="1.8" filter="url(#shadow-sm)"/>`;
      svgContent += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#3F3F3F" `
        + `font-size="11" font-weight="bold" font-family="${font}">${node.label}</text>`;

    } else {
      // Process box
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="8" fill="${processColor}" stroke="#D8D8D8" stroke-width="1.5" filter="url(#shadow-sm)"/>`;
      // Left accent bar
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="5" height="${nodeH}" rx="2" fill="${primary}"/>`;
      svgContent += `<text x="${cx + 4}" y="${cy + (node.detail ? -3 : 5)}" text-anchor="middle" fill="#3F3F3F" `
        + `font-size="12" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx + 4}" y="${cy + 14}" text-anchor="middle" fill="#5B5D60" `
          + `font-size="10" font-family="${font}">${node.detail}</text>`;
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#7F7F7F"/>
  </marker>
  <filter id="shadow-sm"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

---

### 1.2 Swimlane-Diagramm

Parallele horizontale oder vertikale Bahnen (Lanes) die Verantwortlichkeiten darstellen, mit einem Prozessfluss der über die Lanes hinweg fließt. Lanes als farbig abgesetzte Streifen, Prozess-Knoten und Pfeile über Lane-Grenzen hinweg.

```javascript
/**
 * buildSwimlaneSvg — Generates a swimlane process diagram SVG
 * @param {object} opts
 * @param {number} [opts.width=1200] - SVG viewBox width
 * @param {number} [opts.height=700] - SVG viewBox height
 * @param {Array} opts.lanes - Array of lane definitions: { id: string, label: string, color?: string }
 * @param {Array} opts.nodes - Array of { id, label, lane: laneId, col: 0-based column position, type?: "start"|"end"|"process"|"decision" }
 * @param {Array} opts.edges - Array of { from, to, label? }
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {string} [opts.direction="horizontal"] - Lanes run "horizontal" (stacked top-bottom) or "vertical" (side by side)
 * @returns {string} SVG markup
 */
function buildSwimlaneSvg(opts) {
  const W = opts.width || 1200;
  const H = opts.height || 700;
  const primary = opts.primaryColor || "#00868C";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const lanes = opts.lanes || [];
  const nodes = opts.nodes || [];
  const edges = opts.edges || [];

  const headerW = 100;  // lane label area width
  const laneH = (H - 10) / lanes.length;
  const nodeW = 130, nodeH = 44;

  // Build lane backgrounds
  let svgContent = '';
  const laneColors = ["#F2F2F2", "#FFFFFF"];  // alternating

  lanes.forEach((lane, i) => {
    const ly = 5 + i * laneH;
    const bgColor = lane.color || laneColors[i % 2];

    // Lane background
    svgContent += `<rect x="${headerW}" y="${ly}" width="${W - headerW - 5}" height="${laneH}" `
      + `fill="${bgColor}" stroke="#D8D8D8" stroke-width="0.8"/>`;

    // Lane header
    svgContent += `<rect x="5" y="${ly}" width="${headerW - 5}" height="${laneH}" fill="${primary}" rx="0"/>`;
    svgContent += `<text x="${headerW / 2}" y="${ly + laneH / 2 + 4}" text-anchor="middle" `
      + `fill="#FFFFFF" font-size="11" font-weight="bold" font-family="${font}" `
      + `writing-mode="tb" letter-spacing="1">${lane.label}</text>`;
  });

  // Calculate node positions based on lane + col
  const positions = {};
  const maxCol = Math.max(...nodes.map(n => n.col || 0), 0);
  const colSpacing = (W - headerW - 80) / (maxCol + 1);

  nodes.forEach((node) => {
    const laneIdx = lanes.findIndex(l => l.id === node.lane);
    if (laneIdx < 0) return;
    const ly = 5 + laneIdx * laneH;
    positions[node.id] = {
      x: headerW + 40 + (node.col || 0) * colSpacing + colSpacing / 2,
      y: ly + laneH / 2,
    };
  });

  // Draw edges
  edges.forEach((edge) => {
    const from = positions[edge.from];
    const to = positions[edge.to];
    if (!from || !to) return;

    const dx = to.x - from.x, dy = to.y - from.y;
    let x1 = from.x + (dx > 0 ? nodeW / 2 + 3 : (dx < 0 ? -nodeW / 2 - 3 : 0));
    let y1 = from.y + (Math.abs(dx) < 10 ? (dy > 0 ? nodeH / 2 + 3 : -nodeH / 2 - 3) : 0);
    let x2 = to.x + (dx > 0 ? -nodeW / 2 - 3 : (dx < 0 ? nodeW / 2 + 3 : 0));
    let y2 = to.y + (Math.abs(dx) < 10 ? (dy > 0 ? -nodeH / 2 - 3 : nodeH / 2 + 3) : 0);

    // Orthogonal routing
    if (Math.abs(dx) > 20 && Math.abs(dy) > 20) {
      const midX = x1 + (x2 - x1) * 0.5;
      svgContent += `<path d="M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}" `
        + `fill="none" stroke="#7F7F7F" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    } else {
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" `
        + `stroke="#7F7F7F" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    }

    if (edge.label) {
      svgContent += `<text x="${(x1+x2)/2}" y="${(y1+y2)/2 - 8}" text-anchor="middle" `
        + `fill="#5B5D60" font-size="9" font-family="${font}">${edge.label}</text>`;
    }
  });

  // Draw nodes
  nodes.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;
    const type = node.type || "process";

    if (type === "start" || type === "end") {
      const fill = type === "start" ? primary : "#3F3F3F";
      svgContent += `<ellipse cx="${pos.x}" cy="${pos.y}" rx="45" ry="20" fill="${fill}"/>`;
      svgContent += `<text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="#FFF" `
        + `font-size="11" font-weight="bold" font-family="${font}">${node.label}</text>`;
    } else if (type === "decision") {
      svgContent += `<polygon points="${pos.x},${pos.y-30} ${pos.x+50},${pos.y} ${pos.x},${pos.y+30} ${pos.x-50},${pos.y}" `
        + `fill="#F2F2F2" stroke="#01B3BB" stroke-width="1.5"/>`;
      svgContent += `<text x="${pos.x}" y="${pos.y+4}" text-anchor="middle" fill="#3F3F3F" `
        + `font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
    } else {
      svgContent += `<rect x="${pos.x - nodeW/2}" y="${pos.y - nodeH/2}" width="${nodeW}" height="${nodeH}" `
        + `rx="6" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="1.2" filter="url(#shadow-sm)"/>`;
      svgContent += `<rect x="${pos.x - nodeW/2}" y="${pos.y - nodeH/2}" width="4" height="${nodeH}" rx="2" fill="${primary}"/>`;
      svgContent += `<text x="${pos.x + 4}" y="${pos.y + 4}" text-anchor="middle" fill="#3F3F3F" `
        + `font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#7F7F7F"/>
  </marker>
  <filter id="shadow-sm"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

---

## Kategorie 2: Netzwerk & Mindmap

---

### 2.1 Netzwerk-/Graph-Diagramm

Knoten an frei definierbaren Positionen, verbunden durch gerade Linien oder Bézier-Kurven mit Pfeilspitzen. Ideal für Microservice-Architekturen, Systemlandschaften, Stakeholder-Maps.

```javascript
/**
 * buildNetworkSvg — Generates a network/graph diagram SVG
 * @param {object} opts
 * @param {number} [opts.width=1000] - SVG viewBox width
 * @param {number} [opts.height=650] - SVG viewBox height
 * @param {Array} opts.nodes - Array of node objects:
 *   { id, label, x, y, detail?: string, size?: "sm"|"md"|"lg", color?: string, shape?: "circle"|"rect" }
 * @param {Array} opts.edges - Array of { from, to, label?, style?: "solid"|"dashed", bidirectional?: boolean }
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {boolean} [opts.curved=true] - Use Bézier curves for edges
 * @returns {string} SVG markup
 */
function buildNetworkSvg(opts) {
  const W = opts.width || 1000;
  const H = opts.height || 650;
  const primary = opts.primaryColor || "#00868C";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const nodes = opts.nodes || [];
  const edges = opts.edges || [];
  const curved = opts.curved !== false;

  const sizes = { sm: 30, md: 45, lg: 60 };

  let svgContent = '';

  // Draw edges
  edges.forEach((edge) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const x1 = fromNode.x, y1 = fromNode.y;
    const x2 = toNode.x, y2 = toNode.y;
    const dashAttr = edge.style === "dashed" ? ' stroke-dasharray="6,4"' : '';
    const markerAttr = edge.bidirectional
      ? ' marker-start="url(#arrow-rev)" marker-end="url(#arrow)"'
      : ' marker-end="url(#arrow)"';

    if (curved && Math.abs(x2 - x1) > 40 && Math.abs(y2 - y1) > 40) {
      // Bézier curve with control point offset perpendicular to the line
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const offset = len * 0.15;
      const cpX = midX + (-dy / len) * offset;
      const cpY = midY + (dx / len) * offset;
      svgContent += `<path d="M${x1},${y1} Q${cpX},${cpY} ${x2},${y2}" `
        + `fill="none" stroke="#A8CFD1" stroke-width="1.8"${dashAttr}${markerAttr}/>`;
    } else {
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" `
        + `stroke="#A8CFD1" stroke-width="1.8"${dashAttr}${markerAttr}/>`;
    }

    // Edge label at midpoint
    if (edge.label) {
      const lx = (x1 + x2) / 2, ly = (y1 + y2) / 2 - 10;
      svgContent += `<text x="${lx}" y="${ly}" text-anchor="middle" fill="#5B5D60" `
        + `font-size="9" font-family="${font}">${edge.label}</text>`;
    }
  });

  // Draw nodes
  nodes.forEach((node) => {
    const r = sizes[node.size || "md"];
    const color = node.color || primary;
    const shape = node.shape || "circle";

    if (shape === "rect") {
      const rw = r * 2.2, rh = r * 1.4;
      svgContent += `<rect x="${node.x - rw/2}" y="${node.y - rh/2}" width="${rw}" height="${rh}" `
        + `rx="8" fill="#FFFFFF" stroke="${color}" stroke-width="2" filter="url(#shadow-md)"/>`;
      svgContent += `<rect x="${node.x - rw/2}" y="${node.y - rh/2}" width="5" height="${rh}" rx="2" fill="${color}"/>`;
    } else {
      svgContent += `<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="#FFFFFF" `
        + `stroke="${color}" stroke-width="2.5" filter="url(#shadow-md)"/>`;
    }

    // Label
    svgContent += `<text x="${node.x}" y="${node.y + (node.detail ? -4 : 4)}" text-anchor="middle" `
      + `fill="#3F3F3F" font-size="${r > 40 ? 12 : 10}" font-weight="bold" font-family="${font}">${node.label}</text>`;

    if (node.detail) {
      svgContent += `<text x="${node.x}" y="${node.y + 12}" text-anchor="middle" `
        + `fill="#5B5D60" font-size="9" font-family="${font}">${node.detail}</text>`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#7F7F7F"/>
  </marker>
  <marker id="arrow-rev" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto-start-reverse">
    <polygon points="10 0, 0 3.5, 10 7" fill="#7F7F7F"/>
  </marker>
  <filter id="shadow-md"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.12"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

---

### 2.2 Mindmap (Radiale Verzweigung)

Zentraler Knoten mit radialen Ästen, die sich in Unteräste verzweigen. Organische Bézier-Kurven verbinden die Ebenen. Automatische Winkelverteilung.

```javascript
/**
 * buildMindmapSvg — Generates a radial mindmap SVG
 * @param {object} opts
 * @param {number} [opts.width=1100] - SVG viewBox width
 * @param {number} [opts.height=700] - SVG viewBox height
 * @param {object} opts.root - Root node: { label, children: [{ label, children?: [...] }] }
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {Array} [opts.branchColors] - Color per branch; defaults to Capco teal palette cycle
 * @returns {string} SVG markup
 */
function buildMindmapSvg(opts) {
  const W = opts.width || 1100;
  const H = opts.height || 700;
  const primary = opts.primaryColor || "#00868C";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const root = opts.root;
  if (!root) return '';

  const cx = W / 2, cy = H / 2;
  const branchColors = opts.branchColors || ["#00868C", "#01B3BB", "#3F3F3F", "#7CB7BA", "#7F7F7F", "#A8CFD1"];
  const level1Radius = 190;  // distance center → level 1 nodes
  const level2Radius = 140;  // distance level 1 → level 2 nodes

  const children = root.children || [];
  const n = children.length;

  let svgContent = '';

  // Draw branches
  children.forEach((child, i) => {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2; // start from top
    const bx = cx + Math.cos(angle) * level1Radius;
    const by = cy + Math.sin(angle) * level1Radius;
    const color = branchColors[i % branchColors.length];

    // Bézier from center to branch node
    const cpDist = level1Radius * 0.5;
    const cpx = cx + Math.cos(angle) * cpDist;
    const cpy = cy + Math.sin(angle) * cpDist;
    svgContent += `<path d="M${cx},${cy} Q${cpx},${cpy} ${bx},${by}" `
      + `fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;

    // Branch node (pill shape)
    const labelLen = (child.label || "").length;
    const pillW = Math.max(100, labelLen * 8 + 30);
    const pillH = 34;
    svgContent += `<rect x="${bx - pillW/2}" y="${by - pillH/2}" width="${pillW}" height="${pillH}" `
      + `rx="${pillH/2}" fill="${color}" filter="url(#shadow-sm)"/>`;
    svgContent += `<text x="${bx}" y="${by + 5}" text-anchor="middle" fill="#FFFFFF" `
      + `font-size="11" font-weight="bold" font-family="${font}">${child.label}</text>`;

    // Sub-branches (level 2)
    const subChildren = child.children || [];
    const subN = subChildren.length;
    const spread = Math.PI * 0.5;  // spread angle for sub-branches
    const startAngle = angle - spread / 2;

    subChildren.forEach((sub, si) => {
      const subAngle = subN > 1 ? startAngle + (spread / (subN - 1)) * si : angle;
      const sx = bx + Math.cos(subAngle) * level2Radius;
      const sy = by + Math.sin(subAngle) * level2Radius;

      // Curved line from branch to sub-node
      const sCpx = bx + Math.cos(subAngle) * (level2Radius * 0.4);
      const sCpy = by + Math.sin(subAngle) * (level2Radius * 0.4);
      svgContent += `<path d="M${bx},${by} Q${sCpx},${sCpy} ${sx},${sy}" `
        + `fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>`;

      // Sub-node (smaller pill)
      const subLabelLen = (sub.label || "").length;
      const subPillW = Math.max(80, subLabelLen * 7 + 20);
      const subPillH = 26;
      svgContent += `<rect x="${sx - subPillW/2}" y="${sy - subPillH/2}" width="${subPillW}" height="${subPillH}" `
        + `rx="${subPillH/2}" fill="#FFFFFF" stroke="${color}" stroke-width="1.5"/>`;
      svgContent += `<text x="${sx}" y="${sy + 4}" text-anchor="middle" fill="#3F3F3F" `
        + `font-size="9" font-weight="bold" font-family="${font}">${sub.label}</text>`;
    });
  });

  // Central node (drawn last, on top)
  const centerR = 52;
  svgContent += `<circle cx="${cx}" cy="${cy}" r="${centerR}" fill="${primary}" filter="url(#shadow-md)"/>`;
  svgContent += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#FFFFFF" `
    + `font-size="14" font-weight="bold" font-family="${font}">${root.label}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <filter id="shadow-sm"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/></filter>
  <filter id="shadow-md"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.12"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

---

## Kategorie 3: Zyklen & Kreismodelle

---

### 3.1 Zyklus-/Loop-Diagramm

Kreisförmige Anordnung von Phasen, verbunden durch gebogene Pfeile. Ideal für PDCA, Agile Sprints, DevOps-Loops, Feedback-Zyklen.

```javascript
/**
 * buildCycleSvg — Generates a circular cycle/loop diagram SVG
 * @param {object} opts
 * @param {number} [opts.width=700] - SVG viewBox width
 * @param {number} [opts.height=700] - SVG viewBox height
 * @param {Array} opts.phases - Array of { label: string, detail?: string, color?: string }
 * @param {string} [opts.centerLabel] - Optional text in the center
 * @param {string} [opts.centerDetail] - Optional subtitle in center
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {string} [opts.arrowColor="#7F7F7F"]
 * @returns {string} SVG markup
 */
function buildCycleSvg(opts) {
  const W = opts.width || 700;
  const H = opts.height || 700;
  const primary = opts.primaryColor || "#00868C";
  const arrowColor = opts.arrowColor || "#7F7F7F";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const phases = opts.phases || [];
  const n = phases.length;
  if (n === 0) return '';

  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.33;
  const nodeR = 42;
  const colors = ["#00868C", "#01B3BB", "#3F3F3F", "#7CB7BA", "#7F7F7F", "#A8CFD1"];

  let svgContent = '';

  // Draw curved arrows between nodes
  for (let i = 0; i < n; i++) {
    const angle1 = (2 * Math.PI / n) * i - Math.PI / 2;
    const angle2 = (2 * Math.PI / n) * ((i + 1) % n) - Math.PI / 2;
    const x1 = cx + Math.cos(angle1) * radius;
    const y1 = cy + Math.sin(angle1) * radius;
    const x2 = cx + Math.cos(angle2) * radius;
    const y2 = cy + Math.sin(angle2) * radius;

    // Arc path between nodes (outer arc)
    const midAngle = (angle1 + angle2) / 2 + (angle2 < angle1 ? Math.PI : 0);
    const arcBulge = radius * 0.15;

    // Start and end points offset from node edges
    const gapAngle = Math.asin(nodeR / radius) * 1.3;
    const startAngle = angle1 + gapAngle;
    const endAngle = angle2 - gapAngle;
    const sx = cx + Math.cos(startAngle) * radius;
    const sy = cy + Math.sin(startAngle) * radius;
    const ex = cx + Math.cos(endAngle) * radius;
    const ey = cy + Math.sin(endAngle) * radius;

    // Control point: push outward from center
    const cpAngle = (startAngle + endAngle) / 2;
    const cpDist = radius + arcBulge;
    const cpx = cx + Math.cos(cpAngle) * cpDist;
    const cpy = cy + Math.sin(cpAngle) * cpDist;

    svgContent += `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" `
      + `fill="none" stroke="${arrowColor}" stroke-width="2" marker-end="url(#arrow-cycle)" stroke-linecap="round"/>`;
  }

  // Draw phase nodes
  phases.forEach((phase, i) => {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2;
    const nx = cx + Math.cos(angle) * radius;
    const ny = cy + Math.sin(angle) * radius;
    const color = phase.color || colors[i % colors.length];

    svgContent += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${nodeR}" `
      + `fill="${color}" filter="url(#shadow-md)"/>`;
    svgContent += `<text x="${nx.toFixed(1)}" y="${(ny + 5).toFixed(1)}" text-anchor="middle" `
      + `fill="#FFFFFF" font-size="11" font-weight="bold" font-family="${font}">${phase.label}</text>`;

    // Detail label outside the circle
    if (phase.detail) {
      const detailDist = radius + nodeR + 22;
      const dx = cx + Math.cos(angle) * detailDist;
      const dy = cy + Math.sin(angle) * detailDist;
      svgContent += `<text x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" text-anchor="middle" `
        + `fill="#5B5D60" font-size="9" font-family="${font}">${phase.detail}</text>`;
    }
  });

  // Center label
  if (opts.centerLabel) {
    svgContent += `<circle cx="${cx}" cy="${cy}" r="38" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="1.5"/>`;
    svgContent += `<text x="${cx}" y="${cy + (opts.centerDetail ? -3 : 5)}" text-anchor="middle" `
      + `fill="#3F3F3F" font-size="12" font-weight="bold" font-family="${font}">${opts.centerLabel}</text>`;
    if (opts.centerDetail) {
      svgContent += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" `
        + `fill="#5B5D60" font-size="9" font-family="${font}">${opts.centerDetail}</text>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow-cycle" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="${arrowColor}"/>
  </marker>
  <filter id="shadow-md"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.12"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

---

### 3.2 Konzentrische Kreise (Zwiebelmodell)

Verschachtelte Kreisringe von innen (Kern) nach außen. Jeder Ring hat ein Label und optionale Segmentierung.

```javascript
/**
 * buildConcentricCirclesSvg — Generates a concentric circles (onion) diagram SVG
 * @param {object} opts
 * @param {number} [opts.width=700] - SVG viewBox width
 * @param {number} [opts.height=700] - SVG viewBox height
 * @param {Array} opts.rings - Array from innermost to outermost:
 *   { label: string, detail?: string, color?: string }
 * @param {string} [opts.primaryColor="#00868C"]
 * @returns {string} SVG markup
 */
function buildConcentricCirclesSvg(opts) {
  const W = opts.width || 700;
  const H = opts.height || 700;
  const primary = opts.primaryColor || "#00868C";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const rings = opts.rings || [];
  const n = rings.length;
  if (n === 0) return '';

  const cx = W / 2, cy = H / 2;
  const maxR = Math.min(W, H) * 0.42;
  const minR = maxR * 0.18;
  const ringStep = (maxR - minR) / n;

  // Colors: dark center → light outside
  const colorSteps = ["#00868C", "#01B3BB", "#7CB7BA", "#A8CFD1", "#9DC9CB", "#D8D8D8"];

  let svgContent = '';

  // Draw rings from outside in (so outer rings don't cover inner)
  for (let i = n - 1; i >= 0; i--) {
    const ring = rings[i];
    const r = minR + ringStep * (i + 1);
    const color = ring.color || colorSteps[Math.min(i, colorSteps.length - 1)];
    const opacity = 0.2 + (i / n) * 0.15;

    svgContent += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" `
      + `fill="${color}" opacity="${opacity.toFixed(2)}" stroke="${color}" stroke-width="2"/>`;

    // Label positioned in the ring band
    const labelR = minR + ringStep * i + ringStep * 0.5;
    // Place label at top of ring for outer, or center for innermost
    if (i === 0) {
      // Innermost: centered
      svgContent += `<text x="${cx}" y="${cy + (ring.detail ? -4 : 5)}" text-anchor="middle" `
        + `fill="#FFFFFF" font-size="13" font-weight="bold" font-family="${font}">${ring.label}</text>`;
      if (ring.detail) {
        svgContent += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" `
          + `fill="#FFFFFF" font-size="9" font-family="${font}" opacity="0.85">${ring.detail}</text>`;
      }
    } else {
      // Outer rings: label at top of band
      const ly = cy - labelR;
      svgContent += `<text x="${cx}" y="${ly + 5}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="11" font-weight="bold" font-family="${font}">${ring.label}</text>`;
      if (ring.detail) {
        svgContent += `<text x="${cx}" y="${ly + 19}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="9" font-family="${font}">${ring.detail}</text>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${svgContent}
</svg>`;
}
```

---

## Kategorie 4: Architektur-Diagramme

---

### 4.1 Architecture Flow (Zonen-basierter Datenfluss)

Horizontaler Datenfluss von links nach rechts durch benannte **Zonen** — vertikale Streifen die logische Bereiche, Phasen, Verantwortlichkeiten oder Umgebungen darstellen. Jede Zone enthält Komponenten verschiedener Typen, verbunden durch beschriftete Pfeile. Die Zonen und ihr Inhalt sind komplett parametrisch — die Funktion bildet keine bestimmte Architektur ab, sondern stellt das **visuelle Gerüst** für beliebige links-nach-rechts Architekturflüsse bereit.

**Typische Anwendungen:**
- Data Value Chains (Producers → Ingestion → Storage → Processing → Consumers)
- Cloud-Architektur-Übersichten (Client → CDN → API → Services → DB)
- Integration Landscapes (System A → Middleware → System B → Reporting)
- CI/CD Pipelines (Code → Build → Test → Stage → Production)
- Enterprise Data Flows (Source Systems → ETL → DWH → BI → Business Users)

**Shape-Typen** — visuell unterscheidbar je nach Komponententyp:
- `service` — Rechteck mit farbiger Akzentleiste links (Microservice, Applikation, ETL-Job, Worker)
- `database` — Zylinder-Form (Datenbank, Data Warehouse, Data Lake, Cache)
- `queue` — Doppelrand-Rechteck mit Queue-Icon (Message Broker, Event Bus, Stream)
- `api` — Abgerundetes Vollfarb-Rect (API Gateway, Endpoint, Interface, Load Balancer)
- `client` — Abgerundetes Rect mit Akzent-Leiste oben (User, Frontend, Dashboard, External System)
- `storage` — Gestrichelter Rand (Object Storage, File System, Blob, Archive)

```javascript
/**
 * buildArchitectureFlowSvg — Generates a zoned, left-to-right architecture flow SVG
 * @param {object} opts
 * @param {number} [opts.width=1300] - SVG viewBox width
 * @param {number} [opts.height=650] - SVG viewBox height
 * @param {Array} opts.zones - Array of zone objects (left to right):
 *   { id: string, label: string, sublabel?: string, color?: string }
 *   Zones represent logical areas (environments, phases, responsibilities, layers)
 * @param {Array} opts.nodes - Array of node objects:
 *   { id, label, zone: zoneId, row: 0-based vertical position within zone,
 *     type?: "service"|"database"|"queue"|"api"|"client"|"storage",
 *     detail?: string, color?: string }
 * @param {Array} opts.edges - Array of { from, to, label?, style?: "solid"|"dashed" }
 *   label is typically a protocol, data format, or short description
 * @param {string} [opts.primaryColor="#00868C"]
 * @param {string} [opts.zoneBorderColor="#D8D8D8"]
 * @returns {string} Complete SVG markup
 */
function buildArchitectureFlowSvg(opts) {
  const W = opts.width || 1300;
  const H = opts.height || 650;
  const primary = opts.primaryColor || "#00868C";
  const zoneBorderColor = opts.zoneBorderColor || "#D8D8D8";
  const font = 'Century Gothic, CenturyGothic, AppleGothic, sans-serif';
  const zones = opts.zones || [];
  const nodes = opts.nodes || [];
  const edges = opts.edges || [];

  const zoneGap = 4;
  const headerH = 42;           // zone label area at top
  const paddingTop = 18;        // space between header and first node
  const paddingX = 16;          // horizontal padding inside zone
  const nodeW = 130, nodeH = 52;
  const cylW = 110, cylH = 58, cylEllipseRy = 10;

  // Zone colors: alternating light backgrounds
  const zoneColors = ["#F8FAFA", "#FFFFFF", "#F2F8F8", "#FFFFFF", "#F8F8FA", "#FFFFFF"];

  // Calculate zone widths (equal distribution)
  const totalGap = zoneGap * (zones.length - 1);
  const zoneW = (W - totalGap - 20) / zones.length;
  const contentStartY = headerH + paddingTop;
  const contentH = H - contentStartY - 15;

  // Calculate node positions: centered in zone, distributed vertically by row
  const positions = {};
  const zoneXMap = {};

  zones.forEach((zone, zi) => {
    const zx = 10 + zi * (zoneW + zoneGap);
    zoneXMap[zone.id] = { x: zx, w: zoneW };
  });

  // Group nodes by zone, find max row per zone
  const nodesByZone = {};
  nodes.forEach((node) => {
    if (!nodesByZone[node.zone]) nodesByZone[node.zone] = [];
    nodesByZone[node.zone].push(node);
  });

  nodes.forEach((node) => {
    const zInfo = zoneXMap[node.zone];
    if (!zInfo) return;
    const nodesInZone = nodesByZone[node.zone] || [];
    const maxRow = Math.max(...nodesInZone.map(n => n.row || 0), 0);
    const rowCount = maxRow + 1;
    const rowH = contentH / rowCount;
    const row = node.row || 0;

    positions[node.id] = {
      x: zInfo.x + zInfo.w / 2,
      y: contentStartY + row * rowH + rowH / 2,
    };
  });

  let svgContent = '';

  // ── ZONES ──
  zones.forEach((zone, zi) => {
    const zx = 10 + zi * (zoneW + zoneGap);
    const bgColor = zone.color || zoneColors[zi % zoneColors.length];

    // Zone background
    svgContent += `<rect x="${zx}" y="${headerH}" width="${zoneW}" height="${H - headerH - 8}" `
      + `rx="6" fill="${bgColor}" stroke="${zoneBorderColor}" stroke-width="1" stroke-dasharray="4,3" opacity="0.85"/>`;

    // Zone header bar
    const headerColor = zi === 0 ? primary :
                        zi === zones.length - 1 ? "#3F3F3F" :
                        `${primary}${Math.round(200 - zi * 20).toString(16).padStart(2, '0')}`;
    // Use solid teal-gradient headers
    const tealShades = ["#00868C", "#01A3A8", "#01B3BB", "#3FBFC4", "#7CB7BA", "#3F3F3F"];
    const hColor = tealShades[Math.min(zi, tealShades.length - 1)];

    svgContent += `<rect x="${zx}" y="0" width="${zoneW}" height="${headerH}" rx="6" fill="${hColor}"/>`;
    // Square off bottom corners of header
    svgContent += `<rect x="${zx}" y="${headerH - 6}" width="${zoneW}" height="6" fill="${hColor}"/>`;

    // Zone label
    svgContent += `<text x="${zx + zoneW / 2}" y="${headerH / 2 + (zone.sublabel ? -3 : 5)}" `
      + `text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="bold" `
      + `font-family="${font}" letter-spacing="0.5">${zone.label}</text>`;

    if (zone.sublabel) {
      svgContent += `<text x="${zx + zoneW / 2}" y="${headerH / 2 + 13}" `
        + `text-anchor="middle" fill="#FFFFFF" font-size="9" font-family="${font}" opacity="0.8">${zone.sublabel}</text>`;
    }
  });

  // ── EDGES (drawn before nodes so they go behind) ──
  edges.forEach((edge) => {
    const fromPos = positions[edge.from];
    const toPos = positions[edge.to];
    if (!fromPos || !toPos) return;

    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    const fromType = fromNode ? fromNode.type || "service" : "service";
    const toType = toNode ? toNode.type || "service" : "service";

    // Horizontal offset from node edge
    const getHalfW = (type) => {
      if (type === "database") return cylW / 2 + 5;
      if (type === "api" || type === "client") return nodeW / 2 + 5;
      return nodeW / 2 + 5;
    };

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;

    let x1, y1, x2, y2;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Primarily horizontal
      x1 = fromPos.x + (dx > 0 ? getHalfW(fromType) : -getHalfW(fromType));
      y1 = fromPos.y;
      x2 = toPos.x + (dx > 0 ? -getHalfW(toType) : getHalfW(toType));
      y2 = toPos.y;
    } else {
      // Primarily vertical
      x1 = fromPos.x;
      y1 = fromPos.y + (dy > 0 ? nodeH / 2 + 5 : -nodeH / 2 - 5);
      x2 = toPos.x;
      y2 = toPos.y + (dy > 0 ? -nodeH / 2 - 5 : nodeH / 2 + 5);
    }

    const dashAttr = edge.style === "dashed" ? ' stroke-dasharray="6,4"' : '';

    // Route: if both horizontal and vertical offset, use L-shaped or smooth curve
    if (Math.abs(dx) > 30 && Math.abs(dy) > 20) {
      // Smooth S-curve for cross-row connections
      const midX = (x1 + x2) / 2;
      svgContent += `<path d="M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}" `
        + `fill="none" stroke="#A8CFD1" stroke-width="1.8"${dashAttr} marker-end="url(#arrow-arch)"/>`;
    } else {
      // Straight line
      svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" `
        + `stroke="#A8CFD1" stroke-width="1.8"${dashAttr} marker-end="url(#arrow-arch)"/>`;
    }

    // Edge label (protocol/format)
    if (edge.label) {
      const lx = (x1 + x2) / 2;
      const ly = Math.min(y1, y2) - 8;
      // Label background for readability
      const labelW = edge.label.length * 6.5 + 12;
      svgContent += `<rect x="${lx - labelW / 2}" y="${ly - 11}" width="${labelW}" height="16" `
        + `rx="3" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="0.5" opacity="0.9"/>`;
      svgContent += `<text x="${lx}" y="${ly}" text-anchor="middle" `
        + `fill="#5B5D60" font-size="8" font-weight="bold" font-family="${font}">${edge.label}</text>`;
    }
  });

  // ── NODES ──
  nodes.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;
    const type = node.type || "service";
    const color = node.color || primary;
    const cx = pos.x, cy = pos.y;

    if (type === "database") {
      // Cylinder shape
      const dx = cx - cylW / 2, dy = cy - cylH / 2;
      const bodyH = cylH - cylEllipseRy;
      // Bottom ellipse
      svgContent += `<ellipse cx="${cx}" cy="${dy + bodyH}" rx="${cylW / 2}" ry="${cylEllipseRy}" `
        + `fill="#FFFFFF" stroke="${color}" stroke-width="1.8"/>`;
      // Body rect (covers bottom half of top ellipse)
      svgContent += `<rect x="${dx}" y="${dy + cylEllipseRy}" width="${cylW}" height="${bodyH - cylEllipseRy}" `
        + `fill="#FFFFFF" stroke="none"/>`;
      // Side lines
      svgContent += `<line x1="${dx}" y1="${dy + cylEllipseRy}" x2="${dx}" y2="${dy + bodyH}" `
        + `stroke="${color}" stroke-width="1.8"/>`;
      svgContent += `<line x1="${dx + cylW}" y1="${dy + cylEllipseRy}" x2="${dx + cylW}" y2="${dy + bodyH}" `
        + `stroke="${color}" stroke-width="1.8"/>`;
      // Top ellipse (on top of everything)
      svgContent += `<ellipse cx="${cx}" cy="${dy + cylEllipseRy}" rx="${cylW / 2}" ry="${cylEllipseRy}" `
        + `fill="#FFFFFF" stroke="${color}" stroke-width="1.8"/>`;
      // Fill inside top ellipse
      svgContent += `<ellipse cx="${cx}" cy="${dy + cylEllipseRy}" rx="${cylW / 2 - 1}" ry="${cylEllipseRy - 1}" `
        + `fill="${color}" opacity="0.1"/>`;
      // Label
      svgContent += `<text x="${cx}" y="${cy + (node.detail ? -2 : 5)}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx}" y="${cy + 13}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="8" font-family="${font}">${node.detail}</text>`;
      }

    } else if (type === "queue") {
      // Rectangle with double border (message queue / event bus)
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="4" fill="#FFFFFF" stroke="${color}" stroke-width="2.5" filter="url(#shadow-sm)"/>`;
      svgContent += `<rect x="${cx - nodeW / 2 + 4}" y="${cy - nodeH / 2 + 4}" width="${nodeW - 8}" height="${nodeH - 8}" `
        + `rx="2" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.4"/>`;
      // Queue icon: 3 horizontal lines
      const iconX = cx - nodeW / 2 + 12, iconY = cy - 7;
      for (let li = 0; li < 3; li++) {
        svgContent += `<line x1="${iconX}" y1="${iconY + li * 7}" x2="${iconX + 16}" y2="${iconY + li * 7}" `
          + `stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`;
      }
      svgContent += `<text x="${cx + 10}" y="${cy + (node.detail ? -2 : 4)}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx + 10}" y="${cy + 13}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="8" font-family="${font}">${node.detail}</text>`;
      }

    } else if (type === "api") {
      // Teal filled rounded rect (API Gateway / Endpoint)
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="10" fill="${color}" filter="url(#shadow-sm)"/>`;
      svgContent += `<text x="${cx}" y="${cy + (node.detail ? -3 : 5)}" text-anchor="middle" `
        + `fill="#FFFFFF" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx}" y="${cy + 13}" text-anchor="middle" `
          + `fill="#FFFFFF" font-size="8" font-family="${font}" opacity="0.85">${node.detail}</text>`;
      }

    } else if (type === "client") {
      // Rounded rect with grey accent (User / Dashboard / Consumer)
      const clientColor = node.color || "#3F3F3F";
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="10" fill="#FFFFFF" stroke="${clientColor}" stroke-width="1.8" filter="url(#shadow-sm)"/>`;
      // Top accent bar
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="5" `
        + `rx="2" fill="${clientColor}"/>`;
      // Rounded top corners of accent bar
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2 + 3}" width="${nodeW}" height="3" `
        + `fill="${clientColor}"/>`;
      svgContent += `<text x="${cx}" y="${cy + (node.detail ? 1 : 7)}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="8" font-family="${font}">${node.detail}</text>`;
      }

    } else if (type === "storage") {
      // Dashed border rectangle (Object Storage / File System)
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="6" fill="#FFFFFF" stroke="${color}" stroke-width="1.5" stroke-dasharray="5,3"/>`;
      svgContent += `<text x="${cx}" y="${cy + (node.detail ? -2 : 5)}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx}" y="${cy + 13}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="8" font-family="${font}">${node.detail}</text>`;
      }

    } else {
      // Default: service — rectangle with left accent bar
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="${nodeW}" height="${nodeH}" `
        + `rx="6" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="1.2" filter="url(#shadow-sm)"/>`;
      svgContent += `<rect x="${cx - nodeW / 2}" y="${cy - nodeH / 2}" width="5" height="${nodeH}" rx="2" fill="${color}"/>`;
      svgContent += `<text x="${cx + 4}" y="${cy + (node.detail ? -2 : 5)}" text-anchor="middle" `
        + `fill="#3F3F3F" font-size="10" font-weight="bold" font-family="${font}">${node.label}</text>`;
      if (node.detail) {
        svgContent += `<text x="${cx + 4}" y="${cy + 13}" text-anchor="middle" `
          + `fill="#5B5D60" font-size="8" font-family="${font}">${node.detail}</text>`;
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow-arch" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#7CB7BA"/>
  </marker>
  <filter id="shadow-sm"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.08"/></filter>
</defs>
${svgContent}
</svg>`;
}
```

**Layout-Prinzipien:**
- Zonen werden automatisch gleichmäßig über die Breite verteilt — Anzahl und Bedeutung sind frei wählbar
- Knoten werden via `zone` (horizontale Platzierung) und `row` (vertikale Staffelung, 0-basiert) positioniert
- Mehrere Knoten in derselben Zone auf verschiedenen Rows erzeugen parallele Pfade
- Pfeile routen automatisch: gerade bei gleicher Row, S-Kurve (Cubic Bézier) bei unterschiedlichen Rows
- Edge-Labels (Protokolle, Formate, kurze Beschreibungen) bekommen einen weißen Hintergrund-Chip für Lesbarkeit
- Shape-Typen wählen je nach Komponenten-Art: `database` für Datenhaltung, `queue` für asynchrone Kommunikation, `api` für Schnittstellen, `service` als Default, `client` für externe Systeme/User, `storage` für Dateiablage

---

## Kompositions-Beispiele

### Beispiel 5: Architecture Flow — Cloud Platform

```javascript
const svg = buildArchitectureFlowSvg({
  width: 1300, height: 580,
  zones: [
    { id: "client", label: "CLIENTS", sublabel: "External Access" },
    { id: "edge", label: "EDGE", sublabel: "Entry Point" },
    { id: "app", label: "APPLICATION", sublabel: "Business Logic" },
    { id: "data", label: "DATA", sublabel: "Persistence" },
  ],
  nodes: [
    { id: "web", label: "Web App", zone: "client", row: 0, type: "client" },
    { id: "mobile", label: "Mobile App", zone: "client", row: 1, type: "client" },
    { id: "cdn", label: "CDN", detail: "CloudFront", zone: "edge", row: 0, type: "service" },
    { id: "gw", label: "API Gateway", zone: "edge", row: 1, type: "api" },
    { id: "auth", label: "Auth Service", detail: "OAuth 2.0", zone: "app", row: 0, type: "service" },
    { id: "core", label: "Core API", detail: "Node.js", zone: "app", row: 1, type: "service" },
    { id: "worker", label: "Async Worker", zone: "app", row: 2, type: "service", color: "#7F7F7F" },
    { id: "db", label: "PostgreSQL", detail: "Primary", zone: "data", row: 0, type: "database" },
    { id: "cache", label: "Redis", detail: "Cache", zone: "data", row: 1, type: "database", color: "#7F7F7F" },
    { id: "queue", label: "SQS", detail: "Job Queue", zone: "data", row: 2, type: "queue" },
  ],
  edges: [
    { from: "web", to: "cdn" },
    { from: "mobile", to: "gw", label: "REST" },
    { from: "cdn", to: "gw" },
    { from: "gw", to: "auth", label: "JWT" },
    { from: "gw", to: "core" },
    { from: "core", to: "db", label: "SQL" },
    { from: "core", to: "cache" },
    { from: "core", to: "queue", label: "Events" },
    { from: "queue", to: "worker", style: "dashed" },
  ],
});
await addSvgDiagram(slide, pres, svg, { x: 0.3, y: 1.5, w: 12.73, h: 5.2 });
```

### Beispiel 6: Architecture Flow — Data Pipeline

```javascript
const svg = buildArchitectureFlowSvg({
  width: 1300, height: 550,
  zones: [
    { id: "src", label: "SOURCES" },
    { id: "ingest", label: "INGESTION" },
    { id: "store", label: "STORAGE" },
    { id: "proc", label: "PROCESSING" },
    { id: "serve", label: "CONSUMERS" },
  ],
  nodes: [
    { id: "erp", label: "ERP", detail: "SAP", zone: "src", row: 0, type: "service" },
    { id: "iot", label: "IoT Sensors", zone: "src", row: 1, type: "client" },
    { id: "kafka", label: "Kafka", detail: "Streaming", zone: "ingest", row: 0, type: "queue" },
    { id: "lake", label: "Data Lake", detail: "S3 / Delta", zone: "store", row: 0, type: "storage" },
    { id: "dwh", label: "Warehouse", detail: "Snowflake", zone: "store", row: 1, type: "database" },
    { id: "spark", label: "Spark", detail: "Transform", zone: "proc", row: 0, type: "service" },
    { id: "dash", label: "Dashboards", detail: "Power BI", zone: "serve", row: 0, type: "client" },
    { id: "ml", label: "ML Platform", zone: "serve", row: 1, type: "service", color: "#01B3BB" },
  ],
  edges: [
    { from: "erp", to: "kafka", label: "CDC" },
    { from: "iot", to: "kafka", label: "MQTT" },
    { from: "kafka", to: "lake", label: "Avro" },
    { from: "lake", to: "dwh" },
    { from: "lake", to: "spark" },
    { from: "spark", to: "dash", label: "API" },
    { from: "dwh", to: "dash", label: "SQL" },
    { from: "spark", to: "ml" },
  ],
});
await addSvgDiagram(slide, pres, svg, { x: 0.3, y: 1.5, w: 12.73, h: 5.0 });
```

### Beispiel 1: Flowchart auf einer Slide

```javascript
const slide = pres.addSlide();
slide.background = { color: "FFFFFF" };
addSlideHeader(slide, pres, "03", "PROCESS", "APPROVAL WORKFLOW",
  "End-to-end request approval flow");

const svg = buildFlowchartSvg({
  width: 1000, height: 650,
  nodes: [
    { id: "start", type: "start", label: "Request" },
    { id: "review", type: "process", label: "Manager Review", detail: "Within 48h" },
    { id: "check", type: "decision", label: "Approved?" },
    { id: "implement", type: "process", label: "Implementation", detail: "Dev team" },
    { id: "reject", type: "process", label: "Revision", detail: "Back to requester", x: 700, y: 270 },
    { id: "end", type: "end", label: "Complete" },
  ],
  edges: [
    { from: "start", to: "review" },
    { from: "review", to: "check" },
    { from: "check", to: "implement", label: "Ja" },
    { from: "check", to: "reject", label: "Nein" },
    { from: "implement", to: "end" },
    { from: "reject", to: "review" },
  ],
});

await addSvgDiagram(slide, pres, svg, { x: 0.6, y: 1.5, w: 12.13, h: 5.5 });
```

### Beispiel 2: Microservice-Netzwerk

```javascript
const svg = buildNetworkSvg({
  width: 1000, height: 600,
  nodes: [
    { id: "gw", label: "API Gateway", x: 500, y: 60, size: "lg", color: "#00868C" },
    { id: "auth", label: "Auth", detail: "OAuth 2.0", x: 200, y: 220 },
    { id: "user", label: "User Svc", detail: "CRUD", x: 500, y: 220 },
    { id: "order", label: "Order Svc", detail: "Processing", x: 800, y: 220 },
    { id: "db1", label: "PostgreSQL", x: 350, y: 420, shape: "rect", color: "#3F3F3F" },
    { id: "db2", label: "MongoDB", x: 650, y: 420, shape: "rect", color: "#3F3F3F" },
    { id: "mq", label: "Kafka", x: 500, y: 540, shape: "rect", color: "#7F7F7F" },
  ],
  edges: [
    { from: "gw", to: "auth", label: "JWT" },
    { from: "gw", to: "user" },
    { from: "gw", to: "order" },
    { from: "user", to: "db1" },
    { from: "order", to: "db2" },
    { from: "order", to: "mq", label: "Events" },
    { from: "user", to: "mq", style: "dashed" },
  ],
});

await addSvgDiagram(slide, pres, svg, { x: 0.6, y: 1.5, w: 12.13, h: 5.5 });
```

### Beispiel 3: DevOps-Zyklus + Konzentrische Kreise Kombination

```javascript
// Left: DevOps Cycle
const cycleSvg = buildCycleSvg({
  width: 600, height: 600,
  phases: [
    { label: "PLAN", detail: "Requirements" },
    { label: "CODE", detail: "Development" },
    { label: "BUILD", detail: "CI Pipeline" },
    { label: "TEST", detail: "QA & Security" },
    { label: "RELEASE", detail: "Staging" },
    { label: "DEPLOY", detail: "Production" },
    { label: "OPERATE", detail: "Monitoring" },
    { label: "MONITOR", detail: "Feedback" },
  ],
  centerLabel: "DevOps",
  centerDetail: "Continuous",
});
await addSvgDiagram(slide, pres, cycleSvg, { x: 0.3, y: 1.5, w: 6.2, h: 5.5 });

// Right: Security Onion Model
const onionSvg = buildConcentricCirclesSvg({
  width: 500, height: 500,
  rings: [
    { label: "DATA", detail: "Encryption" },
    { label: "APPLICATION", detail: "SAST / DAST" },
    { label: "NETWORK", detail: "Firewall / VPN" },
    { label: "PERIMETER", detail: "WAF / DDoS" },
    { label: "POLICIES", detail: "Governance" },
  ],
});
await addSvgDiagram(slide, pres, onionSvg, { x: 6.8, y: 1.5, w: 5.93, h: 5.5 });
```

### Beispiel 4: Mindmap

```javascript
const svg = buildMindmapSvg({
  root: {
    label: "Digital\nStrategy",
    children: [
      { label: "Cloud", children: [
        { label: "AWS" }, { label: "Azure" }, { label: "GCP" },
      ]},
      { label: "Data & AI", children: [
        { label: "ML Ops" }, { label: "Analytics" },
      ]},
      { label: "Security", children: [
        { label: "Zero Trust" }, { label: "IAM" },
      ]},
      { label: "Agile", children: [
        { label: "Scrum" }, { label: "SAFe" },
      ]},
    ],
  },
});
await addSvgDiagram(slide, pres, svg, { x: 0.6, y: 1.5, w: 12.13, h: 5.5 });
```

---

## Komponenten-Übersicht (Quick Reference)

| # | Funktion | Kategorie | Warum SVG? |
|---|----------|-----------|------------|
| 1.1 | `buildFlowchartSvg()` | Flow | Rauten, Pfeilspitzen, Routing |
| 1.2 | `buildSwimlaneSvg()` | Flow | Cross-Lane-Pfeile, Rauten |
| 2.1 | `buildNetworkSvg()` | Netzwerk | Bézier-Kurven, freie Positionierung |
| 2.2 | `buildMindmapSvg()` | Netzwerk | Radiales Layout, organische Kurven |
| 3.1 | `buildCycleSvg()` | Zyklus | Kreisbögen, gebogene Pfeile |
| 3.2 | `buildConcentricCirclesSvg()` | Zyklus | Verschachtelte Kreisringe |
| 4.1 | `buildArchitectureFlowSvg()` | Architektur | Zonen, Zylinder, S-Kurven, 6 Shape-Typen, Datenfluss |

**Alle Funktionen** geben einen SVG-String zurück. Via `addSvgDiagram()` auf die Slide bringen.

---

## Anti-Patterns

1. **NEVER add a background rect** — SVGs sind transparent für nahtlose Slide-Integration
2. **NEVER use `#` in PptxGenJS color values** — nur in SVG-Farben verwenden; PptxGenJS-Farben ohne `#`
3. **NEVER use `foreignObject`** — Text immer als `<text>` Element, nicht als HTML
4. **NEVER rely on auto text-wrap** — SVG kann kein Auto-Wrap; lange Labels manuell mit `\n` oder `<tspan>` umbrechen
5. **NEVER forget `xmlns`** — ohne `xmlns="http://www.w3.org/2000/svg"` kann `sharp` nicht konvertieren
6. **NEVER use external fonts/images** — SVG muss standalone sein; Century Gothic als System-Font mit Fallbacks
7. **NEVER mix SVG-Farben und PptxGenJS-Farben** — SVG nutzt `#00868C`, PptxGenJS nutzt `00868C` (ohne #)
8. **NEVER use font-size below 9** — wird auf Slides zu klein zum Lesen nach Konvertierung

---

## Zusammenfassung

Dieser Skill liefert **7 SVG-Diagramm-Funktionen** + 1 Helper (`addSvgDiagram`) für die Diagrammtypen, die native PptxGenJS-Shapes nicht abbilden können. Jede Funktion:

- Hat eine konsistente Signatur: `buildXxxSvg(opts)` → gibt SVG-String zurück
- Verwendet die identische Capco Teal/Grau-Palette als Default
- Nutzt Century Gothic als Font (mit System-Fallbacks)
- Erzeugt transparente SVGs für nahtlose Slide-Integration
- Berechnet Positionen dynamisch basierend auf der Knotenanzahl

**Workflow:** Immer zuerst `capco-slides` für das Deck-Gerüst lesen, dann `capco-visual-components` für native Komponenten, dann diese Datei für SVG-basierte Diagramme. Beides kann auf derselben Slide kombiniert werden.
