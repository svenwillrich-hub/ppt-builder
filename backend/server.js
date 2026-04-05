const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ClaudeRunner = require('./lib/claudeRunner');
const PromptBuilder = require('./lib/promptBuilder');
const ParallelRunner = require('./lib/parallelRunner');
const PptxMerger = require('./lib/pptxMerger');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: '/app/uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Track active Claude processes for cancellation
const activeProcesses = new Map();

// Helper: find newly created PPTX with retry (waits for file write to flush)
function findNewPptxFile(existingFiles, startTime, retries = 5, delayMs = 2000) {
  return new Promise(async (resolve) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const currentFiles = fs.readdirSync('/app/outputs').filter(f => f.endsWith('.pptx'));
        const newFiles = currentFiles.filter(f => {
          if (existingFiles.has(f)) return false;
          try {
            const stat = fs.statSync(path.join('/app/outputs', f));
            return stat.mtimeMs > startTime;
          } catch (e) { return false; }
        });
        if (newFiles.length > 0) {
          newFiles.sort((a, b) => {
            const sa = fs.statSync(path.join('/app/outputs', a)).mtimeMs;
            const sb = fs.statSync(path.join('/app/outputs', b)).mtimeMs;
            return sb - sa;
          });
          return resolve(newFiles[0]);
        }
      } catch (e) { /* ignore */ }
      if (attempt < retries - 1) {
        console.log(`[findFile] Attempt ${attempt + 1}/${retries} — no new file yet, retrying in ${delayMs}ms`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    resolve(null);
  });
}

// --- Health check ---
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Claude CLI diagnostics ---
app.get('/api/claude-test', async (req, res) => {
  const { execSync, spawnSync } = require('child_process');
  const homeDir = process.env.HOME || '/home/appuser';
  const diagnostics = { timestamp: new Date().toISOString(), checks: {} };

  // 1. Binary
  try {
    const which = execSync('which claude 2>/dev/null || command -v claude 2>/dev/null', { encoding: 'utf-8' }).trim();
    diagnostics.checks.binary = { ok: true, path: which };
  } catch (e) { diagnostics.checks.binary = { ok: false, error: 'claude not in PATH' }; }

  // 2. Version
  try {
    const version = execSync('claude --version 2>&1', { encoding: 'utf-8', timeout: 10000 }).trim();
    diagnostics.checks.version = { ok: true, version };
  } catch (e) { diagnostics.checks.version = { ok: false, error: e.message }; }

  // 3. Config file
  try {
    const configPath = path.join(homeDir, '.claude.json');
    const configExists = fs.existsSync(configPath);
    let configContent = null;
    if (configExists) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      configContent = {
        hasApiKey: !!raw.apiKey,
        primaryEmail: raw.primaryEmail || null,
        hasOauth: !!(raw.claudeAiOauth && raw.claudeAiOauth.accessToken)
      };
    }
    diagnostics.checks.config = { ok: configExists, exists: configExists, parsed: configContent };
  } catch (e) { diagnostics.checks.config = { ok: false, error: e.message }; }

  // 4. .claude directory
  try {
    const claudeDir = path.join(homeDir, '.claude');
    const dirExists = fs.existsSync(claudeDir);
    diagnostics.checks.claudeDir = { ok: dirExists, exists: dirExists };
  } catch (e) { diagnostics.checks.claudeDir = { ok: false, error: e.message }; }

  // 5. Actual CLI test
  try {
    const result = spawnSync('claude', ['-p', 'Reply with exactly: PPTX_TEST_OK', '--output-format', 'text'], {
      env: process.env, cwd: '/app', encoding: 'utf-8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe']
    });
    const stdout = (result.stdout || '').trim();
    const success = result.status === 0 && stdout.includes('PPTX_TEST_OK');
    diagnostics.checks.cliTest = { ok: success, exitCode: result.status, stdout: stdout.slice(0, 200) };
  } catch (e) { diagnostics.checks.cliTest = { ok: false, error: e.message }; }

  diagnostics.allOk = Object.values(diagnostics.checks).every(c => c.ok);
  res.json(diagnostics);
});

// --- Styles ---
// --- Skills ---
app.get('/api/skills', (req, res) => {
  try {
    const skillsDir = '/app/skills';
    const files = fs.readdirSync(skillsDir)
      .filter(f => (f.endsWith('.skill') || f.endsWith('.md') || f.endsWith('.txt')) && f !== 'README.md');
    const skills = files.map(f => {
      const content = fs.readFileSync(path.join(skillsDir, f), 'utf-8');
      const nameMatch = content.match(/^#\s+(.+)/m);
      return {
        id: f.replace(/\.(md|txt)$/, ''),
        filename: f,
        name: nameMatch ? nameMatch[1] : f.replace(/\.(md|txt)$/, '').replace(/-/g, ' '),
        enabled: true
      };
    });
    res.json(skills);
  } catch (e) {
    res.json([]);
  }
});

// --- Styles ---
app.get('/api/styles', (req, res) => {
  try {
    const styles = JSON.parse(fs.readFileSync('/app/config/styles.json', 'utf-8'));
    res.json(styles);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read styles configuration' });
  }
});

app.put('/api/styles', (req, res) => {
  try {
    fs.writeFileSync('/app/config/styles.json', JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save styles configuration' });
  }
});

// --- File upload ---
app.post('/api/upload', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const fileInfos = req.files.map(f => ({
    originalName: f.originalname,
    storedName: f.filename,
    size: f.size,
    mimetype: f.mimetype
  }));
  res.json({ files: fileInfos });
});

// --- List outputs ---
app.get('/api/outputs', (req, res) => {
  try {
    const outputDir = '/app/outputs';
    const files = fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.pptx'))
      .map(f => {
        const stat = fs.statSync(path.join(outputDir, f));
        return {
          filename: f,
          size: stat.size,
          created: stat.birthtime || stat.mtime
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(files);
  } catch (e) {
    res.json([]);
  }
});

// --- Download output ---
app.get('/api/outputs/:filename', (req, res) => {
  const filePath = path.join('/app/outputs', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
  fs.createReadStream(filePath).pipe(res);
});

// --- Slide preview rendering ---
// Helper: ensure slide preview PNGs exist, return local file paths
function ensurePreviewImages(filename) {
  const { execSync } = require('child_process');
  const pptxPath = path.join('/app/outputs', filename);
  const baseName = filename.replace(/\.pptx$/i, '');
  const previewDir = path.join('/app/previews', baseName);

  // Check if previews already exist
  if (fs.existsSync(previewDir)) {
    const images = fs.readdirSync(previewDir).filter(f => f.endsWith('.png')).sort();
    if (images.length > 0) {
      return {
        apiPaths: images.map(f => `/api/preview-image/${baseName}/${f}`),
        localPaths: images.map(f => path.join(previewDir, f))
      };
    }
  }

  // Generate previews
  fs.mkdirSync(previewDir, { recursive: true });
  execSync(
    `libreoffice --headless --convert-to pdf --outdir "${previewDir}" "${pptxPath}" 2>&1`,
    { timeout: 60000, encoding: 'utf-8' }
  );

  const pdfFile = path.join(previewDir, baseName + '.pdf');
  if (fs.existsSync(pdfFile)) {
    execSync(
      `pdftoppm -png -r 200 "${pdfFile}" "${path.join(previewDir, 'slide')}" 2>&1`,
      { timeout: 60000, encoding: 'utf-8' }
    );
    try { fs.unlinkSync(pdfFile); } catch (e) {}
  }

  const images = fs.readdirSync(previewDir).filter(f => f.endsWith('.png')).sort();
  return {
    apiPaths: images.map(f => `/api/preview-image/${baseName}/${f}`),
    localPaths: images.map(f => path.join(previewDir, f))
  };
}

app.get('/api/preview/:filename', async (req, res) => {
  const pptxPath = path.join('/app/outputs', req.params.filename);
  if (!fs.existsSync(pptxPath)) {
    return res.status(404).json({ error: 'PPTX file not found' });
  }

  try {
    const result = ensurePreviewImages(req.params.filename);
    res.json({ slides: result.apiPaths, cached: true });
  } catch (e) {
    console.error('[preview] Rendering failed:', e.message);
    res.status(500).json({ error: 'Preview rendering failed: ' + e.message.slice(0, 200) });
  }
});

// --- Visual QA ---
app.post('/api/qa', (req, res) => {
  const { filename, slides, styles } = req.body;
  if (!filename) return res.status(400).json({ error: 'No filename provided' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Ensure preview images exist for visual QA
  let previewPaths = [];
  try {
    const previews = ensurePreviewImages(filename);
    previewPaths = previews.localPaths || [];
    ClaudeRunner.sendSSE(res, { type: 'log', message: `[QA] Found ${previewPaths.length} slide preview images for visual analysis` });
  } catch (e) {
    ClaudeRunner.sendSSE(res, { type: 'log', message: `[QA] Warning: Could not generate preview images — visual QA will be limited: ${e.message}` });
  }

  const prompt = PromptBuilder.buildQAPrompt({ filename, slides, styles, previewPaths });

  ClaudeRunner.run(prompt, res, {
    onComplete: (output) => {
      // Extract text content from stream-json
      let textContent = '';
      const lines = output.split('\n');
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === 'text') textContent += block.text;
            }
          } else if (event.type === 'result' && event.result) {
            textContent += (typeof event.result === 'string') ? event.result : '';
          }
        } catch (e) { textContent += line + '\n'; }
      }

      try {
        // Extract JSON from fenced code block or raw JSON
        let jsonStr = null;
        const fencedMatch = textContent.match(/```json\s*([\s\S]*?)```/);
        if (fencedMatch) {
          jsonStr = fencedMatch[1].trim();
        } else {
          const rawMatch = textContent.match(/\{[\s\S]*?"overallScore"[\s\S]*\}/);
          if (rawMatch) jsonStr = rawMatch[0];
        }

        if (jsonStr) {
          const qa = JSON.parse(jsonStr);
          ClaudeRunner.sendSSE(res, { type: 'qa_result', data: qa });
        } else {
          ClaudeRunner.sendSSE(res, { type: 'qa_result', data: { overallScore: 0, overallVerdict: 'Error', slides: [], revisionPlan: '', _parseError: 'Could not find JSON in QA output', _raw: textContent.slice(0, 800) } });
        }
      } catch (e) {
        ClaudeRunner.sendSSE(res, { type: 'qa_result', data: { overallScore: 0, overallVerdict: 'Error', slides: [], revisionPlan: '', _parseError: e.message, _raw: textContent.slice(0, 800) } });
      }
      res.end();
    },
    onError: () => { res.end(); }
  });

  req.on('close', () => {});
});

// Serve per-slide preview images (from parallel generation)
app.get('/api/previews/:file', (req, res) => {
  const imgPath = path.join('/app/previews', req.params.file);
  if (!fs.existsSync(imgPath)) {
    return res.status(404).json({ error: 'Preview not found' });
  }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=60');
  fs.createReadStream(imgPath).pipe(res);
});

// Serve preview images (from QA/full deck)
app.get('/api/preview-image/:dir/:file', (req, res) => {
  const imgPath = path.join('/app/previews', req.params.dir, req.params.file);
  if (!fs.existsSync(imgPath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(imgPath).pipe(res);
});

// --- Step 2: Analyze content ---
app.post('/api/analyze', (req, res) => {
  const { content, language, styles, uploadedFiles, defaultInstructions } = req.body;

  if (!content && (!uploadedFiles || uploadedFiles.length === 0)) {
    return res.status(400).json({ error: 'No content or files provided' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const prompt = PromptBuilder.buildAnalyzePrompt({
    content, language, styles, uploadedFiles, defaultInstructions
  });

  let fullOutput = '';

  ClaudeRunner.run(prompt, res, {
    onLine: (line) => {
      fullOutput += line + '\n';
    },
    onComplete: (output) => {
      // Extract text from stream-json output
      let textContent = '';
      const lines = output.split('\n');
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === 'text') textContent += block.text;
            }
          } else if (event.type === 'result' && event.result) {
            textContent += (typeof event.result === 'string') ? event.result : '';
          }
        } catch (e) {
          // Not JSON — might be raw text output
          textContent += line + '\n';
        }
      }

      // Try to extract JSON slides array from the clean text
      try {
        // Find the outermost [ ... ] that contains slideNumber
        const match = textContent.match(/\[\s*\{[\s\S]*?"slideNumber"[\s\S]*?\}\s*\]/);
        if (match) {
          const slides = JSON.parse(match[0]);
          ClaudeRunner.sendSSE(res, { type: 'result', slides });
        } else {
          // Fallback: try any JSON array
          const fallback = textContent.match(/\[[\s\S]*\]/);
          if (fallback) {
            const slides = JSON.parse(fallback[0]);
            ClaudeRunner.sendSSE(res, { type: 'result', slides });
          } else {
            ClaudeRunner.sendSSE(res, {
              type: 'error',
              message: 'Could not extract slide outline from Claude response. Raw: ' + textContent.slice(0, 300)
            });
          }
        }
      } catch (e) {
        ClaudeRunner.sendSSE(res, {
          type: 'error',
          message: `Failed to parse slide outline: ${e.message}`
        });
      }
      res.end();
    },
    onError: () => {
      res.end();
    }
  });

  req.on('close', () => {
    // Client disconnected
  });
});

// --- Step 4: Generate PPTX (Parallel — one Claude session per slide) ---
app.post('/api/generate', async (req, res) => {
  const { slides, language, styles, uploadedFiles, defaultInstructions } = req.body;

  if (!slides || slides.length === 0) {
    return res.status(400).json({ error: 'No slides provided' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const { palette, font } = req.body;
  const requestId = Date.now().toString();
  const timestamp = new Date().toISOString().slice(0, 10) + '-' +
    String(new Date().getHours()).padStart(2, '0') +
    String(new Date().getMinutes()).padStart(2, '0') +
    String(new Date().getSeconds()).padStart(2, '0');
  const titleSlug = (slides[0]?.actionTitle || 'presentation')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

  ClaudeRunner.sendSSE(res, { type: 'started', requestId, totalSlides: slides.length });
  ClaudeRunner.sendSSE(res, { type: 'log', message: `[parallel] Starting ${slides.length} parallel slide generations...` });

  // Build shared storyline context
  const storylineContext = PromptBuilder.buildStorylineContext({
    slides, language, palette, font, styles
  });

  // Build per-slide prompts
  const slideJobs = slides.map(slide => {
    const outputPath = `/app/outputs/.tmp-slide-${timestamp}-${slide.slideNumber}.pptx`;
    const prompt = PromptBuilder.buildSingleSlidePrompt({
      slide,
      totalSlides: slides.length,
      storylineContext,
      uploadedFiles,
      defaultInstructions,
      outputPath
    });
    return { slideNumber: slide.slideNumber, prompt, outputPath };
  });

  try {
    const { completedFiles, failed, children } = await ParallelRunner.run(slideJobs, res);
    activeProcesses.set(requestId, children);

    if (completedFiles.length === 0) {
      ClaudeRunner.sendSSE(res, { type: 'error', message: 'All slide generations failed. Check the log.' });
      activeProcesses.delete(requestId);
      return res.end();
    }

    if (failed.length > 0) {
      ClaudeRunner.sendSSE(res, { type: 'log', message: `[parallel] WARNING: ${failed.length} slide(s) failed: ${failed.join(', ')}` });
    }

    // Merge slides
    ClaudeRunner.sendSSE(res, { type: 'merging' });
    ClaudeRunner.sendSSE(res, { type: 'log', message: `[parallel] Merging ${completedFiles.length} slides...` });

    const finalFilename = `${timestamp}-${titleSlug}.pptx`;
    const finalOutputPath = path.join('/app/outputs', finalFilename);

    try {
      PptxMerger.merge(completedFiles, finalOutputPath);
      PptxMerger.cleanup(completedFiles);
      ClaudeRunner.sendSSE(res, { type: 'done', filename: finalFilename });
    } catch (mergeErr) {
      ClaudeRunner.sendSSE(res, { type: 'error', message: `Merge failed: ${mergeErr.message}` });
    }

    activeProcesses.delete(requestId);
    res.end();
  } catch (err) {
    ClaudeRunner.sendSSE(res, { type: 'error', message: `Generation failed: ${err.message}` });
    activeProcesses.delete(requestId);
    res.end();
  }

  req.on('close', () => {
    // Connection closed but processes keep running
  });
});

// --- Step 6: Revise PPTX ---
app.post('/api/revise', (req, res) => {
  const { filename, instructions, language, styles, uploadedFiles, revisionNumber } = req.body;

  if (!filename || !instructions) {
    return res.status(400).json({ error: 'Filename and instructions are required' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const prompt = PromptBuilder.buildRevisePrompt({
    filename, instructions, language, styles, uploadedFiles,
    revisionNumber: revisionNumber || 1
  });

  let existingFilesRevise = new Set();
  try { existingFilesRevise = new Set(fs.readdirSync('/app/outputs').filter(f => f.endsWith('.pptx'))); } catch (e) {}
  const revStartTime = Date.now();

  const requestId = Date.now().toString();
  const child = ClaudeRunner.run(prompt, res, {
    onComplete: async (output) => {
      let newFile = await findNewPptxFile(existingFilesRevise, revStartTime);
      if (!newFile) {
        const m = output.match(/\/app\/outputs\/([\w\-\.]+\.pptx)/);
        if (m && fs.existsSync(path.join('/app/outputs', m[1]))) newFile = m[1];
      }
      if (newFile) {
        ClaudeRunner.sendSSE(res, { type: 'done', filename: newFile });
      } else {
        ClaudeRunner.sendSSE(res, { type: 'error', message: 'No revised file found.' });
      }
      activeProcesses.delete(requestId);
      res.end();
    },
    onError: () => { activeProcesses.delete(requestId); res.end(); }
  });

  activeProcesses.set(requestId, child);
  ClaudeRunner.sendSSE(res, { type: 'started', requestId });

  // Do NOT kill on connection close — let Claude finish in background
  req.on('close', () => {
    // Connection closed but process keeps running
  });
});

// --- Cancel a running process ---
app.post('/api/cancel/:requestId', (req, res) => {
  const procs = activeProcesses.get(req.params.requestId);
  if (procs) {
    // Handle both single process and array of processes
    if (Array.isArray(procs)) {
      ParallelRunner.killAll(procs);
    } else {
      try { procs.kill('SIGTERM'); } catch (e) { /* ignore */ }
    }
    activeProcesses.delete(req.params.requestId);
    res.json({ cancelled: true });
  } else {
    res.status(404).json({ error: 'No active process found' });
  }
});

// Global error logging
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled rejection:', err);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PPTX Creator backend running on port ${PORT}`);
});
