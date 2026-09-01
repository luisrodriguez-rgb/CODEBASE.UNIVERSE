/**
 * GitHub Cloud Ingestion Modal Controller for CODEBASE.UNIVERSE.
 * Allows importing any public/private GitHub repository directly into the world simulation.
 * ZERO EMOJIS.
 */

import { GitHubCloudImporter } from '../data/githubImporter.js';
import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';

export class GitHubModalController {
  constructor(onLoadProjectCallback) {
    this.onLoadProject = onLoadProjectCallback;

    this.modal = document.getElementById('github-import-modal');
    this.repoInput = document.getElementById('gh-repo-slug-input');
    this.tokenInput = document.getElementById('gh-token-input');
    this.importBtn = document.getElementById('btn-execute-gh-import');
    this.statusBox = document.getElementById('gh-import-status-box');

    this.initEvents();
  }

  initEvents() {
    this.importBtn?.addEventListener('click', () => {
      sfx.playClick();
      this.executeImport();
    });

    document.getElementById('close-gh-modal-btn')?.addEventListener('click', () => {
      sfx.playClick();
      this.close();
    });

    // Preset quick import buttons
    document.querySelectorAll('.gh-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.playClick();
        const slug = chip.getAttribute('data-slug');
        if (this.repoInput && slug) {
          this.repoInput.value = slug;
          this.executeImport();
        }
      });
    });
  }

  async executeImport() {
    const slug = this.repoInput?.value?.trim();
    const token = this.tokenInput?.value?.trim();

    if (!slug) {
      alert(i18n.currentLang === 'es' ? 'Ingresa el nombre del repositorio (ej. facebook/react)' : 'Enter repository slug (e.g. facebook/react)');
      return;
    }

    if (this.statusBox) {
      this.statusBox.classList.remove('hidden');
      this.statusBox.innerHTML = `<span class="prompt">></span> ${i18n.currentLang === 'es' ? 'Conectando con GitHub API...' : 'Connecting to GitHub API...'}`;
    }

    if (this.importBtn) {
      this.importBtn.disabled = true;
      this.importBtn.textContent = i18n.currentLang === 'es' ? 'IMPORTANDO ARQUITECTURA...' : 'IMPORTING ARCHITECTURE...';
    }

    try {
      sfx.playWarp();
      const result = await GitHubCloudImporter.importRepository(slug, token, (msg) => {
        if (this.statusBox) {
          this.statusBox.innerHTML = `<span class="prompt">></span> ${msg}`;
        }
      });

      if (this.statusBox) {
        this.statusBox.innerHTML = `<span class="prompt" style="color:var(--accent-emerald)">></span> ${i18n.currentLang === 'es' ? 'ARQUITECTURA IMPORTADA CON EXITO.' : 'ARCHITECTURE IMPORTED SUCCESSFULLY.'}`;
      }
      sfx.playVictory();

      setTimeout(() => {
        this.close();
        if (this.onLoadProject) {
          this.onLoadProject('custom_raw', result.graph, result.projectName);
        }
      }, 700);

    } catch (err) {
      sfx.playAlarm();
      if (this.statusBox) {
        this.statusBox.innerHTML = `<span class="prompt" style="color:var(--accent-rose)">></span> ERROR: ${err.message}`;
      }
    } finally {
      if (this.importBtn) {
        this.importBtn.disabled = false;
        this.importBtn.textContent = i18n.currentLang === 'es' ? '[>] IMPORTAR Y GENERAR UNIVERSO' : '[>] IMPORT & GENERATE UNIVERSE';
      }
    }
  }

  open() {
    this.modal?.classList.remove('hidden');
    document.getElementById('modal-backdrop')?.classList.remove('hidden');
  }

  close() {
    this.modal?.classList.add('hidden');
    document.getElementById('modal-backdrop')?.classList.add('hidden');
  }
}
