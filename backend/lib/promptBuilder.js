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
        f.endsWith('.md') || f.endsWith('.txt')
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
    "visualSuggestion": "How to visually present this (e.g. '2x2 matrix', 'process flow diagram', 'data table with highlights')",
    "researchNeeded": false
  }
]
Do not include any text outside the JSON array.`;
  }

  static buildGeneratePrompt({ slides, language, styles, uploadedFiles, defaultInstructions }) {
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
      researchSection = researchSlides
        .map(s => `- Slide ${s.slideNumber}: "${s.actionTitle}" — Research this topic and add references/sources`)
        .join('\n');
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
This allows the UI to track progress.`;
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
For each slide you complete, output a line: SLIDE_COMPLETE::{slideNumber}`;
  }
}

module.exports = PromptBuilder;
