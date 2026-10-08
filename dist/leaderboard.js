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
      $('meta-top-score').textContent = `${data.teams[0].points} PTS`;
    }

    // Render table rows
    body.innerHTML = data.teams.map(team => {
      let rankBadge;
      if (team.rank === 1) {
        rankBadge = `<span class="rank-badge rank-top-1">01 <span class="spark" aria-hidden="true">✳</span></span>`;
      } else if (team.rank === 2) {
        rankBadge = `<span class="rank-badge rank-top-2">02 <span class="spark" aria-hidden="true">★</span></span>`;
      } else if (team.rank === 3) {
        rankBadge = `<span class="rank-badge rank-top-3">03 <span class="spark" aria-hidden="true">★</span></span>`;
      } else {
        rankBadge = `<span class="rank-badge">${String(team.rank).padStart(2, '0')}</span>`;
      }

      return `<tr>
        <td class="col-rank">${rankBadge}</td>
        <td class="col-team">
          <div class="team-name-cell">
            <strong>${escapeHtml(team.teamName)}</strong>
            <small>Leader: ${escapeHtml(team.teamLeader)}</small>
          </div>
        </td>
        <td class="col-id"><span class="team-id-badge">${escapeHtml(team.teamId)}</span></td>
        <td class="col-points"><strong class="points-val ${team.rank <= 3 ? 'top-pts' : ''}">${team.points}</strong></td>
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
