/**
 * Round 1: Visual Decoding Engine
 * Renders interactive visual schematics, CSS preview viewports, logic circuits, and box models
 */

class Round1Visual {
  constructor(game) {
    this.game = game;
    this.questions = (typeof window !== 'undefined' && window.QUESTION_DATABASE) ? window.QUESTION_DATABASE.round1 : (typeof QUESTION_DATABASE !== 'undefined' ? QUESTION_DATABASE.round1 : []);
    this.currentIndex = 0;
    this.selectedOption = null;
    this.answered = false;
    this.purgedOptions = [];
    this.showingHint = false;
    this.timer = 60; // Dynamic seconds per puzzle
    this.timerInterval = null;
    this.isFrozen = false;
  }

  start() {
    if (typeof getShuffledQuestions === 'function') {
      this.questions = getShuffledQuestions('round1');
    } else if (typeof window !== 'undefined' && typeof window.getShuffledQuestions === 'function') {
      this.questions = window.getShuffledQuestions('round1');
    } else if (typeof window !== 'undefined' && window.QUESTION_DATABASE && window.QUESTION_DATABASE.round1) {
      this.questions = [...window.QUESTION_DATABASE.round1];
    } else {
      this.questions = [...QUESTION_DATABASE.round1];
    }
    this.currentIndex = 0;
    this.attachKeyListeners();

    // Global 20-Minute Countdown Timer for Round 1 (1200s)
    this.totalRoundSeconds = 20 * 60;
    this.roundSecondsRemaining = this.totalRoundSeconds;
    this.startGlobalTimer();

    this.loadQuestion(this.currentIndex);
  }

  attachKeyListeners() {
    if (this.keyListenerAttached) return;
    this.keyListenerAttached = true;

    window.addEventListener('keydown', (e) => {
      if (this.game.currentRound !== 1 || this.answered) return;
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 4) {
          e.preventDefault();
          this.handleSelectOption(num - 1);
        }
      }
    });
  }

  formatClockTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mins = Math.floor(s / 60);
    const remainder = s % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  }

  loadQuestion(index) {
    if (!this.questions || this.questions.length === 0) {
      this.questions = (typeof QUESTION_DATABASE !== 'undefined' ? QUESTION_DATABASE.round1 : []) || [];
    }
    if (index >= this.questions.length) {
      this.finishRound();
      return;
    }

    this.currentIndex = index;
    const q = this.questions[this.currentIndex];
    this.answered = false;
    this.selectedOption = null;
    this.purgedOptions = [];
    this.showingHint = false;
    this.questionStartTime = Date.now();

    this.render();
    this.updateTimerDisplays();
  }

  startGlobalTimer() {
    clearInterval(this.timerInterval);
    this.updateTimerDisplays();

    this.timerInterval = setInterval(() => {
      if (this.isFrozen) return;

      this.roundSecondsRemaining--;
      this.updateTimerDisplays();

      // Urgent audio pulse when less than 2 minutes (120s) remain
      if (this.roundSecondsRemaining <= 120 && this.roundSecondsRemaining > 0) {
        if (window.soundEngine && this.roundSecondsRemaining <= 30) {
          window.soundEngine.playTick(true);
        }
      }

      if (this.roundSecondsRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeExpired();
      }
    }, 1000);
  }

  updateTimerDisplays() {
    const formatted = this.formatClockTime(this.roundSecondsRemaining);
    const timerDisplay = document.getElementById('round-timer-val');
    const cardTimerDisplay = document.getElementById('card-timer-val');

    if (timerDisplay) timerDisplay.textContent = formatted;
    if (cardTimerDisplay) cardTimerDisplay.textContent = formatted;

    const isUrgent = this.roundSecondsRemaining <= 120;
    if (timerDisplay) {
      if (isUrgent) timerDisplay.classList.add('urgent-pulse');
      else timerDisplay.classList.remove('urgent-pulse');
    }
    if (cardTimerDisplay) {
      if (isUrgent) cardTimerDisplay.classList.add('urgent-pulse');
      else cardTimerDisplay.classList.remove('urgent-pulse');
    }
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    const timerDisplay = document.getElementById('round-timer-val');
    const cardTimerDisplay = document.getElementById('card-timer-val');
    if (timerDisplay) timerDisplay.classList.remove('urgent-pulse');
    if (cardTimerDisplay) cardTimerDisplay.classList.remove('urgent-pulse');
  }

  handleTimeExpired() {
    this.stopTimer();
    if (window.soundEngine) window.soundEngine.playError();
    alert("TIME EXPIRED: The 20-minute time limit for Round 1 has concluded. Advancing to Round 2.");
    this.finishRound();
  }

  freezeTimer(seconds = 15) {
    this.isFrozen = true;
    const timerBox = document.getElementById('hud-timer-badge');
    if (timerBox) timerBox.classList.add('timer-frozen');

    setTimeout(() => {
      this.isFrozen = false;
      if (timerBox) timerBox.classList.remove('timer-frozen');
    }, seconds * 1000);
  }

  render() {
    const container = document.getElementById('round-view-container');
    if (!container) return;

    const q = this.questions[this.currentIndex];
    const isCodeQuestion = Array.isArray(q.steps) && q.steps.length > 0;

    container.innerHTML = `
      <div class="challenge-wrapper clean-challenge glass-panel">
        <!-- Top Meta Bar -->
        <div class="challenge-topbar">
          <div class="topbar-left">
            <span class="cyber-badge category-badge">${q.category}</span>
            <span class="cyber-badge step-badge">PUZZLE ${this.currentIndex + 1} / ${this.questions.length}</span>
          </div>
          <div class="topbar-right">
            <span class="cyber-badge points-badge">+100 PTS</span>
            <span class="cyber-badge duration-badge" style="border-color: rgba(255, 0, 60, 0.4); color: #fff;">⏱ <span id="card-timer-val">${this.formatClockTime(this.roundSecondsRemaining)}</span></span>
          </div>
        </div>

        <!-- Question Title -->
        <h2 class="clean-challenge-title">${q.title}</h2>

        <!-- Question Main Content Area -->
        <div class="clean-question-card">
          ${isCodeQuestion ? this.renderCodeQuestion(q) : this.renderLogicQuestion(q)}
        </div>

        <!-- Diagnostic Hint Banner (if activated) -->
        <div id="visual-hint-container" class="cyber-hint-card ${this.showingHint ? '' : 'hidden'}">
          <div class="hint-header">
            <strong>DIAGNOSTIC HINT:</strong>
          </div>
          <div class="hint-body">${q.hint}</div>
        </div>

        <!-- Options Grid (Clean 2x2) -->
        <div class="options-grid clean-options-grid" id="visual-options-grid">
          ${q.options.map((opt, idx) => `
            <button class="cyber-option-btn clean-option-btn" id="opt-btn-${idx}" onclick="window.game.round1.handleSelectOption(${idx})">
              <span class="opt-prefix">${['A', 'B', 'C', 'D'][idx] || (idx + 1)}</span>
              <span class="opt-text">${this.escapeHTML(opt)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Post-Answer Feedback Banner -->
        <div id="visual-feedback-card" class="feedback-card hidden"></div>
      </div>
    `;

    // Update global game HUD state
    this.game.updateRoundHUD("ROUND 1: VISUAL DECODING", `${this.currentIndex + 1}/${this.questions.length}`);
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

  renderCodeQuestion(q) {
    const isPython = q.category === 'Python';
    const filename = isPython ? 'script.py' : 'main.c';

    return `
      <div class="clean-code-wrapper">
        <p class="clean-prompt-text">${this.escapeHTML(q.instruction)}</p>
        <div class="clean-ide-window">
          <div class="ide-titlebar">
            <div class="ide-controls">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="ide-filename">${filename}</span>
            <span class="ide-lang-badge">${q.category}</span>
          </div>
          <div class="code-editor-body">
            ${q.steps.map((line, idx) => `
              <div class="code-editor-line">
                <span class="code-line-num">${(idx + 1).toString().padStart(2, '0')}</span>
                <span class="code-line-text"><code>${this.highlightCode(line, q.category)}</code></span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderLogicQuestion(q) {
    const rawText = (q.instruction || '').trim();
    const cluesMatch = rawText.match(/(Clues|Constraints|Flow characteristics|Rules & Information|Rules & Constraints|Events|Crossing times for each individual|Standard Calendar Parameters|Statements):([\s\S]*?)(?=\n\n[^\n]+$|$)/i);

    let intro = rawText;
    let headerTitle = '';
    let clueLines = [];
    let targetQuestion = '';

    if (cluesMatch) {
      headerTitle = cluesMatch[1];
      const cluesBlock = cluesMatch[2];
      intro = rawText.substring(0, cluesMatch.index).trim();
      targetQuestion = rawText.substring(cluesMatch.index + cluesMatch[0].length).trim();

      clueLines = cluesBlock
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/^(\d+\.|\-|\*)\s*/, ''));
    } else {
      const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      if (paragraphs.length > 1) {
        intro = paragraphs.slice(0, paragraphs.length - 1).join('<br><br>');
        targetQuestion = paragraphs[paragraphs.length - 1];
      }
    }

    const visualMini = this.getMinimalVisualHelper(q);

    return `
      <div class="clean-logic-wrapper">
        ${intro ? `<p class="clean-narrative">${intro.replace(/\n\n/g, '<br><br>')}</p>` : ''}
        
        ${clueLines.length > 0 ? `
          <div class="clean-clues-card">
            <div class="clean-clues-title">⚡ ${this.escapeHTML(headerTitle.toUpperCase())}:</div>
            <ul class="clean-clues-list">
              ${clueLines.map(clue => `
                <li class="clean-clue-item">
                  <span class="clue-bullet">▸</span>
                  <span class="clue-desc">${this.escapeHTML(clue)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${visualMini ? `<div class="clean-visual-mini">${visualMini}</div>` : ''}

        ${targetQuestion ? `
          <div class="clean-target-question">
            <span class="target-q-icon">?</span>
            <span class="target-q-prompt">${this.escapeHTML(targetQuestion)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  getMinimalVisualHelper(q) {
    const title = (q.title || '').toLowerCase();
    const id = (q.id || '').toLowerCase();

    // 1. Linear Seating Strip (Compact 5 chairs)
    if (title.includes('linear seating') || title.includes('five-chair') || id === 'v1_1') {
      return `
        <div class="mini-seating-strip">
          <div class="mini-chair unknown"><span class="mc-num">1</span><span class="mc-name">?</span></div>
          <div class="mini-chair occupied"><span class="mc-num">2</span><span class="mc-name">Aaron</span></div>
          <div class="mini-chair occupied"><span class="mc-num">3</span><span class="mc-name">Chloe</span></div>
          <div class="mini-chair unknown"><span class="mc-num">4</span><span class="mc-name">?</span></div>
          <div class="mini-chair unknown"><span class="mc-num">5</span><span class="mc-name">?</span></div>
        </div>
      `;
    }

    // 2. Night Bridge Crossing (v1_4)
    if (title.includes('bridge') || title.includes('flashlight') || id === 'v1_4') {
      return `
        <div class="clean-schematic-bar clean-bridge-schematic">
          <div class="bridge-side side-start">
            <span class="schem-label">START BANK</span>
            <div class="schem-chips">
              <span class="schem-chip">Alpha (1m)</span>
              <span class="schem-chip">Beta (2m)</span>
              <span class="schem-chip">Gamma (7m)</span>
              <span class="schem-chip">Delta (10m)</span>
            </div>
          </div>
          <div class="bridge-span">
            <span class="bridge-icon">🌉</span>
            <span class="bridge-rule">MAX 2 CROSS • 1 TORCH</span>
            <span class="bridge-arrow">────────►</span>
          </div>
          <div class="bridge-side side-dest">
            <span class="schem-label">DESTINATION</span>
            <div class="schem-chips"><span class="schem-chip schem-chip-ghost">ALL 4 MUST CROSS</span></div>
          </div>
        </div>
      `;
    }

    // 3. Apartment Floors Strip (v2_1)
    if (title.includes('apartment') || title.includes('five-floor') || id === 'v2_1') {
      return `
        <div class="mini-floors-strip">
          <div class="mini-floor occupied"><span class="mf-lvl">F5</span><span class="mf-name">Tanvi</span></div>
          <div class="mini-floor unknown"><span class="mf-lvl">F4</span><span class="mf-name">?</span></div>
          <div class="mini-floor unknown"><span class="mf-lvl">F3</span><span class="mf-name">?</span></div>
          <div class="mini-floor occupied"><span class="mf-lvl">F2</span><span class="mf-name">Rohan</span></div>
          <div class="mini-floor unknown"><span class="mf-lvl">F1</span><span class="mf-name">?</span></div>
        </div>
      `;
    }

    // 4. Two Trains Crossing (v2_4)
    if (title.includes('train') || id === 'v2_4') {
      return `
        <div class="clean-schematic-bar clean-train-schematic">
          <div class="train-station">
            <span class="schem-label">STATION X (0 KM)</span>
            <span class="schem-chip">Train A: 60 km/h ➔</span>
          </div>
          <div class="train-track-line">
            <span class="track-distance">300 KM DISTANCE</span>
            <div class="track-vector"><span class="vector-arrow-l">►</span><span class="vector-line"></span><span class="vector-arrow-r">◄</span></div>
          </div>
          <div class="train-station station-right">
            <span class="schem-label">STATION Y (300 KM)</span>
            <span class="schem-chip">◀ Train B: 90 km/h</span>
          </div>
        </div>
      `;
    }

    // 5. Knights & Knaves (v3_1)
    if (title.includes('knights') || title.includes('truth-teller') || id === 'v3_1') {
      return `
        <div class="clean-schematic-bar clean-knights-schematic">
          <div class="knight-card">
            <span class="kc-avatar">👤</span>
            <span class="kc-name">ALEX</span>
            <span class="kc-quote">"All 3 are Knaves"</span>
          </div>
          <div class="knight-card">
            <span class="kc-avatar">👤</span>
            <span class="kc-name">BEN</span>
            <span class="kc-quote">"Exactly 1 is Knight"</span>
          </div>
          <div class="knight-card">
            <span class="kc-avatar">👤</span>
            <span class="kc-name">COLE</span>
            <span class="kc-quote kc-silent">(Silent observer)</span>
          </div>
        </div>
      `;
    }

    // 6. Multi-Inlet Reservoir (v3_4)
    if (title.includes('reservoir') || title.includes('pipes') || id === 'v3_4') {
      return `
        <div class="clean-schematic-bar clean-reservoir-schematic">
          <div class="res-pipe in-pipe"><span class="schem-label">INLET A</span><span class="schem-chip">+1/4 tank/hr</span></div>
          <div class="res-plus">+</div>
          <div class="res-pipe in-pipe"><span class="schem-label">INLET B</span><span class="schem-chip">+1/6 tank/hr</span></div>
          <div class="res-arrow">══►</div>
          <div class="res-tank"><span class="tank-icon">🛢️</span><span class="tank-label">RESERVOIR</span></div>
          <div class="res-arrow">══►</div>
          <div class="res-pipe out-pipe"><span class="schem-label">DRAIN C</span><span class="schem-chip drain-chip">-1/3 tank/hr</span></div>
        </div>
      `;
    }

    // 7. Circular Table (v4_1)
    if (title.includes('circular table') || id === 'v4_1') {
      return `
        <div class="mini-circle-wrap">
          <div class="mini-circular-table">
            <span class="mc-round-label">ROUND TABLE</span>
            <div class="mc-seat seat-t"><span class="mc-tag">K</span></div>
            <div class="mc-seat seat-tr"><span class="mc-tag">M</span></div>
            <div class="mc-seat seat-br"><span class="mc-tag">?</span></div>
            <div class="mc-seat seat-b"><span class="mc-tag">N</span></div>
            <div class="mc-seat seat-bl"><span class="mc-tag">O</span></div>
            <div class="mc-seat seat-tl"><span class="mc-tag">P</span></div>
          </div>
        </div>
      `;
    }

    // 8. 15th August 1947 Day Deduction (v4_4)
    if (title.includes('1947') || title.includes('calendar') || id === 'v4_4') {
      return `
        <div class="clean-schematic-bar clean-calendar-schematic">
          <div class="cal-col"><span class="schem-label">TARGET DATE</span><span class="schem-chip">15 August 1947</span></div>
          <div class="cal-sep">◈</div>
          <div class="cal-col"><span class="schem-label">COMPLETED CYCLES</span><span class="schem-chip">1600 (0) + 300 (1) + 46 yrs</span></div>
          <div class="cal-sep">◈</div>
          <div class="cal-col"><span class="schem-label">RUNNING YEAR</span><span class="schem-chip">Jan 1 to Aug 15, 1947</span></div>
        </div>
      `;
    }

    // 9. Drone Waypoint Flight Path (v1_13, v2_13)
    if (title.includes('drone') || id.includes('13')) {
      return `
        <div class="clean-schematic-bar clean-drone-schematic">
          <div class="cal-col"><span class="schem-label">START</span><span class="schem-chip">Dock O (0, 0)</span></div>
          <div class="cal-sep">▲ 15 km N</div>
          <div class="cal-col"><span class="schem-label">LEG 2</span><span class="schem-chip">► 9 km E</span></div>
          <div class="cal-sep">▼ 3 km S</div>
          <div class="cal-col"><span class="schem-label">FINISH</span><span class="schem-chip">Charlie (9, 12)</span></div>
        </div>
      `;
    }

    return '';
  }

  handleSelectOption(optionIndex) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = optionIndex === q.correctIndex;
    const selectedBtn = document.getElementById(`opt-btn-${optionIndex}`);
    const correctBtn = document.getElementById(`opt-btn-${q.correctIndex}`);

    if (isCorrect) {
      if (selectedBtn) selectedBtn.classList.add('btn-correct');
      if (window.soundEngine) window.soundEngine.playSuccess();
      
      // Question value: 100 Base PTS + Speed Bonus: up to 10 PTS based on question answer speed
      const basePts = 100;
      const elapsedSec = (Date.now() - (this.questionStartTime || Date.now())) / 1000;
      const speedBonus = Math.max(0, Math.min(10, Math.round((1 - (elapsedSec / 120)) * 10)));
      const earnedScore = basePts + speedBonus;
      this.game.addScore(earnedScore);
      
      const bonusText = speedBonus > 0 ? ` (+${speedBonus} speed bonus)` : '';
      this.showFeedback(true, `CORRECT! +${earnedScore} PTS`, `+${basePts} Base PTS${bonusText}\n\n${q.explanation}`);
    } else {
      if (selectedBtn) selectedBtn.classList.add('btn-wrong');
      if (correctBtn) correctBtn.classList.add('btn-correct');
      if (window.soundEngine) window.soundEngine.playError();

      this.showFeedback(false, "INCORRECT! Wrong Option Selected.", q.explanation);
    }
  }

  showFeedback(isSuccess, headline, explanation) {
    const card = document.getElementById('visual-feedback-card');
    if (!card) return;

    card.className = `feedback-card ${isSuccess ? 'feedback-success' : 'feedback-error'}`;
    card.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-status-pill ${isSuccess ? 'pill-success' : 'pill-error'}">${isSuccess ? 'CORRECT' : 'INCORRECT'}</span>
        <h3 class="feedback-title">${headline}</h3>
      </div>
      <p class="feedback-explanation">${explanation}</p>
      <div class="feedback-actions">
        <button class="neon-btn btn-primary" onclick="window.game.round1.nextPuzzle()">
          ${this.currentIndex + 1 < this.questions.length ? 'NEXT PUZZLE' : 'FINISH ROUND 1'}
        </button>
      </div>
    `;
    card.classList.remove('hidden');
  }

  nextPuzzle() {
    this.loadQuestion(this.currentIndex + 1);
  }

  // Perks Execution in Round 1
  apply5050() {
    if (this.answered) return;
    const q = this.questions[this.currentIndex];
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.correctIndex);
    // Shuffle and pick 2 to purge
    wrongIndices.sort(() => 0.5 - Math.random());
    this.purgedOptions = wrongIndices.slice(0, 2);

    this.purgedOptions.forEach(idx => {
      const btn = document.getElementById(`opt-btn-${idx}`);
      if (btn) {
        btn.classList.add('purged-option');
        btn.disabled = true;
      }
    });
    window.armoryStore.showFloatingHUDNotification("50/50 Purge Executed: 2 options eliminated.");
  }

  applyHint() {
    this.showingHint = true;
    const hintBox = document.getElementById('visual-hint-container');
    if (hintBox) hintBox.classList.remove('hidden');
    window.armoryStore.showFloatingHUDNotification("Diagnostic Hint Activated.");
  }

  applyFreeze() {
    this.freezeTimer(10);
    window.armoryStore.showFloatingHUDNotification("Timer Freeze: 10s added.");
  }

  finishRound() {
    this.stopTimer();
    this.game.showRoundCompletionModal(1);
  }

  escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

if (typeof window !== 'undefined') {
  window.Round1Visual = Round1Visual;
}
