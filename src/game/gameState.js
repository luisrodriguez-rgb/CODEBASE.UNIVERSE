/**
 * Central Reactive Game State Container.
 */

import { KnowledgeTracker } from './knowledgeTracker.js';

export class GameState {
  constructor() {
    this.currentProject = 'sketion';
    this.xp = 1450;
    this.knowledgeTracker = new KnowledgeTracker();
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.selectedNodeId = null;
    this.activeQuests = [];
    this.unlockedCodeDex = new Set();
    this.simulationState = null;
    this.activeCommitGen = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  addXp(amount) {
    this.xp += amount;
    this.notify();
  }

  setSelectedNode(nodeId) {
    this.selectedNodeId = nodeId;
    if (nodeId) {
      const isNew = this.knowledgeTracker.markDiscovered(nodeId);
      this.unlockedCodeDex.add(nodeId);
      if (isNew) {
        this.addXp(50);
      }
      // Check quest completion triggers
      this.checkQuestsOnSelect(nodeId);
    }
    this.notify();
  }

  checkQuestsOnSelect(nodeId) {
    for (const quest of this.activeQuests) {
      if (!quest.completed && quest.targetId === nodeId) {
        quest.completed = true;
        this.knowledgeTracker.markUnderstood(nodeId);
        this.addXp(quest.rewardXp);
      }
    }
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.notify();
  }

  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.notify();
  }
}

export const globalState = new GameState();
