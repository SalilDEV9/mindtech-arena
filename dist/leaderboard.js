'use strict';

const $ = id => document.getElementById(id);

// Mobile Nav Toggle
const menuButton = document.querySelector('.menu-toggle');
function closeMenu() {
  $('mobile-nav').hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('mobile-nav').hidden = !open;
  });
}

document.querySelectorAll('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('mobile-nav').hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width:761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Leaderboard Logic
let currentLeaderboardPage = 1;
const LEADERBOARD_LIMIT = 15;

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
      return;
    }

    table.hidden = false;
    pagination.hidden = false;

    // Update metadata stats
    if ($('meta-total-teams')) $('meta-total-teams').textContent = String(data.pagination.totalTeams);
    if ($('meta-top-score') && data.teams.length > 0 && page === 1) {
      $('meta-top-score').textContent = `${data.teams[0].points.toLocaleString()} PTS`;
    }

    // Render table rows matching reference screenshot
    body.innerHTML = data.teams.map(team => {
      let rankShieldClass = 'rank-shield';
      if (team.rank === 1) rankShieldClass = 'rank-shield rank-shield-1';
      else if (team.rank === 2) rankShieldClass = 'rank-shield rank-shield-2';
      else if (team.rank === 3) rankShieldClass = 'rank-shield rank-shield-3';

      const ordinal = getOrdinal(team.rank);

      return `<tr>
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
          <div class="points-flex">
            <span class="points-icon">★</span>
            <span class="points-value ${team.rank <= 3 ? 'top-points' : ''}">${team.points.toLocaleString()}</span>
            <span class="points-unit">PTS</span>
          </div>
        </td>
      </tr>`;
    }).join('');

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

$('prev-page-btn')?.addEventListener('click', () => {
  if (currentLeaderboardPage > 1) loadLeaderboard(currentLeaderboardPage - 1, true);
});

$('next-page-btn')?.addEventListener('click', () => {
  loadLeaderboard(currentLeaderboardPage + 1, true);
});

$('leaderboard-retry')?.addEventListener('click', () => {
  loadLeaderboard(currentLeaderboardPage, false);
});

// Initial fetch
loadLeaderboard(1);
