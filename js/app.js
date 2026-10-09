/**
 * MINDMIND Cyber Arena: Master Game Controller & State Machine
 */

class MindmindGame {
  constructor() {
    this.score = 0;
    this.currentRound = 0; // 0: Landing, 1: Visuals, 2: Bugs, 3: Buzzer, 4: Victory
    this.teamId = localStorage.getItem('mindmind_team_id') || 'TM-101';
    this.playerName = localStorage.getItem('mindmind_player') || 'CYBER_OPERATOR';
    this.questionSet = localStorage.getItem('mindmind_question_set') || 'set1';

    this.round1 = new Round1Visual(this);
    this.round2 = new Round2Bugs(this);
    this.round3 = new Round3Buzzer(this);

    this.init();
  }

  init() {
    try {
      localStorage.removeItem('mindmind_active_session');
    } catch (e) {}

    // Populate stored team ID & player name if available
    const teamInput = document.getElementById('team-id-input');
    if (teamInput) {
      teamInput.value = this.teamId;
      teamInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.startArena();
        }
      });
    }

    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = this.playerName;
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.startArena();
        }
      });
    }

    // Question Set selector & description synchronization
    const setSelect = document.getElementById('question-set-select');
    const setDescEl = document.getElementById('active-set-description');
    const storedSet = localStorage.getItem('mindmind_question_set') || 'set1';

    const updateSetDescription = (setId) => {
      if (!setDescEl || typeof window.getAvailableQuestionSets !== 'function') return;
      const sets = window.getAvailableQuestionSets();
      const match = sets.find(s => s.id === setId);
      if (match) {
        setDescEl.textContent = match.description;
      }
    };

    if (setSelect) {
      setSelect.value = storedSet;
      updateSetDescription(storedSet);
      setSelect.addEventListener('change', (e) => {
        const newSet = e.target.value;
        this.questionSet = newSet;
        if (typeof window.setActiveQuestionSet === 'function') {
          window.setActiveQuestionSet(newSet);
        }
        updateSetDescription(newSet);
        if (window.soundEngine) window.soundEngine.playClick(440);
      });
    }

    if (typeof window.setActiveQuestionSet === 'function') {
      window.setActiveQuestionSet(storedSet);
    }

    // Attach Sound and HUD event listeners
    this.wireGlobalEvents();
    this.updateScoreHUD();
    if (window.armoryStore) window.armoryStore.updateHUD();

    // Check mute setting
    const soundToggle = document.getElementById('sound-toggle-btn');
    if (soundToggle && window.soundEngine) {
      soundToggle.textContent = window.soundEngine.isMuted() ? 'MUTED' : 'SOUND: ON';
    }
  }

  wireGlobalEvents() {
    // Sound Toggle
    const soundToggle = document.getElementById('sound-toggle-btn');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        if (window.soundEngine) {
          window.soundEngine.init();
          const isMuted = window.soundEngine.toggleMute();
          soundToggle.textContent = isMuted ? 'MUTED' : 'SOUND: ON';
          if (!isMuted) {
            window.soundEngine.playClick(220);
            if (window.armoryStore) window.armoryStore.showFloatingCreditNotification("Audio Unmuted");
          } else {
            if (window.armoryStore) window.armoryStore.showFloatingCreditNotification("Audio Muted");
          }
        }
      });
    }


    // Armory Store Button in HUD
    const storeBtn = document.getElementById('hud-store-btn');
    if (storeBtn) {
      storeBtn.addEventListener('click', () => {
        this.openArmoryModal();
      });
    }

    // Powerup in-game triggers
    document.querySelectorAll('.perk-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const perkId = btn.getAttribute('data-perk');
        this.activatePerk(perkId);
      });
    });

    // Close Modals on ESC or overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.add('hidden');
      });
    });

    // Start Arena Button
    const startBtn = document.getElementById('btn-start-run');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startArena();
      });
    }

    // Tactile sound effect on any interactive button click
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .hud-btn, .neon-btn, .close-modal-btn');
      if (btn && window.soundEngine && !btn.classList.contains('cyber-arcade-buzzer')) {
        window.soundEngine.playClick(900);
      }
    });

    // First user gesture initializes audio context smoothly
    window.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.init();
    }, { once: true });

    // Accidental refresh / tab-close protection during active competition rounds
    window.addEventListener('beforeunload', (e) => {
      if (this.currentRound >= 1 && this.currentRound <= 3) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });
  }

  setPlayerName(name) {
    this.playerName = name.trim() || 'CYBER_OPERATOR';
    localStorage.setItem('mindmind_player', this.playerName);
  }

  initSocket() {
    if (typeof io !== 'undefined') {
      try {
        this.socket = io();
        this.socket.on('connect', () => {
          this.socket.emit('team:join', { teamId: this.teamId });
        });
        this.socket.on('score:updated', (data) => {
          if (data && data.teamId === this.teamId && typeof data.score === 'number') {
            this.score = data.score;
            this.updateScoreHUD();
          }
        });
      } catch (e) {
        console.warn('Socket client error:', e);
      }
    }
  }

  async startArena() {
    if (this.currentRound !== 0) return;

    const teamInput = document.getElementById('team-id-input');
    if (teamInput && teamInput.value.trim()) {
      this.teamId = teamInput.value.trim().toUpperCase();
      localStorage.setItem('mindmind_team_id', this.teamId);
    } else {
      this.teamId = 'TEAM_' + Math.floor(100 + Math.random() * 900);
      localStorage.setItem('mindmind_team_id', this.teamId);
    }

    const input = document.getElementById('player-name-input');
    if (input && input.value) {
      this.setPlayerName(input.value);
    }

    // Capture & lock in active question set
    const setSelect = document.getElementById('question-set-select');
    const activeSetId = (setSelect && setSelect.value) ? setSelect.value : (localStorage.getItem('mindmind_question_set') || 'set1');
    if (typeof window.setActiveQuestionSet === 'function') {
      window.setActiveQuestionSet(activeSetId);
    }
    this.questionSet = activeSetId;

    if (window.soundEngine) {
      window.soundEngine.playClick(240);
    }

    // Register / login team in MongoDB
    try {
      const res = await fetch('/api/teams/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: this.teamId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.team && typeof data.team.score === 'number') {
          this.score = data.team.score;
        }
      }
    } catch(e) {}

    this.initSocket();
    this.updateScoreHUD();

    this.switchToView('round-view');
    this.currentRound = 1;
    this.round1.start();
  }

  addScore(points) {
    this.score += points;
    this.animateScoreChange(`+${points}`);
    this.updateScoreHUD();
    this.syncScoreWithServer(points);
    this.pushLiveScoreTelemetry();
  }

  deductScore(points) {
    this.score = Math.max(0, this.score - points);
    this.animateScoreChange(`-${points}`, true);
    this.updateScoreHUD();
    this.syncScoreWithServer(-points);
    this.pushLiveScoreTelemetry();
  }

  async syncScoreWithServer(pointsDelta) {
    try {
      await fetch('/api/scores/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: this.teamId, points: pointsDelta })
      });
    } catch (e) {
      // Local fallback
    }
  }

  animateScoreChange(text, isNegative = false) {
    const badge = document.getElementById('score-anim-badge');
    if (!badge) return;

    badge.textContent = text;
    badge.className = `score-anim-badge ${isNegative ? 'anim-down' : 'anim-up'}`;
    setTimeout(() => {
      badge.className = 'score-anim-badge hidden';
    }, 1200);
  }

  updateScoreHUD() {
    const scoreEls = document.querySelectorAll('.cyber-score-val');
    scoreEls.forEach(el => el.textContent = this.score.toLocaleString());
  }

  updateRoundHUD(roundTitle, progressStr) {
    const titleEl = document.getElementById('hud-round-title');
    const progEl = document.getElementById('hud-round-progress');

    const setTag = this.questionSet ? ` [${this.questionSet.toUpperCase()}]` : '';
    if (titleEl) titleEl.textContent = `${roundTitle}${setTag}`;
    if (progEl) progEl.textContent = progressStr;
  }

  // Tactical Perk In-Game Activation
  activatePerk(perkId) {
    if (!window.armoryStore.hasPerk(perkId)) {
      if (window.armoryStore) window.armoryStore.showFloatingHUDNotification("Lifeline already used for this question");
      if (window.soundEngine) window.soundEngine.playError();
      return;
    }

    const consumed = window.armoryStore.consumePerk(perkId);
    if (!consumed) return;

    // Apply perk to active round
    if (this.currentRound === 1) {
      if (perkId === 'chrono_stasis') this.round1.applyFreeze();
      if (perkId === 'data_purge') this.round1.apply5050();
      if (perkId === 'cyber_lens') this.round1.applyHint();
    } else if (this.currentRound === 2) {
      if (perkId === 'chrono_stasis') this.round2.applyFreeze();
      if (perkId === 'data_purge') this.round2.apply5050();
      if (perkId === 'cyber_lens') this.round2.applyHint();
    } else if (this.currentRound === 3) {
      if (perkId === 'chrono_stasis') this.round3.applyFreeze();
      if (perkId === 'data_purge') this.round3.apply5050();
      if (perkId === 'cyber_lens') this.round3.applyHint();
    }

    window.armoryStore.updateHUD();
  }

  showRoundCompletionModal(roundNum) {
    if (window.soundEngine) window.soundEngine.playSuccess();

    const modal = document.getElementById('intermission-modal');
    if (!modal) return;

    const roundName = roundNum === 1 ? "ROUND 1: VISUAL DECODING" : "ROUND 2: SPOT THE ERRORS";
    const nextRoundName = roundNum === 1 ? "STAGE 2: SPOT THE ERRORS" : "STAGE 3: BUZZER FINISH";
    const nextRoundSub = roundNum === 1 
      ? "Prepare for live code inspection to hunt and patch syntax traps!"
      : "High stakes! Rapid reflexes required in the lightning buzzer showdown!";

    document.getElementById('intermission-round-tag').textContent = `STAGE ${roundNum} COMPLETE`;
    document.getElementById('intermission-headline').textContent = `${roundName} CONQUERED!`;
    document.getElementById('intermission-next-title').textContent = nextRoundName;
    document.getElementById('intermission-next-desc').textContent = nextRoundSub;
    document.getElementById('intermission-proceed-btn').onclick = () => this.proceedToNextRound(roundNum + 1);

    // Real-time mid-stage telemetry sync across all teams
    const midRecord = {
      teamId: this.teamId,
      teamName: this.playerName,
      score: this.score,
      questionSet: (this.questionSet || 'set1').toUpperCase(),
      rank: `STAGE ${roundNum} CLEAR`,
      stagesCleared: roundNum,
      timestamp: new Date().toISOString()
    };
    this.saveTeamScore(midRecord);
    this.syncScoreWithBackend(midRecord);

    modal.classList.remove('hidden');
  }

  proceedToNextRound(nextRoundNum) {
    const modal = document.getElementById('intermission-modal');
    if (modal) modal.classList.add('hidden');

    this.currentRound = nextRoundNum;

    if (nextRoundNum === 2) {
      this.switchToView('round-view');
      this.round2.start();
    } else if (nextRoundNum === 3) {
      this.switchToView('round-view');
      this.round3.start();
    }
  }

  showGameFinishScreen() {
    if (window.soundEngine) window.soundEngine.playSuccess();

    this.currentRound = 4;
    this.switchToView('victory-view');

    // Calculate Cyber Rank
    let rank = "CADET";
    if (this.score >= 2000) {
      rank = "SUPREME ARCHITECT";
    } else if (this.score >= 1400) {
      rank = "ELITE SPECIALIST";
    } else if (this.score >= 800) {
      rank = "SYSTEM OPERATIVE";
    }

    // Structured Record for MongoDB / Mongoose queries
    const scoreRecord = {
      teamId: this.teamId,
      teamName: this.playerName,
      score: this.score,
      questionSet: (this.questionSet || 'set1').toUpperCase(),
      rank: rank,
      stagesCleared: 3,
      timestamp: new Date().toISOString()
    };

    // Save into localStorage team database
    this.saveTeamScore(scoreRecord);

    // Attempt background sync to friend's MongoDB API if running
    this.syncScoreWithBackend(scoreRecord);

    // Update Victory View DOM
    const teamIdEl = document.getElementById('final-team-id');
    if (teamIdEl) teamIdEl.textContent = this.teamId;

    const playerNameEl = document.getElementById('final-player-name');
    if (playerNameEl) playerNameEl.textContent = this.playerName;

    const scoreDisplayEl = document.getElementById('final-score-display');
    if (scoreDisplayEl) scoreDisplayEl.textContent = this.score.toLocaleString();

    const speedRatingEl = document.getElementById('final-speed-rating');
    if (speedRatingEl) speedRatingEl.textContent = this.score >= 1500 ? "HYPERSONIC" : (this.score >= 800 ? "RAPID" : "TACTICAL");

    const rankTagEl = document.getElementById('final-rank-tag');
    if (rankTagEl) rankTagEl.textContent = rank;
  }

  saveTeamScore(record) {
    let scores = [];
    try {
      scores = JSON.parse(localStorage.getItem('mindmind_team_scores') || '[]');
    } catch(e) { scores = []; }

    const existingIndex = scores.findIndex(s => s.teamId && s.teamId.toUpperCase() === record.teamId.toUpperCase());
    if (existingIndex >= 0) {
      scores[existingIndex] = record;
    } else {
      scores.push(record);
    }

    localStorage.setItem('mindmind_team_scores', JSON.stringify(scores));
    localStorage.setItem('mindmind_last_team_score', JSON.stringify(record));
  }

  async syncScoreWithBackend(record) {
    try {
      // 1. BroadcastChannel for instant zero-latency multi-tab sync
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        if (!this.telemetryChannel) {
          this.telemetryChannel = new BroadcastChannel('mindmind_arena_telemetry');
        }
        this.telemetryChannel.postMessage({ type: 'ARENA_SCORE_UPDATE', record });
      }

      // 2. Network sync to server
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        console.log('Scores synchronized:', await res.json());
      }
    } catch(e) {
      // Standalone mode / local-first storage
      console.log('Stored locally.');
    }
  }

  pushLiveScoreTelemetry() {
    if (!this.teamId) return;
    const liveRecord = {
      teamId: this.teamId,
      teamName: this.playerName || 'CYBER_OPERATOR',
      score: this.score,
      rank: `STAGE ${this.currentRound || 1} IN PROGRESS`,
      stagesCleared: Math.max(0, (this.currentRound || 1) - 1),
      timestamp: new Date().toISOString()
    };
    this.saveTeamScore(liveRecord);
    this.syncScoreWithBackend(liveRecord);
  }

  copyMongooseDoc() {
    let lastRecord = null;
    try {
      lastRecord = JSON.parse(localStorage.getItem('mindmind_last_team_score'));
    } catch(e) {}

    if (!lastRecord) {
      lastRecord = {
        teamId: this.teamId,
        teamName: this.playerName,
        score: this.score,
        rank: "CYBER ARCHITECT",
        timestamp: new Date().toISOString()
      };
    }

    const formatted = JSON.stringify(lastRecord, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formatted).then(() => {
        if (window.armoryStore) window.armoryStore.showFloatingCreditNotification("Copied team record to clipboard");
      });
    } else {
      if (window.armoryStore) window.armoryStore.showFloatingCreditNotification("Team record ready");
    }
  }

  exportScoresJSON() {
    const raw = localStorage.getItem('mindmind_team_scores') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmind_team_scores_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.armoryStore) window.armoryStore.showFloatingCreditNotification("Exported mindmind_team_scores.json");
  }

  openLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    if (!modal) return;
    this.renderLeaderboardTable();
    modal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  async renderLeaderboardTable(filterQuery = '') {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    let scores = [];

    // 1. Query central backend server for real-time scores across all teams
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          scores = data.leaderboard;
        }
      }
    } catch (e) {
      // Standalone mode / server not reachable
    }

    // 2. Fallback to localStorage if no scores returned from API
    if (scores.length === 0) {
      try {
        scores = JSON.parse(localStorage.getItem('mindmind_team_scores') || '[]');
      } catch (e) { scores = []; }
    }

    scores.sort((a, b) => (b.score || 0) - (a.score || 0));

    if (filterQuery && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      scores = scores.filter(s => 
        (s.teamId && s.teamId.toLowerCase().includes(q)) || 
        (s.teamName && s.teamName.toLowerCase().includes(q))
      );
    }

    if (scores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4" style="color: #888; text-align: center; padding: 24px;">No team scores recorded yet. Complete an arena run to record scores!</td></tr>`;
      return;
    }

    tbody.innerHTML = scores.map((s, idx) => `
      <tr>
        <td style="text-align: center;"><strong>#${idx + 1}</strong></td>
        <td><span class="cyber-badge" style="color: #ff003c; border-color: #ff003c; font-weight: bold;">${this.escapeHTML(s.teamId || 'N/A')}</span></td>
        <td><strong>${this.escapeHTML(s.teamName || 'Unknown Team')}</strong></td>
        <td><span style="color: #ffffff; font-weight: bold; font-family: var(--font-display);">${(s.score || 0).toLocaleString()} PTS</span></td>
        <td><span class="cyber-badge" style="font-size: 0.65rem;">${s.rank || 'CADET'}</span></td>
        <td style="font-size: 0.72rem; color: #888; font-family: var(--font-mono);">${s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : 'Recent'}</td>
      </tr>
    `).join('');
  }

  filterTeamScores(query) {
    this.renderLeaderboardTable(query);
  }

  clearStoredScores() {
    if (confirm("Are you sure you want to clear all locally stored team scores?")) {
      localStorage.removeItem('mindmind_team_scores');
      localStorage.removeItem('mindmind_last_team_score');
      this.renderLeaderboardTable();
      if (window.armoryStore) window.armoryStore.showFloatingHUDNotification("Cleared local scores database.");
    }
  }

  escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  restartArena() {
    this.currentRound = 0;
    this.score = 0;
    this.updateScoreHUD();
    this.switchToView('welcome-view');
  }

  openArmoryModal() {
    // Store removed
  }

  openCodexModal() {
    // Codex removed
  }

  switchCodexTab(tabKey) {
    document.querySelectorAll('.codex-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    });

    const data = CHEAT_SHEETS[tabKey];
    const body = document.getElementById('codex-doc-content');
    if (body && data) {
      body.innerHTML = `
        <h3 class="codex-title">${data.title}</h3>
        <div class="codex-markdown">${this.parseSimpleMarkdown(data.content)}</div>
      `;
    }
  }

  parseSimpleMarkdown(md) {
    return md
      .replace(/### (.*)/g, '<h4 class="codex-subheading">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-cyber-code">$1</code>')
      .replace(/- (.*)/g, '<li class="codex-li">$1</li>')
      .replace(/\n\n/g, '<br/>');
  }

  switchToView(viewId) {
    ['welcome-view', 'round-view', 'victory-view'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', id !== viewId);
    });
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

if (typeof window !== 'undefined') {
  window.MindmindGame = MindmindGame;

  function initMindmind() {
    if (!window.game) {
      window.game = new MindmindGame();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMindmind);
  } else {
    initMindmind();
  }
}
