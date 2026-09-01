/**
 * Codebase Knowledge & Architect Progression Tracker.
 * Tracks Discovered, Understood, and Mastered entities and computes Knowledge %.
 */

export class KnowledgeTracker {
  constructor() {
    this.discovered = new Set();
    this.understood = new Set();
    this.mastered = new Set();
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

  calculateKnowledgeMetrics(graph) {
    const total = graph.nodes.size || 1;
    const discPct = Math.round((this.discovered.size / total) * 100);
    const underPct = Math.round((this.understood.size / total) * 100);
    const mastPct = Math.round((this.mastered.size / total) * 100);

    // Weighted composite Knowledge score
    // Knowledge = 0.40 * Discovered + 0.35 * Understood + 0.25 * Mastered
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

  getRank(xp) {
    if (xp >= 15000) return 'CODEBASE OVERLORD (LVL 10)';
    if (xp >= 10000) return 'PRINCIPAL ARCHITECT (LVL 08)';
    if (xp >= 7000) return 'STAFF ARCHITECT (LVL 06)';
    if (xp >= 4000) return 'SENIOR ENGINEER (LVL 04)';
    if (xp >= 1500) return 'JUNIOR EXPLORER (LVL 02)';
    return 'INTERN APPRENTICE (LVL 01)';
  }
}
