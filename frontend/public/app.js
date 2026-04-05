(function () {
  'use strict';
  const API = '/api';

  const PALETTES = [
    {
      id: 'office',
      name: 'Office',
      colors: ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'],
      accent: '#4472C4',
      accentHover: '#3A62A8',
      accentLight: '#D6E4F0'
    },
    {
      id: 'blue-warm',
      name: 'Blue Warm',
      colors: ['#4A66AC', '#629DD1', '#297FD5', '#7F8FA9', '#5AA2AE', '#9D90A0'],
      accent: '#4A66AC',
      accentHover: '#3D5691',
      accentLight: '#D4DAE9'
    },
    {
      id: 'blue',
      name: 'Blue',
      colors: ['#0F6FC6', '#009DD9', '#0BD0D9', '#10CF9B', '#7CCA62', '#A5C249'],
      accent: '#0F6FC6',
      accentHover: '#0C5DA6',
      accentLight: '#CCE0F4'
    },
    {
      id: 'blue-green',
      name: 'Blue Green',
      colors: ['#3494BA', '#58B6C0', '#75BDA7', '#7A8C8E', '#84ACB6', '#2683C6'],
      accent: '#3494BA',
      accentHover: '#2B7D9D',
      accentLight: '#D0E6EF'
    },
    {
      id: 'green',
      name: 'Green',
      colors: ['#549E39', '#8AB833', '#C0CF3A', '#029676', '#4AB5C4', '#0989B1'],
      accent: '#549E39',
      accentHover: '#47862F',
      accentLight: '#D6EACE'
    },
    {
      id: 'orange',
      name: 'Orange',
      colors: ['#E48312', '#BD582C', '#865640', '#9B8357', '#C2BC80', '#94A088'],
      accent: '#E48312',
      accentHover: '#C4700F',
      accentLight: '#F8E1BF'
    },
    {
      id: 'red-orange',
      name: 'Red Orange',
      colors: ['#D34817', '#9B2D1F', '#A28E6A', '#956251', '#918485', '#855D5D'],
      accent: '#D34817',
      accentHover: '#B43D14',
      accentLight: '#F4D1C4'
    },
    {
      id: 'red',
      name: 'Red',
      colors: ['#A5300F', '#D55816', '#E19825', '#B19049', '#7F6C58', '#6B5B45'],
      accent: '#A5300F',
      accentHover: '#8C290D',
      accentLight: '#EACCC5'
    },
    {
      id: 'violet',
      name: 'Violet',
      colors: ['#AD84C6', '#8784C7', '#5D739A', '#6997AF', '#84ACB6', '#6F8183'],
      accent: '#AD84C6',
      accentHover: '#9A6FB6',
      accentLight: '#E8DDF0'
    },
    {
      id: 'grayscale',
      name: 'Grayscale',
      colors: ['#595959', '#808080', '#999999', '#B2B2B2', '#CCCCCC', '#D9D9D9'],
      accent: '#595959',
      accentHover: '#404040',
      accentLight: '#E8E8E8'
    },
    {
      id: 'paper',
      name: 'Paper',
      colors: ['#A5B592', '#F3A447', '#E7BC29', '#D092A7', '#9C85C0', '#809EC2'],
      accent: '#A5B592',
      accentHover: '#8FA17C',
      accentLight: '#E4EBE0'
    },
    {
      id: 'median',
      name: 'Median',
      colors: ['#94B6D2', '#DD8047', '#A5AB81', '#D8B25C', '#7BA79D', '#968C8C'],
      accent: '#94B6D2',
      accentHover: '#7DA3C3',
      accentLight: '#DDE8F1'
    }
  ];

  const DEFAULT_INSTRUCTIONS = `Create top-notch consulting slides following these principles:
- Every slide must have a clear action title (key takeaway as the headline)
- Use the Pyramid Principle: lead with the conclusion, support with evidence
- Include quantitative data points wherever possible
- Suggest high-impact visuals: 2x2 matrices, process flows, waterfall charts
- Keep text concise: max 5 bullet points per slide, each under 15 words
- Include a clear narrative arc: Situation > Complication > Resolution
- Add source citations for all data claims`;

  const FONTS = [
    { name: 'Calibri', desc: 'Modern sans-serif, Office default' },
    { name: 'Arial', desc: 'Classic sans-serif, universal' },
    { name: 'Helvetica', desc: 'Swiss precision, clean' },
    { name: 'Century Gothic', desc: 'Geometric, consulting style' },
    { name: 'Segoe UI', desc: 'Microsoft system font' },
    { name: 'Roboto', desc: 'Google\'s versatile sans' },
    { name: 'Open Sans', desc: 'Friendly, highly readable' },
    { name: 'Lato', desc: 'Warm, professional' },
    { name: 'Montserrat', desc: 'Bold geometric headers' },
    { name: 'Poppins', desc: 'Geometric, modern feel' },
    { name: 'Source Sans Pro', desc: 'Adobe\'s open sans-serif' },
    { name: 'Nunito', desc: 'Rounded, approachable' },
    { name: 'Raleway', desc: 'Elegant display font' },
    { name: 'Georgia', desc: 'Classic serif, screen-optimized' },
    { name: 'Garamond', desc: 'Traditional serif, print quality' },
    { name: 'Times New Roman', desc: 'Academic serif standard' },
    { name: 'Playfair Display', desc: 'High-contrast editorial serif' },
    { name: 'Merriweather', desc: 'Serif designed for screens' },
    { name: 'Inter', desc: 'UI-optimized variable font' },
    { name: 'Work Sans', desc: 'Clean, optimized for body text' }
  ];

  const state = {
    currentStep: 1,
    highestStep: 1,
    language: 'english',
    styles: [],
    skills: [],
    uploadedFiles: [],
    slides: [],
    slideComments: {},
    generatedFilename: null,
    revisions: [],
    revisionCount: 0,
    activeRequestId: null,
    slidePreviewUrls: [],
    modalSlideIndex: 0,
    refineInstructions: '',
    analyzeTimer: null,
    analyzeSeconds: 0,
    genTimer: null,
    genSeconds: 0,
    timings: { analyze: 0, outline: 0, generate: 0, total: 0 },
    stepStartTime: null,
    palette: 'office',
    font: 'Calibri',
    customizeColorsFont: false,
    lastStatusIdx: -1
  };

  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel) { return [...document.querySelectorAll(sel)]; };

  // === INIT ===
  document.addEventListener('DOMContentLoaded', async function () {
    loadSettings();
    bindEvents();
    updateStep(1);

    // Load sidebar data in parallel
    Promise.all([loadStyles(), loadSkills(), loadOutputFiles()]);

    // Render font selector
    renderFontSelector();

    // Init CLI check — gates the app
    var ok = await initCliCheck();
    if (ok) {
      var overlay = $('#init-overlay');
      overlay.classList.add('fade-out');
      setTimeout(function() { overlay.classList.add('hidden'); }, 400);
    }
  });

  // Ctrl+Enter shortcut
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (state.currentStep === 1) { var btn = $('#btn-analyze'); if (btn) btn.click(); }
      else if (state.currentStep === 2) { var btn2 = $('#btn-generate'); if (btn2) btn2.click(); }
    }
  });

  // === SETTINGS ===
  function loadSettings() {
    var lang = localStorage.getItem('pptx-lang');
    if (lang) {
      state.language = lang;
      $$('#language-toggle .pill').forEach(function (p) {
        p.classList.toggle('active', p.dataset.lang === lang);
      });
    }

    var instr = localStorage.getItem('pptx-instructions');
    $('#default-instructions').value = instr || DEFAULT_INSTRUCTIONS;

    var content = localStorage.getItem('pptx-draft-content');
    if (content) {
      $('#content-input').value = content;
      updateAnalyzeButton();
    }

    var savedTarget = localStorage.getItem('pptx-slide-target');
    if (savedTarget && savedTarget !== '') {
      var chip = $('.count-chip[data-count="' + savedTarget + '"]');
      if (chip) {
        $$('.count-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
      } else {
        $$('.count-chip').forEach(function (c) { c.classList.remove('active'); });
        $('#slide-target').value = savedTarget;
        $('#slide-target').classList.add('active');
      }
    }

    var palette = localStorage.getItem('pptx-palette') || 'office';
    state.palette = palette;
    applyPalette(palette);

    var font = localStorage.getItem('pptx-font') || 'Calibri';
    state.font = font;

    var customize = localStorage.getItem('pptx-customize') === 'true';
    state.customizeColorsFont = customize;
    if ($('#customize-colors-font')) {
      $('#customize-colors-font').checked = customize;
      $('#customize-panel').classList.toggle('disabled', !customize);
    }

    var instrEl = $('#default-instructions');
    function autoExpand() {
      instrEl.style.height = 'auto';
      instrEl.style.height = instrEl.scrollHeight + 'px';
    }
    instrEl.addEventListener('input', autoExpand);
    setTimeout(autoExpand, 50);
  }

  function saveSettings() {
    localStorage.setItem('pptx-lang', state.language);
    localStorage.setItem('pptx-instructions', $('#default-instructions').value);
    var activeChip = $('.count-chip.active');
    localStorage.setItem('pptx-slide-target', activeChip ? activeChip.dataset.count : $('#slide-target').value);
    localStorage.setItem('pptx-palette', state.palette);
    localStorage.setItem('pptx-font', state.font);
    localStorage.setItem('pptx-customize', state.customizeColorsFont);
    toast('Settings saved', 'success');
  }

  function saveDraft() {
    localStorage.setItem('pptx-draft-content', $('#content-input').value);
  }

  function applyPalette(id) {
    var p = PALETTES.find(function (x) { return x.id === id; }) || PALETTES[0];
    document.documentElement.style.setProperty('--accent', p.accent);
    document.documentElement.style.setProperty('--accent-hover', p.accentHover);
    document.documentElement.style.setProperty('--accent-light', p.accentLight);
    state.palette = id;
    $$('.palette-row').forEach(function (d) {
      d.classList.toggle('active', d.dataset.palette === id);
    });
  }

  // === EVENTS ===
  function bindEvents() {
    // Sidebar
    $('#sidebar-toggle').addEventListener('click', function () {
      $('#sidebar').classList.add('collapsed');
      $('#sidebar-open').hidden = false;
    });
    $('#sidebar-open').addEventListener('click', function () {
      $('#sidebar').classList.remove('collapsed');
      $('#sidebar-open').hidden = true;
    });

    // Language
    $$('#language-toggle .pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('#language-toggle .pill').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        state.language = btn.dataset.lang;
      });
    });

    // Save
    $('#save-settings').addEventListener('click', saveSettings);

    // CLI status
    $('#claude-status').addEventListener('click', checkCliStatus);

    // Refine sidebar
    $('#refine-toggle').addEventListener('click', function () {
      $('#refine-sidebar').classList.remove('collapsed');
    });
    $('#refine-sidebar-close').addEventListener('click', function () {
      $('#refine-sidebar').classList.add('collapsed');
    });
    $('#refine-apply').addEventListener('click', handleRefineApply);

    // Step navigation (clickable completed steps)
    $$('.step-indicator .step').forEach(function (el) {
      el.addEventListener('click', function () {
        var target = parseInt(el.dataset.step);
        if (target <= state.highestStep && target !== state.currentStep) {
          updateStep(target);
          if (target === 2 && state.slides.length > 0) {
            $('#outline-analyzing').hidden = true;
            $('#outline-ready').hidden = false;
            renderSlideOutline();
          }
          if (target === 4) {
            renderResult();
          }
        }
      });
    });

    // Drop zone
    var dz = $('#drop-zone');
    var fi = $('#file-input');
    dz.addEventListener('click', function () { fi.click(); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault();
      dz.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });
    fi.addEventListener('change', function () { handleFiles(fi.files); fi.value = ''; });

    // Slide count chips
    $$('.count-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.count-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        $('#slide-target').value = '';
        $('#slide-target').classList.remove('active');
      });
    });
    $('#slide-target').addEventListener('input', function () {
      if ($('#slide-target').value) {
        $$('.count-chip').forEach(function (c) { c.classList.remove('active'); });
        $('#slide-target').classList.add('active');
      }
    });

    // Content input
    $('#content-input').addEventListener('input', function () {
      updateAnalyzeButton();
      saveDraft();
    });

    // Step 1 -> 2
    $('#btn-analyze').addEventListener('click', function () { startAnalysis(); });

    // Step 2 buttons
    $('#btn-back-to-input').addEventListener('click', function () { updateStep(1); });
    $('#btn-generate').addEventListener('click', startGeneration);
    $('#btn-add-slide-bottom').addEventListener('click', function () { addSlide(); });

    // Analyze log toggle
    $('#analyze-log-toggle').addEventListener('click', function () {
      $('#analyze-terminal').classList.toggle('collapsed');
    });

    // Step 3
    $('#btn-cancel-gen').addEventListener('click', cancelGeneration);
    $('#btn-view-result').addEventListener('click', function () {
      updateStep(4);
      renderResult();
    });
    $('#gen-copy-log').addEventListener('click', function () {
      navigator.clipboard.writeText($('#gen-log').textContent).then(function () {
        toast('Log copied', 'success');
      });
    });

    // Step 4
    $('#btn-download').addEventListener('click', downloadFile);
    $('#btn-visual-qa').addEventListener('click', runVisualQA);
    $('#btn-new-presentation').addEventListener('click', function () {
      state.slides = [];
      state.revisions = [];
      state.revisionCount = 0;
      state.generatedFilename = null;
      state.uploadedFiles = [];
      state.slidePreviewUrls = [];
      state.slideComments = {};
      state.highestStep = 1;
      state.timings = { analyze: 0, outline: 0, generate: 0, total: 0 };
      $('#content-input').value = '';
      $('#uploaded-files').innerHTML = '';
      updateStep(1);
    });

    // Modal
    $('#slide-modal-close').addEventListener('click', closeSlideModal);
    $('#slide-modal-prev').addEventListener('click', function () {
      state.modalSlideIndex = Math.max(0, state.modalSlideIndex - 1);
      updateSlideModal();
    });
    $('#slide-modal-next').addEventListener('click', function () {
      state.modalSlideIndex = Math.min(state.slidePreviewUrls.length - 1, state.modalSlideIndex + 1);
      updateSlideModal();
    });
    $('#slide-modal').addEventListener('click', function (e) {
      if (e.target === $('#slide-modal')) closeSlideModal();
    });
    document.addEventListener('keydown', function (e) {
      if ($('#slide-modal').hidden) return;
      if (e.key === 'Escape') closeSlideModal();
      else if (e.key === 'ArrowLeft') $('#slide-modal-prev').click();
      else if (e.key === 'ArrowRight') $('#slide-modal-next').click();
    });

    // Customize colors & font toggle
    $('#customize-colors-font').addEventListener('change', function () {
      state.customizeColorsFont = this.checked;
      $('#customize-panel').classList.toggle('disabled', !this.checked);
    });

    // Init retry + skip
    $('#init-retry').addEventListener('click', async function () {
      var ok = await initCliCheck();
      if (ok) { var o = $('#init-overlay'); o.classList.add('fade-out'); setTimeout(function() { o.classList.add('hidden'); }, 400); }
    });
    $('#init-skip').addEventListener('click', function (e) {
      e.preventDefault();
      var o = $('#init-overlay'); o.classList.add('fade-out'); setTimeout(function() { o.classList.add('hidden'); }, 400);
    });

    // Font selector
    $('#font-trigger').addEventListener('click', function () {
      var dd = $('#font-dropdown');
      dd.hidden = !dd.hidden;
      if (!dd.hidden) { $('#font-search').value = ''; renderFontOptions(''); $('#font-search').focus(); }
    });
    $('#font-search').addEventListener('input', function () { renderFontOptions(this.value); });
    document.addEventListener('click', function (e) {
      if (!$('#font-selector').contains(e.target)) $('#font-dropdown').hidden = true;
    });
  }

  // === INIT CLI CHECK ===
  async function initCliCheck() {
    $('#init-status').textContent = 'Checking Claude CLI connection...';
    $('#init-retry').hidden = true;
    // Show skip link after 10s
    setTimeout(function() { $('#init-skip').style.display = 'inline'; }, 10000);
    try {
      var res = await fetch(API + '/claude-test', { signal: AbortSignal.timeout(25000) });
      var data = await res.json();
      updateCliDot(data);
      if (data.checks.cliTest && data.checks.cliTest.ok) return true;
      $('#init-status').textContent = 'Claude CLI not responding. Check Docker setup.';
      $('#init-retry').hidden = false;
      return false;
    } catch (e) {
      $('#init-status').textContent = 'Backend unreachable. Is Docker running?';
      $('#init-retry').hidden = false;
      return false;
    }
  }

  function updateCliDot(data) {
    var dot = $('#claude-status-dot');
    var text = $('#claude-status-text');
    if (data.checks.cliTest && data.checks.cliTest.ok) {
      dot.className = 'status-dot ok';
      text.textContent = 'CLI connected';
    } else if (data.allOk) {
      dot.className = 'status-dot ok';
      text.textContent = 'CLI connected';
    } else {
      dot.className = 'status-dot error';
      var fk = Object.keys(data.checks).find(function (k) { return !data.checks[k].ok; });
      text.textContent = ((data.checks[fk] && data.checks[fk].error) || fk + ' failed').slice(0, 30);
    }
  }

  // === CLI STATUS ===
  async function checkCliStatus() {
    var dot = $('#claude-status-dot');
    var text = $('#claude-status-text');
    dot.className = 'status-dot loading';
    text.textContent = 'Checking...';
    try {
      var res = await fetch(API + '/claude-test');
      var data = await res.json();
      if (data.allOk) {
        dot.className = 'status-dot ok';
        text.textContent = 'CLI connected';
      } else {
        dot.className = 'status-dot error';
        var fk = Object.keys(data.checks).find(function (k) { return !data.checks[k].ok; });
        text.textContent = ((data.checks[fk] && data.checks[fk].error) || fk + ' failed').slice(0, 30);
      }
    } catch (e) {
      dot.className = 'status-dot error';
      text.textContent = 'Backend unreachable';
    }
  }

  // === FILE HANDLING ===
  async function handleFiles(fileList) {
    var files = Array.from(fileList);
    if (!files.length) return;
    var formData = new FormData();
    files.forEach(function (f) { formData.append('files', f); });
    try {
      var res = await fetch(API + '/upload', { method: 'POST', body: formData });
      var data = await res.json();
      if (data.files) {
        data.files.forEach(function (f) { state.uploadedFiles.push(f); });
        renderUploadedFiles();
        updateAnalyzeButton();
      }
    } catch (e) {
      toast('Upload failed: ' + e.message, 'error');
    }
  }

  function renderUploadedFiles() {
    var c = $('#uploaded-files');
    c.innerHTML = state.uploadedFiles.map(function (f, i) {
      return '<div class="file-tag">' +
        '<span>' + escapeHtml(f.originalName) + '</span>' +
        '<span class="file-size">' + formatSize(f.size) + '</span>' +
        '<button class="remove-file" data-index="' + i + '">&times;</button>' +
        '</div>';
    }).join('');
    c.querySelectorAll('.remove-file').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.uploadedFiles.splice(parseInt(btn.dataset.index), 1);
        renderUploadedFiles();
        updateAnalyzeButton();
      });
    });
  }

  function updateAnalyzeButton() {
    $('#btn-analyze').disabled = !($('#content-input').value.trim().length > 0 || state.uploadedFiles.length > 0);
  }

  // === SKILLS ===
  async function loadSkills() {
    try {
      var res = await fetch(API + '/skills');
      state.skills = await res.json();
      renderSkills();
    } catch (e) {
      state.skills = [];
    }
  }

  // === FONT SELECTOR ===
  function renderFontSelector() {
    $('#font-selected-name').textContent = state.font;
    $('#font-selected-name').style.fontFamily = "'" + state.font + "', sans-serif";
    renderFontOptions('');
  }

  function renderFontOptions(filter) {
    var container = $('#font-options');
    var lowerFilter = filter.toLowerCase();
    container.innerHTML = FONTS.filter(function (f) {
      return !lowerFilter || f.name.toLowerCase().includes(lowerFilter) || f.desc.toLowerCase().includes(lowerFilter);
    }).map(function (f) {
      return '<div class="font-option ' + (state.font === f.name ? 'active' : '') + '" data-font="' + f.name + '" style="font-family:\'' + f.name + '\', sans-serif">' +
        f.name + ' <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-ui)"> — ' + f.desc + '</span></div>';
    }).join('');
    container.querySelectorAll('.font-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.font = opt.dataset.font;
        $('#font-selected-name').textContent = state.font;
        $('#font-selected-name').style.fontFamily = "'" + state.font + "', sans-serif";
        $('#font-dropdown').hidden = true;
        container.querySelectorAll('.font-option').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        if (state.currentStep === 4 && state.generatedFilename) {
          promptStyleRevision('font changed to: ' + state.font);
        }
      });
    });
  }

  function renderSkills() {
    var container = $('#skills-list');
    if (!state.skills || state.skills.length === 0) {
      container.innerHTML = '<div class="empty-state-small">No skills found in skills/</div>';
      return;
    }
    container.innerHTML = state.skills.map(function (s) {
      return '<div class="style-item" title="' + escapeHtml(s.filename) + '">' +
        '<label class="style-toggle">' +
        '<input type="checkbox" data-id="' + s.id + '" ' + (s.enabled ? 'checked' : '') + '>' +
        '<span class="slider"></span></label>' +
        '<span class="style-name">' + escapeHtml(s.name) + '</span></div>';
    }).join('');
    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var sk = state.skills.find(function (s) { return s.id === cb.dataset.id; });
        if (sk) sk.enabled = cb.checked;
      });
    });
  }

  // === STYLES + PALETTE ===
  async function loadStyles() {
    try {
      var res = await fetch(API + '/styles');
      state.styles = await res.json();
      renderStyles();
    } catch (e) {
      state.styles = [];
    }
  }

  function renderStyles() {
    // Render palette in separate container
    var paletteContainer = $('#palette-list');
    var paletteHtml = '<div class="palette-grid">';
    PALETTES.forEach(function (p) {
      var sw = p.colors.map(function (c) {
        return '<span style="width:14px;height:14px;background:' + c + ';display:inline-block"></span>';
      }).join('');
      paletteHtml += '<div class="palette-row ' + (state.palette === p.id ? 'active' : '') + '" data-palette="' + p.id + '" title="' + p.name + '">' +
        '<span class="palette-swatches">' + sw + '</span>' +
        '<span class="palette-name">' + p.name + '</span></div>';
    });
    paletteHtml += '</div>';
    paletteContainer.innerHTML = paletteHtml;

    paletteContainer.querySelectorAll('.palette-row').forEach(function (row) {
      row.addEventListener('click', function () {
        paletteContainer.querySelectorAll('.palette-row').forEach(function (r) { r.classList.remove('active'); });
        row.classList.add('active');
        applyPalette(row.dataset.palette);
        localStorage.setItem('pptx-palette', row.dataset.palette);
        if (state.currentStep === 4 && state.generatedFilename) {
          promptStyleRevision('color palette changed to: ' + row.dataset.palette);
        }
      });
    });
  }

  function getEnabledStyles() {
    return state.styles.filter(function (s) { return s.enabled; }).map(function (s) { return s.id; });
  }

  // === OUTPUT FILES ===
  async function loadOutputFiles() {
    try {
      var res = await fetch(API + '/outputs');
      renderOutputFiles(await res.json());
    } catch (e) { /* ignore */ }
  }

  function renderOutputFiles(files) {
    var c = $('#files-list');
    if (!files.length) {
      c.innerHTML = '<div class="empty-state-small">No files yet</div>';
      return;
    }
    c.innerHTML = files.map(function (f) {
      return '<a class="file-item" href="' + API + '/outputs/' + f.filename + '" download>' +
        '<span class="file-name">' + escapeHtml(f.filename) + '</span></a>';
    }).join('');
  }

  // === STEP NAVIGATION ===
  function updateStep(step) {
    state.currentStep = step;
    state.highestStep = Math.max(state.highestStep, step);
    $$('.step-indicator .step').forEach(function (el) {
      var s = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed');
      if (s === step) el.classList.add('active');
      else if (s < step) el.classList.add('completed');
    });
    $$('.step-content').forEach(function (el) { el.classList.remove('active'); });
    var target = $('#step-' + step);
    if (target) target.classList.add('active');
    updateRefineContext(step);
  }

  function updateRefineContext(step) {
    var ctx = $('#refine-context');
    if (!ctx) return;
    switch (step) {
      case 1: ctx.textContent = 'Modify your input content or instructions.'; break;
      case 2: ctx.textContent = 'Re-analyze with different instructions or adjust the outline.'; break;
      case 3: ctx.textContent = 'Generation in progress. Wait for completion.'; break;
      case 4: ctx.textContent = 'Describe changes to revise the presentation.'; break;
      default: ctx.textContent = 'Add instructions to refine the current output.';
    }
  }

  function handleRefineApply() {
    var input = $('#refine-input').value.trim();
    if (!input) {
      toast('Please enter instructions', 'warning');
      return;
    }
    if (state.currentStep === 2) {
      $('#refine-sidebar').classList.add('collapsed');
      startAnalysis(input);
    } else if (state.currentStep === 4) {
      state.refineInstructions = input;
      $('#refine-sidebar').classList.add('collapsed');
      startRevision();
    } else {
      toast('Refine not available on this step', 'warning');
    }
    $('#refine-input').value = '';
  }

  // === TIMERS ===
  function startTimer(elId) {
    var key = elId === 'analyze-timer' ? 'analyze' : 'gen';
    state[key + 'Seconds'] = 0;
    var el = $('#' + elId);
    el.textContent = '0:00';
    state[key + 'Timer'] = setInterval(function () {
      state[key + 'Seconds']++;
      var m = Math.floor(state[key + 'Seconds'] / 60);
      var s = state[key + 'Seconds'] % 60;
      el.textContent = m + ':' + s.toString().padStart(2, '0');

      // For generation: show "still working" if no log for 15+ seconds
      if (key === 'gen' && state.genLastLogTime) {
        var silenceMs = Date.now() - state.genLastLogTime;
        var detail = $('#gen-status-detail');
        if (silenceMs > 60000) {
          detail.textContent = 'Claude is still working (complex generation)...';
        } else if (silenceMs > 30000) {
          detail.textContent = 'Processing... this can take a minute';
        } else if (silenceMs > 15000 && detail.textContent === 'Claude is working...') {
          detail.textContent = 'Claude is writing code...';
        }
      }
    }, 1000);
  }

  function stopTimer(key) {
    if (state[key + 'Timer']) {
      clearInterval(state[key + 'Timer']);
      state[key + 'Timer'] = null;
    }
  }

  function formatDuration(secs) {
    if (secs < 60) return secs + 's';
    return Math.floor(secs / 60) + 'm ' + (secs % 60) + 's';
  }

  var ANALYZE_STATUS_MESSAGES = [
    { at: 3, text: 'Connected -- reading your input...' },
    { at: 8, text: 'Understanding topic and audience...' },
    { at: 15, text: 'Identifying key themes...' },
    { at: 25, text: 'Designing narrative arc...' },
    { at: 40, text: 'Writing action titles...' },
    { at: 60, text: 'Selecting visualizations...' },
    { at: 80, text: 'Almost there...' }
  ];

  // === STEP 2: ANALYSIS ===
  async function startAnalysis(extraInstructions) {
    updateStep(2);
    $('#outline-analyzing').hidden = false;
    $('#outline-ready').hidden = true;
    $('#analyze-terminal').classList.remove('collapsed');
    var logEl = $('#analyze-log');
    logEl.textContent = '';
    $('#analyze-status-text').textContent = 'Connecting to Claude CLI...';
    state.analyzeSeconds = 0;
    state.lastStatusIdx = -1;

    // Start timer with status message updates
    var timerEl = $('#analyze-timer');
    timerEl.textContent = '0:00';
    if (state.analyzeTimer) clearInterval(state.analyzeTimer);
    state.analyzeTimer = setInterval(function () {
      state.analyzeSeconds++;
      var m = Math.floor(state.analyzeSeconds / 60);
      var s = state.analyzeSeconds % 60;
      timerEl.textContent = m + ':' + s.toString().padStart(2, '0');
      for (var i = ANALYZE_STATUS_MESSAGES.length - 1; i >= 0; i--) {
        if (state.analyzeSeconds >= ANALYZE_STATUS_MESSAGES[i].at && i > state.lastStatusIdx) {
          state.lastStatusIdx = i;
          $('#analyze-status-text').textContent = ANALYZE_STATUS_MESSAGES[i].text;
          break;
        }
      }
    }, 1000);

    var instructions = $('#default-instructions').value;
    var activeChip = $('.count-chip.active');
    var customVal = parseInt($('#slide-target').value);
    var slideTarget = customVal || (activeChip ? parseInt(activeChip.dataset.count) : 3);
    var content = $('#content-input').value;
    if (extraInstructions) content += '\n\n## Additional instructions:\n' + extraInstructions;

    var body = {
      content: content,
      language: state.language,
      styles: getEnabledStyles(),
      uploadedFiles: state.uploadedFiles.map(function (f) { return f.storedName; }),
      defaultInstructions: instructions + '\n\nTarget approximately ' + slideTarget + ' slides.'
    };

    var lineCount = 0;
    try {
      var response = await fetch(API + '/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();
        for (var idx = 0; idx < lines.length; idx++) {
          var line = lines[idx];
          if (!line.startsWith('data: ')) continue;
          try {
            var event = JSON.parse(line.slice(6));
            if (event.type === 'log') {
              lineCount++;
              logEl.textContent += event.message + '\n';
              logEl.scrollTop = logEl.scrollHeight;
              if (lineCount === 1) $('#analyze-status-text').textContent = 'Claude is working...';
            } else {
              handleAnalyzeEvent(event);
            }
          } catch (parseErr) { /* skip malformed lines */ }
        }
      }
      if (buffer.startsWith('data: ')) {
        try { handleAnalyzeEvent(JSON.parse(buffer.slice(6))); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      toast('Analysis failed: ' + e.message, 'error');
      updateStep(1);
    }
    stopTimer('analyze');
  }

  function handleAnalyzeEvent(event) {
    switch (event.type) {
      case 'result':
        state.slides = event.slides;
        state.timings.analyze = state.analyzeSeconds;
        state.stepStartTime = Date.now();
        $('#outline-analyzing').hidden = true;
        $('#outline-ready').hidden = false;
        $('#analyze-terminal').classList.add('collapsed');
        renderSlideOutline();
        renderAnalysisFacts();
        toast(event.slides.length + ' slides in ' + formatDuration(state.analyzeSeconds), 'success');
        break;
      case 'error':
        var logEl = $('#analyze-log');
        logEl.textContent += '\n=== ERROR ===\n' + event.message + '\n';
        logEl.scrollTop = logEl.scrollHeight;
        toast('Analysis error: ' + event.message, 'error');
        break;
    }
  }

  function renderAnalysisFacts() {
    var facts = $('#analysis-facts');
    var researchCount = state.slides.filter(function (s) { return s.researchNeeded; }).length;
    facts.innerHTML =
      '<div class="fact-chip"><span class="fact-label">Slides</span><span class="fact-value">' + state.slides.length + '</span></div>' +
      (researchCount > 0 ? '<div class="fact-chip"><span class="fact-label">Research</span><span class="fact-value">' + researchCount + '</span></div>' : '');
  }

  // === SLIDE OUTLINE EDITOR ===
  function renderSlideOutline() {
    var grid = $('#slides-grid');
    grid.innerHTML = '';
    state.slides.forEach(function (slide, index) {
      slide.slideNumber = index + 1;
      grid.appendChild(createSlideCard(slide, index));
    });
    $('#slide-count').textContent = state.slides.length + ' slides';
    setupDragAndDrop();
  }

  function createSlideCard(slide, index) {
    var card = document.createElement('div');
    card.className = 'slide-card';
    card.draggable = true;
    card.dataset.index = index;
    card.innerHTML =
      '<div class="slide-card-header">' +
        '<span class="slide-number">' + slide.slideNumber + '</span>' +
        '<span class="drag-handle" title="Drag to reorder"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="4" r="1" fill="currentColor"/><circle cx="10" cy="4" r="1" fill="currentColor"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="8" r="1" fill="currentColor"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="12" r="1" fill="currentColor"/></svg></span>' +
      '</div>' +
      '<div class="slide-field"><label>Action Title</label><input type="text" class="action-title" value="' + escapeHtml(slide.actionTitle || '') + '" data-field="actionTitle"></div>' +
      '<div class="slide-field"><label>Description</label><textarea data-field="description" rows="3">' + escapeHtml(slide.description || '') + '</textarea></div>' +
      '<div class="slide-field"><label>Slide Type</label>' +
        '<div class="slide-type-radios">' +
          '<label class="slide-type-option"><input type="radio" name="slideType-' + index + '" value="standard" ' + ((!slide.slideType || slide.slideType === 'standard') ? 'checked' : '') + ' data-field="slideType"><span>Standard (Recommended)</span></label>' +
          '<label class="slide-type-option"><input type="radio" name="slideType-' + index + '" value="visual-components" ' + (slide.slideType === 'visual-components' ? 'checked' : '') + ' data-field="slideType"><span>Slide with visual components</span></label>' +
          '<label class="slide-type-option"><input type="radio" name="slideType-' + index + '" value="complex-visual" ' + (slide.slideType === 'complex-visual' ? 'checked' : '') + ' data-field="slideType"><span>Complex visual component (layered architecture, flow architecture)</span></label>' +
        '</div>' +
      '</div>' +
      '<div class="slide-card-footer">' +
        '<label class="research-toggle"><input type="checkbox" data-field="researchNeeded" ' + (slide.researchNeeded ? 'checked' : '') + '> Research</label>' +
        '<div class="slide-card-actions">' +
          '<button class="icon-btn duplicate" title="Duplicate"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M2 10V2h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button>' +
          '<button class="icon-btn delete" title="Delete"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 4h8M5.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M6 6.5v3M8 6.5v3M4 4l.5 7a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</div>' +
      '</div>';

    // Bind field inputs
    card.querySelectorAll('input[type="text"], textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        state.slides[index][input.dataset.field] = input.value;
        if (input.tagName === 'TEXTAREA') {
          input.style.height = 'auto';
          input.style.height = input.scrollHeight + 'px';
        }
      });
      if (input.tagName === 'TEXTAREA') {
        setTimeout(function () {
          input.style.height = 'auto';
          input.style.height = input.scrollHeight + 'px';
        }, 10);
      }
    });

    card.querySelector('input[type="checkbox"]').addEventListener('change', function (e) {
      state.slides[index].researchNeeded = e.target.checked;
    });

    card.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        state.slides[index].slideType = radio.value;
      });
    });

    card.querySelector('.duplicate').addEventListener('click', function () {
      var copy = {};
      Object.keys(state.slides[index]).forEach(function (k) { copy[k] = state.slides[index][k]; });
      state.slides.splice(index + 1, 0, copy);
      renderSlideOutline();
    });

    card.querySelector('.delete').addEventListener('click', function () {
      if (state.slides.length <= 1) {
        toast('Cannot delete last slide', 'warning');
        return;
      }
      state.slides.splice(index, 1);
      renderSlideOutline();
    });

    return card;
  }

  function addSlide() {
    state.slides.push({
      slideNumber: state.slides.length + 1,
      actionTitle: '',
      description: '',
      slideType: 'standard',
      researchNeeded: false
    });
    renderSlideOutline();
  }

  function setupDragAndDrop() {
    var dragIdx = null;
    $$('.slide-card').forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        dragIdx = parseInt(card.dataset.index);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
        $$('.slide-card').forEach(function (c) { c.classList.remove('drag-over'); });
      });
      card.addEventListener('dragover', function (e) {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', function () {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', function (e) {
        e.preventDefault();
        card.classList.remove('drag-over');
        var di = parseInt(card.dataset.index);
        if (dragIdx !== null && dragIdx !== di) {
          var moved = state.slides.splice(dragIdx, 1)[0];
          state.slides.splice(di, 0, moved);
          renderSlideOutline();
        }
      });
    });
  }

  // === STEP 3: GENERATION ===
  async function startGeneration() {
    state.slides.forEach(function (s, i) { s.slideNumber = i + 1; });
    if (state.stepStartTime) {
      state.timings.outline = Math.round((Date.now() - state.stepStartTime) / 1000);
    }
    state.stepStartTime = Date.now();
    updateStep(3);

    // Reset UI
    $('#gen-actions-running').hidden = false;
    $('#gen-actions-done').hidden = true;
    $('#gen-status-banner').className = 'gen-status-banner';
    $('#gen-status-text').textContent = 'Generating presentation...';
    $('#gen-status-detail').textContent = 'Connecting to Claude';
    $('#gen-status-icon').innerHTML = '<div class="spinner" style="width:24px;height:24px;border-width:2px;margin:0"></div>';
    state.genLastLogTime = Date.now();
    var logEl = $('#gen-log');
    logEl.textContent = '';
    startTimer('gen-timer');

    var body = {
      slides: state.slides,
      language: state.language,
      styles: getEnabledStyles(),
      uploadedFiles: state.uploadedFiles.map(function (f) { return f.storedName; }),
      defaultInstructions: $('#default-instructions').value
    };

    // Only pass custom palette/font if user explicitly enabled customization
    if (state.customizeColorsFont) {
      var selectedPalette = PALETTES.find(function (p) { return p.id === state.palette; }) || PALETTES[0];
      body.palette = { name: selectedPalette.name, colors: selectedPalette.colors };
      body.font = state.font;
    }

    try {
      var response = await fetch(API + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();
        for (var idx = 0; idx < lines.length; idx++) {
          var line = lines[idx];
          if (!line.startsWith('data: ')) continue;
          try { handleGenerateEvent(JSON.parse(line.slice(6)), logEl); } catch (e) { /* ignore */ }
        }
      }
      if (buffer.startsWith('data: ')) {
        try { handleGenerateEvent(JSON.parse(buffer.slice(6)), logEl); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      toast('Generation failed: ' + e.message, 'error');
    }
    stopTimer('gen');
  }

  function handleGenerateEvent(event, logEl) {
    switch (event.type) {
      case 'started':
        state.activeRequestId = event.requestId;
        $('#gen-status-detail').textContent = 'Claude is working...';
        break;
      case 'log':
        logEl.textContent += event.message + '\n';
        logEl.scrollTop = logEl.scrollHeight;
        state.genLastLogTime = Date.now();
        // Update status detail based on log content
        if (event.message.includes('>>> Write')) {
          $('#gen-status-detail').textContent = 'Writing generation script...';
        } else if (event.message.includes('>>> Bash')) {
          $('#gen-status-detail').textContent = 'Executing script...';
        } else if (event.message.includes('SLIDE_COMPLETE')) {
          var m = event.message.match(/SLIDE_COMPLETE::(\d+)/);
          if (m) $('#gen-status-detail').textContent = 'Slide ' + m[1] + ' of ' + state.slides.length + ' complete';
        } else if (event.message.includes('>>> Edit')) {
          $('#gen-status-detail').textContent = 'Fixing script...';
        } else if (event.message.includes('Presentation saved')) {
          $('#gen-status-detail').textContent = 'Saving presentation...';
        }
        break;
      case 'done':
        stopTimer('gen');
        state.timings.generate = state.genSeconds || 0;
        state.timings.total = state.timings.analyze + state.timings.outline + state.timings.generate;
        state.generatedFilename = event.filename;
        state.activeRequestId = null;
        // Update status banner to done state
        $('#gen-status-banner').className = 'gen-status-banner done';
        $('#gen-status-text').textContent = 'Generation complete';
        $('#gen-status-detail').textContent = state.slides.length + ' slides in ' + formatDuration(state.timings.generate);
        $('#gen-status-icon').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="var(--success)" stroke-width="2"/><path d="M7 12l3 3 7-7" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        // Show done banner, hide cancel
        $('#gen-actions-running').hidden = true;
        $('#gen-actions-done').hidden = false;
        $('#gen-done-meta').textContent = state.slides.length + ' slides | ' + formatDuration(state.timings.generate) + ' | ' + (event.filename || '');
        loadOutputFiles();
        toast('Presentation generated!', 'success');
        break;
      case 'error':
        stopTimer('gen');
        state.activeRequestId = null;
        $('#gen-status-banner').className = 'gen-status-banner';
        $('#gen-status-banner').style.borderColor = 'var(--error)';
        $('#gen-status-banner').style.background = 'var(--error-light)';
        $('#gen-status-text').textContent = 'Generation failed';
        $('#gen-status-detail').textContent = event.message.slice(0, 100);
        $('#gen-status-icon').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="var(--error)" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="var(--error)" stroke-width="2" stroke-linecap="round"/></svg>';
        logEl.textContent += '\n=== ERROR ===\n' + event.message + '\n';
        logEl.scrollTop = logEl.scrollHeight;
        toast('Error: ' + event.message, 'error');
        break;
    }
  }

  async function cancelGeneration() {
    stopTimer('gen');
    if (state.activeRequestId) {
      try {
        await fetch(API + '/cancel/' + state.activeRequestId, { method: 'POST' });
        toast('Cancelled', 'warning');
      } catch (e) { /* ignore */ }
      state.activeRequestId = null;
    }
    updateStep(2);
    if (state.slides.length > 0) {
      $('#outline-analyzing').hidden = true;
      $('#outline-ready').hidden = false;
      renderSlideOutline();
    }
  }

  // === STEP 4: RESULT ===
  function renderResult() {
    if (!state.generatedFilename) return;
    state.slideComments = {};
    $('#preview-file-name').textContent = state.generatedFilename;
    $('#preview-file-meta').textContent = state.slides.length + ' slides';
    $('#output-hint').textContent = './outputs/' + state.generatedFilename;

    $('#time-breakdown').innerHTML =
      '<div class="time-chip">Total: <span class="time-val">' + formatDuration(state.timings.total) + '</span></div>' +
      '<div class="time-chip">Analysis: <span class="time-val">' + formatDuration(state.timings.analyze) + '</span></div>' +
      '<div class="time-chip">Editing: <span class="time-val">' + formatDuration(state.timings.outline) + '</span></div>' +
      '<div class="time-chip">Generation: <span class="time-val">' + formatDuration(state.timings.generate) + '</span></div>';

    loadSlideViewer(state.generatedFilename);
  }

  async function loadSlideViewer(filename) {
    var viewer = $('#slide-viewer');
    viewer.innerHTML = '<div class="slide-viewer-loading">Rendering slide previews...</div>';
    try {
      var res = await fetch(API + '/preview/' + filename);
      var data = await res.json();
      if (data.slides && data.slides.length > 0) {
        state.slidePreviewUrls = data.slides;
        viewer.innerHTML = data.slides.map(function (url, i) {
          var slide = state.slides[i] || {};
          return '<div class="slide-viewer-item" id="slide-view-' + (i + 1) + '">' +
            '<img class="slide-viewer-img" src="' + url + '" alt="Slide ' + (i + 1) + '" data-index="' + i + '" loading="lazy">' +
            '<div class="slide-viewer-bar">' +
              '<span class="slide-viewer-num">' + (i + 1) + '</span>' +
              '<span class="slide-viewer-title">' + escapeHtml(slide.actionTitle || 'Slide ' + (i + 1)) + '</span>' +
            '</div>' +
            '<div style="padding:8px 16px 12px">' +
              '<textarea class="slide-viewer-comment" data-slide="' + (i + 1) + '" placeholder="Revision note for this slide..."></textarea>' +
            '</div>' +
          '</div>';
        }).join('');

        viewer.querySelectorAll('.slide-viewer-img').forEach(function (img) {
          img.addEventListener('click', function () {
            openSlideModal(parseInt(img.dataset.index));
          });
        });

        viewer.querySelectorAll('.slide-viewer-comment').forEach(function (ta) {
          ta.addEventListener('input', function () {
            state.slideComments[ta.dataset.slide] = ta.value;
          });
        });
      } else {
        viewer.innerHTML = '<div class="slide-viewer-loading">Preview not available</div>';
      }
    } catch (e) {
      viewer.innerHTML = '<div class="slide-viewer-loading">Preview rendering failed</div>';
    }
  }

  // === FULLSCREEN MODAL ===
  function openSlideModal(index) {
    state.modalSlideIndex = index;
    $('#slide-modal').hidden = false;
    document.body.style.overflow = 'hidden';
    updateSlideModal();
  }

  function closeSlideModal() {
    $('#slide-modal').hidden = true;
    document.body.style.overflow = '';
  }

  function updateSlideModal() {
    var url = state.slidePreviewUrls[state.modalSlideIndex];
    if (url) {
      $('#slide-modal-img').src = url;
    }
    $('#slide-modal-counter').textContent = 'Slide ' + (state.modalSlideIndex + 1) + ' of ' + state.slidePreviewUrls.length;
    $('#slide-modal-prev').style.visibility = state.modalSlideIndex === 0 ? 'hidden' : 'visible';
    $('#slide-modal-next').style.visibility = state.modalSlideIndex >= state.slidePreviewUrls.length - 1 ? 'hidden' : 'visible';
  }

  // === DOWNLOAD ===
  function downloadFile() {
    if (!state.generatedFilename) return;
    var a = document.createElement('a');
    a.href = API + '/outputs/' + state.generatedFilename;
    a.download = state.generatedFilename;
    a.click();
  }

  // === STYLE CHANGE ON RESULT ===
  function promptStyleRevision(changeDescription) {
    // Pre-fill the refine sidebar and open it
    $('#refine-sidebar').classList.remove('collapsed');
    var current = $('#refine-input').value;
    var newInstr = 'Apply visual update: ' + changeDescription + '. Regenerate the PPTX with the updated style/colors while keeping all content identical.';
    $('#refine-input').value = current ? current + '\n\n' + newInstr : newInstr;
    $('#refine-context').textContent = 'Style changed — click Apply to update the presentation.';
    toast('Style changed — use Refine to apply to your deck', 'info');
  }

  // === VISUAL QA ===
  async function runVisualQA() {
    if (!state.generatedFilename) { toast('No presentation to QA', 'warning'); return; }

    var qaBtn = $('#btn-visual-qa');
    var qaResult = $('#qa-result');
    qaBtn.disabled = true;
    qaBtn.textContent = 'Running QA...';
    qaResult.hidden = true;

    try {
      var response = await fetch(API + '/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: state.generatedFilename,
          slides: state.slides,
          styles: getEnabledStyles()
        })
      });

      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var qaData = null;

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].startsWith('data: ')) continue;
          try {
            var event = JSON.parse(lines[i].slice(6));
            if (event.type === 'qa_result') qaData = event.data;
            else if (event.type === 'log') { /* ignore QA logs */ }
          } catch (e) {}
        }
      }

      if (qaData) {
        renderQAResult(qaData);
      } else {
        toast('QA check returned no result', 'warning');
      }
    } catch (e) {
      toast('QA failed: ' + e.message, 'error');
    }

    qaBtn.disabled = false;
    qaBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 11v-1m0-4v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg> Run Visual QA Check';
  }

  function renderQAResult(data) {
    var qaResult = $('#qa-result');
    var scoreClass = data.overallScore >= 8 ? 'excellent' : data.overallScore >= 6 ? 'good' : data.overallScore >= 4 ? 'needs-work' : 'poor';

    var issuesHtml = '';
    if (data.issues && data.issues.length > 0) {
      issuesHtml = '<div class="qa-section-title">Issues</div>' +
        data.issues.map(function (iss) {
          var sev = iss.severity === 'error' ? 'error' : iss.severity === 'warning' ? 'warning' : 'info';
          return '<div class="qa-issue ' + sev + '"><span class="qa-issue-badge">' + (iss.slide ? 'Slide ' + iss.slide : '') + ' ' + sev + '</span> ' + escapeHtml(iss.issue) + '</div>';
        }).join('');
    }

    var strengthsHtml = '';
    if (data.strengths && data.strengths.length > 0) {
      strengthsHtml = '<div class="qa-section-title">Strengths</div><ul class="qa-list">' +
        data.strengths.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
    }

    var suggestionsHtml = '';
    if (data.suggestions && data.suggestions.length > 0) {
      suggestionsHtml = '<div class="qa-section-title">Suggestions</div><ul class="qa-list">' +
        data.suggestions.map(function (s) { return '<li style="color:var(--accent)">' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
    }

    qaResult.innerHTML =
      '<div class="qa-score-row">' +
        '<div class="qa-score-circle ' + scoreClass + '">' + data.overallScore + '</div>' +
        '<div><div class="qa-verdict">' + escapeHtml(data.overallVerdict || '') + '</div><div style="font-size:13px;color:var(--text-secondary)">' + (data.issues ? data.issues.length : 0) + ' issues found</div></div>' +
      '</div>' +
      issuesHtml + strengthsHtml + suggestionsHtml;

    qaResult.hidden = false;
    qaResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // === REVISIONS ===
  async function startRevision() {
    var globalInstr = state.refineInstructions || '';
    var slideNotes = Object.entries(state.slideComments)
      .filter(function (entry) { return entry[1].trim(); })
      .map(function (entry) { return '- Slide ' + entry[0] + ': ' + entry[1].trim(); })
      .join('\n');
    var instructions = [globalInstr, slideNotes].filter(Boolean).join('\n\n## Per-slide notes:\n');
    if (!instructions.trim()) {
      toast('Please add revision notes', 'warning');
      return;
    }

    state.revisionCount++;
    state.revisions.push({
      text: instructions.slice(0, 80),
      time: new Date().toLocaleTimeString(),
      status: 'in-progress'
    });

    updateStep(3);
    $('#gen-actions-running').hidden = false;
    $('#gen-actions-done').hidden = true;
    $('#gen-status-banner').className = 'gen-status-banner';
    $('#gen-status-text').textContent = 'Revising presentation...';
    $('#gen-status-detail').textContent = 'Connecting to Claude';
    $('#gen-status-icon').innerHTML = '<div class="spinner" style="width:24px;height:24px;border-width:2px;margin:0"></div>';
    state.genLastLogTime = Date.now();
    var logEl = $('#gen-log');
    logEl.textContent = '';
    startTimer('gen-timer');

    var body = {
      filename: state.generatedFilename,
      instructions: instructions,
      language: state.language,
      styles: getEnabledStyles(),
      uploadedFiles: [],
      revisionNumber: state.revisionCount
    };

    try {
      var response = await fetch(API + '/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();
        for (var idx = 0; idx < lines.length; idx++) {
          var line = lines[idx];
          if (line.startsWith('data: ')) {
            try { handleGenerateEvent(JSON.parse(line.slice(6)), logEl); } catch (e) { /* ignore */ }
          }
        }
      }
      if (buffer.startsWith('data: ')) {
        try { handleGenerateEvent(JSON.parse(buffer.slice(6)), logEl); } catch (e) { /* ignore */ }
      }
      state.revisions[state.revisions.length - 1].status = 'done';
    } catch (e) {
      toast('Revision failed: ' + e.message, 'error');
      state.revisions[state.revisions.length - 1].status = 'done';
    }
    state.refineInstructions = '';
    stopTimer('gen');
  }

  // === UTILITIES ===
  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function toast(message, type) {
    if (!type) type = 'info';
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    $('#toast-container').appendChild(el);
    setTimeout(function () {
      el.classList.add('removing');
      setTimeout(function () { el.remove(); }, 200);
    }, 4000);
  }
})();
