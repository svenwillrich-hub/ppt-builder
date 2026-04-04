const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ClaudeRunner = require('./lib/claudeRunner');
const PromptBuilder = require('./lib/promptBuilder');

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

// --- Health check ---
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Claude CLI diagnostics ---
app.get('/api/claude-test', async (req, res) => {
  const { execSync, spawnSync } = require('child_process');
  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // 1. Check if claude binary exists
  try {
    const which = execSync('which claude 2>/dev/null || command -v claude 2>/dev/null', { encoding: 'utf-8' }).trim();
    diagnostics.checks.binary = { ok: true, path: which };
  } catch (e) {
    diagnostics.checks.binary = { ok: false, error: 'claude binary not found in PATH' };
  }

  // 2. Check claude version
  try {
    const version = execSync('claude --version 2>&1', { encoding: 'utf-8', timeout: 10000 }).trim();
    diagnostics.checks.version = { ok: true, version };
  } catch (e) {
    diagnostics.checks.version = { ok: false, error: e.message };
  }

  // 3. Check config file
  try {
    const configExists = fs.existsSync('/root/.claude.json');
    let configContent = null;
    if (configExists) {
      const raw = JSON.parse(fs.readFileSync('/root/.claude.json', 'utf-8'));
      // Only show safe keys
      configContent = {
        hasOauthToken: !!raw.oauthToken,
        hasApiKey: !!raw.apiKey,
        primaryEmail: raw.primaryEmail || null,
        claudeAiOauth: raw.claudeAiOauth ? {
          expiresAt: raw.claudeAiOauth.expiresAt,
          hasAccessToken: !!raw.claudeAiOauth.accessToken,
          hasRefreshToken: !!raw.claudeAiOauth.refreshToken
        } : null
      };
    }
    diagnostics.checks.config = { ok: configExists, exists: configExists, parsed: configContent };
  } catch (e) {
    diagnostics.checks.config = { ok: false, error: e.message };
  }

  // 4. Check .claude directory
  try {
    const dirExists = fs.existsSync('/root/.claude');
    let contents = [];
    if (dirExists) {
      contents = fs.readdirSync('/root/.claude').slice(0, 20);
    }
    diagnostics.checks.claudeDir = { ok: dirExists, exists: dirExists, contents };
  } catch (e) {
    diagnostics.checks.claudeDir = { ok: false, error: e.message };
  }

  // 5. Actual CLI test — run a trivial prompt
  try {
    const result = spawnSync('claude', ['-p', 'Reply with exactly: PPTX_TEST_OK', '--output-format', 'text'], {
      env: process.env,
      cwd: '/app',
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const stdout = (result.stdout || '').trim();
    const stderr = (result.stderr || '').trim();
    const success = result.status === 0 && stdout.includes('PPTX_TEST_OK');
    diagnostics.checks.cliTest = {
      ok: success,
      exitCode: result.status,
      stdout: stdout.slice(0, 500),
      stderr: stderr.slice(0, 500)
    };
  } catch (e) {
    diagnostics.checks.cliTest = { ok: false, error: e.message };
  }

  // Overall status
  diagnostics.allOk = Object.values(diagnostics.checks).every(c => c.ok);

  res.json(diagnostics);
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
app.get('/api/preview/:filename', async (req, res) => {
  const pptxPath = path.join('/app/outputs', req.params.filename);
  if (!fs.existsSync(pptxPath)) {
    return res.status(404).json({ error: 'PPTX file not found' });
  }

  const baseName = req.params.filename.replace(/\.pptx$/i, '');
  const previewDir = path.join('/app/previews', baseName);

  // Check if previews already exist
  if (fs.existsSync(previewDir)) {
    const images = fs.readdirSync(previewDir)
      .filter(f => f.endsWith('.png'))
      .sort()
      .map(f => `/api/preview-image/${baseName}/${f}`);
    return res.json({ slides: images, cached: true });
  }

  // Generate previews using LibreOffice
  const { execSync } = require('child_process');
  try {
    fs.mkdirSync(previewDir, { recursive: true });

    // Convert PPTX to PDF first, then PDF to images
    execSync(
      `libreoffice --headless --convert-to pdf --outdir "${previewDir}" "${pptxPath}" 2>&1`,
      { timeout: 60000, encoding: 'utf-8' }
    );

    const pdfFile = path.join(previewDir, baseName + '.pdf');
    if (fs.existsSync(pdfFile)) {
      // Convert PDF pages to PNG images using pdftoppm
      execSync(
        `pdftoppm -png -r 200 "${pdfFile}" "${path.join(previewDir, 'slide')}" 2>&1`,
        { timeout: 60000, encoding: 'utf-8' }
      );
      // Clean up PDF
      try { fs.unlinkSync(pdfFile); } catch (e) {}
    }

    const images = fs.readdirSync(previewDir)
      .filter(f => f.endsWith('.png'))
      .sort()
      .map(f => `/api/preview-image/${baseName}/${f}`);

    res.json({ slides: images, cached: false });
  } catch (e) {
    console.error('[preview] Rendering failed:', e.message);
    res.status(500).json({ error: 'Preview rendering failed: ' + e.message.slice(0, 200) });
  }
});

// Serve preview images
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

// --- Step 4: Generate PPTX ---
app.post('/api/generate', (req, res) => {
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

  const prompt = PromptBuilder.buildGeneratePrompt({
    slides, language, styles, uploadedFiles, defaultInstructions
  });

  const requestId = Date.now().toString();
  const child = ClaudeRunner.run(prompt, res, {
    onComplete: (output) => {
      // Find the generated filename
      const filenameMatch = output.match(/\/app\/outputs\/([\w\-\.]+\.pptx)/);
      const filename = filenameMatch ? filenameMatch[1] : null;

      // Also check if file exists in outputs
      let foundFile = filename;
      if (!foundFile) {
        try {
          const files = fs.readdirSync('/app/outputs')
            .filter(f => f.endsWith('.pptx'))
            .sort((a, b) => {
              const sa = fs.statSync(path.join('/app/outputs', a)).mtimeMs;
              const sb = fs.statSync(path.join('/app/outputs', b)).mtimeMs;
              return sb - sa;
            });
          if (files.length > 0) foundFile = files[0];
        } catch (e) { /* ignore */ }
      }

      ClaudeRunner.sendSSE(res, {
        type: 'done',
        filename: foundFile || 'unknown.pptx'
      });
      activeProcesses.delete(requestId);
      res.end();
    },
    onError: () => {
      activeProcesses.delete(requestId);
      res.end();
    }
  });

  activeProcesses.set(requestId, child);

  // Send the request ID so client can cancel
  ClaudeRunner.sendSSE(res, { type: 'started', requestId });

  // Do NOT kill on connection close — let Claude finish in background
  // The process will complete and save the file regardless
  req.on('close', () => {
    // Connection closed but process keeps running
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

  const requestId = Date.now().toString();
  const child = ClaudeRunner.run(prompt, res, {
    onComplete: (output) => {
      const filenameMatch = output.match(/\/app\/outputs\/([\w\-\.]+\.pptx)/);
      let foundFile = filenameMatch ? filenameMatch[1] : null;

      if (!foundFile) {
        try {
          const files = fs.readdirSync('/app/outputs')
            .filter(f => f.endsWith('.pptx'))
            .sort((a, b) => {
              const sa = fs.statSync(path.join('/app/outputs', a)).mtimeMs;
              const sb = fs.statSync(path.join('/app/outputs', b)).mtimeMs;
              return sb - sa;
            });
          if (files.length > 0) foundFile = files[0];
        } catch (e) { /* ignore */ }
      }

      ClaudeRunner.sendSSE(res, {
        type: 'done',
        filename: foundFile || 'unknown.pptx'
      });
      activeProcesses.delete(requestId);
      res.end();
    },
    onError: () => {
      activeProcesses.delete(requestId);
      res.end();
    }
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
  const proc = activeProcesses.get(req.params.requestId);
  if (proc) {
    proc.kill('SIGTERM');
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
