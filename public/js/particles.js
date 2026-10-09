/**
 * Ambient Cyber Particle Matrix
 * Renders drifting, glowing neon red nodes with delicate laser linkages
 */

class ParticleMatrix {
  constructor(canvasId = 'cyber-particles-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.twinkles = [];
    this.maxParticles = 80;
    this.connectionDistance = 120;
    this.mouse = { x: -1000, y: -1000, radius: 140 };

    this.init();
  }

  init() {
    this.applyStyles();
    this.setupTwinkleCanvas();
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  applyStyles() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0px';
    this.canvas.style.left = '0px';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    this.canvas.style.display = 'block';
  }

  setupTwinkleCanvas() {
    let canvas = document.getElementById('cyber-twinkle-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cyber-twinkle-canvas';
      document.body.appendChild(canvas);
    }
    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.display = 'block';

    this.twinkleCanvas = canvas;
    this.twinkleCtx = canvas.getContext('2d');
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    if (this.twinkleCanvas) {
      this.twinkleCanvas.width = window.innerWidth;
      this.twinkleCanvas.height = window.innerHeight;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Mouse click twinkle burst
    window.addEventListener('pointerdown', (e) => {
      this.spawnTwinkle(e.clientX, e.clientY);
    });
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(this.maxParticles, Math.floor((this.width * this.height) / 16000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = Date.now() * 0.002;

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move particle
      p.x += p.vx;
      p.y += p.vy;

      // Wrap boundaries smoothly
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse gentle repulsion
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius && dist > 0) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        p.x -= (dx / dist) * force * 1.5;
        p.y -= (dy / dist) * force * 1.5;
      }

      // Pulsing alpha
      const pulseAlpha = p.baseAlpha + Math.sin(now * p.pulseSpeed * 100 + p.pulseOffset) * 0.25;
      const clampedAlpha = Math.max(0.15, Math.min(0.9, pulseAlpha));

      // Draw particle with crimson glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 0, 60, ${clampedAlpha})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#ff003c';
      this.ctx.fill();

      // Connect nearby particles with subtle cyber lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const lineDx = p.x - p2.x;
        const lineDy = p.y - p2.y;
        const lineDist = Math.sqrt(lineDx * lineDx + lineDy * lineDy);

        if (lineDist < this.connectionDistance) {
          const lineAlpha = (1 - lineDist / this.connectionDistance) * 0.22;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(255, 0, 60, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
        }
      }
    }

    // Render and animate mouse click twinkles
    if (this.twinkleCtx) {
      this.twinkleCtx.clearRect(0, 0, this.width, this.height);
      const nowMs = Date.now();

      for (let i = this.twinkles.length - 1; i >= 0; i--) {
        const t = this.twinkles[i];

        if (t.type === 'star') {
          t.rotation += t.rotationSpeed;
          t.currentRadius += (t.maxRadius - t.currentRadius) * 0.16;
          t.alpha -= t.decay;

          const shimmer = t.alpha * (0.8 + 0.2 * Math.sin(nowMs * 0.035));
          this.drawTwinkleStar(
            this.twinkleCtx,
            t.x,
            t.y,
            4,
            t.currentRadius,
            t.currentRadius * 0.2,
            t.rotation,
            '#ffffff',
            '#ff003c',
            shimmer
          );
        } else if (t.type === 'spark') {
          t.x += t.vx;
          t.y += t.vy;
          t.vx *= t.friction;
          t.vy *= t.friction;
          t.rotation += t.rotationSpeed;
          t.alpha -= t.decay;
          t.life++;

          // Sinusoidal twinkle pulsation
          const twinkleAlpha = Math.max(0, t.alpha * (0.65 + 0.35 * Math.sin(t.life * 0.35)));

          this.drawTwinkleStar(
            this.twinkleCtx,
            t.x,
            t.y,
            4,
            t.size,
            t.size * 0.22,
            t.rotation,
            t.color,
            '#ff003c',
            twinkleAlpha
          );
        } else if (t.type === 'ripple') {
          t.radius += t.speed;
          t.alpha -= 0.04;
          if (t.alpha > 0) {
            this.drawRipple(this.twinkleCtx, t);
          }
        }

        if (t.alpha <= 0) {
          this.twinkles.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  spawnTwinkle(x, y) {
    if (window.soundEngine) {
      window.soundEngine.playTwinkle();
    }

    // 1. Central Diamond Star Flare
    this.twinkles.push({
      type: 'star',
      x,
      y,
      currentRadius: 3,
      maxRadius: 16,
      rotation: 0,
      rotationSpeed: 0.08,
      alpha: 1.0,
      decay: 0.045
    });

    // 2. Delicate expanding ripple shockwave
    this.twinkles.push({
      type: 'ripple',
      x,
      y,
      radius: 6,
      maxRadius: 36,
      speed: 2.2,
      alpha: 0.85
    });

    // 3. Burst of twinkling 4-point sparkle stars
    const sparkCount = 14 + Math.floor(Math.random() * 5); // 14 to 18 sparks
    const colors = ['#ffffff', '#ff003c', '#ff2a5f', '#ffffff'];

    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.45;
      const speed = Math.random() * 3.4 + 1.2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.twinkles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        friction: 0.93,
        size: Math.random() * 4.5 + 2.5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        alpha: 1.0,
        decay: Math.random() * 0.024 + 0.018,
        twinkleRate: Math.random() * 15 + 10,
        life: Math.random() * 10,
        color
      });
    }
  }

  drawTwinkleStar(ctx, cx, cy, spikes, outerRadius, innerRadius, rotation, color, glowColor, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.beginPath();
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(0, -outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = Math.cos(rot) * outerRadius;
      let y = Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(0, -outerRadius);
    ctx.closePath();

    ctx.shadowBlur = 12;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();
    ctx.restore();
  }

  drawRipple(ctx, ripple) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 0, 60, ${Math.max(0, ripple.alpha)})`;
    ctx.lineWidth = 1.6;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff003c';
    ctx.stroke();
    ctx.restore();
  }
}

// Auto-initialize when canvas is available
function initParticleMatrix() {
  if (!window.particleMatrix && document.getElementById('cyber-particles-canvas')) {
    window.particleMatrix = new ParticleMatrix('cyber-particles-canvas');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParticleMatrix);
} else {
  initParticleMatrix();
}
