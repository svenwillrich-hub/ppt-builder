const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ClaudeRunner {
  /**
   * Run Claude Code CLI with the given prompt and stream output via SSE.
   * Writes prompt to a temp file to avoid command-line length limits.
   */
  static run(prompt, res, options = {}) {
    // Write prompt to temp file to avoid arg length limits
    const tmpFile = path.join(os.tmpdir(), `claude-prompt-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, prompt, 'utf-8');

    const args = [
      '-p', `$(cat ${tmpFile})`,
      '--allowedTools', 'computer',
      '--output-format', 'stream-json'
    ];

    const promptSize = Buffer.byteLength(prompt, 'utf-8');
    console.log(`[claude] Starting CLI — prompt size: ${(promptSize / 1024).toFixed(1)} KB, temp file: ${tmpFile}`);

    // Pipe prompt via stdin, redirect stdin from file (not cat pipe) to keep stdin open
    const shellCmd = `claude --dangerously-skip-permissions --output-format stream-json --verbose -p - < "${tmpFile}"`;

    const child = spawn('sh', ['-c', shellCmd], {
      env: process.env,
      cwd: '/app',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log(`[claude] Process started — PID: ${child.pid}`);

    let output = '';
    let textOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();

      // stream-json outputs one JSON object per line
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const event = JSON.parse(line);

          if (event.type === 'system') {
            ClaudeRunner.sendSSE(res, { type: 'log', message: `[system] Claude ${event.claude_code_version || ''} connected (${event.model || 'unknown'})` });

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
                    ClaudeRunner.sendSSE(res, { type: 'slide_complete', slideNumber: parseInt(slideMatch[1], 10) });
                  } else {
                    ClaudeRunner.sendSSE(res, { type: 'log', message: tl });
                  }
                }
              } else if (block.type === 'tool_use') {
                // Format tool calls nicely
                const input = block.input || {};
                let desc = '';
                if (block.name === 'Bash') desc = input.command ? input.command.slice(0, 120) : '';
                else if (block.name === 'Write') desc = input.file_path || '';
                else if (block.name === 'Edit') desc = input.file_path || '';
                else if (block.name === 'Read') desc = input.file_path || '';
                else desc = JSON.stringify(input).slice(0, 120);
                ClaudeRunner.sendSSE(res, { type: 'log', message: `>>> ${block.name}: ${desc}` });
              }
            }

          } else if (event.type === 'tool_result' || (event.type === 'user' && event.message)) {
            // Tool results — show output
            const contents = (event.message?.content || event.content || []);
            for (const block of (Array.isArray(contents) ? contents : [])) {
              if (block.type === 'tool_result' && block.content) {
                const resultText = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                const preview = resultText.slice(0, 200);
                if (preview.trim()) {
                  ClaudeRunner.sendSSE(res, { type: 'log', message: `    ${preview}${resultText.length > 200 ? '...' : ''}` });
                }
              }
            }

          } else if (event.type === 'result') {
            if (event.result) {
              textOutput += (typeof event.result === 'string') ? event.result : JSON.stringify(event.result);
              const cost = event.total_cost_usd ? ` ($${event.total_cost_usd.toFixed(4)})` : '';
              const duration = event.duration_ms ? ` in ${(event.duration_ms / 1000).toFixed(1)}s` : '';
              ClaudeRunner.sendSSE(res, { type: 'log', message: `[done] Generation complete${duration}${cost}` });
            }
          }
        } catch (e) {
          // Not JSON — stream as raw log
          if (line.trim()) {
            const slideMatch = line.match(/SLIDE_COMPLETE::(\d+)/);
            if (slideMatch) {
              ClaudeRunner.sendSSE(res, { type: 'slide_complete', slideNumber: parseInt(slideMatch[1], 10) });
            } else {
              ClaudeRunner.sendSSE(res, { type: 'log', message: line });
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
        ClaudeRunner.sendSSE(res, { type: 'log', message: `[stderr] ${msg}` });
      }
    });

    child.on('close', (code, signal) => {
      const elapsed = Math.round((Date.now() - Date.now()) / 1000);
      console.log(`[claude] Process ended — code: ${code}, signal: ${signal}, textOutput: ${textOutput.length} chars, rawOutput: ${output.length} chars`);
      // Log last 200 chars of output for debugging
      console.log(`[claude] Last output: ${textOutput.slice(-200)}`);
      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }

      if (code === 0) {
        if (options.onComplete) options.onComplete(textOutput || output);
      } else if (textOutput.trim().length > 0) {
        // Non-zero exit but produced output — check if it looks like success
        console.log(`[claude] Non-zero exit (${code}) but has output. Treating as success.`);
        if (options.onComplete) options.onComplete(textOutput || output);
      } else {
        const reason = signal ? `signal ${signal}` : `code ${code}`;
        const errorMsg = `Claude CLI process ended (${reason}). Try again with fewer slides or a shorter prompt.`;
        ClaudeRunner.sendSSE(res, { type: 'error', message: errorMsg });
        if (options.onError) options.onError(errorMsg);
      }
    });

    child.on('error', (err) => {
      try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
      const errorMsg = `Failed to start Claude CLI: ${err.message}`;
      ClaudeRunner.sendSSE(res, { type: 'error', message: errorMsg });
      if (options.onError) options.onError(errorMsg);
    });

    return child;
  }

  /**
   * Run Claude Code CLI and collect the full output (non-streaming).
   */
  static runCollect(prompt) {
    return new Promise((resolve, reject) => {
      const tmpFile = path.join(os.tmpdir(), `claude-prompt-${Date.now()}.txt`);
      fs.writeFileSync(tmpFile, prompt, 'utf-8');

      const shellCmd = `claude --dangerously-skip-permissions --output-format text -p - < "${tmpFile}"`;

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
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        reject(new Error(`Failed to start Claude CLI: ${err.message}`));
      });
    });
  }

  static sendSSE(res, data) {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // Connection may have been closed
    }
  }
}

module.exports = ClaudeRunner;
