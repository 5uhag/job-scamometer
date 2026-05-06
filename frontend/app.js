const API_URL = 'http://localhost:8000'; // Replace with your Render URL after deploy

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Drag-and-drop PDF zone
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

// Analyse PDF
document.getElementById('analyse-pdf-btn').addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) { alert('Please select a PDF file first.'); return; }
  const fd = new FormData();
  fd.append('file', file);
  await analyse(fd, 'pdf', 'analyse-pdf-btn');
});

// Analyse text
document.getElementById('analyse-text-btn').addEventListener('click', async () => {
  const text = document.getElementById('offer-text').value.trim();
  if (!text) { alert('Please paste some text first.'); return; }
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
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Could not reach the API. Is the backend running?\n\n' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = endpoint === 'pdf' ? 'Analyse PDF' : 'Analyse Text';
  }
}

function renderResult(data) {
  const el = document.getElementById('result');

  const colorClass = data.color === 'green' ? 'green' : data.color === 'amber' ? 'amber' : 'red';
  const scoreWidth = data.score + '%';

  const redCards = data.red_flags.length
    ? data.red_flags.map(f => flagCard(f, 'red')).join('')
    : '<p class="no-flags">No red flags detected.</p>';

  const greenCards = data.green_flags.length
    ? data.green_flags.map(f => flagCard(f, 'green')).join('')
    : '<p class="no-flags">No green flags detected.</p>';

  el.innerHTML = `
    <div class="verdict-card ${colorClass}">
      <div class="verdict-title">${data.verdict}</div>
      <div class="verdict-sub">Legitimacy score: ${data.score} / 100</div>
      <div class="score-bar-wrap">
        <div class="score-label"><span>0 — Scam</span><span>100 — Genuine</span></div>
        <div class="score-track">
          <div class="score-fill" style="width:${scoreWidth}"></div>
        </div>
      </div>
    </div>

    <div class="flags-section" style="margin-bottom:1.5rem">
      <h2>🚩 Red Flags (${data.red_flags.length})</h2>
      ${redCards}
    </div>

    <div class="flags-section">
      <h2>✅ Green Flags (${data.green_flags.length})</h2>
      ${greenCards}
    </div>
  `;
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
