
const calcWindow    = document.getElementById('calc-window');
const titleBar      = document.getElementById('title-bar');
const displayValue  = document.getElementById('display-value');
const displayExpr   = document.getElementById('display-expression');
const buttonGrid    = document.getElementById('button-grid');
const gearBtn       = document.getElementById('gear-btn');
const skinPanel     = document.getElementById('skin-panel');
const skinOptions   = document.querySelectorAll('.skin-option');
const btnClose      = document.getElementById('btn-close');
const btnMinimize   = document.getElementById('btn-minimize');
const rainbowCanvas = document.getElementById('rainbow-canvas');
const scratchCanvas = document.getElementById('scratch-canvas');
const introOverlay  = document.getElementById('intro-overlay');
const introLine1    = document.getElementById('intro-line1');
const introLine2    = document.getElementById('intro-line2');
const introLine3    = document.getElementById('intro-line3');
const introArrowEl  = document.getElementById('intro-arrow');
const arrowPath     = document.getElementById('arrow-path');
const arrowHead     = document.getElementById('arrow-head');

const SKINS = [
  { label: 'Card Captors Sakura',  folder: 'Card_Captors_Sakura_Cute' },
  // { label: 'Cuteamp',           folder: 'cuteamp' },
  { label: 'Hello Kitty Cinnamon', folder: 'Hello Kitty - Cinnamoroll (Sickeningly Cute)' },
  // { label: 'Hello Kitty Angel', folder: 'hello kitty angel' },
  { label: 'Inuyasha',             folder: 'Inuyasha - Together Always 1' },
  // { label: 'Kari',              folder: 'Kari' },
  { label: 'Kirby',                folder: 'Kirby' },
  { label: 'NGE Misato',           folder: 'Neon Genesis Evangelion - My Misato Amp' },
  // { label: 'SariusVoiceGRID',   folder: 'SariusVoiceGRID' },
  { label: 'Lain',                 folder: 'Twilight_a_Lain_Skin' },
];

const SKINS_BASE = 'winampskins';
let activeSkinIndex = 0;

const state = {
  current: '0', previous: null, operator: null,
  waitingNext: false, justEvaled: false,
};

function renderDisplay(value) {
  if (state.operator && state.previous !== null) {
    displayExpr.textContent = state.previous + ' ' + state.operator;
  } else {
    displayExpr.textContent = '';
  }
  let display = String(value);
  if (display.length > 10) display = parseFloat(display).toExponential(4);
  displayValue.textContent = display;
}

function clearAll() {
  state.current = '0'; state.previous = null; state.operator = null;
  state.waitingNext = false; state.justEvaled = false;
  renderDisplay('0');
}

function inputDigit(digit) {
  if (state.waitingNext || state.justEvaled) {
    state.current = digit; state.waitingNext = false; state.justEvaled = false;
  } else {
    if (state.current.replace('-','').replace('.','').length >= 10) return;
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  renderDisplay(state.current);
}

function inputDecimal() {
  if (state.waitingNext || state.justEvaled) {
    state.current = '0.'; state.waitingNext = false; state.justEvaled = false;
    renderDisplay(state.current); return;
  }
  if (!state.current.includes('.')) { state.current += '.'; renderDisplay(state.current); }
}

function toggleSign() {
  if (state.current === '0') return;
  state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  renderDisplay(state.current);
}

function applyPercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = String(val / 100); state.waitingNext = false;
  renderDisplay(state.current);
}

function calculate(a, b, op) {
  const x = parseFloat(a), y = parseFloat(b);
  switch (op) {
    case '+': return x + y;
    case '−': return x - y;
    case '×': return x * y;
    case '÷': return y === 0 ? 'Error' : x / y;
    default:  return y;
  }
}

function handleOperator(op) {
  const curr = state.current;
  if (state.operator && !state.waitingNext) {
    const result = calculate(state.previous, curr, state.operator);
    state.previous = String(result); state.current = String(result);
    renderDisplay(state.current);
  } else { state.previous = curr; }
  state.operator = op; state.waitingNext = true; state.justEvaled = false;
  displayExpr.textContent = state.previous + ' ' + op;
}

function handleEquals() {
  if (state.operator === null || state.waitingNext) return;
  const result = calculate(state.previous, state.current, state.operator);
  const resultStr = String(result);
  displayExpr.textContent = state.previous + ' ' + state.operator + ' ' + state.current + ' =';
  state.current = resultStr; state.previous = null; state.operator = null;
  state.waitingNext = false; state.justEvaled = true;
  renderDisplay(resultStr);
}

function handleBackspace() {
  if (state.justEvaled || state.current === '0') { clearAll(); return; }
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
  renderDisplay(state.current);
}

buttonGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const action = btn.dataset.action, value = btn.dataset.value;
  switch (action) {
    case 'digit':    inputDigit(value);     break;
    case 'decimal':  inputDecimal();        break;
    case 'clear':    clearAll();            break;
    case 'sign':     toggleSign();          break;
    case 'percent':  applyPercent();        break;
    case 'operator': handleOperator(value); break;
    case 'equals':   handleEquals();        break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9')        { inputDigit(e.key);                      return; }
  if (e.key === '.')                        { inputDecimal();                          return; }
  if (e.key === 'Enter' || e.key === '=')  { handleEquals();                          return; }
  if (e.key === 'Escape')                   { clearAll();                              return; }
  if (e.key === 'Backspace')                { handleBackspace();                       return; }
  if (e.key === '+')                        { handleOperator('+');                     return; }
  if (e.key === '-')                        { handleOperator('−');                     return; }
  if (e.key === '*')                        { handleOperator('×');                     return; }
  if (e.key === '/') { e.preventDefault();  handleOperator('÷');                      return; }
  if (e.key === '%')                        { applyPercent();                          return; }
});

btnClose.addEventListener('click', () => {
  calcWindow.style.transition = 'opacity 0.3s';
  calcWindow.style.opacity = '0';
  setTimeout(() => { calcWindow.style.display = 'none'; }, 300);
});
btnMinimize.addEventListener('click', () => calcWindow.classList.toggle('minimized'));

gearBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  skinPanel.classList.toggle('hidden');
  gearBtn.classList.toggle('active');
});
document.addEventListener('click', (e) => {
  if (!skinPanel.contains(e.target) && e.target !== gearBtn) {
    skinPanel.classList.add('hidden'); gearBtn.classList.remove('active');
  }
});

function applySkin(index) {
  const skin = SKINS[index];
  const folder = SKINS_BASE + '/' + skin.folder;
  const root = document.documentElement.style;
  root.setProperty('--main-bg',     "url('" + folder + "/main.bmp')");
  root.setProperty('--titlebar-bg', "url('" + folder + "/titlebar.bmp')");
  root.setProperty('--numbers-bg',  "url('" + folder + "/numbers.bmp')");
  root.setProperty('--cbuttons-bg', "url('" + folder + "/cbuttons.bmp')");
  root.setProperty('--text-bg',     "url('" + folder + "/text.bmp')");
  skinOptions.forEach((opt, i) => opt.classList.toggle('active-skin', i === index));
  activeSkinIndex = index;
  try { localStorage.setItem('wampcalc-skin', index); } catch (_) {}
  setTimeout(() => { skinPanel.classList.add('hidden'); gearBtn.classList.remove('active'); }, 180);
}
skinOptions.forEach((opt, index) => opt.addEventListener('click', () => applySkin(index)));

function restoreSkin() {
  try {
    const saved = localStorage.getItem('wampcalc-skin');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < SKINS.length) { applySkin(idx); return; }
    }
  } catch (_) {}
  applySkin(0);
}

let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
function isDesktop() { return window.innerWidth >= 768; }
function initDragPosition() {
  if (!calcWindow.classList.contains('was-dragged')) {
    const rect = calcWindow.getBoundingClientRect();
    calcWindow.style.left = rect.left + 'px'; calcWindow.style.top = rect.top + 'px';
    calcWindow.style.transform = 'none'; calcWindow.classList.add('was-dragged');
  }
}
titleBar.addEventListener('mousedown', (e) => {
  if (!isDesktop()) return; e.preventDefault(); initDragPosition(); isDragging = true;
  dragOffsetX = e.clientX - calcWindow.getBoundingClientRect().left;
  dragOffsetY = e.clientY - calcWindow.getBoundingClientRect().top;
  titleBar.style.cursor = 'grabbing';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  let newX = Math.max(0, Math.min(e.clientX - dragOffsetX, window.innerWidth  - calcWindow.offsetWidth));
  let newY = Math.max(0, Math.min(e.clientY - dragOffsetY, window.innerHeight - calcWindow.offsetHeight));
  calcWindow.style.left = newX + 'px'; calcWindow.style.top = newY + 'px';
});
document.addEventListener('mouseup', () => { if (!isDragging) return; isDragging = false; titleBar.style.cursor = 'grab'; });
titleBar.addEventListener('touchstart', (e) => {
  if (!isDesktop()) return;
  const touch = e.touches[0]; initDragPosition();
  dragOffsetX = touch.clientX - calcWindow.getBoundingClientRect().left;
  dragOffsetY = touch.clientY - calcWindow.getBoundingClientRect().top;
  isDragging = true;
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  let newX = Math.max(0, Math.min(touch.clientX - dragOffsetX, window.innerWidth  - calcWindow.offsetWidth));
  let newY = Math.max(0, Math.min(touch.clientY - dragOffsetY, window.innerHeight - calcWindow.offsetHeight));
  calcWindow.style.left = newX + 'px'; calcWindow.style.top = newY + 'px';
}, { passive: true });
document.addEventListener('touchend', () => { isDragging = false; });

function hslToRgb(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q-p)*6*t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q-p)*(2/3-t)*6;
    return p;
  };
  if (s === 0) { const v = Math.round(l*255); return [v,v,v]; }
  const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
  return [
    Math.round(hue2rgb(p, q, h+1/3)*255),
    Math.round(hue2rgb(p, q, h)*255),
    Math.round(hue2rgb(p, q, h-1/3)*255),
  ];
}

function drawSwirlRainbow() {
  const w = rainbowCanvas.width, h = rainbowCanvas.height;
  const ctx = rainbowCanvas.getContext('2d');
  const offW = 480, offH = Math.max(1, Math.round(h / w * 480));
  const off = document.createElement('canvas');
  off.width = offW; off.height = offH;
  const offCtx = off.getContext('2d');
  const img = offCtx.createImageData(offW, offH);
  const d = img.data;
  const cx = offW * 0.5, cy = offH * 0.5;
  for (let y = 0; y < offH; y++) {
    for (let x = 0; x < offW; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx);
      const swirl = angle + dist * 0.013 + Math.sin(x * 0.022) * 0.6 + Math.cos(y * 0.022) * 0.6;
      let hue = ((swirl * 180 / Math.PI) + Math.sin(dist * 0.045) * 55) % 360;
      hue = ((hue % 360) + 360) % 360;
      const [r, g, b] = hslToRgb(hue / 360, 1, 0.56);
      const i = (y * offW + x) * 4;
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
    }
  }
  offCtx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, 0, 0, w, h);
}

function initCanvases() {
  const W = window.innerWidth, H = window.innerHeight;
  rainbowCanvas.width  = W; rainbowCanvas.height  = H;
  scratchCanvas.width  = W; scratchCanvas.height  = H;
  drawSwirlRainbow();
  const sCtx = scratchCanvas.getContext('2d');
  sCtx.fillStyle = '#000';
  sCtx.fillRect(0, 0, W, H);
}

const scratchCtx = scratchCanvas.getContext('2d');
let isScratching = false;

function scratchAt(x, y) {
  const r = 38;
  scratchCtx.globalCompositeOperation = 'destination-out';
  const g = scratchCtx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0,   'rgba(0,0,0,1)');
  g.addColorStop(0.55,'rgba(0,0,0,0.9)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  scratchCtx.fillStyle = g;
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, r, 0, Math.PI * 2);
  scratchCtx.fill();
}

scratchCanvas.addEventListener('mousedown', (e) => {
  if (isDragging) return;
  isScratching = true; scratchAt(e.clientX, e.clientY);
});
document.addEventListener('mousemove', (e) => {
  if (isScratching && !isDragging) scratchAt(e.clientX, e.clientY);
});
document.addEventListener('mouseup', () => { isScratching = false; });

scratchCanvas.addEventListener('touchstart', (e) => {
  isScratching = true;
  Array.from(e.changedTouches).forEach(t => scratchAt(t.clientX, t.clientY));
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!isScratching) return;
  Array.from(e.changedTouches).forEach(t => scratchAt(t.clientX, t.clientY));
}, { passive: true });
document.addEventListener('touchend', () => { isScratching = false; });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function typeText(el, text, delay) {
  return new Promise(resolve => {
    let i = 0; el.textContent = '';
    const timer = setInterval(() => {
      el.textContent += text[i]; i++;
      if (i >= text.length) { clearInterval(timer); resolve(); }
    }, delay);
  });
}

async function runIntro() {
  await sleep(300);
  await typeText(introLine1, 'this is wampcalc ✦', 80);
  await sleep(150);

  const mainLen = arrowPath.getTotalLength();
  arrowPath.style.strokeDasharray  = mainLen + 'px';
  arrowPath.style.strokeDashoffset = mainLen + 'px';
  const headLen = arrowHead.getTotalLength();
  arrowHead.style.strokeDasharray  = headLen + 'px';
  arrowHead.style.strokeDashoffset = headLen + 'px';
  arrowHead.style.opacity = '0';
  introArrowEl.style.opacity = '1';
  await sleep(60);
  arrowPath.style.transition = 'stroke-dashoffset 1.1s ease-in-out';
  arrowPath.style.strokeDashoffset = '0';
  await sleep(1200);
  arrowHead.style.transition = 'stroke-dashoffset 0.35s ease, opacity 0.35s ease';
  arrowHead.style.strokeDashoffset = '0';
  arrowHead.style.opacity = '1';
  await sleep(400);

  await typeText(introLine2, "the cutest calculator you'll ever see ✨", 50);
  await sleep(500);
  await typeText(introLine3, 'scratch the background • draw anything', 45);
  await sleep(5500);

  introOverlay.style.transition = 'opacity 1.8s ease';
  introOverlay.style.opacity = '0';
  await sleep(1900);
  introOverlay.style.display = 'none';
}

function init() {
  initCanvases();
  restoreSkin();
  renderDisplay('0');
  runIntro();
}

init();
