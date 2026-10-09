/**
 * MIND//MIND Cyber Arena: Master Question Set Coordinator
 * Manages 4 Dedicated Competition Sets (ALPHA, BETA, GAMMA, DELTA)
 * Dispatches fixed questions per selected set with 0 state leakage
 */

(function () {
  // Ensure global QUESTION_SETS registry exists
  if (typeof window !== 'undefined' && !window.QUESTION_SETS) {
    window.QUESTION_SETS = {};
  }

  /**
   * Set of Available Competition Question Sets (SET 1 and SET 2)
   */
  const AVAILABLE_SETS = [
    {
      id: "set1",
      name: "SET 1 (ALPHA)",
      badge: "ALPHA",
      description: "15 Visual/Logic Puzzles, 16 Error Traps & 16 Buzzer Challenges (Alpha Matrix)"
    },
    {
      id: "set2",
      name: "SET 2 (BETA)",
      badge: "BETA",
      description: "15 Visual/Logic Puzzles, 16 Error Traps & 16 Buzzer Challenges (Beta Matrix)"
    }
  ];

  /**
   * Activates the selected question set
   * @param {string} setId - 'set1' | 'set2' | 'set3' | 'set4'
   */
  function setActiveQuestionSet(setId) {
    const targetId = (setId || 'set1').toLowerCase();
    const sets = (typeof window !== 'undefined' && window.QUESTION_SETS) ? window.QUESTION_SETS : {};
    
    // Fallback to set1 or first available
    const activeSet = sets[targetId] || sets['set1'] || window.QUESTION_SET_1 || Object.values(sets)[0];

    if (activeSet) {
      if (typeof window !== 'undefined') {
        window.CURRENT_QUESTION_SET = targetId;
        window.QUESTION_DATABASE = activeSet;
        try {
          localStorage.setItem('mindmind_question_set', targetId);
        } catch (e) { /* local storage disabled */ }
      }
      return activeSet;
    }
    return null;
  }

  /**
   * Returns active question set object
   */
  function getActiveQuestionSet() {
    if (typeof window !== 'undefined') {
      return window.QUESTION_DATABASE || window.QUESTION_SETS?.['set1'] || null;
    }
    return null;
  }

  /**
   * Returns metadata for all available sets
   */
  function getAvailableQuestionSets() {
    return AVAILABLE_SETS;
  }

  /**
   * Returns a fresh, deep-cloned question list for the requested round
   * Preserves fixed question sequence as defined in the selected set
   */
  function getShuffledQuestions(roundKey, limit = null) {
    const db = (typeof window !== 'undefined' && window.QUESTION_DATABASE)
      ? window.QUESTION_DATABASE
      : (typeof window !== 'undefined' && window.QUESTION_SETS && window.QUESTION_SETS['set1'])
      ? window.QUESTION_SETS['set1']
      : null;

    if (!db || !db[roundKey] || !Array.isArray(db[roundKey])) {
      return [];
    }

    // Deep clone each question so runtime state (selected choices, purged items) never mutates definitions
    const pool = db[roundKey].map(q => JSON.parse(JSON.stringify(q)));

    return limit ? pool.slice(0, limit) : pool;
  }

  /**
   * Deep-clones and randomizes a single question's options if needed
   */
  function randomizeSingleQuestion(question) {
    const cloned = JSON.parse(JSON.stringify(question));

    if (Array.isArray(cloned.options) && typeof cloned.correctIndex === 'number') {
      const originalCorrectText = cloned.options[cloned.correctIndex];
      shuffleArray(cloned.options);
      cloned.correctIndex = cloned.options.indexOf(originalCorrectText);
    }

    if (Array.isArray(cloned.fixOptions) && typeof cloned.correctFixIndex === 'number') {
      const originalCorrectFix = cloned.fixOptions[cloned.correctFixIndex];
      shuffleArray(cloned.fixOptions);
      cloned.correctFixIndex = cloned.fixOptions.indexOf(originalCorrectFix);
    }

    return cloned;
  }

  /**
   * Fisher-Yates array shuffle algorithm
   */
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // Tactical Reference Sheets Unlocked in the Armory
  const CHEAT_SHEETS = {
    c: {
      title: "C Core Mechanics & Memory Architecture",
      content: `
### Pointers & Memory
- **Pointers**: \`int *p = &a;\` stores memory address. \`*p\` dereferences to read or mutate memory.
- **Dangling Pointers**: Never dereference memory after calling \`free(p)\`, and never return the address of a local stack variable.
- **Strings**: Always account for the null terminator \`\\0\`. \"CAT\" requires 4 bytes (\`sizeof(\"CAT\") == 4\`).
- **Operators**: Assignment \`=\` modifies variables; equality comparison requires \`==\`.

### Formats & Arithmetic
- **Integer Division**: \`9 / 2\` truncates to \`4\` before float conversion.
- **Scanf**: Always pass the memory address: \`scanf(\"%d\", &age);\`.
`
    },
    python: {
      title: "Python Fundamentals & Traps",
      content: `
### Object References & Mutation
- **Assignment**: \`b = a\` copies the reference, not the object. Mutating \`b\` also modifies \`a\`!
- **Immutability**: Strings and tuples are immutable. In-place index assignments like \`s[0] = 'H'\` raise TypeError.
- **Identity vs Equality**: \`is\` checks memory identity; \`==\` checks value equality.
- **Dictionary Keys**: Must be immutable and hashable. Lists cannot be dictionary keys; use tuples instead.
- **Scope**: Modifying an outer variable inside a function without \`global\` raises \`UnboundLocalError\`.
`
    },
    logic_html: {
      title: "HTML Fundamentals & Logical Reasoning",
      content: `
### Basic HTML Tags
- **Hyperlinks & Media**: \`<a href=\"url\">\` uses \`href\`. \`<img src=\"img.png\" alt=\"...\">\` requires \`src\` and \`alt\`.
- **Tables**: \`<table>\` contains rows \`<tr>\`, which hold cells \`<td>\` or headers \`<th>\`.
- **Input Types**: \`<input type=\"password\">\`, \`<input type=\"text\">\`, \`<input type=\"email\">\`.

### Logical Reasoning Rules
- **Handshake Formula**: Total handshakes among \(n\) people = \(n \\times (n - 1) / 2\).
- **Dice**: Opposite faces on a standard 6-sided die always sum to 7.
- **Speed Conversion**: Convert km/h to m/s by multiplying with \(5 / 18\).
- **Independent Events**: Past coin flips never influence subsequent flips (always 50% for a fair coin).
`
    }
  };

  // Attach to window runtime
  if (typeof window !== 'undefined') {
    window.AVAILABLE_SETS = AVAILABLE_SETS;
    window.setActiveQuestionSet = setActiveQuestionSet;
    window.getActiveQuestionSet = getActiveQuestionSet;
    window.getAvailableQuestionSets = getAvailableQuestionSets;
    window.getShuffledQuestions = getShuffledQuestions;
    window.randomizeSingleQuestion = randomizeSingleQuestion;
    window.shuffleArray = shuffleArray;
    window.CHEAT_SHEETS = CHEAT_SHEETS;

    // Initialize with stored or default Set 1
    let defaultSet = 'set1';
    try {
      const stored = localStorage.getItem('mindmind_question_set');
      if (stored && ['set1', 'set2', 'set3', 'set4'].includes(stored)) {
        defaultSet = stored;
      }
    } catch (e) { /* ignore */ }

    // Activate default set
    setActiveQuestionSet(defaultSet);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      AVAILABLE_SETS,
      setActiveQuestionSet,
      getActiveQuestionSet,
      getAvailableQuestionSets,
      getShuffledQuestions,
      randomizeSingleQuestion,
      shuffleArray,
      CHEAT_SHEETS
    };
  }
})();
