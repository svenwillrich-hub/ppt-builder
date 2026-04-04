FROM node:20-slim

# Install Python, LibreOffice (headless for PPTX-to-image), and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    libreoffice-impress libreoffice-common fonts-liberation \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install python-pptx and pdf2image for slide rendering
RUN pip3 install --break-system-packages python-pptx Pillow pdf2image

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

COPY package.json ./
RUN npm install --production

# Pre-install pptxgenjs so Claude doesn't have to
RUN npm install pptxgenjs

COPY . .

# Create non-root user and directories
RUN useradd -m -s /bin/sh appuser && \
    mkdir -p /app/outputs /app/uploads /app/skills /app/config /app/previews && \
    chown -R appuser:appuser /app && \
    mkdir -p /home/appuser/.claude && \
    chown -R appuser:appuser /home/appuser && \
    chmod +x /app/entrypoint.sh

EXPOSE 3001

# Start as root to fix permissions, then drop to appuser
ENTRYPOINT ["/app/entrypoint.sh"]
