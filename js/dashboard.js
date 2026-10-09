/**
 * MINDMIND Spectator Dashboard Engine
 * Clean & Minimalist Real-Time Leaderboard & Buzzer Controller
 */

class ArenaDashboard {
  constructor() {
    this.scores = [];
    this.filteredScores = [];
    this.searchQuery = '';
    this.autoRefresh = true;
    this.pollIntervalMs = 2500;
    this.pollTimer = null;
    this.lastSyncTime = Date.now();
    this.soundEnabled = true;
    this.previousLeader = null;
    this.audioCtx = null;
    this.isAuthenticated = sessionStorage.getItem('mindmind_dash_authenticated') === 'true';

    // Buzzer Round State
    this.currentQuestionSet = 'set1';
    this.currentQuestionIndex = 0;
    this.activeBuzzerQueue = [];
    this.socket = null;
    this.isQuizStarted = false;

    this.initAudio();
    this.initAuth();
    this.initBroadcastChannel();
    this.initQuizGatekeeper();
    this.initBuzzerControls();
    this.bindEvents();

    if (this.isAuthenticated) {
      this.initSocket();
      this.startPolling();
    }
    this.updateLastSyncTimer();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  playBeep(freq = 600, duration = 0.15) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch(e) {}
  }

  initAuth() {
    const overlay = document.getElementById('dash-auth-overlay');
    const container = document.getElementById('dashboard-main-container');
    const form = document.getElementById('dash-auth-form');
    const passInput = document.getElementById('dash-login-pass');
    const errorBox = document.getElementById('dash-auth-error');
    const modal = document.querySelector('.dash-auth-modal');
    const logoutBtn = document.getElementById('dash-logout-btn');

    const setAuthState = (authenticated) => {
      this.isAuthenticated = authenticated;
      if (authenticated) {
        sessionStorage.setItem('mindmind_dash_authenticated', 'true');
        if (overlay) overlay.classList.add('hidden');
        if (container) container.classList.remove('locked');
        if (errorBox) {
          errorBox.classList.add('hidden');
          errorBox.textContent = '';
        }
        if (passInput) passInput.classList.remove('input-error');
      } else {
        sessionStorage.removeItem('mindmind_dash_authenticated');
        if (overlay) overlay.classList.remove('hidden');
        if (container) container.classList.add('locked');
        if (passInput) passInput.value = '';
        setTimeout(() => { if (passInput) passInput.focus(); }, 120);
      }
    };

    // Initialize display state based on current session
    setAuthState(this.isAuthenticated);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = (passInput ? passInput.value : '').trim();

        let authSuccess = false;
        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) authSuccess = true;
          }
        } catch(err) {
          // Login fails closed if the server is unavailable
          /* Client-side bypass disabled: only the backend validates admin login. */
        }

        // Never grant access based on a password stored in browser code
        /* Client-side bypass disabled: only the backend validates admin login. */

        if (authSuccess) {
          setAuthState(true);
          this.playBeep(880, 0.15);
          this.showToast('ADMIN ACCESS GRANTED');
          this.initSocket();
          this.startPolling();
          this.fetchScores(true);
        } else {
          if (errorBox) {
            errorBox.textContent = 'ACCESS DENIED: INVALID ADMIN PASSWORD';
            errorBox.classList.remove('hidden');
          }
          if (passInput) {
            passInput.classList.add('input-error');
            passInput.value = '';
            passInput.focus();
          }
          if (modal) {
            modal.classList.remove('shake');
            void modal.offsetWidth;
            modal.classList.add('shake');
          }
          this.playBeep(220, 0.25);
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.stopPolling();
        setAuthState(false);
        this.showToast('SESSION TERMINATED');
      });
    }
  }

  initSocket() {
    if (typeof io !== 'undefined') {
      try {
        this.socket = io({ transports: ['websocket'], upgrade: false, timeout: 10000 });
        const syncStatusEl = document.getElementById('buzzer-sync-status');

        this.socket.on('connect', () => {
          if (syncStatusEl) {
            syncStatusEl.textContent = 'SOCKET: LIVE';
            syncStatusEl.style.color = '#00ff88';
            syncStatusEl.style.borderColor = 'rgba(0, 255, 136, 0.4)';
          }
          this.socket.emit('admin:join');
        });

        this.socket.on('disconnect', () => {
          if (syncStatusEl) {
            syncStatusEl.textContent = 'SOCKET: DISCONNECTED';
            syncStatusEl.style.color = '#ffaa00';
            syncStatusEl.style.borderColor = 'rgba(255, 170, 0, 0.4)';
          }
        });

        this.socket.on('admin:buzzer_queue_update', (queue) => {
          this.renderBuzzerQueue(queue);
          if (queue && queue.length > 0) {
            this.playBeep(750, 0.08);
          }
        });

        this.socket.on('quiz:status', (data) => {
          if (data && typeof data.quizStarted === 'boolean') {
            this.updateQuizStatusUI(data.quizStarted);
          }
        });

        this.socket.on('score:updated', () => {
          this.fetchScores();
        });
      } catch (e) {
        console.warn('Socket initialization error:', e);
      }
    }
  }

  initQuizGatekeeper() {
    const toggleBtn = document.getElementById('btn-toggle-quiz');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', async () => {
        const nextState = !this.isQuizStarted;
        if (nextState) {
          // The HTTP action below broadcasts the change.
          try {
            await fetch('/api/quiz/start', { method: 'POST' });
          } catch(e) {}
          this.updateQuizStatusUI(true);
          this.playBeep(980, 0.25);
          this.showToast('🚀 QUIZ LAUNCHED! TEAMS CAN NOW ENTER');
        } else {
          // The HTTP action below broadcasts the change.
          try {
            await fetch('/api/quiz/stop', { method: 'POST' });
          } catch(e) {}
          this.updateQuizStatusUI(false);
          this.playBeep(350, 0.2);
          this.showToast('⏸️ QUIZ LOCKED / PAUSED');
        }
      });
    }

    // Initial status check
    fetch('/api/quiz/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.quizStarted === 'boolean') {
          this.updateQuizStatusUI(data.quizStarted);
        }
      })
      .catch(() => {});
  }

  updateQuizStatusUI(isStarted) {
    this.isQuizStarted = !!isStarted;
    const badge = document.getElementById('quiz-status-badge');
    const dot = document.getElementById('quiz-live-dot');
    const btn = document.getElementById('btn-toggle-quiz');

    if (this.isQuizStarted) {
      if (badge) {
        badge.textContent = 'QUIZ IS LIVE (UNLOCKED)';
        badge.style.borderColor = '#00ff88';
        badge.style.color = '#00ff88';
      }
      if (dot) dot.style.background = '#00ff88';
      if (btn) {
        btn.innerHTML = '<span>⏸️ PAUSE / LOCK QUIZ</span>';
        btn.style.background = '#333344';
      }
    } else {
      if (badge) {
        badge.textContent = 'QUIZ LOCKED (NOT STARTED)';
        badge.style.borderColor = '#ff003c';
        badge.style.color = '#ff003c';
      }
      if (dot) dot.style.background = '#ff003c';
      if (btn) {
        btn.innerHTML = '<span>🚀 START QUIZ</span>';
        btn.style.background = '#ff003c';
      }
    }
  }

  initBuzzerControls() {
    const setSelect = document.getElementById('admin-set-select');
    const qSelect = document.getElementById('admin-q-select');
    const broadcastBtn = document.getElementById('btn-broadcast-question');
    const toggleAnswerBtn = document.getElementById('btn-toggle-answer');
    const clearBuzzerBtn = document.getElementById('btn-clear-buzzer');

    // Populate Question # dropdown dynamically
    const populateQuestionDropdown = () => {
      if (!qSelect) return;
      qSelect.innerHTML = '';
      const sets = (typeof window !== 'undefined' && window.QUESTION_SETS) ? window.QUESTION_SETS : {};
      const activeSet = sets[this.currentQuestionSet] || window.QUESTION_SET_1 || null;
      const count = (activeSet && Array.isArray(activeSet.round3)) ? activeSet.round3.length : 16;
      for (let i = 0; i < count; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Question ${i + 1}`;
        if (i === this.currentQuestionIndex) opt.selected = true;
        qSelect.appendChild(opt);
      }
    };
    populateQuestionDropdown();

    if (setSelect) {
      setSelect.addEventListener('change', (e) => {
        this.currentQuestionSet = e.target.value;
        this.currentQuestionIndex = 0;
        populateQuestionDropdown();
        this.updateQuestionPreview();
      });
    }

    if (qSelect) {
      qSelect.addEventListener('change', (e) => {
        this.currentQuestionIndex = parseInt(e.target.value, 10) || 0;
        this.updateQuestionPreview();
      });
    }

    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', () => {
        this.broadcastCurrentQuestion();
      });
    }

    if (toggleAnswerBtn) {
      toggleAnswerBtn.addEventListener('click', () => {
        this.toggleSecretAnswer();
      });
    }

    if (clearBuzzerBtn) {
      clearBuzzerBtn.addEventListener('click', () => {
        this.clearBuzzerRound();
      });
    }

    // Initial preview load
    setTimeout(() => {
      this.updateQuestionPreview();
    }, 100);
  }

  getCurrentQuestionData() {
    const sets = (typeof window !== 'undefined' && window.QUESTION_SETS) ? window.QUESTION_SETS : {};
    const activeSet = sets[this.currentQuestionSet] || window.QUESTION_SET_1 || null;
    if (activeSet && Array.isArray(activeSet.round3) && activeSet.round3[this.currentQuestionIndex]) {
      return activeSet.round3[this.currentQuestionIndex];
    }
    return {
      category: 'TECHNICAL',
      question: 'Question data loading or unavailable.',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'No explanation.'
    };
  }

  updateQuestionPreview() {
    const q = this.getCurrentQuestionData();
    const catEl = document.getElementById('admin-q-category');
    const numEl = document.getElementById('admin-q-num');
    const textEl = document.getElementById('admin-q-text');
    const ansEl = document.getElementById('admin-correct-answer');
    const expEl = document.getElementById('admin-answer-explanation');
    const vaultEl = document.getElementById('admin-answer-vault');
    const toggleBtn = document.getElementById('btn-toggle-answer');
    const statusBadge = document.getElementById('admin-q-status-badge');

    const sets = (typeof window !== 'undefined' && window.QUESTION_SETS) ? window.QUESTION_SETS : {};
    const activeSet = sets[this.currentQuestionSet] || window.QUESTION_SET_1 || null;
    const totalQ = (activeSet && Array.isArray(activeSet.round3)) ? activeSet.round3.length : 16;
    if (numEl) numEl.textContent = `QUESTION ${this.currentQuestionIndex + 1} / ${totalQ}`;
    if (textEl) textEl.textContent = q.question;

    const answerStr = q.options ? `${q.options[q.correctIndex]}` : (q.answer || 'Correct Answer');
    if (ansEl) ansEl.textContent = answerStr;
    if (expEl) expEl.textContent = q.explanation || 'No extra explanation required.';

    // Hide secret answer by default
    if (vaultEl) vaultEl.classList.add('hidden');
    if (toggleBtn) toggleBtn.innerHTML = '<span>👁️ SHOW ANSWER</span>';
    if (statusBadge) {
      statusBadge.textContent = 'READY TO BROADCAST';
      statusBadge.style.color = '#ffffff';
    }
  }

  toggleSecretAnswer() {
    const vaultEl = document.getElementById('admin-answer-vault');
    const toggleBtn = document.getElementById('btn-toggle-answer');
    if (!vaultEl || !toggleBtn) return;

    const isHidden = vaultEl.classList.contains('hidden');
    if (isHidden) {
      vaultEl.classList.remove('hidden');
      toggleBtn.innerHTML = '<span>🙈 HIDE ANSWER</span>';
      this.playBeep(900, 0.1);
    } else {
      vaultEl.classList.add('hidden');
      toggleBtn.innerHTML = '<span>👁️ SHOW ANSWER</span>';
      this.playBeep(450, 0.1);
    }
  }

  async broadcastCurrentQuestion() {
    const q = this.getCurrentQuestionData();
    const payload = {
      questionIndex: this.currentQuestionIndex,
      questionText: q.question,
      category: q.category
    };

    // 1. Socket.io broadcast (instant)
    // One HTTP action only: prevent duplicated changes from Socket.IO + HTTP.

    // 2. HTTP API fallback
    try {
      await fetch('/api/buzzer/display', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch(e) {}

    // Update status
    const statusBadge = document.getElementById('admin-q-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'ACTIVE // BUZZERS LIVE';
      statusBadge.style.color = 'var(--neon-red)';
    }

    this.renderBuzzerQueue([]);
    this.playBeep(980, 0.2);
    this.showToast('QUESTION BROADCASTED TO CANDIDATES');
  }

  async clearBuzzerRound() {
    // One HTTP action only: prevent duplicated changes from Socket.IO + HTTP.
    try {
      await fetch('/api/buzzer/clear', { method: 'POST' });
    } catch(e) {}

    const statusBadge = document.getElementById('admin-q-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'CLEARED // WAITING';
      statusBadge.style.color = '#888899';
    }

    this.renderBuzzerQueue([]);
    this.playBeep(400, 0.15);
    this.showToast('Buzzer round cleared');
  }

  renderBuzzerQueue(queue) {
    this.activeBuzzerQueue = Array.isArray(queue) ? queue : [];
    const container = document.getElementById('buzzer-queue-list');
    if (!container) return;

    if (this.activeBuzzerQueue.length === 0) {
      container.innerHTML = `
        <div class="queue-empty-state">
          <span class="empty-icon">⏱</span>
          <p>NO BUZZES RECORDED YET</p>
          <small>Click "DISPLAY QUESTION TO TEAMS" to activate candidate buzzers.</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.activeBuzzerQueue.map((item, idx) => {
      const isFirst = idx === 0;
      const rankBadge = isFirst ? '🥇 1st' : (idx === 1 ? '🥈 2nd' : (idx === 2 ? '🥉 3rd' : `#${idx + 1}`));
      return `
        <div class="buzzer-queue-item ${isFirst ? 'first-place' : ''}">
          <span class="queue-rank-badge">${rankBadge}</span>
          <div class="queue-team-info">
            <span class="queue-team-id">${this.escapeHTML(item.teamId)}</span>
            <span class="queue-reaction-time">+${Number(item.reactionTime).toFixed(3)}s</span>
          </div>
          <div class="queue-actions">
            <button class="btn-point-action btn-award-pts" onclick="window.dashboard.awardPoints('${this.escapeHTML(item.teamId)}', 200)">+200 PTS</button>
            <button class="btn-point-action btn-deduct-pts" onclick="window.dashboard.awardPoints('${this.escapeHTML(item.teamId)}', -50)">-50 PTS</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async awardPoints(teamId, points) {
    const pts = parseInt(points, 10) || 0;
    const cleanId = String(teamId).trim().toUpperCase();

    // 1. Socket event
    // One HTTP action only: prevent duplicated changes from Socket.IO + HTTP.

    // 2. HTTP POST fallback to unified score endpoint
    try {
      const res = await fetch('/api/scores/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: cleanId, points: pts })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Updated team score:`, data);
      }
    } catch(e) {}

    if (pts >= 0) {
      this.playBeep(1050, 0.2);
      this.showToast(`+${pts} PTS AWARDED TO ${cleanId}`);
    } else {
      this.playBeep(250, 0.25);
      this.showToast(`${pts} PTS DEDUCTED FROM ${cleanId}`);
    }

    this.fetchScores(true);
  }

  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('mindmind_arena_telemetry');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'ARENA_SCORE_UPDATE') {
            this.handleLiveIncomingScore(event.data.record);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Also listen to window storage events for same-origin tabs
    window.addEventListener('storage', (e) => {
      if (!this.isAuthenticated) return;
      if (e.key === 'mindmind_team_scores' || e.key === 'mindmind_last_team_score') {
        this.fetchScores();
      }
    });
  }

  handleLiveIncomingScore(record) {
    if (!this.isAuthenticated || !record || !record.teamId) return;
    const cleanId = String(record.teamId).toUpperCase();
    const idx = this.scores.findIndex(s => s.teamId && s.teamId.toUpperCase() === cleanId);
    if (idx >= 0) {
      this.scores[idx] = { ...this.scores[idx], ...record };
    } else {
      this.scores.push(record);
    }
    this.scores.sort((a, b) => (b.score || 0) - (a.score || 0));
    this.render();
    this.showToast(`${cleanId}: ${record.score} PTS`);
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('dash-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Auto-refresh toggle button
    const autoBtn = document.getElementById('toggle-auto-refresh-btn');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.autoRefresh = !this.autoRefresh;
        autoBtn.classList.toggle('active', this.autoRefresh);
        autoBtn.innerHTML = this.autoRefresh ? '<span>LIVE</span>' : '<span>PAUSED</span>';
        if (this.autoRefresh) {
          this.startPolling();
          this.showToast('Stream active');
        } else {
          this.stopPolling();
          this.showToast('Stream paused');
        }
      });
    }

    // Manual Refresh button
    const refreshBtn = document.getElementById('manual-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.fetchScores(true);
        this.playBeep(800, 0.1);
      });
    }

    // Projector Fullscreen button
    const fullBtn = document.getElementById('toggle-fullscreen-btn');
    if (fullBtn) {
      fullBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          fullBtn.innerHTML = '<span>EXIT</span>';
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          fullBtn.innerHTML = '<span>FULLSCREEN</span>';
        }
      });
    }

    // Sound toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.innerHTML = this.soundEnabled ? '<span>AUDIO</span>' : '<span>MUTED</span>';
        if (this.soundEnabled) this.playBeep(700, 0.1);
      });
    }

    // Admin demo injector
    const demoBtn = document.getElementById('admin-inject-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => this.injectDemoTeams());
    }

    // Admin clear all
    const resetBtn = document.getElementById('admin-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetArenaScores());
    }

    // Export JSON
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportScoresJSON());
    }
  }

  startPolling() {
    this.stopPolling();
    this.fetchScores();
    this.pollTimer = setInterval(() => {
      if (this.autoRefresh) {
        this.fetchScores();
      }
    }, this.pollIntervalMs);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  updateLastSyncTimer() {
    setInterval(() => {
      const syncEl = document.getElementById('last-sync-time');
      if (!syncEl) return;
      const secondsAgo = Math.floor((Date.now() - this.lastSyncTime) / 1000);
      if (secondsAgo <= 2) {
        syncEl.textContent = 'LIVE';
      } else {
        syncEl.textContent = `${secondsAgo}s ago`;
      }
    }, 1000);
  }

  async fetchScores(isManual = false) {
    if (!this.isAuthenticated) return;
    let freshScores = [];
    let serverReachable = false;

    // 1. Fetch from central Express / MongoDB API
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          freshScores = data.leaderboard;
          serverReachable = true;
        }
      }
    } catch (e) {
      // Backend not running / standalone mode
    }

    // 2. Fallback to localStorage if server returned empty or failed
    if (freshScores.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('mindmind_team_scores') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          freshScores = local;
        }
      } catch (e) {}
    }

    this.scores = freshScores;
    this.scores.sort((a, b) => (b.score || 0) - (a.score || 0));
    this.lastSyncTime = Date.now();

    // Check if leader changed for fanfare
    if (this.scores.length > 0) {
      const currentLeader = this.scores[0].teamId;
      if (this.previousLeader && this.previousLeader !== currentLeader) {
        this.playBeep(950, 0.3);
        this.showToast(`Leader: Team ${currentLeader} (#1)`);
      }
      this.previousLeader = currentLeader;
    }

    this.render();

    // Update connection indicator
    const connDot = document.getElementById('connection-indicator');
    if (connDot) {
      connDot.style.background = serverReachable ? 'var(--neon-red)' : '#555555';
      connDot.title = serverReachable ? 'Central Server Online' : 'Local Telemetry Active';
    }

    if (isManual) {
      this.showToast(`Synced (${this.scores.length} teams)`);
    }
  }

  render() {
    this.renderMetrics();
    this.renderPodium();
    this.renderTable();
  }

  renderMetrics() {
    const totalTeamsEl = document.getElementById('metric-total-teams');
    const peakScoreEl = document.getElementById('metric-peak-score');
    const avgScoreEl = document.getElementById('metric-avg-score');
    const peakStageEl = document.getElementById('metric-peak-stage');

    const count = this.scores.length;
    if (totalTeamsEl) totalTeamsEl.textContent = count;

    if (count === 0) {
      if (peakScoreEl) peakScoreEl.textContent = '0';
      if (avgScoreEl) avgScoreEl.textContent = '0';
      if (peakStageEl) peakStageEl.textContent = 'STAGE 1';
      return;
    }

    const peak = this.scores[0].score || 0;
    const total = this.scores.reduce((sum, s) => sum + (s.score || 0), 0);
    const avg = Math.round(total / count);

    const maxStage = Math.max(...this.scores.map(s => s.stagesCleared || 1));

    if (peakScoreEl) peakScoreEl.textContent = peak.toLocaleString();
    if (avgScoreEl) avgScoreEl.textContent = avg.toLocaleString();
    if (peakStageEl) peakStageEl.textContent = maxStage >= 3 ? 'FINISHED' : `STAGE ${maxStage}`;
  }

  renderPodium() {
    const p1 = this.scores[0] || null;
    const p2 = this.scores[1] || null;
    const p3 = this.scores[2] || null;

    this.renderPodiumCard('podium-rank-1', p1, '1ST', 'pos-1');
    this.renderPodiumCard('podium-rank-2', p2, '2ND', 'pos-2');
    this.renderPodiumCard('podium-rank-3', p3, '3RD', 'pos-3');
  }

  renderPodiumCard(containerId, team, badgeTitle, posClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isRank1 = posClass === 'pos-1';
    const isRank2 = posClass === 'pos-2';
    const crownTag = isRank1 
      ? `<div class="podium-crown-badge">★ TOURNAMENT LEADER ★</div>`
      : (isRank2 ? `<div class="podium-runner-badge">RUNNER UP</div>` : `<div class="podium-contender-badge">CONTENDER</div>`);

    if (!team) {
      container.innerHTML = `
        ${crownTag}
        <div class="podium-pos-badge ${posClass}">${badgeTitle}</div>
        <div class="podium-team-name empty-slot">—</div>
        <div class="podium-team-id">AWAITING SQUAD</div>
        <div class="podium-score-wrap">
          <span class="podium-score" style="color: var(--text-muted); opacity: 0.45;">0</span>
          <span class="podium-score-unit">PTS</span>
        </div>
        <div class="podium-tier-pill"><span class="tier-pip"></span>STAGE 1</div>
      `;
      return;
    }

    container.innerHTML = `
      ${crownTag}
      <div class="podium-pos-badge ${posClass}">${badgeTitle}</div>
      <div class="podium-team-name">${this.escapeHTML(team.teamName || 'OPERATOR')}</div>
      <div class="podium-team-id">#${this.escapeHTML(team.teamId)}</div>
      <div class="podium-score-wrap">
        <span class="podium-score">${Number(team.score || 0).toLocaleString()}</span>
        <span class="podium-score-unit">PTS</span>
      </div>
      <div class="podium-tier-pill"><span class="tier-pip"></span>${this.escapeHTML(team.rank || 'STAGE 1')}</div>
    `;
  }

  renderTable() {
    const tbody = document.getElementById('dash-table-body');
    if (!tbody) return;

    let displayScores = [...this.scores];
    if (this.searchQuery) {
      displayScores = displayScores.filter(s =>
        (s.teamId && s.teamId.toLowerCase().includes(this.searchQuery)) ||
        (s.teamName && s.teamName.toLowerCase().includes(this.searchQuery))
      );
    }

    if (displayScores.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="dash-empty-state">
              <div class="dash-empty-title">NO SQUADS RECORDED</div>
              <div style="margin-top: 14px;">
                <button class="dash-btn btn-outline" onclick="window.dashboard.injectDemoTeams()">DEMO TEAMS</button>
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const peakScore = Math.max(1, this.scores[0]?.score || 1);

    tbody.innerHTML = displayScores.map((s, idx) => {
      const overallRank = this.scores.findIndex(x => x.teamId === s.teamId) + 1;
      let rankClass = '';
      let rowHighlight = '';

      if (overallRank === 1) {
        rankClass = 'rank-gold';
        rowHighlight = 'row-top-1';
      } else if (overallRank === 2) {
        rankClass = 'rank-silver';
        rowHighlight = 'row-top-2';
      } else if (overallRank === 3) {
        rankClass = 'rank-bronze';
        rowHighlight = 'row-top-3';
      }

      const percent = Math.min(100, Math.round(((s.score || 0) / peakScore) * 100));
      const cleared = s.stagesCleared || 1;
      let stageBadge = `<span class="stage-badge stage-init">STAGE ${cleared}</span>`;
      if (cleared >= 3) {
        stageBadge = `<span class="stage-badge stage-complete">STAGE 3</span>`;
      } else if (cleared === 2) {
        stageBadge = `<span class="stage-badge stage-mid">STAGE 2</span>`;
      }

      const timeAgo = s.timestamp ? this.formatRelativeTime(new Date(s.timestamp)) : 'Just now';
      const rankPad = String(overallRank).padStart(2, '0');

      return `
        <tr class="${rowHighlight}">
          <td>
            <div class="table-rank-pill ${rankClass}">${rankPad}</div>
          </td>
          <td>
            <span class="team-id-badge">#${this.escapeHTML(s.teamId)}</span>
            ${s.questionSet ? `<div style="margin-top: 4px;"><span class="stage-badge" style="font-size: 0.65rem; padding: 2px 6px; border-color: rgba(255, 0, 60, 0.35); color: #fff;">${this.escapeHTML(s.questionSet)}</span></div>` : ''}
          </td>
          <td>
            <div class="team-name-cell">${this.escapeHTML(s.teamName || 'OPERATOR')}</div>
          </td>
          <td>
            <div class="score-cell-wrap">
              <span class="score-cell">${Number(s.score || 0).toLocaleString()}</span>
              <span class="score-unit-tag">PTS</span>
            </div>
            <div class="score-bar-bg">
              <div class="score-bar-fill" style="width: ${percent}%;"></div>
            </div>
          </td>
          <td>${stageBadge}</td>
          <td>
            <div class="time-cell">
              <span class="time-ping-dot"></span>
              <span>${timeAgo}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  formatRelativeTime(date) {
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 10) return 'Just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    return `${hrs}h ago`;
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  showToast(msg) {
    const toast = document.getElementById('dash-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  async injectDemoTeams() {
    const demoTeams = [
      { teamId: 'ALPHA', teamName: 'Viper Protocol', score: 1940, rank: 'STAGE 3', stagesCleared: 3, timestamp: new Date().toISOString() },
      { teamId: 'NEURAL', teamName: 'Binary Overlords', score: 1680, rank: 'STAGE 3', stagesCleared: 3, timestamp: new Date(Date.now() - 45000).toISOString() },
      { teamId: 'STORM', teamName: 'Syntax Execs', score: 1420, rank: 'STAGE 2', stagesCleared: 2, timestamp: new Date(Date.now() - 90000).toISOString() },
      { teamId: 'VOID', teamName: 'Memory Leaks', score: 1190, rank: 'STAGE 2', stagesCleared: 2, timestamp: new Date(Date.now() - 150000).toISOString() },
      { teamId: 'QUANTUM', teamName: 'Null Pointers', score: 850, rank: 'STAGE 1', stagesCleared: 1, timestamp: new Date(Date.now() - 210000).toISOString() }
    ];

    for (const team of demoTeams) {
      try {
        await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(team)
        });
      } catch (e) {}
    }

    localStorage.setItem('mindmind_team_scores', JSON.stringify(demoTeams));
    this.playBeep(900, 0.2);
    this.fetchScores(true);
    this.showToast('Demo teams loaded');
  }

  async resetArenaScores() {
    const confirmReset = window.confirm('Clear all team scores?');
    if (!confirmReset) return;

    try {
      await fetch('/api/scores/reset', { method: 'POST' });
    } catch(e) {}

    localStorage.removeItem('mindmind_team_scores');
    localStorage.removeItem('mindmind_last_team_score');
    this.scores = [];
    this.previousLeader = null;
    this.render();
    this.playBeep(400, 0.2);
    this.showToast('Scores cleared');
  }

  exportScoresJSON() {
    if (this.scores.length === 0) {
      alert('No scores to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(this.scores, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scores_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported JSON');
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new ArenaDashboard();
});
