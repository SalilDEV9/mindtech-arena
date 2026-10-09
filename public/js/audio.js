/**
 * Cyberpunk Procedural Audio Engine - Subtle Vibrating Haptic Edition
 * Tight, subtle, refined low-frequency haptic vibrations
 * Zero long droning, zero loud obnoxious blasts, zero cringe
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      localStorage.removeItem('mindmind_muted');
    } catch (e) {}
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  init() {
    this.getAudioContext();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(val) {
    this.muted = !!val;
  }

  // 1. Subtle, crisp micro-vibration haptic tap for mouse clicks (~50ms)
  playTwinkle() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Clean haptic tap: subtle pitch slide (150Hz -> 75Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.045);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.045);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // 2. Snappy, tight mechanical switch click (~45ms)
  playClick(freq = 180) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.038);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.038);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.048);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.052);
    } catch (e) {}
  }

  // 3. Sleek, refined vibrating two-tone harmonic swell for correct answers (~160ms)
  playSuccess() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Two warm vibrating tones (A3: 220Hz -> E4: 330Hz)
      const freqs = [220, 330];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.065;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.12);
        gain.gain.linearRampToValueAtTime(0.0, startTime + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch (e) {}
  }

  // 4. Subtle, tight dual-pulse vibration for wrong answers (~150ms)
  playError() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.12);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // 5. Punchy, controlled arcade buzzer (~180ms)
  playBuzzer() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      // Tight 6Hz detuned buzz at 110Hz
      osc1.frequency.setValueAtTime(110, now);
      osc2.frequency.setValueAtTime(116, now);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.30, now + 0.02);
      gain.gain.setValueAtTime(0.30, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.17);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.19);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.20);
      osc2.stop(now + 0.20);
    } catch (e) {}
  }

  // 6. Subtle, quiet radar heartbeat tick (~35ms)
  playTick(urgent = false) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(urgent ? 220 : 130, now);

      gain.gain.setValueAtTime(urgent ? 0.20 : 0.12, now);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 7. Subtle credit pick-up chime (~120ms)
  playCredit() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.09);

      gain.gain.setValueAtTime(0.20, now);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 8. Subtle perk activation whoosh (~150ms)
  playPowerup() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(360, now + 0.13);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0.0, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }
}

// Global Sound Engine Singleton
window.soundEngine = new SoundEngine();

// Persistent unlock on user gesture
function unlockAllAudio() {
  if (window.soundEngine) {
    const ctx = window.soundEngine.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }
}

['click', 'pointerdown', 'keydown', 'touchstart'].forEach(type => {
  window.addEventListener(type, unlockAllAudio, { capture: true });
});
