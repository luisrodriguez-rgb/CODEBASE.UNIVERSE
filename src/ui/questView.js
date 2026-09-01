/**
 * Quests Deck & Detective Incident Room Controller for CODEBASE.UNIVERSE.
 */

import { sfx } from '../audio/soundFX.js';
import { i18n } from '../i18n/translations.js';
import { generateIncidentCases } from '../game/incidentRoom.js';

export class QuestViewController {
  constructor(state, camera) {
    this.state = state;
    this.camera = camera;

    this.container = document.getElementById('quests-modal');
    this.listContainer = document.getElementById('quests-list');
    this.tabButtons = document.querySelectorAll('.quest-tabs .tab-btn');
    this.activeCategory = 'all';

    this.incidentCases = [];

    this.initEvents();
    this.subscribeState();
    this.updateI18n();
  }

  initEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-quest-category') || 'all';
        this.renderQuests();
      });
    });

    i18n.subscribe(() => {
      this.updateI18n();
      this.renderQuests();
    });
  }

  subscribeState() {
    this.state.subscribe((event, data) => {
      if (event === 'graph_loaded') {
        this.incidentCases = generateIncidentCases(this.state.graph, this.state.analysis);
        this.renderQuests();
      } else if (event === 'quest_completed') {
        this.renderQuests();
      }
    });
  }

  renderQuests() {
    if (!this.listContainer) return;
    const quests = this.state.quests || [];
    const isEs = i18n.currentLang === 'es';

    let filtered = quests;
    if (this.activeCategory === 'onboarding') {
      filtered = quests.filter(q => q.category === 'onboarding');
    } else if (this.activeCategory === 'daily') {
      filtered = quests.filter(q => q.category === 'daily');
    } else if (this.activeCategory === 'detective') {
      this.renderDetectiveCases();
      return;
    }

    this.listContainer.innerHTML = filtered.map(q => {
      const code = q.code || 'QST #01';
      const title = isEs ? (q.title_es || q.title) : q.title;
      const desc = isEs ? (q.description_es || q.description) : q.description;
      const hint = isEs ? (q.hint_es || q.hint) : q.hint;
      const reward = q.rewardXP || q.rewardXp || 500;

      return `
        <div class="quest-card ${q.completed ? 'completed' : ''}" data-quest-id="${q.id}">
          <div class="quest-info">
            <div class="quest-title">${q.completed ? '[DONE] ' : ''}${code} // ${title}</div>
            <div class="quest-desc">${desc}</div>
            <div class="quest-hint">${i18n.t('quest_hint_prefix')} ${hint}</div>
          </div>
          <div class="quest-action-col">
            <span class="quest-reward">+${reward} XP</span>
            <button class="quest-track-btn ${q.completed ? 'completed' : ''}" data-track-id="${q.id}">
              ${q.completed ? i18n.t('btn_completed') : i18n.t('btn_track')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.listContainer.querySelectorAll('.quest-track-btn:not(.completed)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sfx.playClick();
        const qId = btn.getAttribute('data-track-id');
        const quest = quests.find(q => q.id === qId);
        const targetId = quest?.targetNodeId || quest?.targetId;
        if (quest && targetId) {
          const targetNode = this.state.graph.getNode(targetId);
          if (targetNode) {
            this.container?.classList.add('hidden');
            document.getElementById('modal-backdrop')?.classList.add('hidden');
            this.state.setSelectedNode(targetId);
            this.camera.centerOn(targetNode.x, targetNode.y, 3.5);
            sfx.playVictory();
            this.state.completeQuest(qId);
          }
        }
      });
    });
  }

  renderDetectiveCases() {
    const isEs = i18n.currentLang === 'es';
    if (!this.incidentCases || this.incidentCases.length === 0) {
      this.listContainer.innerHTML = `<div style="color:var(--text-muted);padding:20px;">No active incident investigations.</div>`;
      return;
    }

    this.listContainer.innerHTML = this.incidentCases.map(c => {
      const code = c.code || 'CASE #01';
      const title = isEs ? c.title_es : c.title;
      const desc = isEs ? c.description_es : c.description;
      const clues = isEs ? c.clues_es : c.clues;
      const reward = c.rewardXp || c.rewardXP || 800;

      return `
        <div class="quest-card ${c.solved ? 'completed' : ''}" data-case-id="${c.id}">
          <div class="quest-info" style="max-width:68%">
            <div class="quest-title" style="color:var(--accent-rose)">${c.solved ? '[SOLVED] ' : '[INCIDENT] '}${code} // ${title}</div>
            <div class="quest-desc">${desc}</div>
            <div style="margin-top:8px;font-size:10.5px;color:var(--text-muted);display:flex;flex-direction:column;gap:3px;">
              ${clues.map(clue => `<span>- ${clue}</span>`).join('')}
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
              <span style="font-size:10px;font-weight:700;color:var(--text-muted)">SUSPECTS:</span>
              ${c.suspects.map(s => `
                <button class="suspect-btn" data-case-id="${c.id}" data-suspect-id="${s.id}" style="background:rgba(23,32,51,0.8);border:1px solid var(--border-subtle);color:#fff;font-size:10px;padding:4px 8px;border-radius:3px;cursor:pointer;">
                  [?] ${s.name}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="quest-action-col">
            <span class="quest-reward">+${reward} XP</span>
            <span class="badge ${c.solved ? 'highlight' : 'threat-badge'}">${c.solved ? 'RESOLVED' : 'ACTIVE'}</span>
          </div>
        </div>
      `;
    }).join('');

    this.listContainer.querySelectorAll('.suspect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.playClick();
        const caseId = btn.getAttribute('data-case-id');
        const suspectId = btn.getAttribute('data-suspect-id');
        const incidentCase = this.incidentCases.find(c => c.id === caseId);

        if (incidentCase) {
          if (suspectId === incidentCase.culpritId) {
            incidentCase.solved = true;
            sfx.playVictory();
            this.state.knowledgeTracker.addXP(incidentCase.rewardXp);
            alert(isEs
              ? `CASO RESUELTO: Identificaste correctamente el modulo causante del fallo (${suspectId}). Recompensa: +${incidentCase.rewardXp} XP.`
              : `CASE RESOLVED: You correctly identified the root cause module (${suspectId}). Reward: +${incidentCase.rewardXp} XP.`
            );
            this.renderDetectiveCases();
          } else {
            sfx.playAlarm();
            alert(isEs
              ? `PISTA ERRONEA: El modulo ${suspectId} tiene dependencias sanas y no es el origen del incidente. Revisa las pistas de centralidad y riesgo.`
              : `FALSE LEAD: Module ${suspectId} has healthy topology and is not the culprit. Check the risk and centrality clues.`
            );
          }
        }
      });
    });
  }

  updateI18n() {
    const title = document.getElementById('quests-header-title');
    if (title) title.textContent = i18n.t('quests_title');

    const rewardsLbl = document.getElementById('quests-lbl-rewards');
    if (rewardsLbl) rewardsLbl.textContent = i18n.t('quests_rewards_available');

    const tabAll = document.getElementById('quest-tab-btn-all');
    if (tabAll) tabAll.textContent = i18n.t('quest_tab_all');

    const tabOnboarding = document.getElementById('quest-tab-btn-onboarding');
    if (tabOnboarding) tabOnboarding.textContent = i18n.t('quest_tab_onboarding');

    const tabDetective = document.getElementById('quest-tab-btn-detective');
    if (tabDetective) tabDetective.textContent = i18n.t('quest_tab_detective');

    const tabDaily = document.getElementById('quest-tab-btn-daily');
    if (tabDaily) tabDaily.textContent = i18n.t('quest_tab_daily');
  }
}
