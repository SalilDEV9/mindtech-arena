'use strict';

const $ = id => document.getElementById(id);

// Mobile Nav Toggle
const menuButton = document.querySelector('.menu-toggle');
function closeMenu() {
  const mobileNav = $('mobile-nav');
  if (mobileNav) mobileNav.hidden = true;
  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
}

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    const mobileNav = $('mobile-nav');
    if (mobileNav) mobileNav.hidden = !open;
  });
}

document.querySelectorAll('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const mobileNav = $('mobile-nav');
    if (mobileNav && !mobileNav.hidden) {
      closeMenu();
      if (menuButton) menuButton.focus();
    }
    const modal = $('password-modal');
    if (modal && !modal.hidden) {
      closePasswordModal();
    }
  }
});

window.matchMedia('(min-width:761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// State Management
let currentLeaderboardPage = 1;
const LEADERBOARD_LIMIT = 15;
let currentTeamsList = [];
const stagedUpdates = new Map(); // teamId -> { teamId, teamName, points, originalPoints }
const activeEditingTeams = new Set(); // Set of teamId strings currently in edit mode

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

function showToast(message, type = 'info') {
  const toastEl = $('toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = `toast visible ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  setTimeout(() => {
    toastEl.className = 'toast';
  }, 4000);
}

function updateStagedUI() {
  const btn = $('btn-update-scores');
  const badge = $('staged-count-badge');
  const count = stagedUpdates.size;

  if (!btn || !badge) return;

  if (count > 0) {
    btn.disabled = false;
    btn.classList.add('has-staged');
    badge.hidden = false;
    badge.textContent = String(count);
  } else {
    btn.disabled = true;
    btn.classList.remove('has-staged');
    badge.hidden = true;
    badge.textContent = '0';
  }
}

function renderTeamRow(team) {
  const isEditing = activeEditingTeams.has(team.teamId);
  const isStaged = stagedUpdates.has(team.teamId);
  const currentPoints = isStaged ? stagedUpdates.get(team.teamId).points : team.points;

  let rankShieldClass = 'rank-shield';
  if (team.rank === 1) rankShieldClass = 'rank-shield rank-shield-1';
  else if (team.rank === 2) rankShieldClass = 'rank-shield rank-shield-2';
  else if (team.rank === 3) rankShieldClass = 'rank-shield rank-shield-3';

  const ordinal = getOrdinal(team.rank);

  let pointsCellHtml = '';
  if (isEditing) {
    pointsCellHtml = `
      <div class="inline-edit-wrap">
        <input
          type="number"
          min="0"
          max="100000"
          id="input-${escapeHtml(team.teamId)}"
          class="inline-score-input"
          value="${currentPoints}"
          data-team-id="${escapeHtml(team.teamId)}"
          aria-label="Score for ${escapeHtml(team.teamName)}"
        />
        <div class="inline-edit-actions">
          <button type="button" class="btn-row-action btn-row-done" data-action="done" data-team-id="${escapeHtml(team.teamId)}" title="Confirm score">
            ✓ Done
          </button>
          <button type="button" class="btn-row-action btn-row-cancel" data-action="cancel" data-team-id="${escapeHtml(team.teamId)}" title="Cancel edit">
            ✕ Cancel
          </button>
        </div>
      </div>
    `;
  } else {
    pointsCellHtml = `
      <div class="points-flex">
        <span class="points-icon">★</span>
        <span class="points-value ${team.rank <= 3 ? 'top-points' : ''}">${Number(currentPoints).toLocaleString()}</span>
        <span class="points-unit">PTS</span>
        ${isStaged ? '<span class="staged-pill" title="Staged for database update">Pending</span>' : ''}
        <button
          type="button"
          class="btn-row-action btn-row-edit"
          data-action="edit"
          data-team-id="${escapeHtml(team.teamId)}"
          title="Edit score for ${escapeHtml(team.teamName)}"
          aria-label="Edit score for ${escapeHtml(team.teamName)}"
        >
          ✏️
        </button>
      </div>
    `;
  }

  return `
    <tr id="row-${escapeHtml(team.teamId)}" class="${isStaged ? 'row-staged' : ''} ${isEditing ? 'row-editing' : ''}">
      <td class="col-rank">
        <div class="rank-flex">
          <span class="${rankShieldClass}">${team.rank}</span>
          <span class="rank-ordinal ${team.rank <= 3 ? 'top-ordinal' : ''}">${ordinal}</span>
        </div>
      </td>
      <td class="col-user">
        <div class="user-cell">
          <strong class="user-team-name">${escapeHtml(team.teamName)}</strong>
          <div class="user-meta">
            <span class="user-leader">${escapeHtml(team.teamLeader)}</span>
            <span class="user-divider">·</span>
            <span class="user-id">${escapeHtml(team.teamId)}</span>
          </div>
        </div>
      </td>
      <td class="col-wagered">
        ${pointsCellHtml}
      </td>
    </tr>
  `;
}

function renderTableRows() {
  const body = $('leaderboard-body');
  if (!body) return;
  body.innerHTML = currentTeamsList.map(renderTeamRow).join('');

  // Auto-focus any active input
  if (activeEditingTeams.size > 0) {
    const firstActiveId = Array.from(activeEditingTeams)[0];
    const input = $(`input-${firstActiveId}`);
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// Table Action Delegations
$('leaderboard-body')?.addEventListener('click', event => {
  const btn = event.target.closest('.btn-row-action');
  if (!btn) return;

  const action = btn.dataset.action;
  const teamId = btn.dataset.teamId;
  const team = currentTeamsList.find(t => t.teamId === teamId);
  if (!team) return;

  if (action === 'edit') {
    activeEditingTeams.add(teamId);
    renderTableRows();
  } else if (action === 'cancel') {
    activeEditingTeams.delete(teamId);
    renderTableRows();
  } else if (action === 'done') {
    const input = $(`input-${teamId}`);
    if (!input) return;

    const newPoints = parseInt(input.value, 10);
    if (isNaN(newPoints) || newPoints < 0) {
      showToast('Please enter a valid non-negative score.', 'error');
      input.focus();
      return;
    }

    if (newPoints !== team.points) {
      stagedUpdates.set(teamId, {
        teamId,
        teamName: team.teamName,
        points: newPoints,
        originalPoints: team.points
      });
      showToast(`Score for "${team.teamName}" staged as ${newPoints} PTS. Click "Update Scores" to save.`, 'info');
    } else {
      stagedUpdates.delete(teamId);
    }

    activeEditingTeams.delete(teamId);
    updateStagedUI();
    renderTableRows();
  }
});

// Support Enter and Escape keys in inline input
$('leaderboard-body')?.addEventListener('keydown', event => {
  if (event.target.classList.contains('inline-score-input')) {
    const teamId = event.target.dataset.teamId;
    if (event.key === 'Enter') {
      event.preventDefault();
      const doneBtn = document.querySelector(`.btn-row-done[data-team-id="${teamId}"]`);
      if (doneBtn) doneBtn.click();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      const cancelBtn = document.querySelector(`.btn-row-cancel[data-team-id="${teamId}"]`);
      if (cancelBtn) cancelBtn.click();
    }
  }
});

// Load Leaderboard Data
async function loadLeaderboard(page = 1, shouldScroll = false) {
  currentLeaderboardPage = page;
  const body = $('leaderboard-body');
  const loader = $('leaderboard-loader');
  const errorEl = $('leaderboard-error');
  const emptyEl = $('leaderboard-empty');
  const errorMsg = $('leaderboard-error-msg');
  const table = $('leaderboard-table');
  const pagination = $('leaderboard-pagination');

  if (!body) return;

  loader.hidden = false;
  errorEl.hidden = true;
  emptyEl.hidden = true;
  body.replaceChildren();

  try {
    const res = await fetch(`/api/leaderboard?page=${page}&limit=${LEADERBOARD_LIMIT}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server responded with status ${res.status}`);
    }

    const { data } = await res.json();
    loader.hidden = true;

    if (!data || !data.teams || data.teams.length === 0) {
      emptyEl.hidden = false;
      table.hidden = true;
      pagination.hidden = true;
      currentTeamsList = [];
      return;
    }

    table.hidden = false;
    pagination.hidden = false;
    currentTeamsList = data.teams;

    // Update metadata stats
    if ($('meta-total-teams')) $('meta-total-teams').textContent = String(data.pagination.totalTeams);
    if ($('meta-top-score') && data.teams.length > 0 && page === 1) {
      $('meta-top-score').textContent = `${data.teams[0].points.toLocaleString()} PTS`;
    }

    // Render table rows
    renderTableRows();
    updateStagedUI();

    // Update Pagination UI
    const startIdx = (page - 1) * LEADERBOARD_LIMIT + 1;
    const endIdx = Math.min(page * LEADERBOARD_LIMIT, data.pagination.totalTeams);
    $('pagination-info').textContent = `Showing teams ${startIdx}–${endIdx} of ${data.pagination.totalTeams}`;

    const prevBtn = $('prev-page-btn');
    const nextBtn = $('next-page-btn');
    prevBtn.disabled = !data.pagination.hasPrevPage;
    nextBtn.disabled = !data.pagination.hasNextPage;

    // Page Numbers
    const pageNumbersEl = $('page-numbers');
    pageNumbersEl.replaceChildren();
    for (let p = 1; p <= data.pagination.totalPages; p++) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = `page-num-btn ${p === page ? 'active' : ''}`;
      pageBtn.textContent = String(p);
      pageBtn.setAttribute('aria-label', `Page ${p}`);
      pageBtn.addEventListener('click', () => loadLeaderboard(p, true));
      pageNumbersEl.appendChild(pageBtn);
    }

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    loader.hidden = true;
    errorEl.hidden = false;
    table.hidden = true;
    pagination.hidden = true;
    errorMsg.textContent = err.message || 'Unable to load leaderboard. Please check database connection.';
  }
}

// Password Modal Handling
function openPasswordModal() {
  if (stagedUpdates.size === 0) {
    showToast('No score changes have been staged. Click ✏️ on any row to edit first.', 'info');
    return;
  }

  const modal = $('password-modal');
  const summaryEl = $('modal-changes-summary');
  const pwdInput = $('admin-password-input');
  const errAlert = $('modal-error-alert');

  if (!modal || !summaryEl) return;

  // Render pending updates summary
  const itemsHtml = Array.from(stagedUpdates.values()).map(u => `
    <div class="summary-item">
      <div class="summary-team">
        <strong>${escapeHtml(u.teamName)}</strong>
        <span class="summary-id">${escapeHtml(u.teamId)}</span>
      </div>
      <div class="summary-score-change">
        <span class="score-old">${u.originalPoints}</span>
        <span class="score-arrow">→</span>
        <strong class="score-new">${u.points} PTS</strong>
      </div>
    </div>
  `).join('');

  summaryEl.innerHTML = `
    <div class="summary-title">Pending Changes (${stagedUpdates.size} ${stagedUpdates.size === 1 ? 'team' : 'teams'}):</div>
    <div class="summary-list">${itemsHtml}</div>
  `;

  if (errAlert) errAlert.hidden = true;
  if (pwdInput) pwdInput.value = '';

  modal.hidden = false;
  setTimeout(() => {
    if (pwdInput) pwdInput.focus();
  }, 50);
}

function closePasswordModal() {
  const modal = $('password-modal');
  if (modal) modal.hidden = true;
  const errAlert = $('modal-error-alert');
  if (errAlert) errAlert.hidden = true;
}

// Modal Event Listeners
$('btn-update-scores')?.addEventListener('click', openPasswordModal);
$('modal-cancel-btn')?.addEventListener('click', closePasswordModal);

$('password-modal')?.addEventListener('click', event => {
  if (event.target === $('password-modal')) {
    closePasswordModal();
  }
});

// Password Form Submit
$('password-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const pwdInput = $('admin-password-input');
  const errAlert = $('modal-error-alert');
  const errText = $('modal-error-text');
  const submitBtn = $('modal-submit-btn');
  const btnText = $('submit-btn-text');
  const spinner = $('submit-btn-spinner');

  if (!pwdInput || stagedUpdates.size === 0) return;

  const password = pwdInput.value.trim();
  if (!password) {
    pwdInput.focus();
    return;
  }

  // Set loading state
  submitBtn.disabled = true;
  if (btnText) btnText.textContent = 'Verifying & Updating...';
  if (spinner) spinner.hidden = false;
  if (errAlert) errAlert.hidden = true;

  const updatesPayload = Array.from(stagedUpdates.values()).map(u => ({
    teamId: u.teamId,
    points: u.points
  }));

  try {
    const res = await fetch('/api/leaderboard/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        updates: updatesPayload
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update scores. Check password.');
    }

    // Success!
    closePasswordModal();
    const updatedCount = stagedUpdates.size;
    stagedUpdates.clear();
    activeEditingTeams.clear();
    updateStagedUI();
    showToast(`✓ Successfully updated ${updatedCount} team ${updatedCount === 1 ? 'score' : 'scores'} in MongoDB!`, 'success');

    // Refresh Leaderboard from server
    await loadLeaderboard(currentLeaderboardPage, false);
  } catch (err) {
    if (errAlert && errText) {
      errAlert.hidden = false;
      errText.textContent = err.message || 'Incorrect admin password. Please try again.';
      pwdInput.classList.add('input-shake');
      setTimeout(() => pwdInput.classList.remove('input-shake'), 600);
      pwdInput.focus();
      pwdInput.select();
    }
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Confirm & Update';
    if (spinner) spinner.hidden = true;
  }
});

// Pagination & Retry
$('prev-page-btn')?.addEventListener('click', () => {
  if (currentLeaderboardPage > 1) loadLeaderboard(currentLeaderboardPage - 1, true);
});

$('next-page-btn')?.addEventListener('click', () => {
  loadLeaderboard(currentLeaderboardPage + 1, true);
});

$('leaderboard-retry')?.addEventListener('click', () => {
  loadLeaderboard(currentLeaderboardPage, false);
});

// Initial Fetch
loadLeaderboard(1);
