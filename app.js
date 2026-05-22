const appState = {
  html: '<h1>Salom, Dunyo!</h1>\n<p>Kod yozishni boshlang...</p>',
  css: 'body { font-family:sans-serif; padding:2rem; }',
  js: 'console.log("KOD PRO ga xush kelibsiz!");',
  currentTab: 'html',
  currentOutput: 'preview',
  currentView: 'editor'
};

const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('lineNumbers');
const preview = document.getElementById('preview');
const consoleEl = document.getElementById('console');
const cursorPos = document.getElementById('cursorPos');
const fileSize = document.getElementById('fileSize');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const installBtn = document.getElementById('installBtn');

let renderTimer;
const origLog = console.log;
const origWarn = console.warn;
const origError = console.error;

console.log = function() {
  addConsole('log', ...arguments);
  origLog.apply(console, arguments);
};
console.warn = function() {
  addConsole('warn', ...arguments);
  origWarn.apply(console, arguments);
};
console.error = function() {
  addConsole('error', ...arguments);
  origError.apply(console, arguments);
};

function addConsole(type, ...args) {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  const el = document.createElement('div');
  el.className = type;
  el.textContent = msg;
  consoleEl.appendChild(el);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function getCode() {
  return {
    html: appState.html,
    css: appState.css,
    js: appState.js
  };
}

function setCode(tab, value) {
  appState[tab] = value;
  updateLineNumbers();
  updateFileSize();
  scheduleRender();
  saveState();
}

function activeCode() {
  return appState[appState.currentTab];
}

function switchTab(tab) {
  const prev = appState.currentTab;
  appState.currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  if (prev !== tab) {
    appState[prev] = editor.value;
  }
  editor.value = appState[tab];
  updateLineNumbers();
  updateFileSize();
  updateCursorPos();
}

function updateLineNumbers() {
  const count = editor.value.split('\n').length;
  lineNumbers.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
}

function updateFileSize() {
  const bytes = new Blob([editor.value]).size;
  fileSize.textContent = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
}

function updateCursorPos() {
  const val = editor.value;
  const pos = editor.selectionStart;
  const upTo = val.substring(0, pos);
  const line = (upTo.match(/\n/g) || []).length + 1;
  const col = pos - upTo.lastIndexOf('\n');
  cursorPos.textContent = `Ln ${line}, Col ${col}`;
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, 400);
}

function renderPreview() {
  const code = getCode();
  const doc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${code.js}<\/script>
</body>
</html>`;
  preview.srcdoc = doc;
  statusDot.style.background = 'var(--ok)';
  statusText.textContent = 'yangilandi';
  setTimeout(() => { statusText.textContent = 'tayyor'; }, 1500);
}

function renderConsole() {
  consoleEl.innerHTML = '';
  try {
    const code = getCode();
    const combined = code.html + '\n<style>' + code.css + '</style>\n<script>' + code.js + '<\/script>';
    new Function(code.js)();
  } catch (e) {
    addConsole('error', 'Xatolik:', e.message);
  }
}

function switchOutput(tab) {
  appState.currentOutput = tab;
  document.querySelectorAll('.output-tab').forEach(t => t.classList.toggle('active', t.dataset.otab === tab));
  preview.classList.toggle('hidden', tab !== 'preview');
  consoleEl.classList.toggle('hidden', tab !== 'console');
  if (tab === 'console') renderConsole();
}

function switchView(view) {
  appState.currentView = view;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const isEditor = view === 'editor';
  const isPreview = view === 'preview';
  const isConsole = view === 'console';
  document.querySelector('.tabs-bar').style.display = isEditor ? 'flex' : 'none';
  document.querySelector('.editor-wrap').style.display = isEditor ? 'flex' : 'none';
  document.querySelector('.output-tabs-bar').style.display = isEditor || isConsole ? 'flex' : 'none';
  document.querySelector('.output-area').classList.toggle('hidden', !isEditor && !isPreview && !isConsole);
  // When in preview/console mode switch the output tab accordingly
  if (isPreview) switchOutput('preview');
  if (isConsole) switchOutput('console');
}

function saveState() {
  try {
    localStorage.setItem('kodpro', JSON.stringify({ html: appState.html, css: appState.css, js: appState.js }));
  } catch(e) {}
}

function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem('kodpro'));
    if (d) { appState.html = d.html || appState.html; appState.css = d.css || appState.css; appState.js = d.js || appState.js; }
  } catch(e) {}
}

function exportCode() {
  const code = getCode();
  const blob = new Blob([code.html + '\n<style>' + code.css + '</style>\n<script>' + code.js + '<\/script>'], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kod-pro-export.html';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Fayl yuklandi');
}

function copyCode() {
  navigator.clipboard.writeText(editor.value).then(() => showToast('Nusxalandi')).catch(() => {
    editor.select();
    document.execCommand('copy');
    showToast('Nusxalandi');
  });
}

function clearCode() {
  appState[appState.currentTab] = '';
  editor.value = '';
  updateLineNumbers();
  updateFileSize();
  scheduleRender();
  saveState();
  showToast('Tozalandi');
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'70px', left:'50%', transform:'translateX(-50%)',
    background:'var(--accent)', color:'#000', padding:'0.5rem 1.2rem',
    fontWeight:'700', fontSize:'0.75rem', zIndex:'200',
    transition:'opacity 0.3s', letterSpacing:'0.1em'
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 1500);
}

const TEMPLATES = [
  { name:'Bo'sh sahifa', desc:'Oddiy HTML struktura', html:'<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8">\n  <title>Mening sahifam</title>\n</head>\n<body>\n  <h1>Salom!</h1>\n</body>\n</html>', css:'', js:'' },
  { name:'Karta dizayni', desc:'Material uslubidagi karta', html:'<div class="card">\n  <img src="https://picsum.photos/400/200" alt="Rasm" style="width:100%">\n  <div class="card-body">\n    <h2>Karta sarlavhasi</h2>\n    <p>Bu yerda karta matni joylashadi. Chiroyli dizayn uchun CSS bilan ishlang.</p>\n    <button>Batafsil</button>\n  </div>\n</div>', css:'* { margin:0; padding:0; box-sizing:border-box; }\nbody { background:#f0f0f0; display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:sans-serif; }\n.card { max-width:380px; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1); }\n.card-body { padding:1.5rem; }\n.card-body h2 { margin-bottom:0.5rem; font-size:1.2rem; }\n.card-body p { color:#666; line-height:1.6; margin-bottom:1rem; }\nbutton { background:#000; color:#fff; border:none; padding:0.6rem 1.5rem; border-radius:6px; cursor:pointer; font-weight:600; }', js:'' },
  { name:'Hisoblagich', desc:'React uslubidagi hisoblagich', html:'<div id="app-counter">\n  <h1>Hisoblagich</h1>\n  <div class="counter-display" id="count">0</div>\n  <div class="counter-btns">\n    <button onclick="dec()">-</button>\n    <button onclick="reset()">0</button>\n    <button onclick="inc()">+</button>\n  </div>\n</div>', css:'#app-counter { text-align:center; padding:3rem 1rem; font-family:sans-serif; }\n.counter-display { font-size:4rem; font-weight:900; margin:1.5rem 0; }\n.counter-btns { display:flex; gap:0.5rem; justify-content:center; }\n.counter-btns button { padding:0.5rem 1.5rem; font-size:1.2rem; border:2px solid #000; background:#fff; cursor:pointer; font-weight:700; }\n.counter-btns button:hover { background:#000; color:#fff; }', js:'let c = 0;\nfunction inc() { c++; document.getElementById("count").textContent = c; }\nfunction dec() { c--; document.getElementById("count").textContent = c; }\nfunction reset() { c = 0; document.getElementById("count").textContent = c; }' },
  { name:'To-do List', desc:'Vazifalar ro\'yxati', html:'<div class="todo-app">\n  <h1>Vazifalar</h1>\n  <div class="todo-input">\n    <input id="todoInput" placeholder="Vazifa qo\'shing..." />\n    <button onclick="addTodo()">+</button>\n  </div>\n  <ul id="todoList"></ul>\n</div>', css:'* { margin:0; padding:0; box-sizing:border-box; }\nbody { font-family:sans-serif; background:#f5f5f5; display:flex; justify-content:center; padding:3rem 1rem; }\n.todo-app { width:100%; max-width:400px; background:#fff; padding:2rem; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.1); }\nh1 { margin-bottom:1rem; font-size:1.3rem; }\n.todo-input { display:flex; gap:0.5rem; margin-bottom:1rem; }\n.todo-input input { flex:1; padding:0.6rem; border:2px solid #ddd; border-radius:6px; font-size:0.9rem; }\n.todo-input input:focus { outline:none; border-color:#000; }\n.todo-input button { padding:0.6rem 1rem; background:#000; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:1.2rem; }\nul { list-style:none; }\nli { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid #eee; font-size:0.9rem; }\nli button { background:none; border:none; color:#ef4444; cursor:pointer; font-weight:700; }', js:'function addTodo() {\n  const input = document.getElementById("todoInput");\n  if (!input.value.trim()) return;\n  const li = document.createElement("li");\n  li.innerHTML = \'<span>\' + input.value + \'</span><button onclick="this.parentElement.remove()">X</button>\';\n  document.getElementById("todoList").appendChild(li);\n  input.value = "";\n}' },
  { name:'Brutalist Hero', desc:'Qora-sariq brutalist hero section', html:'<section class="brutal-hero">\n  <div class="brutal-content">\n    <span class="brutal-num">01</span>\n    <h1>XOLERIC</h1>\n    <div class="brutal-line"></div>\n    <p>DEVELOPER &bull; DESIGNER</p>\n    <a href="#" class="brutal-btn">KASHF ET</a>\n  </div>\n</section>', css:'* { margin:0; padding:0; box-sizing:border-box; }\nbody { background:#000; display:flex; align-items:center; min-height:100vh; }\n.brutal-hero { width:100%; padding:4rem 2rem; }\n.brutal-num { font-size:5rem; font-weight:900; color:rgba(255,255,255,0.05); display:block; }\nh1 { font-size:clamp(3rem,12vw,8rem); font-weight:900; color:#fff; letter-spacing:-0.04em; line-height:0.9; text-transform:uppercase; margin:1rem 0; }\n.brutal-line { width:100px; height:6px; background:#FFDE02; margin:1.5rem 0; }\np { color:#666; font-size:1rem; letter-spacing:0.15em; margin-bottom:2rem; text-transform:uppercase; }\n.brutal-btn { display:inline-block; border:3px solid #fff; color:#fff; padding:0.8rem 2rem; text-decoration:none; font-weight:700; letter-spacing:0.15em; font-size:0.8rem; }\n.brutal-btn:hover { background:#fff; color:#000; }', js:'' },
  { name:'API So\'rov', desc:'Fetch bilan ma\'lumot olish', html:'<div class="api-demo">\n  <h1>API Demo</h1>\n  <button onclick="fetchData()">Ma\'lumot olish</button>\n  <pre id="apiResult">Natija bu yerda...</pre>\n</div>', css:'body { font-family:sans-serif; padding:2rem; background:#f5f5f5; }\n.api-demo { max-width:500px; margin:0 auto; }\nh1 { margin-bottom:1rem; font-size:1.3rem; }\nbutton { padding:0.6rem 1.5rem; background:#000; color:#fff; border:none; cursor:pointer; font-weight:600; margin-bottom:1rem; }\npre { background:#1a1a1a; color:#e5e5e5; padding:1rem; border-radius:8px; overflow-x:auto; font-size:0.8rem; }', js:'async function fetchData() {\n  const pre = document.getElementById("apiResult");\n  pre.textContent = "Yuklanmoqda...";\n  try {\n    const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");\n    const data = await res.json();\n    pre.textContent = JSON.stringify(data, null, 2);\n  } catch(e) {\n    pre.textContent = "Xatolik: " + e.message;\n  }\n}' }
];

function openTemplates() {
  const modal = document.getElementById('templateModal');
  modal.classList.remove('hidden');
  const list = document.getElementById('templateList');
  list.innerHTML = '';
  TEMPLATES.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'template-item';
    el.innerHTML = `${t.name} <small>${t.desc}</small>`;
    el.onclick = () => {
      appState.html = t.html;
      appState.css = t.css;
      appState.js = t.js;
      editor.value = appState[appState.currentTab];
      updateLineNumbers();
      updateFileSize();
      scheduleRender();
      saveState();
      modal.classList.add('hidden');
      showToast('Template yuklandi');
    };
    list.appendChild(el);
  });
}

// ─── EVENT BINDING ───

editor.addEventListener('input', () => {
  setCode(appState.currentTab, editor.value);
});

editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

editor.addEventListener('click', updateCursorPos);
editor.addEventListener('keyup', updateCursorPos);
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
    setCode(appState.currentTab, editor.value);
    updateCursorPos();
  }
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.querySelectorAll('.output-tab').forEach(tab => {
  tab.addEventListener('click', () => switchOutput(tab.dataset.otab));
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('runBtn').addEventListener('click', () => {
  renderPreview();
  if (appState.currentOutput === 'console') renderConsole();
  showToast('Ishga tushirildi');
});

document.getElementById('templatesBtn').addEventListener('click', openTemplates);
document.getElementById('closeModal').addEventListener('click', () => document.getElementById('templateModal').classList.add('hidden'));
document.getElementById('templateModal').addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) document.getElementById('templateModal').classList.add('hidden');
});
document.getElementById('exportBtn').addEventListener('click', exportCode);
document.getElementById('copyBtn').addEventListener('click', copyCode);
document.getElementById('clearBtn').addEventListener('click', clearCode);

// ─── PWA INSTALL ───
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; installBtn.hidden = true; });
  });
});
window.addEventListener('appinstalled', () => { installBtn.hidden = true; showToast('O\'rnatildi!'); });

// ─── INIT ───
loadState();
switchTab('html');
editor.value = appState.html;
updateLineNumbers();
updateFileSize();
updateCursorPos();
scheduleRender();
