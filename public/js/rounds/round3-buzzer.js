/**
 * Round 3: Real-Time Multi-Team Buzzer Arena
 * Synchronized with Admin Host Console via WebSockets / HTTP Fallback
 * - Questions appear when Admin displays them
 * - Candidate has access ONLY to the Buzzer (no answers/choices displayed)
 * - Exact elapsed response time transmitted and ranked in real-time
 */

class Round3Buzzer {
  constructor(game) {
    this.game = game;
    this.state = 'IDLE'; // 'IDLE', 'ACTIVE', 'BUZZED'
    this.activeQuestion = null;
    this.activatedAt = 0;
    this.buzzRank = null;
    this.reactionTime = null;
    this.spaceListenerAttached = false;
    this.pollInterval = null;
  }

  start() {
    this.state = 'IDLE';
    this.activeQuestion = null;
    this.activatedAt = 0;
    this.buzzRank = null;
    this.reactionTime = null;

    this.attachKeyListeners();
    this.initSocketEvents();
    this.startStatePolling();
    this.render();
  }

  attachKeyListeners() {
    if (this.spaceListenerAttached) return;
    this.spaceListenerAttached = true;

    window.addEventListener('keydown', (e) => {
      if (this.game.currentRound !== 3) return;

      if (e.code === 'Space') {
        if (this.state === 'ACTIVE') {
          e.preventDefault();
          this.triggerBuzzer();
        }
      }
    });
  }

  initSocketEvents() {
    const socket = this.game.socket || (typeof io !== 'undefined' ? io({ transports: ['websocket'], upgrade: false, timeout: 10000 }) : null);
    if (!socket) return;
    this.game.socket = socket;

    socket.emit('team:join', { teamId: this.game.teamId });

    socket.off('buzzer:question_displayed');
    socket.off('buzzer:buzz_confirmed');
    socket.off('buzzer:cleared');

    // Admin displays question to all candidates
    socket.on('buzzer:question_displayed', (data) => {
      this.handleQuestionDisplayed(data);
    });

    // Confirmation of buzz position
    socket.on('buzzer:buzz_confirmed', (data) => {
      this.buzzRank = data.rank;
      this.reactionTime = data.reactionTime;
      this.render();
      if (window.soundEngine) window.soundEngine.playSuccess();
    });

    // Admin resets buzzer round
    socket.on('buzzer:cleared', () => {
      this.state = 'IDLE';
      this.activeQuestion = null;
      this.activatedAt = 0;
      this.buzzRank = null;
      this.reactionTime = null;
      this.render();
    });
  }

  startStatePolling() {
    clearInterval(this.pollInterval);
    // Poll server state every 1.5 seconds as fallback
    this.pollInterval = setInterval(async () => {
      if (this.game.currentRound !== 3) {
        clearInterval(this.pollInterval);
        return;
      }
      try {
        const res = await fetch('/api/buzzer/state');
        if (res.ok) {
          const data = await res.json();
          if (data.activeQuestion && (!this.activeQuestion || this.activeQuestion.activatedAt !== data.activeQuestion.activatedAt)) {
            this.handleQuestionDisplayed(data.activeQuestion);
          } else if (!data.activeQuestion && this.state !== 'IDLE') {
            this.state = 'IDLE';
            this.activeQuestion = null;
            this.buzzRank = null;
            this.reactionTime = null;
            this.render();
          }
        }
      } catch(e) {}
    }, 1500);
  }

  handleQuestionDisplayed(data) {
    if (!data) return;
    this.activeQuestion = data;
    this.activatedAt = data.activatedAt || Date.now();
    this.state = 'ACTIVE';
    this.buzzRank = null;
    this.reactionTime = null;
    this.render();

    if (window.soundEngine) {
      window.soundEngine.playClick(880);
    }
    if (window.armoryStore) {
      window.armoryStore.showFloatingHUDNotification("QUESTION BROADCASTED BY HOST!");
    }
  }

  async triggerBuzzer() {
    if (this.state !== 'ACTIVE') return;

    this.state = 'BUZZED';
    const now = Date.now();
    this.reactionTime = parseFloat(((now - this.activatedAt) / 1000).toFixed(3));
    this.buzzRank = 1; // provisional until confirmed

    if (window.soundEngine) {
      window.soundEngine.playBuzzer();
    }

    // 1. Socket emit
    if (this.game.socket) {
      this.game.socket.emit('team:buzz', { teamId: this.game.teamId });
    }

    // 2. HTTP POST fallback
    try {
      const res = await fetch('/api/buzzer/buzz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: this.game.teamId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rank) this.buzzRank = data.rank;
        if (data.reactionTime) this.reactionTime = data.reactionTime;
      }
    } catch(e) {}

    this.render();
  }

  render() {
    const container = document.getElementById('round-view-container');
    if (!container) return;

    const isActive = this.state === 'ACTIVE';
    const isBuzzed = this.state === 'BUZZED';
    const isIdle = this.state === 'IDLE';

    const categoryText = this.activeQuestion ? this.activeQuestion.category : 'TECHNICAL ROUND';
    const questionText = this.activeQuestion 
      ? this.activeQuestion.questionText 
      : 'WAITING FOR ADMIN HOST TO BROADCAST THE NEXT QUESTION...';

    container.innerHTML = `
      <div class="challenge-wrapper clean-challenge buzzer-round-theme glass-panel">
        <!-- Top Meta Bar -->
        <div class="challenge-topbar">
          <div class="topbar-left">
            <span class="cyber-badge category-badge">${this.escapeHTML(categoryText)}</span>
            <span class="cyber-badge step-badge">ROUND 3 // BUZZER SHOWDOWN</span>
          </div>
          <div class="topbar-right">
            <span class="cyber-badge status-live-badge ${isActive ? 'pulse-radar-dot' : ''}" style="border-color: ${isActive ? 'var(--neon-red)' : '#555566'}; color: ${isActive ? '#ffffff' : '#888899'};">
              ${isIdle ? 'STANDBY' : (isActive ? 'QUESTION LIVE' : 'BUZZ SUBMITTED')}
            </span>
            <span class="cyber-badge team-tag-badge text-neon-bright">${this.escapeHTML(this.game.teamId)}</span>
          </div>
        </div>

        <!-- Question Title (Shown when Admin broadcasts) -->
        <div class="buzzer-question-box ${isIdle ? 'idle-prompt' : ''}">
          <span class="q-label-tag">${isIdle ? 'STATUS' : 'QUESTION PROMPT'}</span>
          <h2 class="clean-challenge-title buzzer-prompt-text">${this.escapeHTML(questionText)}</h2>
        </div>

        <!-- The Physical Neon Arcade Buzzer Chamber -->
        <div class="buzzer-chamber">
          <div class="buzzer-ring">
            <button 
              id="master-buzzer-btn" 
              class="cyber-arcade-buzzer ${isActive ? 'buzzer-ready' : (isBuzzed ? 'buzzer-locked' : 'buzzer-idle')}" 
              onclick="window.game.round3.triggerBuzzer()"
              ${isActive ? '' : 'disabled'}
            >
              <div class="buzzer-core">
                <span class="buzzer-main-label">${isBuzzed ? 'BUZZED!' : (isActive ? 'BUZZ IN' : 'LOCKED')}</span>
                <span class="buzzer-hotkey-hint">${isBuzzed ? 'RECORDED' : (isActive ? '[SPACEBAR]' : 'WAIT FOR HOST')}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Real-Time Status Banner -->
        <div class="buzzer-status-card glass-panel">
          ${isIdle ? `
            <div class="status-icon">⏳</div>
            <div class="status-msg">
              <strong>STANDBY MODE:</strong> The buzzer will activate automatically the instant the Admin displays the question.
              <small style="display: block; margin-top: 4px; color: #888899;">Keep your hand ready over the <strong>[SPACEBAR]</strong>.</small>
            </div>
          ` : (isActive ? `
            <div class="status-icon neon-pulse">⚡</div>
            <div class="status-msg">
              <strong style="color: var(--neon-red);">QUESTION IS LIVE!</strong>
              <span>Hit <strong>[SPACEBAR]</strong> or tap the red button above as fast as possible to buzz in!</span>
            </div>
          ` : `
            <div class="status-icon">🏆</div>
            <div class="status-msg">
              <strong style="color: #00ff88;">BUZZ CONFIRMED!</strong>
              <div style="font-family: var(--font-mono); font-size: 1.05rem; margin-top: 4px;">
                REACTION TIME: <span style="color: #ffffff; font-weight: 800;">+${this.reactionTime || '0.000'}s</span>
                ${this.buzzRank ? ` • QUEUE POSITION: <span style="color: var(--neon-red); font-weight: 800;">#${this.buzzRank}</span>` : ''}
              </div>
              <small style="display: block; margin-top: 4px; color: #aaaabb;">Waiting for the Host to check your answer and award points.</small>
            </div>
          `)}
        </div>
      </div>
    `;

    this.game.updateRoundHUD("ROUND 3: BUZZER SHOWDOWN", `${this.game.teamId}`);
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

if (typeof window !== 'undefined') {
  window.Round3Buzzer = Round3Buzzer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Round3Buzzer;
}
