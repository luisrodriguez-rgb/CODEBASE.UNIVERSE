/**
 * Graph data structure and topological traversal algorithms.
 */

export class CodeGraph {
  constructor() {
    /** @type {Map<string, any>} */
    this.nodes = new Map();
    /** @type {Array<any>} */
    this.edges = [];
    /** @type {Map<string, Set<string>>} Target -> Set of Sources (Callers/Dependents) */
    this.inDegree = new Map();
    /** @type {Map<string, Set<string>>} Source -> Set of Targets (Dependencies) */
    this.outDegree = new Map();
  }

  addNode(node) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, {
        ...node,
        x: node.x ?? 0,
        y: node.y ?? 0,
        vx: 0,
        vy: 0
      });
      this.inDegree.set(node.id, new Set());
      this.outDegree.set(node.id, new Set());
    }
  }

  addEdge(edge) {
    const { source, target, type = 'imports' } = edge;
    if (this.nodes.has(source) && this.nodes.has(target)) {
      this.edges.push({ source, target, type });
      this.outDegree.get(source).add(target);
      this.inDegree.get(target).add(source);
    }
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getDependents(nodeId) {
    return Array.from(this.inDegree.get(nodeId) || []);
  }

  getDependencies(nodeId) {
    return Array.from(this.outDegree.get(nodeId) || []);
  }

  getDirectConnections(nodeId) {
    const deps = this.getDependencies(nodeId);
    const dependents = this.getDependents(nodeId);
    return Array.from(new Set([...deps, ...dependents]));
  }

  /**
   * Breadth-first search for forward reachability (what downstream nodes break).
   */
  getDownstreamCascade(startNodeId) {
    const visited = new Set();
    const queue = [{ id: startNodeId, depth: 0 }];
    const cascadeLevels = new Map();

    while (queue.length > 0) {
      const { id, depth } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);

      if (!cascadeLevels.has(depth)) {
        cascadeLevels.set(depth, []);
      }
      cascadeLevels.get(depth).push(id);

      const callers = this.getDependents(id);
      for (const callerId of callers) {
        if (!visited.has(callerId)) {
          queue.push({ id: callerId, depth: depth + 1 });
        }
      }
    }

    return {
      affectedNodes: Array.from(visited),
      cascadeLevels,
      directCount: (cascadeLevels.get(1) || []).length,
      indirectCount: Math.max(0, visited.size - 1 - (cascadeLevels.get(1) || []).length)
    };
  }

  clone() {
    const copy = new CodeGraph();
    for (const node of this.nodes.values()) {
      copy.addNode({ ...node });
    }
    for (const edge of this.edges) {
      copy.addEdge({ ...edge });
    }
    return copy;
  }
}
