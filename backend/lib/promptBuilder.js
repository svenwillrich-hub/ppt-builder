const fs = require('fs');
const path = require('path');

class PromptBuilder {
  static getStyleInstructions(styleIds) {
    const stylesPath = '/app/config/styles.json';
    let styles = [];
    try {
      styles = JSON.parse(fs.readFileSync(stylesPath, 'utf-8'));
    } catch (e) {
      return '';
    }

    const selected = styles.filter(s => styleIds.includes(s.id) && s.enabled);
    if (selected.length === 0) return 'No specific style selected.';

    return selected.map(s => `- ${s.name}: ${s.instruction}`).join('\n');
  }

  static getSkillContents() {
    const skillsDir = '/app/skills';
    const parts = [];
    try {
      const files = fs.readdirSync(skillsDir).filter(f =>
        f.endsWith('.skill') || f.endsWith('.md') || f.endsWith('.txt')
      );
      for (const file of files) {
        if (file === 'README.md') continue;
        const content = fs.readFileSync(path.join(skillsDir, file), 'utf-8');
        parts.push(`### ${file}\n${content}`);
      }
    } catch (e) {
      // Skills dir may not exist or be empty
    }
    return parts.length > 0 ? parts.join('\n\n') : 'No skill files available.';
  }

  static getUploadedFileContents(filenames) {
    if (!filenames || filenames.length === 0) return 'No reference documents uploaded.';

    const parts = [];
    for (const filename of filenames) {
      const filePath = path.join('/app/uploads', filename);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        parts.push(`### ${filename}\n${content}`);
      } catch (e) {
        parts.push(`### ${filename}\n[Binary file — available at /app/uploads/${filename}]`);
      }
    }
    return parts.join('\n\n');
  }

  static buildAnalyzePrompt({ content, language, styles, uploadedFiles, defaultInstructions }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const fileContents = this.getUploadedFileContents(uploadedFiles);

    let uploadedFilePaths = '';
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFilePaths = uploadedFiles
        .map(f => `/app/uploads/${f}`)
        .join('\n');
    }

    return `You are a presentation architect. Analyze the following content and create a structured slide deck outline.

Language: ${language || 'english'}

## Style Guidelines
${styleInstructions}

${defaultInstructions ? `## Additional Instructions\n${defaultInstructions}\n` : ''}

## Input Content
${content || '(No text content provided)'}

${uploadedFilePaths ? `## Uploaded Reference Files\nThe following files are available for reference:\n${uploadedFilePaths}\nRead these files to extract relevant content for the presentation.\n` : ''}

## Reference Documents
${fileContents}

## Instructions

Think carefully about the **storyline** across all slides. Each slide must logically build on the previous one, creating a coherent narrative arc from start to finish.

Return ONLY a valid JSON array with this structure for each slide:
[
  {
    "slideNumber": 1,
    "actionTitle": "Bold, concise slide title",
    "coreMessage": "One sentence explaining the key takeaway and how this slide fits into the overall storyline",
    "description": "- Key argument or fact this slide establishes\\n- Supporting evidence or data point\\n- How this connects to the next slide in the storyline",
    "researchNeeded": false
  }
]

IMPORTANT for the description field:
- Exactly 3 bullet points, each starting with "- "
- Pure content only: facts, arguments, data, storyline connections
- Do NOT mention visual layout, design, charts, or how to display anything
- Focus on WHAT the slide says, not HOW it looks
- Each bullet should be one concise sentence

Do not include any text outside the JSON array.`;
  }

  static buildGeneratePrompt({ slides, language, styles, uploadedFiles, defaultInstructions, palette, font }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const skillContents = this.getSkillContents();
    const fileContents = this.getUploadedFileContents(uploadedFiles);

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10) + '-' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const titleSlug = (slides[0]?.actionTitle || 'presentation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const filename = `${timestamp}-${titleSlug}.pptx`;

    const researchSlides = slides.filter(s => s.researchNeeded);
    let researchSection = 'No research requested.';
    if (researchSlides.length > 0) {
      researchSection = `The following slides require real-world research with cited sources:
${researchSlides.map(s => `- Slide ${s.slideNumber}: "${s.actionTitle}"`).join('\n')}

For each research slide:
1. Use web search to find relevant academic papers, industry reports, or authoritative sources
2. Prefer: peer-reviewed papers, conference proceedings, Gartner/McKinsey/BCG reports, official statistics
3. Also acceptable: authoritative websites, industry publications — include full URL
4. Add a FOOTNOTES section at the bottom of each research slide with APA-style citations
5. APA format examples:
   - Journal: Author, A. B. (Year). Title of article. Journal Name, Volume(Issue), Pages. https://doi.org/xxx
   - Website: Author/Organization. (Year). Title of page. Site Name. https://url
6. Reference each claim in the slide body with a superscript number matching the footnote
7. Use small font (8-9pt) for footnotes to keep them unobtrusive`;
    }

    return `You are a professional presentation designer. Create a PPTX file based on this confirmed slide outline.

## CRITICAL: Environment Info
- You are running inside a Docker container as user "appuser"
- Node.js 20 is available. pptxgenjs is PRE-INSTALLED at /app/node_modules/pptxgenjs — do NOT install it again
- Python 3.11 is available. python-pptx and Pillow are PRE-INSTALLED — do NOT install them again
- Working directory is /app
- Output directory /app/outputs/ exists and is writable
- Use either pptxgenjs (Node.js) or python-pptx (Python) to create the PPTX file — both work
- Do NOT use pip install or npm install — everything is already set up
- Write the generation script to /tmp/ and execute it from there

Language: ${language || 'english'}

## Color & Typography Customization
${this.buildPaletteBlock(palette, font)}

## Style Guidelines
${styleInstructions}

${defaultInstructions ? `## Additional Instructions\n${defaultInstructions}\n` : ''}

## Skill References
${skillContents}

## Slide Outline
${JSON.stringify(slides, null, 2)}

## Research Requirements
${researchSection}

## Reference Documents
${fileContents}

Create the presentation as a .pptx file and save it to /app/outputs/${filename}
After completing each slide, print exactly: SLIDE_COMPLETE::{slideNumber}
This allows the UI to track progress.

## CRITICAL: Post-Generation Validation
After creating the PPTX file, ALWAYS run this validation step to prevent PowerPoint repair warnings:
\`\`\`
python3 -c "from pptx import Presentation; p = Presentation('/app/outputs/${filename}'); p.save('/app/outputs/${filename}')"
\`\`\`
This re-saves the file through python-pptx's XML parser which fixes common formatting issues.`;
  }

  static buildPaletteBlock(palette, font) {
    if (!palette) return 'No palette selected. Use a professional consulting color scheme with blue as primary accent.';
    const c = palette.colors.map(hex => hex.replace('#', ''));
    let block = `CUSTOM Color Palette: ${palette.name}

CRITICAL: Use EXACTLY these hex values wherever the skills reference palette.* variables:

\`\`\`javascript
const palette = {
  primary:      "${c[0]}",
  primaryLight: "${c[4] || c[0]}",
  primaryPale:  "${c[2] || c[0]}",
  accent:       "${c[1]}",
  accentLight:  "${c[3] || c[2] || c[0]}",
  alertRed:     "${c[3] || 'CC0000'}",
  darkGreen:    "${c[5] || '2D6A2E'}",
  lightBg:      "FFFFFF",
  lightGray:    "F2F2F2",
  textDark:     "000000",
  textBody:     "3F3F3F",
  textMuted:    "5B5D60",
  textSubtle:   "57677A",
  textLight:    "FFFFFF",
  cardBg:       "FFFFFF",
  border:       "D8D8D8",
  midGrey:      "7F7F7F",
};
\`\`\`

For SVG skills, prepend "#" to each value (e.g. "#${c[0]}" instead of "${c[0]}").
All 6 palette colors: ${palette.colors.join(', ')}`;
    if (font) block += `\n\nCUSTOM Font: ${font}\nUse "${font}" for ALL text in the presentation (titles, body, labels). This overrides any skill-defined fonts.`;
    return block;
  }

  static buildStorylineContext({ slides, language, palette, font, styles }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const paletteBlock = this.buildPaletteBlock(palette, font);
    const slideOutline = slides.map(s =>
      `- Slide ${s.slideNumber}/${slides.length}: "${s.actionTitle}" — ${s.coreMessage || s.description || ''}`
    ).join('\n');

    return `## Presentation Storyline Context

You are generating ONE slide of a ${slides.length}-slide presentation. The other slides are being generated in parallel by separate Claude sessions. You must focus ONLY on your assigned slide, but use this context to ensure visual and narrative consistency.

Language: ${language || 'english'}

## Full Slide Outline (for storyline awareness)
${slideOutline}

## Color & Typography Customization
${paletteBlock}

## Style Guidelines
${styleInstructions}

## CRITICAL: Environment Info
- You are running inside a Docker container as user "appuser"
- Node.js 20 is available. pptxgenjs is PRE-INSTALLED at /app/node_modules/pptxgenjs — do NOT install it again
- Python 3.11 is available. python-pptx and Pillow are PRE-INSTALLED — do NOT install them again
- Working directory is /app
- Do NOT use pip install or npm install — everything is already set up
- Write the generation script to /tmp/ and execute it from there`;
  }

  static buildSingleSlidePrompt({ slide, totalSlides, storylineContext, uploadedFiles, defaultInstructions, outputPath }) {
    const skillContents = this.getSkillContents();
    const fileContents = this.getUploadedFileContents(uploadedFiles);

    let researchSection = '';
    if (slide.researchNeeded) {
      researchSection = `## Research Requirements
This slide requires real-world research with cited sources.
1. Use web search to find relevant academic papers, industry reports, or authoritative sources
2. Prefer: peer-reviewed papers, conference proceedings, Gartner/McKinsey/BCG reports, official statistics
3. Add a FOOTNOTES section at the bottom of the slide with APA-style citations
4. Reference each claim with a superscript number matching the footnote
5. Use small font (8-9pt) for footnotes`;
    }

    return `You are a professional presentation designer. Create a single PPTX slide.

${storylineContext}

${defaultInstructions ? `## Additional Instructions\n${defaultInstructions}\n` : ''}

## Skill References
${skillContents}

## YOUR ASSIGNED SLIDE (Slide ${slide.slideNumber} of ${totalSlides})

\`\`\`json
${JSON.stringify(slide, null, 2)}
\`\`\`

**Title:** ${slide.actionTitle}
**Core Message:** ${slide.coreMessage || ''}
**Description:** ${slide.description || ''}
**Slide Type:** ${slide.slideType || 'standard'}

${researchSection}

## Reference Documents
${fileContents}

## Output Instructions
- Create a PPTX file with EXACTLY ONE slide
- Use widescreen dimensions: 13.33" × 7.5"
- Save the file to: ${outputPath}
- After completing the slide, print exactly: SLIDE_COMPLETE::${slide.slideNumber}

## CRITICAL: Post-Generation Validation
After creating the PPTX file, ALWAYS run:
\`\`\`
python3 -c "from pptx import Presentation; p = Presentation('${outputPath}'); p.save('${outputPath}')"
\`\`\``;
  }

  static buildQAPrompt({ filename, slides, styles, previewPaths }) {
    const styleInstructions = this.getStyleInstructions(styles || []);

    const slideInfo = slides && slides.length > 0
      ? slides.map(s => `- Slide ${s.slideNumber}: "${s.actionTitle}" — ${s.description || ''}`).join('\n')
      : '';

    const imageSection = previewPaths && previewPaths.length > 0
      ? `## Slide Preview Images (VISUAL INSPECTION — CRITICAL)
The following PNG files show how each slide ACTUALLY RENDERS. Read each image to check for visual issues:
${previewPaths.map((p, i) => `- Slide ${i + 1}: ${p}`).join('\n')}

For each slide image, look carefully for:
- Text overlapping other elements or shapes
- Lines, connectors, or shapes crossing into unrelated areas
- Text overflow, truncation, or text extending beyond its container
- Poor contrast or unreadable text
- Misaligned elements that should be aligned
- Shapes or diagrams that look broken or incomplete
- Any visual artifact that looks unprofessional
- Elements too close to slide edges`
      : '';

    return `You are a meticulous presentation QA reviewer. Analyze the PPTX file at /app/outputs/${filename} slide by slide.

## CRITICAL: Environment Info
- Python 3.11 with python-pptx is PRE-INSTALLED — use it to read the PPTX file
- Do NOT install anything

## Expected Slide Outline
${slideInfo}

## Style Context
${styleInstructions}

${imageSection}

## Task
1. For EACH slide, first READ the corresponding PNG image file above to visually inspect the rendered output
2. Then use python-pptx to open /app/outputs/${filename} and check structural details
3. Check against this QA checklist:
   - **Visual rendering**: Does the slide look correct visually? Any overlapping elements, broken shapes, text overflow?
   - **Content completeness**: Does each slide have the expected action title and body content?
   - **Text quality**: Any placeholder text, lorem ipsum, "TODO", or incomplete sentences?
   - **Formatting consistency**: Are font sizes, colors, and alignment consistent?
   - **Visual elements**: Are charts/diagrams/tables real or just described as text?
   - **Readability**: Text legible, not overflowing, not too small?
   - **Professional quality**: C-level consulting presentation standard?
4. For each issue found, provide a concrete fix instruction

## Output Format
After analyzing, output EXACTLY this JSON wrapped in triple backtick json fences:

\`\`\`json
{
  "overallScore": 7,
  "overallVerdict": "Good",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Actual title found on slide",
      "issues": [
        {
          "severity": "error",
          "issue": "Description of the problem",
          "fix": "Concrete instruction to fix this issue"
        }
      ],
      "strengths": ["What's good about this slide"]
    }
  ],
  "revisionPlan": "Combined step-by-step revision instructions for all issues found. Write this as a clear bulleted list that can be directly used as revision instructions."
}
\`\`\`

Important:
- overallScore: 1-10 (10 = perfect)
- overallVerdict: "Excellent" (8-10), "Good" (6-7), "Needs Work" (4-5), "Poor" (1-3)
- severity: "error" (must fix), "warning" (should fix), "info" (nice to have)
- revisionPlan: Only include if there are issues to fix. Write actionable instructions.
- Return ONLY the fenced JSON block, no other text before or after it.`;
  }

  static buildRevisePrompt({ filename, instructions, language, styles, uploadedFiles, revisionNumber }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const fileContents = this.getUploadedFileContents(uploadedFiles);

    const baseName = filename.replace(/\.pptx$/, '');
    const revFilename = `${baseName}-rev${revisionNumber}.pptx`;

    return `You are a presentation editor. Revise the existing PPTX based on these instructions.

## CRITICAL: Environment Info
- Node.js 20 with pptxgenjs PRE-INSTALLED at /app/node_modules/pptxgenjs
- Python 3.11 with python-pptx and Pillow PRE-INSTALLED
- Do NOT install anything — all dependencies are ready
- Write scripts to /tmp/ and execute from there

Language: ${language || 'english'}
Existing file: /app/outputs/${filename}

## Style Guidelines
${styleInstructions}

## Revision Instructions
${instructions}

## Additional Context
${fileContents}

Read the existing file at /app/outputs/${filename}, apply the requested changes, and save the revised file to /app/outputs/${revFilename}
For each slide you complete, output a line: SLIDE_COMPLETE::{slideNumber}

## CRITICAL: Post-Generation Validation
After saving the revised PPTX, ALWAYS run this validation step to prevent PowerPoint repair warnings:
\`\`\`
python3 -c "from pptx import Presentation; p = Presentation('/app/outputs/${revFilename}'); p.save('/app/outputs/${revFilename}')"
\`\`\``;
  }
  static buildEnhancePrompt({ filename, slideNumber, language, styles, palette, font, outputPath }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const skillContents = this.getSkillContents();
    const paletteBlock = this.buildPaletteBlock(palette, font);

    return `You are a presentation design perfectionist. You have been given an existing single-slide PPTX.

## CRITICAL: Environment Info
- Node.js 20 with pptxgenjs PRE-INSTALLED at /app/node_modules/pptxgenjs
- Python 3.11 with python-pptx and Pillow PRE-INSTALLED
- Do NOT install anything — all dependencies are ready
- Write scripts to /tmp/ and execute from there

Language: ${language || 'english'}
Existing file: /app/outputs/${filename}
Slide to enhance: Slide ${slideNumber}

## Color & Typography Customization
${paletteBlock}

## Style Guidelines
${styleInstructions}

## Skill References
${skillContents}

## Task
Your task: Recreate slide ${slideNumber} with significantly improved visual quality while keeping the EXACT same content and message.

First, read the existing PPTX to understand the current slide content. Then recreate it focusing on:
- Better spatial balance — distribute elements evenly, avoid crowding
- Stronger visual hierarchy — make the most important element stand out immediately
- More sophisticated use of the color palette — subtle gradients, accent highlights, card shadows
- Professional whitespace — breathing room between elements
- Richer visual components — replace plain bullet lists with structured grids, icon cards, or visual frameworks where appropriate
- Sharper typography — consistent sizing, proper line height, clear contrast
- Polished details — aligned edges, consistent margins, rounded corners on cards

Do NOT change: the title, the core message, the data points, or the storyline position of this slide.
Do NOT add fictional content or remove existing content.

## CRITICAL: Layout Quality Checks
After generating the slide, verify these constraints before saving:
- **No overlapping elements** — shapes, text boxes, and images must not overlap each other
- **Nothing outside the slide** — all elements must be fully within the slide boundaries (0,0 to 13.33",7.5"). No negative x/y, no elements extending beyond the right or bottom edge
- **No excessive whitespace** — use at least 70% of the slide area. Large empty regions signal poor layout. Fill space with structured content, not padding
- **Text must not overflow** — text must fit inside its container. Reduce font size or expand the container if text is truncated or clipped
- **Consistent margins** — maintain at least 0.4" margin from slide edges, and keep spacing between elements uniform

## Output
1. Read the existing PPTX at /app/outputs/${filename}
2. Extract slide ${slideNumber}'s content
3. Create a new single-slide PPTX with the enhanced design
4. Save to: ${outputPath}
5. Print: SLIDE_COMPLETE::${slideNumber}

## CRITICAL: Post-Generation Validation
After creating the PPTX file, ALWAYS run:
\`\`\`
python3 -c "from pptx import Presentation; p = Presentation('${outputPath}'); p.save('${outputPath}')"
\`\`\``;
  }

  static buildSlideRevisePrompt({ filename, slideNumber, instructions, language, styles, palette, font, outputPath }) {
    const styleInstructions = this.getStyleInstructions(styles || []);
    const skillContents = this.getSkillContents();
    const paletteBlock = this.buildPaletteBlock(palette, font);

    return `You are a presentation editor. Revise a single slide based on specific instructions.

## CRITICAL: Environment Info
- Node.js 20 with pptxgenjs PRE-INSTALLED at /app/node_modules/pptxgenjs
- Python 3.11 with python-pptx and Pillow PRE-INSTALLED
- Do NOT install anything — all dependencies are ready
- Write scripts to /tmp/ and execute from there

Language: ${language || 'english'}
Existing file: /app/outputs/${filename}
Slide to revise: Slide ${slideNumber}

## Color & Typography Customization
${paletteBlock}

## Style Guidelines
${styleInstructions}

## Skill References
${skillContents}

## Revision Instructions
${instructions}

## Task
1. Read the existing PPTX at /app/outputs/${filename}
2. Extract slide ${slideNumber}'s current content
3. Apply the revision instructions above to recreate the slide
4. Create a new single-slide PPTX with the revised design
5. Save to: ${outputPath}
6. Print: SLIDE_COMPLETE::${slideNumber}

## Layout Quality Checks
- No overlapping elements
- Nothing outside slide boundaries (13.33" x 7.5")
- Use at least 70% of slide area
- Text must fit inside containers
- Consistent margins (min 0.4" from edges)

## CRITICAL: Post-Generation Validation
\`\`\`
python3 -c "from pptx import Presentation; p = Presentation('${outputPath}'); p.save('${outputPath}')"
\`\`\``;
  }

  static buildVisualSuggestPrompt(slides) {
    const slideList = slides.map(s =>
      `Slide ${s.slideNumber}: "${s.actionTitle}" — ${s.coreMessage || s.description || ''}`
    ).join('\n');

    return `You are a presentation visualization expert. For each slide below, suggest the Top 5 visual component types that would best communicate the slide's core message.

## Available Visual Components

**Native PptxGenJS Components (capco-visual-components skill):**
- donut-kpi: Circular progress rings for KPI dashboards (percentages, scores, completion rates)
- progress-bars: Horizontal bars for tracking multiple metrics or comparing values
- vs-comparison: Side-by-side bar comparison for two options/scenarios
- number-callouts: Large prominent numbers for key financial or statistical highlights
- status-dashboard: Multi-chart composite panel for operational status overviews
- staircase: Ascending steps for maturity models, roadmaps, or progression phases
- chevron-process: Horizontal arrow chain for linear processes or workflows
- pyramid: Layered triangle for hierarchies, maturity levels, or prioritization
- swot: 4-quadrant strategic analysis layout
- venn-circles: Overlapping circles for showing relationships and intersections
- pentagon-strategy: 5-factor circular arrangement for strategic frameworks
- timeline-horizontal: Left-to-right timeline for milestones or chronological events
- timeline-vertical: Top-to-bottom timeline with KPI markers
- funnel-ranking: Progressively wider bars for funnel stages or ranked items
- quadrant-2x2: 4 blocks in matrix layout for categorization or prioritization
- icon-card-grid: Card grid with icons for feature lists or capability overviews
- callout-bubbles: Prominent colored bubbles for highlighting key metrics
- org-chart: Hierarchical tree for organizational or team structures
- layer-stack: Horizontal layers for technology stacks or architecture tiers
- native-chart: Standard bar/line/pie/doughnut charts for data visualization

**SVG Diagrams (capco-svg-diagrams skill):**
- flowchart: Decision flows with process boxes, diamonds, and arrows
- swimlane: Responsibility lanes with cross-lane process flows
- network-graph: Freely connected nodes for system architectures or landscapes
- mindmap: Radial branching from central concept for brainstorming or topic exploration
- cycle-diagram: Circular phases for iterative processes (PDCA, sprints, DevOps)
- concentric-circles: Nested rings for layered models (onion diagrams)
- architecture-flow: Zoned left-to-right data flow for system architecture

## Slides to Analyze
${slideList}

## Instructions
For EACH slide, return your Top 5 suggestions. Consider:
- What data/concepts does the slide communicate?
- Which visual best reinforces the core message?
- Variety — don't suggest the same component for every slide

Return ONLY a valid JSON object with this structure:
\`\`\`json
{
  "1": [
    { "id": "component-id", "name": "Human Readable Name", "reason": "Why this fits" },
    ...4 more
  ],
  "2": [ ...5 suggestions... ],
  ...
}
\`\`\`
Keys are slide numbers as strings. Do not include any text outside the JSON.`;
  }
}

module.exports = PromptBuilder;
