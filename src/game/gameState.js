/**
 * Central Reactive Game State Container for CODEBASE.UNIVERSE.
 */

import { KnowledgeTracker } from './knowledgeTracker.js';

export class GameState {
  constructor() {
    this.currentProject = 'sketion';
    this.graph = null;
    this.analysis = null;
    this.quests = [];
    this.activeQuests = [];
    this.knowledgeTracker = new KnowledgeTracker();
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.selectedNodeId = null;
    this.unlockedCodeDex = new Set();
    this.simulationState = null;
    this.activeCommitGen = null;
    this.listeners = new Set();
  }

  setGraph(graph, analysis, quests) {
    this.graph = graph;
    this.analysis = analysis;
    this.quests = quests || [];
    this.activeQuests = this.quests;
    if (graph) {
      this.knowledgeTracker.totalNodesCount = graph.nodes.size;
    }
    this.notify('graph_loaded', { graph, analysis, quests });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = 'state_updated', data = {}) {
    for (const listener of this.listeners) {
      try {
        listener(event, data, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  addXp(amount) {
    this.knowledgeTracker.addXP(amount);
    this.notify('knowledge_updated', { xp: this.knowledgeTracker.totalXP });
  }

  setSelectedNode(nodeId) {
    this.selectedNodeId = nodeId;
    if (nodeId) {
      const isNew = this.knowledgeTracker.markDiscovered(nodeId);
      this.unlockedCodeDex.add(nodeId);
      if (isNew) {
        this.addXp(50);
      }
      this.checkQuestsOnSelect(nodeId);
    }
    this.notify('node_selected', { nodeId });
  }

  checkQuestsOnSelect(nodeId) {
    for (const quest of this.quests) {
      if (!quest.completed && quest.targetNodeId === nodeId) {
        quest.completed = true;
        this.knowledgeTracker.markUnderstood(nodeId);
        this.addXp(quest.rewardXP || 500);
        this.notify('quest_completed', { questId: quest.id });
      }
    }
  }

  completeQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && !quest.completed) {
      quest.completed = true;
      if (quest.targetNodeId) {
        this.knowledgeTracker.markUnderstood(quest.targetNodeId);
      }
      this.addXp(quest.rewardXP || 500);
      this.notify('quest_completed', { questId });
    }
  }

  setActiveFilter(filter) {
    this.activeFilter = filter;
    this.notify('filter_changed', { filter });
  }

  setSearchQuery(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.notify('search_changed', { query: this.searchQuery });
  }
}

export const globalState = new GameState();
