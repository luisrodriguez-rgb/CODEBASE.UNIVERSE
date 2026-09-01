/**
 * Interactive Camera Controller with Pan, Zoom, and Semantic Zoom Levels.
 */

export class WorldCamera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.zoom = 0.85;
    this.minZoom = 0.15;
    this.maxZoom = 4.0;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 0.85;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.x += dx / this.zoom;
        this.y += dy / this.zoom;
        this.targetX = this.x;
        this.targetY = this.y;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // Zoom towards mouse pointer
      this.x -= (mouseX / this.zoom) * (zoomFactor - 1);
      this.y -= (mouseY / this.zoom) * (zoomFactor - 1);
      this.zoom = newZoom;
      this.targetZoom = newZoom;
      this.targetX = this.x;
      this.targetY = this.y;
    }, { passive: false });
  }

  screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = screenX - rect.left - rect.width / 2;
    const cy = screenY - rect.top - rect.height / 2;
    return {
      x: cx / this.zoom - this.x,
      y: cy / this.zoom - this.y
    };
  }

  worldToScreen(worldX, worldY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (worldX + this.x) * this.zoom + rect.width / 2,
      y: (worldY + this.y) * this.zoom + rect.height / 2
    };
  }

  centerOn(worldX, worldY, zoomLevel = 1.3) {
    this.targetX = -worldX;
    this.targetY = -worldY;
    this.targetZoom = zoomLevel;
  }

  reset() {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 0.85;
  }

  update() {
    // Smooth camera lerping
    this.x += (this.targetX - this.x) * 0.14;
    this.y += (this.targetY - this.y) * 0.14;
    this.zoom += (this.targetZoom - this.zoom) * 0.14;
  }

  /**
   * Computes semantic zoom tier for adaptive level of detail (LOD).
   */
  getSemanticZoomTier() {
    if (this.zoom < 0.40) return { tier: 'PROJECT', label: 'LEVEL: PROJECT' };
    if (this.zoom < 0.80) return { tier: 'SUBSYSTEM', label: 'LEVEL: SUBSYSTEM' };
    if (this.zoom < 1.60) return { tier: 'MODULE', label: 'LEVEL: MODULE' };
    return { tier: 'DETAIL', label: 'LEVEL: FUNCTION / DETAIL' };
  }
}
