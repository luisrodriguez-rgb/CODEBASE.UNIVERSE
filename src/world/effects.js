/**
 * Visual FX Engine: Shockwave blast animations, energy pulses, and blackout cascades.
 */

export class WorldEffects {
  constructor() {
    this.shockwaves = [];
    this.pulses = [];
    this.blackoutNodes = new Set();
    this.highlightNodes = new Set();
  }

  triggerShockwave(x, y, color = '#f43f5e', maxRadius = 350) {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      alpha: 1.0,
      speed: 12
    });
  }

  triggerEnergyPulse(sourceX, sourceY, targetX, targetY, color = '#38bdf8') {
    this.pulses.push({
      sx: sourceX,
      sy: sourceY,
      tx: targetX,
      ty: targetY,
      progress: 0,
      speed: 0.03,
      color
    });
  }

  setBlackoutNodes(nodeIds) {
    this.blackoutNodes = new Set(nodeIds);
  }

  clearBlackout() {
    this.blackoutNodes.clear();
  }

  setHighlightNodes(nodeIds) {
    this.highlightNodes = new Set(nodeIds);
  }

  clearHighlights() {
    this.highlightNodes.clear();
  }

  update() {
    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update energy pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.progress += p.speed;
      if (p.progress >= 1.0) {
        this.pulses.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // 1. Draw Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3 * sw.alpha;
      ctx.globalAlpha = sw.alpha;
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(1, sw.radius - 8), 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * sw.alpha;
      ctx.globalAlpha = sw.alpha * 0.7;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Energy Pulses
    for (const p of this.pulses) {
      const curX = p.sx + (p.tx - p.sx) * p.progress;
      const curY = p.sy + (p.ty - p.sy) * p.progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }
}
