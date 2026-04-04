# PPTX Creator

Interactive presentation builder powered by Claude Code CLI. Upload content, get a structured slide outline, review and refine it, then generate a professional PPTX — all from your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-required-blue.svg)
![Claude Code](https://img.shields.io/badge/Claude_Code-CLI-orange.svg)

## How It Works

```
Input  →  Analyze  →  Outline  →  Generate  →  Result
  1          2          3           4            5
```

1. **Input** — Paste text, upload files (MD, TXT, PDF, DOCX, PPTX, images), set slide count and style preferences
2. **Analyze** — Claude reads your content and proposes a structured slide outline with action titles and visual concepts
3. **Outline** — Review, edit, reorder, add/remove slides. Each slide has a title, description, and visual suggestion
4. **Generate** — Claude writes a Python/Node.js script to build the PPTX file, with live progress tracking
5. **Result** — Download the PPTX, preview each slide as an image, add per-slide revision notes, and iterate

### Key Features

- **Slide Preview** — LibreOffice renders each slide as a PNG for in-browser review
- **Fullscreen Modal** — Click any slide thumbnail to view it full-screen with keyboard navigation
- **Refine Sidebar** — Universal refinement panel available at every step
- **Per-Slide Revisions** — Comment on individual slides for targeted improvements
- **Time Tracking** — See how long each step took (analysis, editing, generation)
- **Multiple Styles** — Toggle consulting styles and color palettes
- **Live Progress** — Real-time streaming of Claude's actions during generation

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) (Windows or Mac)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) — logged in via `claude /login`

> **No API key required.** The app uses your Claude Code OAuth session (Claude Pro/Max subscription).

## Quick Start

### Windows

```powershell
cd docker-windows
start.bat          # Opens log window, starts containers on first run
```

In a separate terminal:
```powershell
restart.bat        # Rebuild & restart (e.g. after code changes)
stop.bat           # Stop all containers
```

### macOS / Linux

```bash
chmod +x docker-mac/*.sh
cd docker-mac
./start.sh         # Opens log window, starts containers on first run
```

In a separate terminal:
```bash
./restart.sh       # Rebuild & restart
./stop.sh          # Stop all containers
```

Then open **http://localhost:8090** in your browser.

## Project Structure

```
ppt-builder/
├── docker-compose.yml          # Container orchestration
├── .env.example                # Environment template
├── .gitignore
│
├── backend/
│   ├── Dockerfile              # Node 20 + Python 3 + LibreOffice + Claude CLI
│   ├── entrypoint.sh           # Permission setup, drops to non-root user
│   ├── package.json
│   ├── server.js               # Express API server
│   └── lib/
│       ├── claudeRunner.js     # Claude CLI process management + SSE streaming
│       └── promptBuilder.js    # Prompt construction for analyze/generate/revise
│
├── frontend/
│   ├── nginx.conf              # Reverse proxy + SSE support
│   └── public/
│       ├── index.html          # Single-page app
│       ├── app.js              # Vanilla JS application (~1100 lines)
│       └── styles.css          # Light theme CSS (~1400 lines)
│
├── config/
│   └── styles.json             # Presentation style presets
│
├── skills/                     # Drop skill files here for Claude to reference
│   └── README.md
│
├── outputs/                    # Generated PPTX files (gitignored)
├── uploads/                    # User-uploaded reference files (gitignored)
│
├── docker-windows/             # Windows batch scripts
│   ├── start.bat
│   ├── restart.bat
│   └── stop.bat
│
└── docker-mac/                 # macOS/Linux shell scripts
    ├── start.sh
    ├── restart.sh
    └── stop.sh
```

## Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Nginx + Vanilla JS | Single-page app, no build step |
| Backend | Node.js / Express | API server, Claude CLI orchestration |
| Claude CLI | `claude --dangerously-skip-permissions` | AI-powered content analysis + PPTX generation |
| PPTX Generation | pptxgenjs (Node) / python-pptx (Python) | Pre-installed in Docker, Claude chooses which to use |
| Slide Preview | LibreOffice headless + pdftoppm | PPTX → PDF → PNG conversion |
| Communication | SSE (Server-Sent Events) | Real-time progress streaming |

## Configuration

### Presentation Styles

Edit `config/styles.json` to add or modify style presets:

```json
[
  {
    "id": "consulting",
    "name": "Consulting Classic",
    "instruction": "Visualization-heavy, framework diagrams, McKinsey style.",
    "enabled": true
  }
]
```

### Custom Skills

Drop `.md` or `.txt` files into the `skills/` folder. They are automatically included in Claude's generation prompt, allowing it to follow specific style guides or frameworks.

### Color Palettes

12 PPT-style color palettes are available in the sidebar (Office, Blue Warm, Blue, Green, Orange, Red, Violet, Grayscale, etc.).

## How Generation Works

1. The backend writes the prompt to a temp file
2. It pipes the file to `claude --dangerously-skip-permissions --output-format stream-json --verbose -p -`
3. Claude writes a Python or Node.js script using pre-installed `python-pptx` or `pptxgenjs`
4. The script generates the PPTX file in `/app/outputs/`
5. Stream-JSON events are parsed and forwarded to the browser via SSE
6. After generation, LibreOffice renders each slide as a PNG for preview

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not logged in" | Run `claude /login` on your host machine, then `restart.bat` |
| CLI Status shows error | Click the status indicator in the sidebar footer to re-test |
| Empty live log | Check `docker-compose logs backend` for errors |
| Preview images missing | LibreOffice may need more time; check backend logs |
| Port 8090 in use | Change the port mapping in `docker-compose.yml` |
| Generation takes long | Normal for 10+ slides; Claude writes and runs a full script |

## Security Notes

- `--dangerously-skip-permissions` is used inside the Docker container only — Claude has unrestricted tool access within the sandboxed container
- No credentials are stored in the project — OAuth tokens are mounted read-only from your host's `~/.claude/` directory
- The container runs as a non-root user (`appuser`)
- Generated files are saved to `./outputs/` on your host machine

## License

MIT
