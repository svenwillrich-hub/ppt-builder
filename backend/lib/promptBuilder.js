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
Return ONLY a valid JSON array with this structure for each slide:
[
  {
    "slideNumber": 1,
    "actionTitle": "Key message of this slide",
    "description": "Detailed content description",
    "slideType": "standard",
    "researchNeeded": false
  }
]
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
${palette ? `CUSTOM Color Palette: ${palette.name}\nColors (use for ALL accents, charts, backgrounds, headings):\n${palette.colors.map((c, i) => `  Color ${i + 1}: ${c}`).join('\n')}\nIMPORTANT: Override any skill-defined colors with these palette colors.` : 'Use the colors defined in the skill/style guidelines. If none specified, use a professional consulting color scheme.'}
${font ? `\nCUSTOM Font: ${font}\nUse "${font}" for ALL text in the presentation (titles, body, labels). This overrides any skill-defined fonts.` : ''}

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
}

module.exports = PromptBuilder;
