'use strict';
const rounds = [
  {name:'MIND RUSH', title:['FAST MINDS.','FIRST MOVES.'], icon:'↯', description:'Crack visual challenges, spot errors and race through a buzzer finish. Put your HTML, CSS, basic programming and reasoning skills to the test.', tags:['Visual challenges','Logic & tech','Buzzer finish'], payoff:'Earn credits for what comes next.'},
  {name:'IDEA FORGE', title:['BOLD IDEAS.','UNEXPECTED TURNS.'], icon:'✳', description:'Turn everyday problems into smart ideas. Brainstorm with your team, put your earned credits to use and tackle a surprise twist that challenges your creativity.', tags:['Creative thinking','Team strategy','Surprise twist'], payoff:'Give a meaningful problem a fresh perspective.'},
  {name:'VISION ARENA', title:['YOUR SOLUTION.','YOUR SPOTLIGHT.'], icon:'↗', description:'Finalist teams take the stage to present their solution. Explain the problem, show how your idea helps and make a clear, convincing case for its impact.', tags:['Finalist teams','Clear thinking','Real-world impact'], payoff:'Make your thinking count in front of the judges.'}
];
const $ = id => document.getElementById(id);
const tabs = [...document.querySelectorAll('[data-round]')];
function selectRound(index, focus = false) {
  const round = rounds[index];
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  $('round-panel').setAttribute('aria-labelledby', `tab-${index}`);
  $('panel-kicker').textContent = `ROUND 0${index + 1} / ${round.name}`;
  $('panel-title').replaceChildren(document.createTextNode(round.title[0]), document.createElement('br'), document.createTextNode(round.title[1]));
  $('round-icon').textContent = round.icon;
  $('panel-description').textContent = round.description;
  $('panel-tags').replaceChildren(...round.tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
  $('panel-payoff').textContent = round.payoff;
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRound(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectRound(next, true); }
  });
});
const menuButton = document.querySelector('.menu-toggle');
function closeMenu() { $('mobile-nav').hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('mobile-nav').hidden = !open;
});
document.querySelectorAll('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('mobile-nav').hidden) { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width:761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const cfg = window.EVENT_CONFIG || {};
const fields = {dateLabel:'event-date',timeLabel:'event-time',venueDetail:'venue-detail',teamSize:'team-answer',fee:'fee-answer',prizes:'prize-answer'};
for (const [key, id] of Object.entries(fields)) if (cfg[key]) $(id).textContent = cfg[key];
if (cfg.registrationUrl) {
  try {
    const url = new URL(cfg.registrationUrl);
    if (url.protocol !== 'https:') throw new Error('Registration requires HTTPS');
    const link = $('registration-cta');
    link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', 'Register for MindTech Arena');
    link.querySelector('span').textContent = 'REGISTER NOW';
    $('registration-label').textContent = 'Register on MakeMyPass';
    $('registration-note').textContent = 'Registration fee: ₹20 · See MakeMyPass for team details and payment instructions.';
  } catch { /* Keep the coming-soon state for invalid configuration. */ }
}
let countdownTimer;
function updateCountdown() {
  const start = Date.parse(cfg.startDate);
  if (!Number.isFinite(start)) return;
  const delta = start - Date.now();
  $('countdown').hidden = false;
  if (delta <= 0) {
    const end = Date.parse(cfg.endDate);
    $('countdown').firstElementChild.textContent = Number.isFinite(end) && Date.now() < end ? 'THE ARENA IS LIVE' : 'THE ARENA HAS BEGUN';
    $('countdown-values').replaceChildren();
    if (Number.isFinite(end) && Date.now() >= end) $('countdown').firstElementChild.textContent = 'THANK YOU FOR BEING PART OF THE ARENA';
    return;
  }
  const values = [Math.floor(delta/86400000),Math.floor(delta/3600000)%24,Math.floor(delta/60000)%60,Math.floor(delta/1000)%60];
  const units = ['DAYS','HOURS','MINUTES','SECONDS'];
  $('countdown-values').replaceChildren(...values.map((value,index) => {
    const wrapper = document.createElement('div'), number = document.createElement('b'), unit = document.createElement('small');
    number.textContent = String(value).padStart(2,'0'); unit.textContent = units[index]; wrapper.append(number,unit); return wrapper;
  }));
}
if (cfg.startDate && Number.isFinite(Date.parse(cfg.startDate))) { updateCountdown(); countdownTimer = setInterval(updateCountdown,1000); }
let toastTimer;
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'),4500); }
$('share-button').addEventListener('click', async () => {
  const url = location.origin + location.pathname;
  const message = {title:'MindTech Arena | MindQuest',text:'Think fast. Team up. Make your move at MindTech Arena.',url};
  try {
    if (navigator.share) await navigator.share(message);
    else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast('Link copied. Share it with your team.'); }
    else toast('Copy the address from your browser to share this page.');
  } catch (error) { if (error.name !== 'AbortError') toast('You can copy the page address to share it with your team.'); }
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
      const section = $('leaderboard');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
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

