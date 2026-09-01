/**
 * Quests & Onboarding Log Modal Controller.
 */

export class QuestView {
  constructor(state, graph, analysis, world) {
    this.state = state;
    this.graph = graph;
    this.analysis = analysis;
    this.world = world;

    this.modal = document.getElementById('quests-modal');
    this.list = document.getElementById('quests-list');
    this.tabBtns = document.querySelectorAll('.quest-tabs .tab-btn');

    this.activeCategory = 'all';

    this.initEvents();
  }

  initEvents() {
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-quest-category') || 'all';
        this.renderList();
      });
    });

    this.state.subscribe(() => {
      if (!this.modal.classList.contains('hidden')) {
        this.renderList();
      }
    });
  }

  open() {
    this.modal.classList.remove('hidden');
    document.getElementById('modal-backdrop').classList.remove('hidden');
    this.renderList();
  }

  close() {
    this.modal.classList.add('hidden');
    document.getElementById('modal-backdrop').classList.add('hidden');
  }

  renderList() {
    const quests = this.state.activeQuests.filter(q => {
      if (this.activeCategory === 'all') return true;
      return q.category === this.activeCategory;
    });

    this.list.innerHTML = quests.map(q => {
      return `
        <div class="quest-card ${q.completed ? 'completed' : ''}">
          <div class="quest-info">
            <div class="quest-title">${q.title} <span style="font-size:10px; color:var(--text-muted); margin-left:8px;">${q.difficulty}</span></div>
            <div class="quest-desc">${q.description}</div>
            <div class="quest-hint">HINT: ${q.hint}</div>
          </div>
          <div class="quest-action-col">
            <span class="quest-reward">+${q.rewardXp} XP</span>
            <button class="quest-track-btn ${q.completed ? 'completed' : ''}" data-target-id="${q.targetId}">
              ${q.completed ? 'COMPLETED ✓' : 'TRACK // LOCATE'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.list.querySelectorAll('.quest-track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target-id');
        if (targetId) {
          this.close();
          this.state.setSelectedNode(targetId);
          const node = this.graph.getNode(targetId);
          if (node) {
            this.world.camera.centerOn(node.x, node.y);
          }
        }
      });
    });
  }
}
