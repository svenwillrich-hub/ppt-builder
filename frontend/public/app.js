/* === PPTX Creator — Frontend Application === */

(function () {
  'use strict';

  const API = '/api';

  // --- Color palettes (PPT-style with 6 theme colors each) ---
  const PALETTES = [
    { id: 'office',       name: 'Office',         colors: ['#4472C4','#ED7D31','#A5A5A5','#FFC000','#5B9BD5','#70AD47'], accent: '#4472C4', accentHover: '#3560a8', accentLight: '#e8eef8' },
    { id: 'blue-warm',    name: 'Blue Warm',       colors: ['#4A66AC','#629DD1','#297FD5','#7F8FA9','#5AA2AE','#9D90A0'], accent: '#4A66AC', accentHover: '#3b5491', accentLight: '#eaedF5' },
    { id: 'blue',         name: 'Blue',            colors: ['#0F6FC6','#009DD9','#0BD0D9','#10CF9B','#7CCA62','#A5C249'], accent: '#0F6FC6', accentHover: '#0b5aa3', accentLight: '#e5f0fa' },
    { id: 'blue-green',   name: 'Blue Green',      colors: ['#3494BA','#58B6C0','#75BDA7','#7A8C8E','#84ACB6','#2683C6'], accent: '#3494BA', accentHover: '#2a7a9a', accentLight: '#e7f3f7' },
    { id: 'green',        name: 'Green',           colors: ['#549E39','#8AB833','#C0CF3A','#029676','#4AB5C4','#0989B1'], accent: '#549E39', accentHover: '#44822e', accentLight: '#edf5ea' },
    { id: 'orange',       name: 'Orange',          colors: ['#E48312','#BD582C','#865640','#9B8357','#C2BC80','#94A088'], accent: '#E48312', accentHover: '#c46f0e', accentLight: '#fdf1e3' },
    { id: 'red-orange',   name: 'Red Orange',      colors: ['#D34817','#9B2D1F','#A28E6A','#956251','#918485','#855D5D'], accent: '#D34817', accentHover: '#b03c12', accentLight: '#fae9e4' },
    { id: 'red',          name: 'Red',             colors: ['#A5300F','#D55816','#E19825','#B19C7D','#7F6C6C','#6E4B4B'], accent: '#A5300F', accentHover: '#88270c', accentLight: '#f5e6e3' },
    { id: 'violet',       name: 'Violet',          colors: ['#7E32CB','#AD40E8','#D164FF','#A48CC2','#8C7BAF','#6654A0'], accent: '#7E32CB', accentHover: '#6828a8', accentLight: '#f1e8fa' },
    { id: 'grayscale',    name: 'Grayscale',       colors: ['#595959','#808080','#A6A6A6','#BFBFBF','#D9D9D9','#404040'], accent: '#595959', accentHover: '#404040', accentLight: '#efefef' },
    { id: 'paper',        name: 'Paper',           colors: ['#A5AB81','#D8B25C','#7BA79D','#968C8C','#F2D19F','#B5A28D'], accent: '#A5AB81', accentHover: '#8c9268', accentLight: '#f2f3ed' },
    { id: 'median',       name: 'Median',          colors: ['#94B6D2','#DD8047','#A5AB81','#D8B25C','#7BA79D','#968C8C'], accent: '#94B6D2', accentHover: '#7a9fbd', accentLight: '#eef4f8' }
  ];

  const DEFAULT_INSTRUCTIONS = `Create top-notch consulting slides following these principles:
- Every slide must have a clear action title (key takeaway as the headline)
- Use the Pyramid Principle: lead with the conclusion, support with evidence
- Include quantitative data points wherever possible (stats, percentages, benchmarks)
- Suggest high-impact visuals: 2x2 matrices, process flows, waterfall charts, comparison tables
- Keep text concise: max 5 bullet points per slide, each under 15 words
- Include a clear narrative arc: Situation > Complication > Resolution
- Add source citations for all data claims`;

  // --- State ---
  const state = {
    currentStep: 1,
    highestStep: 1,
    language: 'english',
    styles: [],
    uploadedFiles: [],
    revisionFiles: [],
    slides: [],
    slideComments: {},
    slidePreviewUrls: [],
    modalSlideIndex: 0,
    generatedFilename: null,
    revisions: [],
    revisionCount: 0,
    activeRequestId: null,
    refineInstructions: '',
    // Timing
    timings: { analyze: 0, outline: 0, generate: 0, total: 0 },
    stepStartTime: null,
    analyzeTimer: null,
    analyzeSeconds: 0,
    genTimer: null,
    genSeconds: 0,
    palette: 'indigo'
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadStyles();
    loadOutputFiles();
    bindEvents();
    updateStep(1);
    checkCliStatus();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (state.currentStep === 1) $('#btn-analyze').click();
      else if (state.currentStep === 3) $('#btn-generate').click();
      else if (state.currentStep === 5) handleRefineApply();
    }
  });

  // --- Settings ---
  function loadSettings() {
    const lang = localStorage.getItem('pptx-lang');
    if (lang) {
      state.language = lang;
      $$('#language-toggle .pill').forEach(p => p.classList.toggle('active', p.dataset.lang === lang));
    }

    const instructions = localStorage.getItem('pptx-instructions');
    $('#default-instructions').value = instructions || DEFAULT_INSTRUCTIONS;

    const content = localStorage.getItem('pptx-draft-content');
    if (content) { $('#content-input').value = content; updateAnalyzeButton(); }

    // Slide target: restore saved chip selection or default to 3
    const savedTarget = localStorage.getItem('pptx-slide-target');
    if (savedTarget && savedTarget !== '') {
      const chip = $(`.count-chip[data-count="${savedTarget}"]`);
      if (chip) {
        $$('.count-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      } else {
        $$('.count-chip').forEach(c => c.classList.remove('active'));
        $('#slide-target').value = savedTarget;
        $('#slide-target').classList.add('active');
      }
    }

    const palette = localStorage.getItem('pptx-palette') || 'indigo';
    state.palette = palette;
    applyPalette(palette);
  }

  function saveSettings() {
    localStorage.setItem('pptx-lang', state.language);
    localStorage.setItem('pptx-instructions', $('#default-instructions').value);
    const activeChipSave = $('.count-chip.active');
    localStorage.setItem('pptx-slide-target', activeChipSave ? activeChipSave.dataset.count : $('#slide-target').value);
    localStorage.setItem('pptx-palette', state.palette);
    toast('Settings saved', 'success');
  }

  function saveDraft() {
    localStorage.setItem('pptx-draft-content', $('#content-input').value);
  }

  // --- Color palette ---
  function applyPalette(id) {
    const p = PALETTES.find(x => x.id === id) || PALETTES[0];
    document.documentElement.style.setProperty('--accent', p.accent);
    document.documentElement.style.setProperty('--accent-hover', p.accentHover);
    document.documentElement.style.setProperty('--accent-light', p.accentLight);
    state.palette = id;

    // Update palette selector active state
    $$('.palette-dot').forEach(d => d.classList.toggle('active', d.dataset.palette === id));
  }

  // --- Events ---
  function bindEvents() {
    // Sidebar toggle
    $('#sidebar-toggle').addEventListener('click', () => {
      $('#sidebar').classList.add('collapsed');
      $('#sidebar-open').hidden = false;
    });
    $('#sidebar-open').addEventListener('click', () => {
      $('#sidebar').classList.remove('collapsed');
      $('#sidebar-open').hidden = true;
    });

    // Language toggle
    $$('#language-toggle .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#language-toggle .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        state.language = btn.dataset.lang;
      });
    });

    // Save settings
    $('#save-settings').addEventListener('click', saveSettings);

    // CLI status click to re-test
    $('#claude-status').addEventListener('click', checkCliStatus);

    // Drop zone
    const dropZone = $('#drop-zone');
    const fileInput = $('#file-input');
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { handleFiles(fileInput.files); fileInput.value = ''; });

    // Slide count chips
    $$('.count-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.count-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        $('#slide-target').value = '';
        $('#slide-target').classList.remove('active');
      });
    });
    $('#slide-target').addEventListener('input', () => {
      if ($('#slide-target').value) {
        $$('.count-chip').forEach(c => c.classList.remove('active'));
        $('#slide-target').classList.add('active');
      }
    });

    // Auto-expand instructions textarea
    const instrEl = $('#default-instructions');
    function autoExpand() { instrEl.style.height = 'auto'; instrEl.style.height = instrEl.scrollHeight + 'px'; }
    instrEl.addEventListener('input', autoExpand);
    setTimeout(autoExpand, 50);

    // Content input
    $('#content-input').addEventListener('input', () => { updateAnalyzeButton(); saveDraft(); });

    // Analyze
    $('#btn-analyze').addEventListener('click', () => startAnalysis());

    // Step 2 done buttons
    $('#btn-view-outline').addEventListener('click', () => updateStep(3));
    $('#btn-back-to-input').addEventListener('click', () => updateStep(1));

    // Generate
    $('#btn-generate').addEventListener('click', startGeneration);
    $('#btn-add-slide-bottom').addEventListener('click', () => addSlide());
    $('#btn-cancel-gen').addEventListener('click', cancelGeneration);
    $('#btn-download').addEventListener('click', downloadFile);

    // New presentation
    $('#btn-new-presentation').addEventListener('click', () => {
      state.slides = []; state.revisions = []; state.revisionCount = 0;
      state.generatedFilename = null; state.uploadedFiles = []; state.revisionFiles = [];
      state.slidePreviewUrls = []; state.slideComments = {}; state.highestStep = 1;
      $('#content-input').value = ''; $('#uploaded-files').innerHTML = '';
      updateStep(1);
    });

    // Copy log
    $('#gen-copy-log').addEventListener('click', () => {
      navigator.clipboard.writeText($('#gen-log').textContent).then(() => toast('Log copied', 'success'));
    });

    // Clickable step navigation
    $$('.step-indicator .step').forEach(el => {
      el.addEventListener('click', () => {
        const target = parseInt(el.dataset.step);
        if (target <= state.highestStep && target !== state.currentStep) {
          updateStep(target);
          if (target === 3) renderSlideOutline();
        }
      });
    });

    // Refine sidebar toggle
    $('#refine-toggle').addEventListener('click', () => {
      $('#refine-sidebar').classList.remove('collapsed');
    });
    $('#refine-sidebar-close').addEventListener('click', () => {
      $('#refine-sidebar').classList.add('collapsed');
    });

    // Refine apply
    $('#refine-apply').addEventListener('click', handleRefineApply);

    // Slide modal
    $('#slide-modal-close').addEventListener('click', closeSlideModal);
    $('#slide-modal-prev').addEventListener('click', () => {
      if (state.slidePreviewUrls.length === 0) return;
      state.modalSlideIndex = (state.modalSlideIndex - 1 + state.slidePreviewUrls.length) % state.slidePreviewUrls.length;
      updateSlideModal();
    });
    $('#slide-modal-next').addEventListener('click', () => {
      if (state.slidePreviewUrls.length === 0) return;
      state.modalSlideIndex = (state.modalSlideIndex + 1) % state.slidePreviewUrls.length;
      updateSlideModal();
    });
    $('#slide-modal').addEventListener('click', (e) => {
      if (e.target === $('#slide-modal')) closeSlideModal();
    });

    // Keyboard for modal
    document.addEventListener('keydown', (e) => {
      if ($('#slide-modal').hidden) return;
      if (e.key === 'Escape') closeSlideModal();
      else if (e.key === 'ArrowLeft') $('#slide-modal-prev').click();
      else if (e.key === 'ArrowRight') $('#slide-modal-next').click();
    });
  }

  // --- CLI Status (simple check) ---
  async function checkCliStatus() {
    const dot = $('#claude-status-dot');
    const text = $('#claude-status-text');
    dot.className = 'status-dot loading';
    text.textContent = 'Checking...';

    try {
      const res = await fetch(`${API}/claude-test`);
      const data = await res.json();
      if (data.allOk) {
        dot.className = 'status-dot ok';
        text.textContent = 'CLI connected';
      } else {
        dot.className = 'status-dot error';
        const failedKey = Object.keys(data.checks).find(k => !data.checks[k].ok);
        const failedCheck = data.checks[failedKey];
        text.textContent = failedCheck?.error?.slice(0, 30) || failedKey + ' failed';
        text.title = JSON.stringify(failedCheck, null, 2);
      }
    } catch (e) {
      dot.className = 'status-dot error';
      text.textContent = 'Backend unreachable';
    }
  }

  // --- File handling ---
  async function handleFiles(fileList) {
    const files = Array.from(fileList);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.files) { data.files.forEach(f => state.uploadedFiles.push(f)); renderUploadedFiles(); updateAnalyzeButton(); }
    } catch (e) { toast('Upload failed: ' + e.message, 'error'); }
  }

  async function handleRevisionFiles(fileList) {
    const files = Array.from(fileList);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.files) { data.files.forEach(f => state.revisionFiles.push(f)); renderRevisionFiles(); }
    } catch (e) { toast('Upload failed: ' + e.message, 'error'); }
  }

  function renderUploadedFiles() {
    const container = $('#uploaded-files');
    container.innerHTML = state.uploadedFiles.map((f, i) => `
      <div class="file-tag"><span>${f.originalName}</span><span class="file-size">${formatSize(f.size)}</span><button class="remove-file" data-index="${i}">&times;</button></div>
    `).join('');
    container.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => { state.uploadedFiles.splice(parseInt(btn.dataset.index), 1); renderUploadedFiles(); updateAnalyzeButton(); });
    });
  }

  function renderRevisionFiles() {
    const container = $('#revision-files');
    if (!container) return;
    container.innerHTML = state.revisionFiles.map((f, i) => `
      <div class="file-tag"><span>${f.originalName}</span><span class="file-size">${formatSize(f.size)}</span><button class="remove-file" data-index="${i}">&times;</button></div>
    `).join('');
    container.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => { state.revisionFiles.splice(parseInt(btn.dataset.index), 1); renderRevisionFiles(); });
    });
  }

  function updateAnalyzeButton() {
    const hasContent = $('#content-input').value.trim().length > 0;
    const hasFiles = state.uploadedFiles.length > 0;
    $('#btn-analyze').disabled = !(hasContent || hasFiles);
  }

  // --- Styles ---
  async function loadStyles() {
    try {
      const res = await fetch(`${API}/styles`);
      state.styles = await res.json();
      renderStyles();
    } catch (e) { state.styles = []; }
  }

  function renderStyles() {
    const container = $('#styles-list');

    // PPT-style palette selector
    let paletteHtml = '<div style="margin-bottom:16px"><label class="section-label">Color Palette</label><div class="palette-grid">';
    PALETTES.forEach(p => {
      const swatches = p.colors.map(c => `<span style="width:14px;height:14px;background:${c};display:inline-block;"></span>`).join('');
      paletteHtml += `<div class="palette-row ${state.palette === p.id ? 'active' : ''}" data-palette="${p.id}" title="${p.name}">
        <span class="palette-swatches">${swatches}</span>
        <span class="palette-name">${p.name}</span>
      </div>`;
    });
    paletteHtml += '</div></div>';

    container.innerHTML = paletteHtml + state.styles.map(s => `
      <div class="style-item" title="${s.instruction}">
        <label class="style-toggle"><input type="checkbox" data-id="${s.id}" ${s.enabled ? 'checked' : ''}><span class="slider"></span></label>
        <span class="style-name">${s.name}</span>
      </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const style = state.styles.find(s => s.id === cb.dataset.id);
        if (style) style.enabled = cb.checked;
      });
    });

    container.querySelectorAll('.palette-row').forEach(row => {
      row.addEventListener('click', () => {
        container.querySelectorAll('.palette-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        applyPalette(row.dataset.palette);
        localStorage.setItem('pptx-palette', row.dataset.palette);
      });
    });
  }

  function getEnabledStyles() { return state.styles.filter(s => s.enabled).map(s => s.id); }

  // --- Output files ---
  async function loadOutputFiles() {
    try {
      const res = await fetch(`${API}/outputs`);
      const files = await res.json();
      renderOutputFiles(files);
    } catch (e) { /* ignore */ }
  }

  function renderOutputFiles(files) {
    const container = $('#files-list');
    if (!files.length) { container.innerHTML = '<div class="empty-state-small">No files yet</div>'; return; }
    container.innerHTML = files.map(f => `
      <a class="file-item" href="${API}/outputs/${f.filename}" download>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M5 5h4M5 7h4M5 9h2" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/></svg>
        <span class="file-name">${f.filename}</span>
      </a>
    `).join('');
  }

  // --- Step navigation ---
  function updateStep(step) {
    state.currentStep = step;
    state.highestStep = Math.max(state.highestStep, step);

    $$('.step-indicator .step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed', 'clickable');
      if (s === step) el.classList.add('active');
      else if (s < step) el.classList.add('completed');
      if (s <= state.highestStep && s !== step) el.classList.add('clickable');
    });

    $$('.step-content').forEach(el => el.classList.remove('active'));
    const target = $(`#step-${step}`);
    if (target) target.classList.add('active');

    updateRefineContext(step);
  }

  // --- Refine sidebar ---
  function updateRefineContext(step) {
    const ctx = $('#refine-context');
    if (!ctx) return;
    switch (step) {
      case 1:
        ctx.textContent = 'Refine is available after analysis.';
        break;
      case 2:
        ctx.textContent = 'Analysis in progress. Wait for completion to refine.';
        break;
      case 3:
        ctx.textContent = 'Re-analyze with additional instructions. The outline will be regenerated.';
        break;
      case 4:
        ctx.textContent = 'Generation in progress. Wait for completion to refine.';
        break;
      case 5:
        ctx.textContent = 'Add revision instructions. Per-slide comments below will be included automatically.';
        break;
      default:
        ctx.textContent = 'Add instructions to refine the current output.';
    }
  }

  function handleRefineApply() {
    const refineInput = ($('#refine-input') ? $('#refine-input').value.trim() : '');

    if (state.currentStep === 3) {
      if (!refineInput) { toast('Enter refine instructions', 'warning'); return; }
      $('#refine-sidebar').classList.add('collapsed');
      $('#refine-input').value = '';
      startAnalysis(refineInput);
    } else if (state.currentStep === 5) {
      // Collect per-slide comments
      const slideNotes = Object.entries(state.slideComments)
        .filter(([_, v]) => v.trim())
        .map(([num, text]) => `- Slide ${num}: ${text.trim()}`)
        .join('\n');

      const instructions = [refineInput, slideNotes].filter(Boolean).join('\n\n## Per-slide notes:\n');

      if (!instructions.trim()) { toast('Please add revision notes (refine text or per-slide comments)', 'warning'); return; }

      state.refineInstructions = instructions;
      $('#refine-sidebar').classList.add('collapsed');
      $('#refine-input').value = '';
      startRevision();
    } else {
      toast('Refine is not available on this step', 'warning');
    }
  }

  // --- Step 2: Analysis ---
  function startAnalyzeTimer() {
    state.analyzeSeconds = 0;
    state.lastStatusIdx = -1;
    const el = $('#analyze-timer');
    el.textContent = '0:00';
    state.analyzeTimer = setInterval(() => {
      state.analyzeSeconds++;
      const m = Math.floor(state.analyzeSeconds / 60);
      const s = state.analyzeSeconds % 60;
      el.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      // Show timed status messages
      for (let i = ANALYZE_STATUS_MESSAGES.length - 1; i >= 0; i--) {
        if (state.analyzeSeconds >= ANALYZE_STATUS_MESSAGES[i].at && i > state.lastStatusIdx) {
          state.lastStatusIdx = i;
          $('#analyze-status-text').textContent = ANALYZE_STATUS_MESSAGES[i].text;
          break;
        }
      }
    }, 1000);
  }

  function stopAnalyzeTimer() {
    if (state.analyzeTimer) { clearInterval(state.analyzeTimer); state.analyzeTimer = null; }
  }

  // Status messages shown during analysis based on time elapsed
  const ANALYZE_STATUS_MESSAGES = [
    { at: 3,  text: 'Connected — Claude is reading your input...' },
    { at: 8,  text: 'Understanding the topic and audience...' },
    { at: 15, text: 'Identifying key themes and arguments...' },
    { at: 25, text: 'Designing the narrative arc and slide structure...' },
    { at: 40, text: 'Writing action titles and descriptions...' },
    { at: 60, text: 'Selecting optimal visualizations per slide...' },
    { at: 80, text: 'Almost there — finalizing...' }
  ];

  async function startAnalysis(extraInstructions) {
    updateStep(2);
    // Reset analyze UI
    $('#analyze-in-progress').hidden = false;
    $('#analyze-done').hidden = true;
    $('#btn-view-outline').hidden = false;
    $('#analyze-summary').style.color = '';
    const logEl = $('#analyze-log');
    logEl.textContent = '';
    $('#analyze-status-text').textContent = 'Connecting to Claude CLI...';
    startAnalyzeTimer();

    const instructions = $('#default-instructions').value;
    const activeChip = $('.count-chip.active');
    const customVal = parseInt($('#slide-target').value);
    const slideTarget = customVal || (activeChip ? parseInt(activeChip.dataset.count) : 15);

    let content = $('#content-input').value;
    if (extraInstructions) {
      content += `\n\n## Additional instructions for re-analysis:\n${extraInstructions}`;
    }

    const body = {
      content,
      language: state.language,
      styles: getEnabledStyles(),
      uploadedFiles: state.uploadedFiles.map(f => f.storedName),
      defaultInstructions: instructions + `\n\nTarget approximately ${slideTarget} slides.`
    };

    let lineCount = 0;

    try {
      const response = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'log') {
              lineCount++;
              logEl.textContent += event.message + '\n';
              logEl.scrollTop = logEl.scrollHeight;

              // Update status based on log content
              if (lineCount === 1) {
                $('#analyze-status-text').textContent = 'Claude is working...';
              }
              if (event.message.includes('slideNumber') || event.message.includes('"slideNumber"')) {
                $('#analyze-status-text').textContent = 'Finalizing response...';
              }
            } else {
              handleAnalyzeEvent(event);
            }
          } catch (e) { /* skip */ }
        }
      }

      if (buffer.startsWith('data: ')) {
        try { handleAnalyzeEvent(JSON.parse(buffer.slice(6))); } catch (e) { /* skip */ }
      }
    } catch (e) {
      toast('Analysis failed: ' + e.message, 'error');
      updateStep(1);
    }
    stopAnalyzeTimer();
  }

  function handleAnalyzeEvent(event) {
    switch (event.type) {
      case 'result':
        state.slides = event.slides;
        state.timings.analyze = state.analyzeSeconds;
        state.stepStartTime = Date.now();
        renderSlideOutline();

        // Show done state
        $('#analyze-in-progress').hidden = true;
        $('#analyze-done').hidden = false;
        $('#analyze-summary').textContent = `${event.slides.length} slides generated in ${formatDuration(state.analyzeSeconds)}`;

        // Render analysis facts
        renderAnalysisFacts(event.slides);

        toast(`Analysis complete — ${event.slides.length} slides`, 'success');
        break;
      case 'error':
        const errLog = $('#analyze-log');
        errLog.textContent += '\n\n=== ERROR ===\n' + event.message + '\n';
        errLog.scrollTop = errLog.scrollHeight;
        $('#analyze-in-progress').hidden = true;
        $('#analyze-done').hidden = false;
        $('#analyze-summary').textContent = 'Analysis failed — see log below';
        $('#analyze-summary').style.color = 'var(--error)';
        $('#btn-view-outline').hidden = true;
        toast('Analysis error: ' + event.message, 'error');
        break;
    }
  }

  function renderAnalysisFacts(slides) {
    const factsEl = $('#analysis-facts');
    if (!factsEl) return;

    const slideCount = slides.length;

    // Count unique visual suggestion keywords
    const visualTypes = new Set();
    slides.forEach(s => {
      if (s.visualSuggestion) {
        const keywords = s.visualSuggestion.toLowerCase()
          .match(/\b(chart|matrix|table|flow|diagram|timeline|map|graph|bar|pie|waterfall|funnel|comparison|process|pyramid|swot|list|icons|image|photo|illustration)\b/g);
        if (keywords) keywords.forEach(k => visualTypes.add(k));
      }
    });

    // Count research slides
    const researchCount = slides.filter(s => s.researchNeeded).length;

    let html = `<span class="fact-chip">${slideCount} slides</span>`;
    if (visualTypes.size > 0) {
      html += `<span class="fact-chip">${visualTypes.size} visual type${visualTypes.size > 1 ? 's' : ''}</span>`;
    }
    if (researchCount > 0) {
      html += `<span class="fact-chip">${researchCount} research slide${researchCount > 1 ? 's' : ''}</span>`;
    }

    factsEl.innerHTML = html;
  }

  // --- Step 3: Slide Outline Editor ---
  function renderSlideOutline() {
    const grid = $('#slides-grid');
    grid.innerHTML = '';
    state.slides.forEach((slide, index) => {
      slide.slideNumber = index + 1;
      grid.appendChild(createSlideCard(slide, index));
    });
    $('#slide-count').textContent = `${state.slides.length} slides`;
    setupDragAndDrop();
  }

  function createSlideCard(slide, index) {
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.draggable = true;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="slide-card-header">
        <span class="slide-number">${slide.slideNumber}</span>
        <span class="drag-handle" title="Drag to reorder">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="4" r="1" fill="currentColor"/><circle cx="10" cy="4" r="1" fill="currentColor"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="12" r="1" fill="currentColor"/></svg>
        </span>
      </div>
      <div class="slide-field">
        <label>Action Title</label>
        <input type="text" class="action-title" value="${escapeHtml(slide.actionTitle || '')}" data-field="actionTitle">
      </div>
      <div class="slide-fields-row">
        <div class="slide-field">
          <label>Description</label>
          <textarea data-field="description" rows="4">${escapeHtml(slide.description || '')}</textarea>
        </div>
        <div class="slide-field">
          <label>Visual Concept</label>
          <textarea data-field="visualSuggestion" rows="4">${escapeHtml(slide.visualSuggestion || '')}</textarea>
        </div>
      </div>
      <div class="slide-card-footer">
        <label class="research-toggle">
          <input type="checkbox" data-field="researchNeeded" ${slide.researchNeeded ? 'checked' : ''}>
          Research & References
        </label>
        <div class="slide-card-actions">
          <button class="icon-btn duplicate" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M2 10V2h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
          <button class="icon-btn delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 4h8M5.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M6 6.5v3M8 6.5v3M4 4l.5 7a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    `;

    card.querySelectorAll('input[type="text"], textarea').forEach(input => {
      input.addEventListener('input', () => {
        state.slides[index][input.dataset.field] = input.value;
        if (input.tagName === 'TEXTAREA') { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; }
      });
      // Auto-expand on render
      if (input.tagName === 'TEXTAREA') { setTimeout(() => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; }, 10); }
    });
    card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => { state.slides[index].researchNeeded = e.target.checked; });
    card.querySelector('.duplicate').addEventListener('click', () => { state.slides.splice(index + 1, 0, { ...state.slides[index] }); renderSlideOutline(); });
    card.querySelector('.delete').addEventListener('click', () => {
      if (state.slides.length <= 1) { toast('Cannot delete the only slide', 'warning'); return; }
      state.slides.splice(index, 1); renderSlideOutline();
    });

    return card;
  }

  function addSlide() {
    state.slides.push({ slideNumber: state.slides.length + 1, actionTitle: '', description: '', visualSuggestion: '', researchNeeded: false });
    renderSlideOutline();
  }

  function setupDragAndDrop() {
    let dragIndex = null;
    $$('.slide-card').forEach(card => {
      card.addEventListener('dragstart', (e) => { dragIndex = parseInt(card.dataset.index); card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); $$('.slide-card').forEach(c => c.classList.remove('drag-over')); });
      card.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('drag-over'); });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', (e) => {
        e.preventDefault(); card.classList.remove('drag-over');
        const dropIndex = parseInt(card.dataset.index);
        if (dragIndex !== null && dragIndex !== dropIndex) {
          const [moved] = state.slides.splice(dragIndex, 1);
          state.slides.splice(dropIndex, 0, moved);
          renderSlideOutline();
        }
      });
    });
  }

  // --- Timers ---
  function startGenTimer() {
    state.genSeconds = 0;
    const el = $('#gen-timer');
    el.textContent = '0:00';
    state.genTimer = setInterval(() => {
      state.genSeconds++;
      const m = Math.floor(state.genSeconds / 60);
      const s = state.genSeconds % 60;
      el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function stopGenTimer() { if (state.genTimer) { clearInterval(state.genTimer); state.genTimer = null; } }

  function formatDuration(secs) {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  }

  // --- Step 4: Generation ---
  async function startGeneration() {
    state.slides.forEach((s, i) => s.slideNumber = i + 1);
    // Track outline editing time
    if (state.stepStartTime) state.timings.outline = Math.round((Date.now() - state.stepStartTime) / 1000);
    state.stepStartTime = Date.now();

    updateStep(4);
    renderGenerationProgress();
    startGenTimer();
    const logEl = $('#gen-log');
    logEl.textContent = '';

    // Mark first slide as current
    const firstItem = $(`.gen-slide-item[data-slide="1"]`);
    if (firstItem) {
      firstItem.classList.add('current');
      firstItem.querySelector('.gen-slide-status').className = 'gen-slide-status status-progress';
    }

    const body = {
      slides: state.slides,
      language: state.language,
      styles: getEnabledStyles(),
      uploadedFiles: state.uploadedFiles.map(f => f.storedName),
      defaultInstructions: $('#default-instructions').value
    };

    try {
      const response = await fetch(`${API}/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try { handleGenerateEvent(JSON.parse(line.slice(6)), logEl); } catch (e) { /* skip */ }
        }
      }
      if (buffer.startsWith('data: ')) { try { handleGenerateEvent(JSON.parse(buffer.slice(6)), logEl); } catch (e) { /* skip */ } }
    } catch (e) { toast('Generation failed: ' + e.message, 'error'); updateStep(3); }
  }

  function handleGenerateEvent(event, logEl) {
    switch (event.type) {
      case 'started': state.activeRequestId = event.requestId; break;
      case 'log': logEl.textContent += event.message + '\n'; logEl.scrollTop = logEl.scrollHeight; break;
      case 'slide_complete': markSlideComplete(event.slideNumber); break;
      case 'done':
        stopGenTimer();
        state.timings.generate = state.genSeconds || 0;
        state.timings.total = state.timings.analyze + state.timings.outline + state.timings.generate;
        state.generatedFilename = event.filename; state.activeRequestId = null;
        showPreview(event.filename); loadOutputFiles();
        toast(`Presentation generated in ${formatDuration(state.timings.generate)}!`, 'success'); break;
      case 'error':
        stopGenTimer();
        state.activeRequestId = null;
        logEl.textContent += '\n\n=== ERROR ===\n' + event.message + '\n';
        logEl.scrollTop = logEl.scrollHeight;
        toast('Generation error: ' + event.message, 'error');
        break;
    }
  }

  function renderGenerationProgress() {
    $('#gen-slides-list').innerHTML = state.slides.map(s => `
      <div class="gen-slide-item" data-slide="${s.slideNumber}">
        <span class="gen-slide-status status-pending"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/></svg></span>
        <span class="gen-slide-title">Slide ${s.slideNumber}: ${escapeHtml(s.actionTitle)}</span>
        <span class="gen-slide-label"></span>
      </div>
    `).join('');
    $('#gen-progress-bar').style.width = '0%';
    $('#gen-progress-label').textContent = 'Starting...';
  }

  function markSlideComplete(slideNumber) {
    const item = $(`.gen-slide-item[data-slide="${slideNumber}"]`);
    if (item) {
      item.classList.remove('current');
      const st = item.querySelector('.gen-slide-status');
      st.className = 'gen-slide-status status-complete';
      st.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const label = item.querySelector('.gen-slide-label');
      if (label) label.textContent = '';
    }

    const next = $(`.gen-slide-item[data-slide="${slideNumber + 1}"]`);
    if (next) {
      next.classList.add('current');
      next.querySelector('.gen-slide-status').className = 'gen-slide-status status-progress';
      const nextLabel = next.querySelector('.gen-slide-label');
      if (nextLabel) nextLabel.textContent = 'Generating...';
      // Auto-scroll to current slide in the list
      next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const completed = $$('.gen-slide-status.status-complete').length;
    const pct = Math.round((completed / state.slides.length) * 100);
    $('#gen-progress-bar').style.width = `${pct}%`;
    $('#gen-progress-label').textContent = `Slide ${completed} of ${state.slides.length}`;
  }

  async function cancelGeneration() {
    stopGenTimer();
    if (state.activeRequestId) { try { await fetch(`${API}/cancel/${state.activeRequestId}`, { method: 'POST' }); toast('Cancelled', 'warning'); } catch (e) { /* ignore */ } state.activeRequestId = null; }
    updateStep(3);
  }

  // --- Step 5: Preview ---
  function showPreview(filename) {
    updateStep(5);
    state.generatedFilename = filename;
    state.slideComments = {};
    state.slidePreviewUrls = [];

    $('#preview-filename').textContent = 'Your presentation is ready';
    $('#preview-file-name').textContent = filename;
    $('#preview-file-meta').textContent = `${state.slides.length} slides`;
    $('#output-hint').textContent = `./outputs/${filename}`;

    // Time breakdown
    const tb = $('#time-breakdown');
    tb.innerHTML = `
      <div class="time-chip">Total: <span class="time-val">${formatDuration(state.timings.total)}</span></div>
      <div class="time-chip">Analysis: <span class="time-val">${formatDuration(state.timings.analyze)}</span></div>
      <div class="time-chip">Editing: <span class="time-val">${formatDuration(state.timings.outline)}</span></div>
      <div class="time-chip">Generation: <span class="time-val">${formatDuration(state.timings.generate)}</span></div>
    `;

    // Slide-by-slide review
    renderSlideReview();
    loadSlidePreview(filename);
    renderRevisionHistory();
  }

  function renderSlideReview() {
    const list = $('#slide-review-list');
    list.innerHTML = state.slides.map(s => `
      <div class="slide-review-item" id="slide-review-${s.slideNumber}">
        <span class="slide-review-num">${s.slideNumber}</span>
        <div class="slide-review-preview">
          <div class="slide-preview-placeholder" data-slide="${s.slideNumber}">Loading preview...</div>
        </div>
        <div class="slide-review-right">
          <div class="slide-review-info">
            <div class="slide-review-title">${escapeHtml(s.actionTitle || '')}</div>
            <div class="slide-review-desc">${escapeHtml((s.description || '').slice(0, 120))}</div>
          </div>
          <textarea class="slide-review-comment" data-slide="${s.slideNumber}" placeholder="Revision note..."></textarea>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.slide-review-comment').forEach(ta => {
      ta.addEventListener('input', () => { state.slideComments[ta.dataset.slide] = ta.value; });
    });
  }

  async function loadSlidePreview(filename) {
    try {
      const res = await fetch(`${API}/preview/${filename}`);
      const data = await res.json();
      if (data.slides && data.slides.length > 0) {
        state.slidePreviewUrls = data.slides;
        data.slides.forEach((url, i) => {
          const placeholder = $(`.slide-preview-placeholder[data-slide="${i + 1}"]`);
          if (placeholder) {
            placeholder.outerHTML = `<img class="slide-preview-img" src="${url}" alt="Slide ${i + 1}" data-slide-index="${i}" loading="lazy">`;
          }
        });

        // Bind click-to-open-modal on preview images
        $$('.slide-preview-img').forEach(img => {
          img.addEventListener('click', () => {
            const idx = parseInt(img.dataset.slideIndex);
            openSlideModal(idx);
          });
          img.style.cursor = 'pointer';
        });

        // Render carousel
        renderCarousel(data.slides);
      } else {
        state.slidePreviewUrls = [];
        $$('.slide-preview-placeholder').forEach(el => { el.textContent = 'Preview unavailable'; });
      }
    } catch (e) {
      state.slidePreviewUrls = [];
      $$('.slide-preview-placeholder').forEach(el => { el.textContent = 'Preview unavailable'; });
    }
  }

  // --- Slide carousel ---
  function renderCarousel(urls) {
    const carousel = $('#slide-carousel');
    if (!carousel || !urls.length) return;
    carousel.innerHTML = urls.map((url, i) => `
      <div class="carousel-thumb${i === 0 ? ' active' : ''}" data-index="${i}">
        <img src="${url}" alt="Slide ${i + 1}">
        <span class="carousel-num">${i + 1}</span>
      </div>
    `).join('');

    carousel.querySelectorAll('.carousel-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        // Update active state
        carousel.querySelectorAll('.carousel-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        // Scroll to corresponding slide review
        const reviewItem = $(`#slide-review-${idx + 1}`);
        if (reviewItem) reviewItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // --- Fullscreen slide modal ---
  function openSlideModal(index) {
    if (!state.slidePreviewUrls.length) return;
    state.modalSlideIndex = index;
    updateSlideModal();
    $('#slide-modal').hidden = false;
  }

  function closeSlideModal() {
    $('#slide-modal').hidden = true;
  }

  function updateSlideModal() {
    const url = state.slidePreviewUrls[state.modalSlideIndex];
    if (!url) return;
    $('#slide-modal-img').src = url;
    $('#slide-modal-counter').textContent = `${state.modalSlideIndex + 1} / ${state.slidePreviewUrls.length}`;
  }

  // --- Download ---
  function downloadFile() {
    if (!state.generatedFilename) return;
    const a = document.createElement('a');
    a.href = `${API}/outputs/${state.generatedFilename}`;
    a.download = state.generatedFilename;
    a.click();
  }

  // --- Revisions ---
  function renderRevisionHistory() {
    const historyEl = $('#revision-history');
    if (!historyEl) return;
    historyEl.innerHTML = state.revisions.map(r => `
      <div class="revision-item">
        <span class="revision-time">${r.time}</span>
        <span class="revision-text">${escapeHtml(r.text)}</span>
        <span class="revision-status ${r.status}">${r.status === 'done' ? 'Completed' : 'In progress'}</span>
      </div>
    `).join('');
    const countEl = $('#revision-count');
    if (countEl) countEl.textContent = state.revisions.length;
  }

  async function startRevision() {
    const instructions = state.refineInstructions || '';

    if (!instructions.trim()) { toast('Please add revision notes', 'warning'); return; }

    state.revisionCount++;
    const revision = { text: instructions.slice(0, 100), time: new Date().toLocaleTimeString(), status: 'in-progress' };
    state.revisions.push(revision);
    renderRevisionHistory();

    updateStep(4);
    renderGenerationProgress();
    startGenTimer();
    const logEl = $('#gen-log');
    logEl.textContent = '';

    // Mark first slide as current
    const firstItem = $(`.gen-slide-item[data-slide="1"]`);
    if (firstItem) {
      firstItem.classList.add('current');
      firstItem.querySelector('.gen-slide-status').className = 'gen-slide-status status-progress';
      const label = firstItem.querySelector('.gen-slide-label');
      if (label) label.textContent = 'Generating...';
    }

    const body = {
      filename: state.generatedFilename, instructions, language: state.language,
      styles: getEnabledStyles(), uploadedFiles: state.revisionFiles.map(f => f.storedName),
      revisionNumber: state.revisionCount
    };

    try {
      const response = await fetch(`${API}/revise`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) { if (line.startsWith('data: ')) { try { handleGenerateEvent(JSON.parse(line.slice(6)), logEl); } catch (e) { /* skip */ } } }
      }
      if (buffer.startsWith('data: ')) { try { handleGenerateEvent(JSON.parse(buffer.slice(6)), logEl); } catch (e) { /* skip */ } }
      revision.status = 'done'; renderRevisionHistory();
    } catch (e) { toast('Revision failed: ' + e.message, 'error'); revision.status = 'done'; renderRevisionHistory(); updateStep(5); }

    state.refineInstructions = '';
    state.revisionFiles = [];
    renderRevisionFiles();
  }

  // --- Utilities ---
  function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toast-container').appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 200); }, 4000);
  }

})();
