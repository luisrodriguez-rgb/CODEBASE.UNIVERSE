/**
 * Execution Flow Tracer & Pathfinding Navigator for CODEBASE.UNIVERSE.
 * Allows "Follow the Flow" and "Trace Path" (Google Maps for Software Architecture).
 */

export class PathFollower {
  constructor(graph, camera, state) {
    this.graph = graph;
    this.camera = camera;
    this.state = state;

    this.activePath = [];
    this.currentStepIndex = 0;
    this.isFollowing = false;
    this.stepTimer = 0;
    this.stepDuration = 1.6; // Seconds per node focus
    this.onCompleteCallback = null;
  }

  /**
   * Traces the shortest dependency path between startNodeId and endNodeId using BFS.
   * @param {string} startNodeId
   * @param {string} endNodeId
   * @returns {string[]} Ordered node IDs
   */
  findPath(startNodeId, endNodeId) {
    if (startNodeId === endNodeId) return [startNodeId];

    const queue = [[startNodeId]];
    const visited = new Set([startNodeId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      const neighbors = this.graph.getDependencies(current);
      for (const next of neighbors) {
        if (next === endNodeId) {
          return [...path, next];
        }
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
    return [];
  }

  /**
   * Generates a linear downstream execution pipeline starting from startNodeId.
   * @param {string} startNodeId
   * @param {number} maxSteps
   * @returns {string[]}
   */
  getDownstreamFlow(startNodeId, maxSteps = 6) {
    const flow = [startNodeId];
    let current = startNodeId;
    const visited = new Set([startNodeId]);

    for (let i = 0; i < maxSteps; i++) {
      const deps = this.graph.getDependencies(current);
      const next = deps.find(d => !visited.has(d));
      if (!next) break;

      visited.add(next);
      flow.push(next);
      current = next;
    }
    return flow;
  }

  /**
   * Initiates the guided camera flight along the specified path.
   * @param {string[]} nodePath
   * @param {Function} onComplete
   */
  startFlow(nodePath, onComplete = null) {
    if (!nodePath || nodePath.length === 0) return;
    this.activePath = nodePath;
    this.currentStepIndex = 0;
    this.isFollowing = true;
    this.stepTimer = 0;
    this.onCompleteCallback = onComplete;

    this.focusCurrentStep();
  }

  stopFlow() {
    this.isFollowing = false;
    this.activePath = [];
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = null;
    }
  }

  focusCurrentStep() {
    if (this.currentStepIndex >= this.activePath.length) {
      this.stopFlow();
      return;
    }

    const nodeId = this.activePath[this.currentStepIndex];
    const node = this.graph.getNode(nodeId);
    if (node) {
      this.state.setSelectedNode(nodeId);
      this.camera.centerOn(node.x, node.y, 3.2);
    }
  }

  update(dt) {
    if (!this.isFollowing || this.activePath.length === 0) return;

    this.stepTimer += dt;
    if (this.stepTimer >= this.stepDuration) {
      this.stepTimer = 0;
      this.currentStepIndex++;
      if (this.currentStepIndex < this.activePath.length) {
        this.focusCurrentStep();
      } else {
        this.stopFlow();
      }
    }
  }

  getActivePathEdges() {
    if (this.activePath.length < 2) return new Set();
    const edgeKeys = new Set();
    for (let i = 0; i < this.activePath.length - 1; i++) {
      edgeKeys.add(`${this.activePath[i]}->${this.activePath[i + 1]}`);
    }
    return edgeKeys;
  }
}
