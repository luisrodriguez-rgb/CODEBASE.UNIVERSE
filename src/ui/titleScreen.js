/**
 * Title Splash Screen & Codebase Ingestion Selector.
 */

import { parseCustomGraphJSON } from '../data/customIngest.js';

export class TitleScreen {
  constructor(onProjectSelect) {
    this.onProjectSelect = onProjectSelect;
    this.screen = document.getElementById('title-screen');
    this.selectDropdown = document.getElementById('project-select-dropdown');
    this.customBox = document.getElementById('custom-import-box');
    this.fileInput = document.getElementById('custom-file-input');
    this.enterBtn = document.getElementById('enter-world-btn');

    this.initEvents();
  }

  initEvents() {
    this.selectDropdown.addEventListener('change', () => {
      if (this.selectDropdown.value === 'custom') {
        this.customBox.classList.remove('hidden');
      } else {
        this.customBox.classList.add('hidden');
      }
    });

    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const json = JSON.parse(ev.target.result);
            const customGraph = parseCustomGraphJSON(json);
            this.hide();
            this.onProjectSelect('custom', customGraph);
          } catch (err) {
            alert(`Error parsing custom JSON graph: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
    });

    this.enterBtn.addEventListener('click', () => {
      const selected = this.selectDropdown.value;
      if (selected === 'custom') {
        if (!this.fileInput.files || this.fileInput.files.length === 0) {
          alert('Please select a JSON codebase graph file to import.');
          return;
        }
      } else {
        this.hide();
        this.onProjectSelect(selected);
      }
    });
  }

  show() {
    this.screen.classList.remove('hidden');
  }

  hide() {
    this.screen.classList.add('hidden');
  }
}
