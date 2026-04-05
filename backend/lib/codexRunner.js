const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ClaudeRunner = require('./claudeRunner');

class CodexRunner {
  /**
   * Run Codex CLI with the given prompt and stream output via SSE.
   * Same interface as ClaudeRunner.run().
   */
  static run(prompt, res, options = {}) {
    const tmpFile = path.join(os.tmpdir(), `codex-prompt-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, prompt, 'utf-8');

    const promptSize = Buffer.byteLength(prompt, 'utf-8');
    console.log(`[codex] Starting CLI — prompt size: ${(promptSize / 1024).toFixed(1)} KB, temp file: ${tmpFile}`);

    const shellCmd = `codex exec --sandbox full-auto --json -p - < "${tmpFile}"`;

    const child = spawn('sh', ['-c', shellCmd], {
      env: process.env,
      cwd: '/app',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log(`[codex] Process started — PID: ${child.pid}`);

    let output = '';
    let textOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();

      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const event = JSON.parse(line);

          // Map Codex events to the same SSE format as Claude
          if (event.type === 'message' && event.role === 'assistant') {
            // Assistant message with content
            const content = event.content || '';
            if (typeof content === 'string' && content) {
              textOutput += content;
              const textLines = content.split('\n');
              for (const tl of textLines) {
                if (!tl.trim()) continue;
                const slideMatch = tl.match(/SLIDE_COMPLETE::(\d+)/);
                if (slideMatch) {
                  CodexRunner.sendSSE(res, { type: 'slide_complete', slideNumber: parseInt(slideMatch[1], 10) });
                } else {
                  CodexRunner.sendSSE(res, { type: 'log', message: tl });
                }
              }
            } else if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === 'text' && block.text) {
                  textOutput += block.text;
                  const textLines = block.text.split('\n');
                  for (const tl of textLines) {
                    if (!tl.trim()) continue;
                    const slideMatch = tl.match(/SLIDE_COMPLETE::(\d+)/);
                    if (slideMatch) {
                      CodexRunner.sendSSE(res, { type: 'slide_complete', slideNumber: parseInt(slideMatch[1], 10) });
                    } else {
                      CodexRunner.sendSSE(res, { type: 'log', message: tl });
                    }
                  }
                } else if (block.type === 'command' || block.type === 'function_call') {
                  const cmd = block.command || block.input || '';
                  const desc = typeof cmd === 'string' ? cmd.slice(0, 120) : JSON.stringify(cmd).slice(0, 120);
                  CodexRunner.sendSSE(res, { type: 'log', message: `>>> ${block.type}: ${desc}` });
                }
              }
            }

          } else if (event.type === 'command_output' || event.type === 'function_output') {
            const resultText = event.output || event.content || '';
            if (typeof resultText === 'string') {
              const preview = resultText.slice(0, 200);
              if (preview.trim()) {
                CodexRunner.sendSSE(res, { type: 'log', message: `    ${preview}${resultText.length > 200 ? '...' : ''}` });
              }
            }

          } else if (event.type === 'system') {
            CodexRunner.sendSSE(res, { type: 'log', message: `[system] Codex connected` });

          } else if (event.type === 'done' || event.type === 'completed') {
            const cost = event.cost_usd ? ` ($${event.cost_usd.toFixed(4)})` : '';
            const duration = event.duration_ms ? ` in ${(event.duration_ms / 1000).toFixed(1)}s` : '';
            CodexRunner.sendSSE(res, { type: 'log', message: `[done] Generation complete${duration}${cost}` });
          }
        } catch (e) {
          // Not JSON — stream as raw log
          if (line.trim()) {
            const slideMatch = line.match(/SLIDE_COMPLETE::(\d+)/);
            if (slideMatch) {
              CodexRunner.sendSSE(res, { type: 'slide_complete', slideNumber: parseInt(slideMatch[1], 10) });
            } else {
              CodexRunner.sendSSE(res, { type: 'log', message: line });
            }
            textOutput += line + '\n';
          }
        }
      }

      if (options.onLine) options.onLine(data.toString());
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        CodexRunner.sendSSE(res, { type: 'log', message: `[stderr] ${msg}` });
      }
    });

    child.on('close', (code, signal) => {
      console.log(`[codex] Process ended — code: ${code}, signal: ${signal}, textOutput: ${textOutput.length} chars`);
      try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }

      if (code === 0) {
        if (options.onComplete) options.onComplete(textOutput || output);
      } else if (textOutput.trim().length > 0) {
        console.log(`[codex] Non-zero exit (${code}) but has output. Treating as success.`);
        if (options.onComplete) options.onComplete(textOutput || output);
      } else {
        const reason = signal ? `signal ${signal}` : `code ${code}`;
        const errorMsg = `Codex CLI process ended (${reason}). Try again.`;
        CodexRunner.sendSSE(res, { type: 'error', message: errorMsg });
        if (options.onError) options.onError(errorMsg);
      }
    });

    child.on('error', (err) => {
      try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
      const errorMsg = `Failed to start Codex CLI: ${err.message}`;
      CodexRunner.sendSSE(res, { type: 'error', message: errorMsg });
      if (options.onError) options.onError(errorMsg);
    });

    return child;
  }

  /**
   * Run Codex CLI and collect the full output (non-streaming).
   */
  static runCollect(prompt) {
    return new Promise((resolve, reject) => {
      const tmpFile = path.join(os.tmpdir(), `codex-prompt-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, prompt, 'utf-8');

      const shellCmd = `codex exec --sandbox full-auto -p - < "${tmpFile}"`;

      const child = spawn('sh', ['-c', shellCmd], {
        env: process.env,
        cwd: '/app',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('close', (code) => {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        if (code === 0 || stdout.trim().length > 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Codex CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        reject(new Error(`Failed to start Codex CLI: ${err.message}`));
      });
    });
  }

  // Reuse the same sendSSE utility
  static sendSSE(res, data) {
    ClaudeRunner.sendSSE(res, data);
  }
}

module.exports = CodexRunner;
