/**
 * Silky-Smooth Camera Controller with Continuous Exponential Zoom,
 * Precise Trackpad/Mouse Wheel scaling, and WASD/Arrow Navigation.
 */

export class WorldCamera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.zoom = 0.85;
    this.minZoom = 0.04;
    this.maxZoom = 15.0;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 0.85;

    this.keys = {};

    this.initEvents();
  }

  initEvents() {
    // Mouse Drag Pan
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 1) {
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

    // Silky Smooth Exponential Cursor-Anchored Zoom (Supports Mac Trackpad Pinch & Mouse Wheel)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const rect = this.canvas.getBoundingClientRect();
      const cursorScreenX = e.clientX - rect.left;
      const cursorScreenY = e.clientY - rect.top;

      // Position in world space before zoom
      const worldBefore = this.screenToWorld(cursorScreenX, cursorScreenY);

      // Continuous exponential scaling (normalized for discrete clicks and fluid trackpad gestures)
      const clampedDelta = Math.max(-120, Math.min(120, e.deltaY));
      const zoomFactor = Math.exp(-clampedDelta * 0.0035);
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * zoomFactor));

      this.targetZoom = newZoom;

      // Re-anchor camera target so point under cursor remains perfectly stationary
      const cx = cursorScreenX - rect.width / 2;
      const cy = cursorScreenY - rect.height / 2;

      this.targetX = -(worldBefore.x - cx / newZoom);
      this.targetY = -(worldBefore.y - cy / newZoom);
    }, { passive: false });

    // Keyboard Pan
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = screenX - rect.width / 2;
    const cy = screenY - rect.height / 2;
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

  centerOn(worldX, worldY, zoomLevel = 3.5) {
    this.targetX = -worldX;
    this.targetY = -worldY;
    this.targetZoom = Math.min(this.maxZoom, Math.max(this.minZoom, zoomLevel));
  }

  reset() {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 0.85;
  }

  update() {
    const panSpeed = 26 / this.zoom;
    if (this.keys['w'] || this.keys['arrowup']) {
      this.targetY += panSpeed;
      this.y += panSpeed;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.targetY -= panSpeed;
      this.y -= panSpeed;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.targetX += panSpeed;
      this.x += panSpeed;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.targetX -= panSpeed;
      this.x -= panSpeed;
    }

    // High performance smooth lerping
    this.x += (this.targetX - this.x) * 0.18;
    this.y += (this.targetY - this.y) * 0.18;
    this.zoom += (this.targetZoom - this.zoom) * 0.18;
  }

  getSemanticZoomTier() {
    if (this.zoom < 0.40) return { tier: 'PROJECT', key: 'level_project' };
    if (this.zoom < 0.90) return { tier: 'SUBSYSTEM', key: 'level_subsystem' };
    if (this.zoom < 2.40) return { tier: 'MODULE', key: 'level_module' };
    return { tier: 'DETAIL', key: 'level_detail' };
  }
}
