const calcWindow = document.getElementById('calc-window');
const titleBar = document.getElementById('title-bar');
const displayValue = document.getElementById('display-value');
const displayExpr = document.getElementById('button-grid');
const gearBtn = document.getElementById('gear-btn');
const skinPanel = document.getElementById('skin-panel');
const SkinOptions = document.querySelectorAll('.skin-option');
const btnClose = document.getElementById('btn-close');
const btnMinimize = document.getElementById('btn-minimize');
const SKINS = [
    { label: 'Card Captors Sakura', folder: 'Card_Captors_Sakura_Cute'},
    { label: 'Cuteamp', folder: 'cuteamp'},
    { label: 'Hello Kitty Cinnamon', folder: 'Hello Kitty - Cinnamoroll (Sickeningly Cute)'},
    { label: 'Hello Kitty Angel', folder: 'Inuyasha - Together Always 1'},
    { label: 'Inuyasha', folder: 'Inuyasha - Together Always 1'},
    { label: 'Kari', folder: 'Kari'},
    { label: 'Kirby', folder: 'Kirby'},
    { label: 'NGE Misato', folder: 'Neon Genesis Evangelion - My Misato Amp'},
    { label: 'SariusVoiceGRID', folder: 'SariusVoiceGRID'},
    { label: 'Lain', folder: 'Twilight_a_Lain_Skin'},
];
let activeSkinIndex = 0;
const SKINS_BASE = 'winampskins';
const state = {
    current: '0',
    previous: null,
    operator: null,
    waitingNext: false,
    justEvaled: false,
};
const CHAR_W = 9;
const CHAR_H = 13;
const SCALE = 2;
const DIGIT_OFFSETS = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '-': 10,
    '.': 11,
};
function renderDisplay(value) {
  if (state.operator && state.previous !== null) {
    displayExpr.textContent = `${state.previous} ${state.operator}`;
  } else {
    displayExpr.textContent = '';
  }
  let display = String(value);
  if (display.length > 10) {
    
    const num = parseFloat(display);
    display = num.toExponential(4);
  }
  displayValue.innerHTML = '';
  const wrapper = document.createElement('span');
  wrapper.style.display        = 'inline-flex';
  wrapper.style.alignItems     = 'flex-end';
  wrapper.style.gap            = '1px';
  wrapper.style.lineHeight     = '1';
  for (const ch of display) {
    if (ch in DIGIT_OFFSETS) {
      const span = document.createElement('span');
      span.className = 'digit';
      const xOff = -(DIGIT_OFFSETS[ch] * CHAR_W);
      span.style.backgroundPosition = `${xOff}px 0`;
      wrapper.appendChild(span);
    } else if (ch === ' ') {
      const space = document.createElement('span');
      space.style.display = 'inline-block';
      space.style.width   = `${CHAR_W * SCALE}px`;
      wrapper.appendChild(space);
    } else {
      const plain = document.createElement('span');
      plain.textContent         = ch;
      plain.style.fontSize      = `${CHAR_H * SCALE}px`;
      plain.style.fontFamily    = 'Courier New, monospace';
      plain.style.color         = 'var(--display-color)';
      plain.style.textShadow    = '0 0 6px var(--display-color)';
      plain.style.fontWeight    = 'bold';
      wrapper.appendChild(plain);
    }
  }
  displayValue.appendChild(wrapper);
}
function clearAll() {
  state.current     = '0';
  state.previous    = null;
  state.operator    = null;
  state.waitingNext = false;
  state.justEvaled  = false;
  renderDisplay('0');
} 
function inputDigit(digit) {
  if (state.waitingNext || state.justEvaled) {
    state.current     = digit;
    state.waitingNext = false;
    state.justEvaled  = false;
  } else {
    if (state.current.replace('-', '').replace('.', '').length >= 10) return;
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  renderDisplay(state.current);
}
function inputDecimal() {
  if (state.waitingNext || state.justEvaled) {
    state.current     = '0.';
    state.waitingNext = false;
    state.justEvaled  = false;
    renderDisplay(state.current);
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    renderDisplay(state.current);
  }
}
function toggleSign() {
  if (state.current === '0') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  renderDisplay(state.current);
}
function applyPercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = String(val / 100);
  state.waitingNext = false;
  renderDisplay(state.current);
}
function calculate(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case '+': return x + y;
    case '−': return x - y;
    case '×': return x * y;
    case '÷': return y === 0 ? 'Error' : x / y;
    default:  return b;
  }
}
function handleOperator(op) {
  const curr = state.current;
  if (state.operator && !state.waitingNext) {
    const result = calculate(state.previous, curr, state.operator);
    state.previous = String(result);
    state.current  = String(result);
    renderDisplay(state.current);
  } else {
    state.previous = curr;
  }
  state.operator    = op;
  state.waitingNext = true;
  state.justEvaled  = false;
  displayExpr.textContent = `${state.previous} ${op}`;
}
function handleEquals() {
  if (state.operator === null || state.waitingNext) return;
  const result = calculate(state.previous, state.current, state.operator);
  const resultStr = String(result);
  displayExpr.textContent =
    `${state.previous} ${state.operator} ${state.current} =`;
  state.current     = resultStr;
  state.previous    = null;
  state.operator    = null;
  state.waitingNext = false;
  state.justEvaled  = true;
  renderDisplay(resultStr);
}
buttonGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const action = btn.dataset.action;
  const value  = btn.dataset.value;
  switch (action) {
    case 'digit':    inputDigit(value);   break;
    case 'decimal':  inputDecimal();      break;
    case 'clear':    clearAll();          break;
    case 'sign':     toggleSign();        break;
    case 'percent':  applyPercent();      break;
    case 'operator': handleOperator(value); break;
    case 'equals':   handleEquals();      break;
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key);          return; }
  if (e.key === '.')                 { inputDecimal();              return; }
  if (e.key === 'Enter' || e.key === '=') { handleEquals();        return; }
  if (e.key === 'Escape')            { clearAll();                  return; }
  if (e.key === 'Backspace')         { handleBackspace();           return; }
  if (e.key === '+')                 { handleOperator('+');         return; }
  if (e.key === '-')                 { handleOperator('−');         return; }
  if (e.key === '*')                 { handleOperator('×');         return; }
  if (e.key === '/')  { e.preventDefault(); handleOperator('÷');   return; }
  if (e.key === '%')                 { applyPercent();              return; }
});
function handleBackspace() {
  if (state.justEvaled || state.current === '0') { clearAll(); return; }
  state.current = state.current.length > 1
    ? state.current.slice(0, -1)
    : '0';
  renderDisplay(state.current);
}
btnClose.addEventListener('click', () => { 
  calcWindow.style.transition = 'opacity 0.3s';
  calcWindow.style.opacity    = '0';
  setTimeout(() => { calcWindow.style.display = 'none'; }, 300);
});
btnMinimize.addEventListener('click', () => {
  calcWindow.classList.toggle('minimized');
});
gearBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  skinPanel.classList.toggle('hidden');
  gearBtn.classList.toggle('active');
});
document.addEventListener('click', (e) => {
  if (!skinPanel.contains(e.target) && e.target !== gearBtn) {
    skinPanel.classList.add('hidden');
    gearBtn.classList.remove('active');
  }
});
function applySkin(index) {
  const skin   = SKINS[index];
  const folder = `${SKINS_BASE}/${skin.folder}`;
  const root   = document.documentElement.style;
  root.setProperty('--main-bg',      `url('${folder}/main.bmp')`);
  root.setProperty('--titlebar-bg',  `url('${folder}/titlebar.bmp')`);
  root.setProperty('--numbers-bg',   `url('${folder}/numbers.bmp')`);
  root.setProperty('--cbuttons-bg',  `url('${folder}/cbuttons.bmp')`);
  root.setProperty('--text-bg',      `url('${folder}/text.bmp')`);
  skinOptions.forEach((opt, i) => {
    opt.classList.toggle('active-skin', i === index);
  });
  activeSkinIndex = index;
  try { localStorage.setItem('wampcalc-skin', index); } catch (_) {}
  setTimeout(() => {
    skinPanel.classList.add('hidden');
    gearBtn.classList.remove('active');
  }, 180);
}
skinOptions.forEach((opt, index) => {
  opt.addEventListener('click', () => applySkin(index));
});
function restoreSkin() {
  try {
    const saved = localStorage.getItem('wampcalc-skin');
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < SKINS.length) {
        applySkin(idx);
        return;
      }
    }
  } catch (_) {}
  applySkin(0);
}
let isDragging  = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
function isDesktop() {
  return window.innerWidth >= 768;
}
titleBar.addEventListener('mousedown', (e) => {
  if (!isDesktop()) return;
  e.preventDefault();
  isDragging = true;
  if (!calcWindow.classList.contains('was-dragged')) {
    const rect = calcWindow.getBoundingClientRect();
    calcWindow.style.left      = rect.left + 'px';
    calcWindow.style.top       = rect.top  + 'px';
    calcWindow.style.transform = 'none';
    calcWindow.classList.add('was-dragged');
  }
  dragOffsetX = e.clientX - calcWindow.getBoundingClientRect().left;
  dragOffsetY = e.clientY - calcWindow.getBoundingClientRect().top;
  calcWindow.classList.add('is-dragging');
  titleBar.style.cursor = 'grabbing';
});
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  let newX = e.clientX - dragOffsetX;
  let newY = e.clientY - dragOffsetY;
  const maxX = window.innerWidth  - calcWindow.offsetWidth;
  const maxY = window.innerHeight - calcWindow.offsetHeight;
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));
  calcWindow.style.left = newX + 'px';
  calcWindow.style.top  = newY + 'px';
});
document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  calcWindow.classList.remove('is-dragging');
  titleBar.style.cursor = 'grab';
});
titleBar.addEventListener('touchstart', (e) => {
  if (!isDesktop()) return;
  const touch = e.touches[0];
  if (!calcWindow.classList.contains('was-dragged')) {
    const rect = calcWindow.getBoundingClientRect();
    calcWindow.style.left      = rect.left + 'px';
    calcWindow.style.top       = rect.top  + 'px';
    calcWindow.style.transform = 'none';
    calcWindow.classList.add('was-dragged');
  }
  dragOffsetX = touch.clientX - calcWindow.getBoundingClientRect().left;
  dragOffsetY = touch.clientY - calcWindow.getBoundingClientRect().top;
  isDragging  = true;
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  let newX = touch.clientX - dragOffsetX;
  let newY = touch.clientY - dragOffsetY;
  const maxX = window.innerWidth  - calcWindow.offsetWidth;
  const maxY = window.innerHeight - calcWindow.offsetHeight;
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));
  calcWindow.style.left = newX + 'px';
  calcWindow.style.top  = newY + 'px';
}, { passive: true });
document.addEventListener('touchend', () => {
  isDragging = false;
});
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  #calc-window.minimized #button-grid,
  #calc-window.minimized #bottom-bar,
  #calc-window.minimized #skin-panel {
    display: none;
  }
  #calc-window.minimized #display-area {
    margin-bottom: 6px;
  }
`;
document.head.appendChild(styleSheet);
function init() {
  restoreSkin();
  renderDisplay('0');
}
init();