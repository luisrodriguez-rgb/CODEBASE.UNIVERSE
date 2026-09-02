/**
 * Command Center Landing Dashboard Controller for CODEBASE.UNIVERSE.
 * Connects GitHub Cloud Importer, Local Workspace AST / CBM Engine, Presets, and Live i18n.
 *
 * ZERO EMOJIS.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';
import { CodeGraph } from '../analysis/graph.js';
import { GitHubCloudImporter } from '../data/githubImporter.js';
import { CbmBridgeDriver } from '../indexer/cbmBridge.js';

export class TitleScreenController {
  constructor(onStartCallback, onDatasetSelectCallback) {
    this.onStart = onStartCallback;
    this.onDatasetSelect = onDatasetSelectCallback;

    this.container = document.getElementById('title-screen');
    
    this.initElements();
    this.initEvents();
    this.checkCbmProjects();
    this.updateI18n();
  }

  initElements() {
    this.langToggleBtn = document.getElementById('landing-lang-toggle-btn');
    this.soundToggleBtn = document.getElementById('landing-sound-toggle-btn');
    this.closeBtn = document.getElementById('close-title-screen-btn');

    // Card 1: GitHub Cloud
    this.ghSlugInput = document.getElementById('landing-gh-slug-input');
    this.ghTokenInput = document.getElementById('landing-gh-token-input');
    this.ghImportBtn = document.getElementById('landing-btn-github-import');
    this.ghChips = document.querySelectorAll('.landing-gh-chip');

    // Card 2: Local & CBM
    this.cbmSelect = document.getElementById('landing-cbm-select');
    this.localScanBtn = document.getElementById('landing-btn-local-scan');

    // Card 3: Presets & AST Drop
    this.presetSelect = document.getElementById('landing-preset-select');
    this.presetLaunchBtn = document.getElementById('landing-btn-preset-launch');
    this.dropzone = document.getElementById('landing-dropzone');
    this.fileInput = document.getElementById('landing-file-input');

    // Terminal
    this.termBox = document.getElementById('landing-terminal-box');
    this.termLog = document.getElementById('landing-terminal-log');
  }

  initEvents() {
    // 0. Close Button Action
    this.closeBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container && !this.container.classList.contains('hidden')) {
        this.hide();
      }
    });

    // 1. Language Toggle
    this.langToggleBtn?.addEventListener('click', () => {
      sfx.playClick();
      i18n.toggleLanguage();
      this.updateI18n();
    });

    // 2. Sound Toggle
    this.soundToggleBtn?.addEventListener('click', () => {
      const isMuted = sfx.toggleMute();
      if (!isMuted) sfx.playClick();
      this.soundToggleBtn.textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
    });

    // 3. Card 1: GitHub Preset Chips
    this.ghChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.playClick();
        const slug = chip.getAttribute('data-slug');
        if (this.ghSlugInput) this.ghSlugInput.value = slug;
      });
    });

    // GitHub Import Action
    this.ghImportBtn?.addEventListener('click', async () => {
      const slug = this.ghSlugInput?.value.trim();
      const token = this.ghTokenInput?.value.trim();
      if (!slug) {
        alert('Please enter a GitHub repository slug (e.g. facebook/react)');
        return;
      }

      sfx.playClick();
      this.showTerminal();
      this.ghImportBtn.disabled = true;
      this.ghImportBtn.textContent = '[...] FETCHING GIT TREE...';

      try {
        const result = await GitHubCloudImporter.importRepository(
          slug,
          token,
          (msg) => this.logTerminal(msg)
        );

        sfx.playVictory();
        this.logTerminal(`[SUCCESS] Universe generated for ${result.projectName}`);
        
        setTimeout(() => {
          this.hide();
          if (this.onDatasetSelect) {
            this.onDatasetSelect('custom_raw', result.graph, result.projectName);
          }
        }, 800);
      } catch (err) {
        sfx.playAlert();
        this.logTerminal(`[ERROR] ${err.message}`);
        this.ghImportBtn.disabled = false;
        this.ghImportBtn.textContent = '[>] IMPORT FROM GITHUB';
      }
    });

    // 4. Card 2: Local Scan & CBM Action
    this.localScanBtn?.addEventListener('click', async () => {
      try {
        // Immediately give visual feedback, bypassing anything that could throw
        if (this.localScanBtn) {
          this.localScanBtn.disabled = true;
          this.localScanBtn.textContent = '[...] LOADING GRAPH...';
        }
        
        try { sfx.playClick(); } catch(e) { console.warn('SFX failed', e); }
        try { this.showTerminal(); } catch(e) { console.warn('Terminal failed', e); }

        const selectedCbm = this.cbmSelect?.value;
        const isCbm = selectedCbm && selectedCbm !== 'default';

        try {
          if (isCbm) {
            this.logTerminal(`[>] Ingesting CBM SQLite Knowledge Graph: ${selectedCbm}...`);
            const res = await fetch(`/api/cbm/load?project=${encodeURIComponent(selectedCbm)}`);
            if (!res.ok) throw new Error(`Failed to load CBM project (${res.status})`);
            const raw = await res.json();
            const graph = CbmBridgeDriver.transformCbmToUniverseGraph(raw);


          sfx.playVictory();
          this.logTerminal(`[SUCCESS] CBM Ingestion Complete: ${graph.nodes.size} nodes, ${graph.edges.length} connections.`);

          setTimeout(() => {
            this.hide();
            if (this.onDatasetSelect) {
              this.onDatasetSelect('custom_raw', graph, `CBM // ${selectedCbm.replace(/^Users-[^-]+-Desktop-Trabajos-/, '')}`);
            }
          }, 600);
        } else {
          this.logTerminal('[>] Querying local workspace AST & CBM SQLite engine...');
          // Try CBM first for CODEBASE.UNIVERSE
          let res = await fetch('/api/cbm/load?project=Users-leonfeliperodriguez-Desktop-Trabajos-CODEBASE.UNIVERSE');
          if (res.ok) {
            const raw = await res.json();
            const graph = CbmBridgeDriver.transformCbmToUniverseGraph(raw);
            sfx.playVictory();
            this.logTerminal(`[SUCCESS] CBM Engine: Loaded ${graph.nodes.size} entities & ${graph.edges.length} edges.`);

            setTimeout(() => {
              this.hide();
              if (this.onDatasetSelect) {
                this.onDatasetSelect('custom_raw', graph, 'CODEBASE.UNIVERSE (CBM GRAPH)');
              }
            }, 600);
          } else {
            // Fallback to local scanner
            const scanRes = await fetch('/api/scan');
            if (!scanRes.ok) throw new Error('Local scanner endpoint unreachable.');
            const raw = await scanRes.json();
            const graph = new CodeGraph();
            for (const n of raw.nodes) graph.addNode(n);
            for (const e of raw.edges) graph.addEdge(e);

            sfx.playVictory();
            this.logTerminal(`[SUCCESS] Loaded ${graph.nodes.size} local entities & ${graph.edges.length} connections.`);

            setTimeout(() => {
              this.hide();
              if (this.onDatasetSelect) {
                this.onDatasetSelect('custom_raw', graph, 'LOCAL WORKSPACE (CODEBASE.UNIVERSE)');
              }
            }, 600);
          }
        }
      } catch (err) {
        sfx.playAlert();
        this.logTerminal(`[ERROR] ${err.message}`);
        if (this.localScanBtn) {
          this.localScanBtn.disabled = false;
          this.localScanBtn.textContent = '[>] SCAN LOCAL REPOSITORY';
        }
      }
    } catch (globalErr) {
      console.error('Fatal UI Error in click listener:', globalErr);
      if (this.localScanBtn) {
        this.localScanBtn.disabled = false;
        this.localScanBtn.textContent = '[!] CRITICAL ERROR - REFRESH';
      }
    }
    });

    // 5. Card 3: Preset World Launch Action
    this.presetLaunchBtn?.addEventListener('click', () => {
      sfx.playWarp();
      const val = this.presetSelect?.value || 'sketion';
      this.hide();
      if (this.onDatasetSelect) {
        this.onDatasetSelect(val);
      }
    });

    // Custom File Dropzone
    this.dropzone?.addEventListener('click', () => {
      this.fileInput?.click();
    });

    this.fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        sfx.playVictory();
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const customData = JSON.parse(event.target.result);
            const graph = customData.cbm_schema
              ? CbmBridgeDriver.transformCbmToUniverseGraph(customData)
              : new CodeGraph();

            if (!customData.cbm_schema) {
              for (const n of (customData.nodes || [])) graph.addNode(n);
              for (const e of (customData.edges || [])) graph.addEdge(e);
            }

            this.hide();
            if (this.onDatasetSelect) {
              this.onDatasetSelect('custom_raw', graph, file.name.replace(/\.[^/.]+$/, ''));
            }
          } catch (err) {
            alert('Invalid JSON graph file.');
          }
        };
        reader.readAsText(file);
      }
    });

    i18n.subscribe(() => {
      this.updateI18n();
    });
  }

  async checkCbmProjects() {
    try {
      const res = await fetch('/api/cbm/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.available && data.projects && data.projects.length > 0 && this.cbmSelect) {
          this.cbmSelect.innerHTML = '<option value="default">[ SELECCIONAR PROYECTO CBM CACHE ]</option>';
          for (const p of data.projects) {
            const opt = document.createElement('option');
            opt.value = p.id || p.name;
            opt.textContent = `[CBM] ${p.name.toUpperCase()}`;
            this.cbmSelect.appendChild(opt);
          }
        }
      }
    } catch (e) {
      // Local endpoint offline, proceed with local fallback
    }
  }

  showTerminal() {
    this.termBox?.classList.remove('hidden');
    if (this.termLog) this.termLog.innerHTML = '';
  }

  logTerminal(msg) {
    if (this.termLog) {
      const line = document.createElement('div');
      line.className = 'manifesto-line';
      line.textContent = `> ${msg}`;
      this.termLog.appendChild(line);
      this.termLog.scrollTop = this.termLog.scrollHeight;
    }
  }

  updateI18n() {
    if (this.langToggleBtn) {
      this.langToggleBtn.textContent = i18n.currentLang === 'es' ? 'ES / EN' : 'EN / ES';
    }

    const brandTitle = document.getElementById('cc-brand-title');
    if (brandTitle) brandTitle.textContent = i18n.t('landing_portal_title') || 'CODEBASE.UNIVERSE';

    const heroTitle = document.getElementById('landing-hero-title');
    if (heroTitle) heroTitle.textContent = i18n.currentLang === 'es' ? 'EL SOFTWARE COMO UNA CIUDADELA VIVA' : 'SOFTWARE AS A LIVING CITADEL';

    const heroSub = document.getElementById('landing-hero-subtitle');
    if (heroSub) heroSub.textContent = i18n.t('landing_subtext');

    // Card 1
    const ghHead = document.getElementById('card-gh-heading');
    if (ghHead) ghHead.textContent = i18n.t('portal_card_gh_title');
    const ghDesc = document.getElementById('card-gh-desc');
    if (ghDesc) ghDesc.textContent = i18n.t('portal_card_gh_desc');
    if (this.ghImportBtn) this.ghImportBtn.textContent = i18n.t('portal_btn_gh_import');

    // Card 2
    const cbmHead = document.getElementById('card-cbm-heading');
    if (cbmHead) cbmHead.textContent = i18n.t('portal_card_cbm_title');
    const cbmDesc = document.getElementById('card-cbm-desc');
    if (cbmDesc) cbmDesc.textContent = i18n.t('portal_card_cbm_desc');
    if (this.localScanBtn) this.localScanBtn.textContent = i18n.t('portal_btn_local_scan');

    // Card 3
    const demoHead = document.getElementById('card-demo-heading');
    if (demoHead) demoHead.textContent = i18n.t('portal_card_demo_title');
    const demoDesc = document.getElementById('card-demo-desc');
    if (demoDesc) demoDesc.textContent = i18n.t('portal_card_demo_desc');
    if (this.presetLaunchBtn) this.presetLaunchBtn.textContent = i18n.t('portal_btn_launch_preset');

    const dropText = document.getElementById('landing-drop-text');
    if (dropText) dropText.textContent = i18n.t('portal_lbl_custom_drop');

    // Features Strip
    const f1T = document.getElementById('feat-1-title');
    if (f1T) f1T.textContent = i18n.t('portal_feature_1');
    const f1D = document.getElementById('feat-1-desc');
    if (f1D) f1D.textContent = i18n.t('portal_feature_1_desc');

    const f2T = document.getElementById('feat-2-title');
    if (f2T) f2T.textContent = i18n.t('portal_feature_2');
    const f2D = document.getElementById('feat-2-desc');
    if (f2D) f2D.textContent = i18n.t('portal_feature_2_desc');

    const f3T = document.getElementById('feat-3-title');
    if (f3T) f3T.textContent = i18n.t('portal_feature_3');
    const f3D = document.getElementById('feat-3-desc');
    if (f3D) f3D.textContent = i18n.t('portal_feature_3_desc');

    const f4T = document.getElementById('feat-4-title');
    if (f4T) f4T.textContent = i18n.t('portal_feature_4');
    const f4D = document.getElementById('feat-4-desc');
    if (f4D) f4D.textContent = i18n.t('portal_feature_4_desc');
  }

  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.container.style.display = 'flex';
      sfx.playClick();
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
      this.container.style.display = 'none';
    }
  }
}
