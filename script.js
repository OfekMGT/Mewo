const scene = document.getElementById('scene');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const resetButton = document.getElementById('resetButton');
const catEmojis = ['🐱', '😺', '🐈', '😹', '🐾'];

let score = 0;
let bestScore = Number(localStorage.getItem('mewo-best-score') || 0);

function updateHud() {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(bestScore);
}

function playPopSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const context = new AudioCtx();
  const gainNode = context.createGain();
  const osc = context.createOscillator();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(360, context.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.18);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);

  osc.connect(gainNode);
  gainNode.connect(context.destination);

  osc.start();
  osc.stop(context.currentTime + 0.2);
  setTimeout(() => context.close(), 250);
}

function createCat() {
  const cat = document.createElement('button');
  cat.className = 'cat';
  cat.type = 'button';
  cat.setAttribute('aria-label', 'cat');

  const emoji = catEmojis[Math.floor(Math.random() * catEmojis.length)];
  cat.textContent = emoji;

  const size = 56 + Math.random() * 68;
  const left = 8 + Math.random() * 75;
  const top = 22 + Math.random() * 55;

  cat.style.width = `${size}px`;
  cat.style.height = `${size}px`;
  cat.style.left = `${left}%`;
  cat.style.top = `${top}%`;
  cat.style.setProperty('--pop-x', `${(Math.random() - 0.5) * 250}px`);
  cat.style.setProperty('--pop-y', `${-60 - Math.random() * 150}px`);
  cat.style.setProperty('--tilt', `${(Math.random() - 0.5) * 160}deg`);

  cat.addEventListener('click', (event) => {
    playPopSound();
    popCat(cat, event);
  });

  scene.appendChild(cat);
}

function popCat(cat, event) {
  if (cat.classList.contains('popping')) return;

  const rect = scene.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  score += 1;
  bestScore = Math.max(bestScore, score);
  localStorage.setItem('mewo-best-score', String(bestScore));
  updateHud();

  cat.classList.add('popping');

  const burst = document.createElement('div');
  burst.className = 'burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  scene.appendChild(burst);

  window.setTimeout(() => {
    burst.remove();
  }, 700);

  window.setTimeout(() => {
    cat.remove();
    createCat();
  }, 720);
}

function resetGame() {
  scene.querySelectorAll('.cat').forEach((cat) => cat.remove());
  score = 0;
  updateHud();
  seedCats();
}

function seedCats() {
  const count = 14;
  for (let i = 0; i < count; i += 1) {
    createCat();
  }
}

resetButton.addEventListener('click', resetGame);
updateHud();
seedCats();
