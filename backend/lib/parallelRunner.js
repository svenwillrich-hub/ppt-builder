const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ClaudeRunner = require('./claudeRunner');

class ParallelRunner {
  /**
   * Run multiple Claude CLI processes in parallel, one per slide.
   * All slides start simultaneously — no batching.
   * @param {Array<{slideNumber: number, prompt: string, outputPath: string}>} slideJobs
   * @param {object} res - SSE response object
   * @returns {Promise<{completedFiles: Array, failed: number[], children: Array}>}
   */
  static async run(slideJobs, res) {
    const children = [];

    const promises = slideJobs.map(job => this._runSingleSlide(job, res, children));
    const results = await Promise.allSettled(promises);

    const completedFiles = [];
    const failed = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.outputPath) {
        completedFiles.push(result.value);
      } else {
        const num = result.status === 'fulfilled' ? result.value.slideNumber : 0;
        failed.push(num);
      }
    }

    completedFiles.sort((a, b) => a.slideNumber - b.slideNumber);
    return { completedFiles, failed, children };
  }

  /**
   * Run a single Claude CLI process for one slide.
   * On completion, generates a PNG preview and sends it via SSE.
   */
  static _runSingleSlide(job, res, childrenArray) {
    return new Promise((resolve, reject) => {
      const { slideNumber, prompt, outputPath } = job;
      const tmpFile = path.join(os.tmpdir(), `claude-slide-${Date.now()}-${slideNumber}.txt`);
      fs.writeFileSync(tmpFile, prompt, 'utf-8');

      const promptSize = Buffer.byteLength(prompt, 'utf-8');
      console.log(`[parallel] Slide ${slideNumber} — prompt size: ${(promptSize / 1024).toFixed(1)} KB`);

      ClaudeRunner.sendSSE(res, { type: 'slide_started', slideNumber });

      const shellCmd = `claude --dangerously-skip-permissions --output-format stream-json --verbose -p - < "${tmpFile}"`;
      const child = spawn('sh', ['-c', shellCmd], {
        env: process.env,
        cwd: '/app',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      childrenArray.push(child);
      let textOutput = '';

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const event = JSON.parse(line);

            if (event.type === 'system') {
              ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] Claude connected` });

            } else if (event.type === 'assistant' && event.message) {
              const contents = event.message.content || [];
              for (const block of contents) {
                if (block.type === 'text' && block.text) {
                  textOutput += block.text;
                  const textLines = block.text.split('\n');
                  for (const tl of textLines) {
                    if (!tl.trim()) continue;
                    const slideMatch = tl.match(/SLIDE_COMPLETE::(\d+)/);
                    if (slideMatch) {
                      ClaudeRunner.sendSSE(res, { type: 'slide_complete', slideNumber });
                    } else {
                      ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] ${tl}` });
                    }
                  }
                } else if (block.type === 'tool_use') {
                  const input = block.input || {};
                  let desc = '';
                  if (block.name === 'Bash') desc = input.command ? input.command.slice(0, 100) : '';
                  else if (['Write', 'Edit', 'Read'].includes(block.name)) desc = input.file_path || '';
                  else desc = JSON.stringify(input).slice(0, 100);
                  ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] >>> ${block.name}: ${desc}` });
                }
              }

            } else if (event.type === 'result') {
              if (event.result) textOutput += (typeof event.result === 'string') ? event.result : JSON.stringify(event.result);
              const cost = event.total_cost_usd ? ` ($${event.total_cost_usd.toFixed(4)})` : '';
              const duration = event.duration_ms ? ` in ${(event.duration_ms / 1000).toFixed(1)}s` : '';
              ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] Done${duration}${cost}` });
            }
          } catch (e) {
            if (line.trim()) {
              const slideMatch = line.match(/SLIDE_COMPLETE::(\d+)/);
              if (slideMatch) {
                ClaudeRunner.sendSSE(res, { type: 'slide_complete', slideNumber });
              }
            }
          }
        }
      });

      child.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}][stderr] ${msg}` });
      });

      child.on('close', (code) => {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }

        let finalPath = outputPath;
        if (!fs.existsSync(outputPath)) {
          finalPath = this._findSlideFile(slideNumber);
        }

        if (finalPath && fs.existsSync(finalPath)) {
          console.log(`[parallel] Slide ${slideNumber} — complete: ${finalPath}`);
          // Generate preview asynchronously
          this._generatePreview(finalPath, slideNumber, res);
          resolve({ slideNumber, outputPath: finalPath });
        } else if (code === 0 || textOutput.length > 0) {
          ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] WARNING: No output file found` });
          reject(new Error(`Slide ${slideNumber}: no output file`));
        } else {
          ClaudeRunner.sendSSE(res, { type: 'log', message: `[slide ${slideNumber}] ERROR: Process failed (code ${code})` });
          reject(new Error(`Slide ${slideNumber}: process failed with code ${code}`));
        }
      });

      child.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        reject(new Error(`Slide ${slideNumber}: ${err.message}`));
      });
    });
  }

  /**
   * Generate a PNG preview of a single-slide PPTX and send via SSE.
   */
  static _generatePreview(pptxPath, slideNumber, res) {
    try {
      const previewDir = '/app/previews';
      if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

      // Convert PPTX to PDF first, then to PNG
      const baseName = path.basename(pptxPath, '.pptx');
      execSync(`soffice --headless --convert-to pdf "${pptxPath}" --outdir "${previewDir}"`, {
        timeout: 30000, stdio: 'pipe'
      });

      const pdfPath = path.join(previewDir, `${baseName}.pdf`);
      const pngPath = path.join(previewDir, `${baseName}.png`);

      if (fs.existsSync(pdfPath)) {
        execSync(`pdftoppm -png -singlefile -r 150 "${pdfPath}" "${previewDir}/${baseName}"`, {
          timeout: 15000, stdio: 'pipe'
        });
        try { fs.unlinkSync(pdfPath); } catch (e) { /* ignore */ }
      }

      if (fs.existsSync(pngPath)) {
        const previewUrl = `/api/previews/${baseName}.png`;
        ClaudeRunner.sendSSE(res, { type: 'slide_preview', slideNumber, previewUrl });
        console.log(`[parallel] Slide ${slideNumber} — preview: ${previewUrl}`);
      }
    } catch (e) {
      console.log(`[parallel] Slide ${slideNumber} — preview generation failed: ${e.message}`);
      // Non-fatal — slide is still generated, just no preview
    }
  }

  static _findSlideFile(slideNumber) {
    try {
      const files = fs.readdirSync('/app/outputs');
      const match = files.find(f => f.includes(`-slide-`) && f.includes(`-${slideNumber}.pptx`));
      return match ? path.join('/app/outputs', match) : null;
    } catch (e) {
      return null;
    }
  }

  static killAll(children) {
    for (const child of children) {
      try { child.kill('SIGTERM'); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = ParallelRunner;
