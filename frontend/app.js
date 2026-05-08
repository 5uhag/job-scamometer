const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000' : '';

// ── Auth (localStorage) ───────────────────────────────────────────────────────
const AUTH = {
  get users()   { return JSON.parse(localStorage.getItem('scamo_users')   || '[]');   },
  set users(v)  { localStorage.setItem('scamo_users',   JSON.stringify(v)); },
  get current() { return JSON.parse(localStorage.getItem('scamo_current') || 'null'); },
  set current(v){ localStorage.setItem('scamo_current', v ? JSON.stringify(v) : 'null'); },

  register(name, email, password) {
    const users = this.users;
    if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()))
      return { error: 'This email is already registered.' };
    const user = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), pw: btoa(password) };
    users.push(user);
    this.users = users;
    this.current = { id: user.id, name: user.name, email: user.email };
    return { success: true };
  },

  login(email, password) {
    const user = this.users.find(u =>
      u.email.toLowerCase() === email.trim().toLowerCase() && u.pw === btoa(password)
    );
    if (!user) return { error: 'Invalid email or password.' };
    this.current = { id: user.id, name: user.name, email: user.email };
    return { success: true };
  },

  logout() {
    this.current = null;
    renderNavAuth();
  }
};

// ── Nav auth rendering ────────────────────────────────────────────────────────
function renderNavAuth() {
  const area = document.getElementById('nav-auth-area');
  const user = AUTH.current;

  if (user) {
    const initial = user.name.charAt(0).toUpperCase();
    area.innerHTML = `
      <div class="user-pill" id="user-pill">
        <div class="user-avatar">${initial}</div>
        <span class="user-name-nav">${user.name.split(' ')[0]}</span>
        <svg class="user-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="user-dropdown">
          <div class="user-dropdown-name">${user.name}</div>
          <div class="user-dropdown-email">${user.email}</div>
          <button class="user-dropdown-btn" id="logout-btn">Sign out</button>
        </div>
      </div>`;

    document.getElementById('user-pill').addEventListener('click', e => {
      document.getElementById('user-pill').classList.toggle('open');
      e.stopPropagation();
    });
    document.getElementById('logout-btn').addEventListener('click', e => {
      AUTH.logout();
      e.stopPropagation();
    });
  } else {
    area.innerHTML = `
      <button class="nav-btn-ghost" id="nav-signin-btn">Sign In</button>
      <button class="nav-btn-solid" id="nav-signup-btn">Sign Up</button>`;
    document.getElementById('nav-signin-btn').addEventListener('click', () => openModal('signin'));
    document.getElementById('nav-signup-btn').addEventListener('click', () => openModal('signup'));
  }
}

// close dropdown on outside click
document.addEventListener('click', () => {
  const pill = document.getElementById('user-pill');
  if (pill) pill.classList.remove('open');
});

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(tab) {
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchModalTab(tab);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  clearAuthErrors();
}

function switchModalTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.form === tab));
  document.querySelectorAll('.modal-form').forEach(f => f.classList.toggle('active', f.id === tab + '-form'));
  document.getElementById('modal-title').textContent = tab === 'signin' ? 'Welcome back' : 'Create account';
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = ''; el.classList.remove('visible');
  });
}

function showAuthError(formId, msg) {
  const el = document.getElementById(formId + '-error');
  el.textContent = msg;
  el.classList.add('visible');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => { clearAuthErrors(); switchModalTab(tab.dataset.form); });
});
document.querySelectorAll('.link-btn').forEach(btn => {
  btn.addEventListener('click', () => { clearAuthErrors(); switchModalTab(btn.dataset.form); });
});

document.getElementById('signin-form').addEventListener('submit', e => {
  e.preventDefault();
  const email    = document.getElementById('si-email').value;
  const password = document.getElementById('si-password').value;
  if (!email || !password) { showAuthError('signin', 'Please fill in all fields.'); return; }
  const result = AUTH.login(email, password);
  if (result.error) { showAuthError('signin', result.error); return; }
  closeModal();
  renderNavAuth();
});

document.getElementById('signup-form').addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('su-name').value;
  const email    = document.getElementById('su-email').value;
  const password = document.getElementById('su-password').value;
  if (!name || !email || !password) { showAuthError('signup', 'Please fill in all fields.'); return; }
  if (password.length < 6) { showAuthError('signup', 'Password must be at least 6 characters.'); return; }
  const result = AUTH.register(name, email, password);
  if (result.error) { showAuthError('signup', result.error); return; }
  closeModal();
  renderNavAuth();
});

// ── Nav scroll effect ─────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('site-nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ── Drag-and-drop PDF ─────────────────────────────────────────────────────────
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileName  = document.getElementById('file-name');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') {
    fileInput.files = e.dataTransfer.files;
    fileName.textContent = file.name;
  }
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) fileName.textContent = fileInput.files[0].name;
});

// ── Analyse buttons ───────────────────────────────────────────────────────────
document.getElementById('analyse-pdf-btn').addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) { showError('Please select a PDF file first.'); return; }
  const fd = new FormData();
  fd.append('file', file);
  await analyse(fd, 'pdf', 'analyse-pdf-btn');
});

document.getElementById('analyse-text-btn').addEventListener('click', async () => {
  const text = document.getElementById('offer-text').value.trim();
  if (!text) { showError('Please paste some text first.'); return; }
  const fd = new FormData();
  fd.append('text', text);
  await analyse(fd, 'text', 'analyse-text-btn');
});

async function analyse(formData, endpoint, btnId) {
  const btn = document.getElementById(btnId);
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Analysing…';

  try {
    const res = await fetch(`${API_URL}/analyse/${endpoint}`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    renderResult(data);
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showError('Could not reach the API. Is the backend running?\n\n' + err.message);
  } finally {
    btn.disabled = false;
    const searchIcon = '<svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    btn.innerHTML = searchIcon + (endpoint === 'pdf' ? 'Analyse PDF' : 'Analyse Text');
  }
}

// ── Score gauge SVG ───────────────────────────────────────────────────────────
function scoreGaugeSVG(colorClass) {
  const r = 52;
  const circ = +(2 * Math.PI * r).toFixed(2);
  const stroke = colorClass === 'green' ? '#22C55E' : colorClass === 'amber' ? '#F59E0B' : '#EF4444';
  return `
    <div class="score-gauge-wrap">
      <svg class="score-gauge" viewBox="0 0 120 120" width="130" height="130">
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="${stroke}" stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${circ}"
          transform="rotate(-90 60 60)"
          class="score-ring"/>
        <text x="60" y="55" text-anchor="middle" dominant-baseline="middle"
          fill="white" font-size="27" font-weight="700"
          font-family="JetBrains Mono, monospace"
          class="score-num">0</text>
        <text x="60" y="75" text-anchor="middle" dominant-baseline="middle"
          fill="rgba(255,255,255,0.4)" font-size="11"
          font-family="JetBrains Mono, monospace">/100</text>
      </svg>
    </div>`;
}

// ── Result rendering ──────────────────────────────────────────────────────────
function renderResult(data) {
  const el = document.getElementById('result');
  const colorClass = data.color === 'green' ? 'green' : data.color === 'amber' ? 'amber' : 'red';

  const redCards = data.red_flags.length
    ? data.red_flags.map(f => flagCard(f, 'red')).join('')
    : '<p class="no-flags">No red flags detected — good sign.</p>';

  const greenCards = data.green_flags.length
    ? data.green_flags.map(f => flagCard(f, 'green')).join('')
    : '<p class="no-flags">No green flags detected — letter lacks trust signals.</p>';

  el.innerHTML = `
    <div class="verdict-card ${colorClass}">
      ${scoreGaugeSVG(colorClass)}
      <div class="verdict-label">${data.verdict}</div>
      <div class="verdict-detail">Legitimacy score: ${data.score} / 100</div>
    </div>
    <div class="result-flags">
      <div class="flags-heading">
        <span>Red Flags</span>
        <span class="flag-count">${data.red_flags.length}</span>
      </div>
      ${redCards}
      <div class="flags-heading">
        <span>Green Flags</span>
        <span class="flag-count">${data.green_flags.length}</span>
      </div>
      ${greenCards}
    </div>`;

  // Animate gauge ring + counter
  const ring  = el.querySelector('.score-ring');
  const numEl = el.querySelector('.score-num');
  if (ring && numEl) {
    const circ    = parseFloat(ring.getAttribute('stroke-dasharray'));
    const target  = circ * (1 - data.score / 100);
    const dur     = 900;
    let   start   = null;
    const ease    = t => 1 - Math.pow(1 - t, 3);

    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = ease(p);
      ring.style.strokeDashoffset = circ - (circ - target) * e;
      numEl.textContent = Math.round(data.score * e);
      if (p < 1) requestAnimationFrame(step);
      else numEl.textContent = data.score;
    }
    requestAnimationFrame(step);
  }
}

function flagCard(flag, type) {
  const icon  = type === 'red' ? '🚩' : '✅';
  const cls   = type === 'red' ? 'red-flag' : 'green-flag';
  const idCls = type === 'red' ? 'red' : 'green';
  return `
    <div class="flag-card ${cls}">
      <div class="flag-icon">${icon}</div>
      <div class="flag-body">
        <strong>${flag.name} <span class="flag-id ${idCls}">${flag.id}</span></strong>
        <p>${flag.message}</p>
      </div>
    </div>`;
}

function showError(msg) { alert(msg); }

// ── Init ──────────────────────────────────────────────────────────────────────
renderNavAuth();
if (window.scrollY > 20) document.getElementById('site-nav').classList.add('scrolled');
