/**
 * Round 2: Spot The Errors (Cyber Bug Hunter)
 * Interactive Cyber Terminal / IDE with clickable code lines, syntax diagnostics, and patch deployment
 */

class Round2Bugs {
  constructor(game) {
    this.game = game;
    this.questions = (typeof window !== 'undefined' && window.QUESTION_DATABASE) ? window.QUESTION_DATABASE.round2 : (typeof QUESTION_DATABASE !== 'undefined' ? QUESTION_DATABASE.round2 : []);
    this.currentIndex = 0;
    this.selectedLineIndex = null;
    this.lineConfirmed = false;
    this.answered = false;
    this.timer = 80;
    this.timerInterval = null;
    this.isFrozen = false;
    this.showingHint = false;
  }

  start() {
    if (typeof getShuffledQuestions === 'function') {
      this.questions = getShuffledQuestions('round2', 8);
    } else if (typeof window !== 'undefined' && typeof window.getShuffledQuestions === 'function') {
      this.questions = window.getShuffledQuestions('round2', 8);
    } else if (typeof window !== 'undefined' && window.QUESTION_DATABASE && window.QUESTION_DATABASE.round2) {
      this.questions = [...window.QUESTION_DATABASE.round2].slice(0, 8);
    } else {
      this.questions = [...QUESTION_DATABASE.round2].slice(0, 8);
    }
    this.currentIndex = 0;
    this.attachKeyListeners();
    this.loadBug(this.currentIndex);
  }

  attachKeyListeners() {
    if (this.keyListenerAttached) return;
    this.keyListenerAttached = true;

    window.addEventListener('keydown', (e) => {
      if (this.game.currentRound !== 2 || this.answered) return;
      if (this.lineConfirmed) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 4) {
            e.preventDefault();
            this.handleSelectPatch(num - 1);
          }
        }
      }
    });
  }

  loadBug(index) {
    if (!this.questions || this.questions.length === 0) {
      this.questions = (typeof QUESTION_DATABASE !== 'undefined' ? QUESTION_DATABASE.round2 : []) || [];
    }
    if (index >= this.questions.length) {
      this.finishRound();
      return;
    }

    this.currentIndex = index;
    const q = this.questions[this.currentIndex];
    this.selectedLineIndex = null;
    this.lineConfirmed = false;
    this.answered = false;
    this.initialTimer = this.calculateBugDuration(q);
    this.timer = this.initialTimer;
    this.isFrozen = false;
    this.showingHint = false;

    this.render();
    this.startTimer();
  }

  calculateBugDuration(q) {
    if (!q) return 180;
    if (q.timeLimit && typeof q.timeLimit === 'number') return q.timeLimit;
    const textLen = (q.scenario || '').length;
    const lineCount = (q.codeLines || []).length;
    let duration = 160 + (lineCount * 3);
    if (textLen > 250) duration += 15;
    return Math.min(210, Math.max(160, duration));
  }

  startTimer() {
    clearInterval(this.timerInterval);
    const timerDisplay = document.getElementById('round-timer-val');
    const cardTimerDisplay = document.getElementById('card-timer-val');
    if (timerDisplay) timerDisplay.textContent = this.timer;
    if (cardTimerDisplay) cardTimerDisplay.textContent = this.timer;

    this.timerInterval = setInterval(() => {
      if (this.isFrozen) return;

      this.timer--;
      if (timerDisplay) {
        timerDisplay.textContent = this.timer;
        if (this.timer <= 10) {
          timerDisplay.classList.add('urgent-pulse');
          if (window.soundEngine) window.soundEngine.playTick(true);
        } else {
          timerDisplay.classList.remove('urgent-pulse');
        }
      }
      if (cardTimerDisplay) {
        cardTimerDisplay.textContent = this.timer;
        if (this.timer <= 10) {
          cardTimerDisplay.classList.add('urgent-pulse');
        } else {
          cardTimerDisplay.classList.remove('urgent-pulse');
        }
      }

      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    const timerDisplay = document.getElementById('round-timer-val');
    const cardTimerDisplay = document.getElementById('card-timer-val');
    if (timerDisplay) timerDisplay.classList.remove('urgent-pulse');
    if (cardTimerDisplay) cardTimerDisplay.classList.remove('urgent-pulse');
  }

  freezeTimer(seconds = 10) {
    this.isFrozen = true;
    const timerBox = document.getElementById('hud-timer-badge');
    if (timerBox) timerBox.classList.add('timer-frozen');

    setTimeout(() => {
      this.isFrozen = false;
      if (timerBox) timerBox.classList.remove('timer-frozen');
    }, seconds * 1000);
  }

  handleTimeout() {
    if (this.answered) return;
    this.answered = true;
    if (window.soundEngine) window.soundEngine.playError();

    const q = this.questions[this.currentIndex];
    this.showFeedback(false, "TIME EXPIRED! Inspection time ended.", q.errorExplanation);
  }

  highlightCode(rawLine, category) {
    if (!rawLine) return '';
    let escaped = rawLine.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cat = (category || '').toLowerCase();

    const stringPool = [];
    escaped = escaped.replace(/("[^"]*"|\x27[^\x27]*\x27)/g, (m) => {
      stringPool.push(`<span class="syn-string">${m}</span>`);
      return `___STR_${stringPool.length - 1}___`;
    });

    if (cat.includes('html')) {
      escaped = escaped.replace(/\b([a-zA-Z\-]+)=/g, '<span class="syn-attr">$1</span>=');
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9]+)/g, '<span class="syn-tag">$1</span>');
      escaped = escaped.replace(/(&gt;)/g, '<span class="syn-tag">&gt;</span>');
    } else if (cat.includes('python')) {
      const pyKeywords = ['def', 'return', 'if', 'elif', 'else', 'for', 'in', 'while', 'print', 'True', 'False', 'None', 'import', 'from', 'as', 'try', 'except', 'len', 'range', 'append', 'sort', 'sorted', 'int', 'str', 'float', 'list', 'dict'];
      const kwRegex = new RegExp(`\\b(${pyKeywords.join('|')})\\b`, 'g');
      escaped = escaped.replace(kwRegex, '<span class="syn-keyword">$1</span>');
      escaped = escaped.replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>');
    } else {
      if (escaped.trim().startsWith('#include')) {
        escaped = `<span class="syn-preproc">${escaped}</span>`;
      } else {
        const cKeywords = ['int', 'char', 'float', 'double', 'void', 'return', 'if', 'else', 'for', 'while', 'printf', 'scanf', 'sizeof', 'main', 'const', 'struct'];
        const kwRegex = new RegExp(`\\b(${cKeywords.join('|')})\\b`, 'g');
        escaped = escaped.replace(kwRegex, '<span class="syn-keyword">$1</span>');
        escaped = escaped.replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>');
      }
    }

    escaped = escaped.replace(/___STR_(\d+)___/g, (_, idx) => stringPool[parseInt(idx, 10)]);
    return escaped;
  }

  render() {
    const container = document.getElementById('round-view-container');
    if (!container) return;

    const q = this.questions[this.currentIndex];

    container.innerHTML = `
      <div class="challenge-wrapper clean-challenge glass-panel">
        <!-- Top Meta Bar -->
        <div class="challenge-topbar">
          <div class="topbar-left">
            <span class="cyber-badge category-badge">${q.category}</span>
            <span class="cyber-badge step-badge">BUG ${this.currentIndex + 1} / ${this.questions.length}</span>
          </div>
          <div class="topbar-right">
            <span class="cyber-badge points-badge">+150 PTS</span>
            <span class="cyber-badge duration-badge" style="border-color: rgba(255, 0, 60, 0.4); color: #fff;">⏱ <span id="card-timer-val">${this.timer}</span>s</span>
          </div>
        </div>

        <!-- Question Title -->
        <h2 class="clean-challenge-title">${q.title}</h2>

        <!-- Clean Diagnostic Callout -->
        <div class="clean-bug-callout">
          <span class="bug-tag">ERROR REPORT</span>
          <span class="bug-desc">${this.escapeHTML(q.scenario)}</span>
        </div>

        <!-- Action Instruction -->
        <div class="clean-action-instruction">⚡ Click the line containing the error to inspect and deploy a fix:</div>

        <!-- Cyber IDE Terminal Window -->
        <div class="clean-ide-window">
          <div class="ide-titlebar">
            <div class="ide-controls">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="ide-filename">${q.category === 'Python' ? 'script.py' : q.category === 'Basic HTML' ? 'index.html' : 'program.c'}</span>
            <span class="ide-status" id="ide-status-badge">CLICK DEFECTIVE LINE</span>
          </div>
          
          <div class="ide-editor-body" id="ide-lines-container">
            ${q.codeLines.map((line, idx) => `
              <div class="ide-line" id="code-line-${idx}" onclick="window.game.round2.handleLineClick(${idx})">
                <span class="line-number">${(idx + 1).toString().padStart(2, '0')}</span>
                <span class="line-code"><code>${this.highlightCode(line, q.category)}</code></span>
                <span class="line-target-indicator">SELECT</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Hint Card (if activated) -->
        <div id="bug-hint-container" class="cyber-hint-card ${this.showingHint ? '' : 'hidden'}">
          <div class="hint-header">
            <strong>DIAGNOSTIC HINT:</strong>
          </div>
          <div class="hint-body">${q.hint}</div>
        </div>

        <!-- Step 2: Patch Deployment Box -->
        <div id="patch-deployment-panel" class="patch-panel hidden glass-panel">
          <div class="patch-header">
            <span class="patch-badge">FIX PROTOCOL</span>
            <span class="patch-sub">Select the patch for Line <strong id="target-line-indicator">#</strong>:</span>
          </div>
          <div class="options-grid clean-options-grid" id="patch-options-grid">
            ${q.fixOptions.map((fix, idx) => `
              <button class="cyber-option-btn clean-option-btn" id="patch-btn-${idx}" onclick="window.game.round2.handleSelectPatch(${idx})">
                <span class="opt-prefix">PATCH ${['A', 'B', 'C', 'D'][idx] || (idx + 1)}</span>
                <span class="opt-text">${this.escapeHTML(fix)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Post-Answer Feedback Banner -->
        <div id="bug-feedback-card" class="feedback-card hidden"></div>
      </div>
    `;

    this.game.updateRoundHUD("ROUND 2: SPOT THE ERRORS", `${this.currentIndex + 1}/${this.questions.length}`);
  }

  handleLineClick(lineIndex) {
    if (this.answered || this.lineConfirmed) return;

    const q = this.questions[this.currentIndex];
    this.selectedLineIndex = lineIndex;

    // Reset visual selection on all lines
    document.querySelectorAll('.ide-line').forEach(el => el.classList.remove('line-selected', 'line-wrong-shake'));

    const clickedEl = document.getElementById(`code-line-${lineIndex}`);
    if (!clickedEl) return;

    if (window.soundEngine) window.soundEngine.playClick(900);

    if (lineIndex === q.errorLineIndex) {
      // Correct line spotted!
      this.lineConfirmed = true;
      clickedEl.classList.add('line-confirmed-error');
      
      const statusBadge = document.getElementById('ide-status-badge');
      if (statusBadge) {
        statusBadge.textContent = `TARGET ACQUIRED: LINE ${lineIndex + 1}`;
        statusBadge.classList.add('status-locked');
      }

      // Spotting the defective line: +30 PTS base (+ up to 5 speed bonus)
      const totalTime = this.initialTimer || 160;
      const speedRatio = Math.max(0, this.timer / totalTime);
      const lineSpeedBonus = Math.min(5, Math.max(0, Math.round(speedRatio * 5)));
      const linePts = 30 + lineSpeedBonus;
      this.game.addScore(linePts);
      if (window.armoryStore) window.armoryStore.showFloatingHUDNotification(`Defective Line Identified: +${linePts} PTS`);

      // Show patch options
      const patchPanel = document.getElementById('patch-deployment-panel');
      const targetLineIndicator = document.getElementById('target-line-indicator');
      if (targetLineIndicator) targetLineIndicator.textContent = `#${lineIndex + 1}`;
      if (patchPanel) {
        patchPanel.classList.remove('hidden');
        patchPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // Wrong line clicked
      clickedEl.classList.add('line-wrong-shake');
      if (window.soundEngine) window.soundEngine.playError();
      if (window.armoryStore) window.armoryStore.showFloatingHUDNotification("Bug is not in this line. Try another line.");
    }
  }

  handleSelectPatch(fixIndex) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();

    const q = this.questions[this.currentIndex];
    const isCorrect = fixIndex === q.correctFixIndex;
    const selectedBtn = document.getElementById(`patch-btn-${fixIndex}`);
    const correctBtn = document.getElementById(`patch-btn-${q.correctFixIndex}`);

    if (isCorrect) {
      if (selectedBtn) selectedBtn.classList.add('btn-correct');
      if (window.soundEngine) window.soundEngine.playSuccess();

      // Patch selection: 120 Base PTS + Speed Bonus: up to 10 PTS max (Total ~150-165 PTS)
      const basePts = 120;
      const totalTime = this.initialTimer || 160;
      const speedRatio = Math.max(0, this.timer / totalTime);
      const patchSpeedBonus = Math.min(10, Math.max(0, Math.round(speedRatio * 10)));
      const earnedScore = basePts + patchSpeedBonus;
      this.game.addScore(earnedScore);

      const bonusText = patchSpeedBonus > 0 ? ` (+${patchSpeedBonus} speed bonus)` : '';
      this.showFeedback(true, `PATCH VERIFIED! +${earnedScore} PTS`, `+${basePts} Base PTS${bonusText}\n\n${q.errorExplanation} Fix applied successfully.`);
    } else {
      if (selectedBtn) selectedBtn.classList.add('btn-wrong');
      if (correctBtn) correctBtn.classList.add('btn-correct');
      if (window.soundEngine) window.soundEngine.playError();

      this.showFeedback(false, "INCORRECT FIX! Solution does not resolve the bug.", q.errorExplanation);
    }
  }

  showFeedback(isSuccess, headline, explanation) {
    const card = document.getElementById('bug-feedback-card');
    if (!card) return;

    card.className = `feedback-card ${isSuccess ? 'feedback-success' : 'feedback-error'}`;
    card.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-status-pill ${isSuccess ? 'pill-success' : 'pill-error'}">${isSuccess ? 'RESOLVED' : 'FAILED'}</span>
        <h3 class="feedback-title">${headline}</h3>
      </div>
      <p class="feedback-explanation">${explanation}</p>
      <div class="feedback-actions">
        <button class="neon-btn btn-primary" onclick="window.game.round2.nextBug()">
          ${this.currentIndex + 1 < this.questions.length ? 'NEXT BUG' : 'FINISH ROUND 2'}
        </button>
      </div>
    `;
    card.classList.remove('hidden');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  nextBug() {
    this.loadBug(this.currentIndex + 1);
  }

  apply5050() {
    if (this.answered) return;
    const q = this.questions[this.currentIndex];

    if (!this.lineConfirmed) {
      // Purge 2 non-buggy lines from suspicion
      const innocentLineIndices = q.codeLines.map((_, i) => i).filter(i => i !== q.errorLineIndex);
      innocentLineIndices.sort(() => 0.5 - Math.random());
      const purgedLines = innocentLineIndices.slice(0, 2);

      purgedLines.forEach(idx => {
        const el = document.getElementById(`code-line-${idx}`);
        if (el) {
          el.style.opacity = '0.25';
          el.style.pointerEvents = 'none';
          const indicator = el.querySelector('.line-target-indicator');
          if (indicator) {
            indicator.textContent = 'CLEARED';
            indicator.style.color = '#ffffff';
            indicator.style.display = 'block';
          }
        }
      });
      window.armoryStore.showFloatingHUDNotification("50/50 Purge: 2 safe code lines cleared.");
    } else {
      // Purge 2 incorrect patches
      const wrongFixes = [0, 1, 2, 3].filter(i => i !== q.correctFixIndex);
      wrongFixes.sort(() => 0.5 - Math.random());
      const purged = wrongFixes.slice(0, 2);

      purged.forEach(idx => {
        const btn = document.getElementById(`patch-btn-${idx}`);
        if (btn) {
          btn.classList.add('purged-option');
          btn.disabled = true;
        }
      });
      window.armoryStore.showFloatingHUDNotification("50/50 Purge: 2 wrong fixes eliminated.");
    }
  }

  applyHint() {
    this.showingHint = true;
    const hintBox = document.getElementById('bug-hint-container');
    if (hintBox) hintBox.classList.remove('hidden');

    // Also highlight suspect lines
    const q = this.questions[this.currentIndex];
    const targetLine = document.getElementById(`code-line-${q.errorLineIndex}`);
    if (targetLine) {
      targetLine.classList.add('hint-glow-line');
    }
    window.armoryStore.showFloatingHUDNotification("Diagnostic Hint: Target line highlighted.");
  }

  applyFreeze() {
    this.freezeTimer(10);
    window.armoryStore.showFloatingHUDNotification("Timer Freeze: 10s added.");
  }

  finishRound() {
    this.stopTimer();
    this.game.showRoundCompletionModal(2);
  }

  escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

if (typeof window !== 'undefined') {
  window.Round2Bugs = Round2Bugs;
}
