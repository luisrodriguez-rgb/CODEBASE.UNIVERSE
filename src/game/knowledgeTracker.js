/**
 * Codebase Knowledge & Architect Progression Tracker for CODEBASE.UNIVERSE.
 */

export class KnowledgeTracker {
  constructor() {
    this.discovered = new Set();
    this.understood = new Set();
    this.mastered = new Set();
    this.discoveredNodes = this.discovered;
    this.totalXP = 1450;
    this.totalNodesCount = 568;
  }

  addXP(amount) {
    this.totalXP += amount;
  }

  markDiscovered(nodeId) {
    const isNew = !this.discovered.has(nodeId);
    this.discovered.add(nodeId);
    return isNew;
  }

  markUnderstood(nodeId) {
    this.discovered.add(nodeId);
    this.understood.add(nodeId);
  }

  markMastered(nodeId) {
    this.discovered.add(nodeId);
    this.understood.add(nodeId);
    this.mastered.add(nodeId);
  }

  getCompletionPercentage() {
    if (this.totalNodesCount === 0) return 0;
    return Math.min(100, Math.round((this.discovered.size / this.totalNodesCount) * 100));
  }

  getRankTitle() {
    if (this.totalXP >= 15000) return 'CODEBASE OVERLORD (LVL 10)';
    if (this.totalXP >= 10000) return 'PRINCIPAL ARCHITECT (LVL 08)';
    if (this.totalXP >= 7000) return 'STAFF ARCHITECT (LVL 06)';
    if (this.totalXP >= 4000) return 'SENIOR ENGINEER (LVL 04)';
    if (this.totalXP >= 1500) return 'JUNIOR EXPLORER (LVL 02)';
    return 'INTERN APPRENTICE (LVL 01)';
  }

  calculateKnowledgeMetrics(graph) {
    const total = graph?.nodes?.size || this.totalNodesCount || 1;
    this.totalNodesCount = total;
    const discPct = Math.round((this.discovered.size / total) * 100);
    const underPct = Math.round((this.understood.size / total) * 100);
    const mastPct = Math.round((this.mastered.size / total) * 100);

    const overallKnowledgePct = Math.min(100, Math.round(
      0.40 * discPct + 0.35 * underPct + 0.25 * mastPct
    ));

    return {
      discoveredCount: this.discovered.size,
      totalCount: total,
      discoveredPct: discPct,
      understoodPct: underPct,
      masteredPct: mastPct,
      overallKnowledgePct
    };
  }
}
