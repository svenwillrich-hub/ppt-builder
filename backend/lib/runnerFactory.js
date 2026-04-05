const ClaudeRunner = require('./claudeRunner');
const CodexRunner = require('./codexRunner');

function getRunner(provider) {
  if (provider === 'codex') return CodexRunner;
  return ClaudeRunner;
}

module.exports = { getRunner };
