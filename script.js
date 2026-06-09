const fruitImages = [
  'images/apple.png',
  'images/banana.png',
  'images/watermelon.png',
  'images/strawberry.png',
  'images/peach.png'
];

const playBtn = document.getElementById('playBtn');
const gameStage = document.getElementById('gameStage');
const menuCard = document.querySelector('.menu-card');
const backgroundFruits = document.querySelector('.floating-fruits');
const bladeTrail = document.getElementById('bladeTrail');
const scorePanel = document.getElementById('scorePanel');
const scoreValue = document.getElementById('scoreValue');
const livesPanel = document.getElementById('livesPanel');
const lifeImages = [
  document.getElementById('life1'),
  document.getElementById('life2'),
  document.getElementById('life3')
];
const gameOverMenu = document.getElementById('gameOverMenu');
const gameOverScore = document.getElementById('gameOverScore');
const gameOverHighScore = document.getElementById('gameOverHighScore');
const highScoreValue = document.getElementById('highScoreValue');
const retryBtn = document.getElementById('retryBtn');
const returnToMenuBtn = document.getElementById('returnToMenuBtn');

let isGameActive = false;
let highScore = Number(localStorage.getItem('fruitNinjaHighScore')) || 0;
let lastX = 0;
let lastY = 0;
let isMouseDown = false;
let spawnInterval = null;
let nextFruitIndex = 0;
let score = 0;
let gameStartTime = 0;
let lives = 3;

function createThrownFruit(imageSrc) {
  const fruit = document.createElement('img');
  fruit.src = imageSrc;
  fruit.className = 'throw-fruit';

  const offsetX = (Math.random() - 0.5) * 140;
  const startX = 10 + Math.random() * 80;
  const spinStart = Math.round(Math.random() * 360);
  const spinEnd = 720 + Math.round(Math.random() * 360);
  const peakHeight = 50 + Math.random() * 40;
  const duration = 3.4 + Math.random() * 1.2;
  const isBomb = Math.random() < 0.15; // 15% chance of bomb

  fruit.style.setProperty('--start-x', `${startX}%`);
  fruit.style.setProperty('--throw-offset', `${offsetX}px`);
  fruit.style.setProperty('--spin-start', `${spinStart}deg`);
  fruit.style.setProperty('--spin-end', `${spinEnd}deg`);
  fruit.style.setProperty('--delay', `0ms`);
  fruit.style.setProperty('--peak-height', `${peakHeight}vh`);
  fruit.style.setProperty('--duration', `${duration}s`);
  fruit.style.width = `${50 + Math.round(Math.random() * 30)}px`;
  fruit.dataset.isBomb = isBomb;

  if (isBomb) {
    fruit.src = 'images/boom.png';
    fruit.classList.add('bomb-fruit');
  }

  return fruit;
}

function createSlashEffect(x, y, velocityX, velocityY) {
  const slash = document.createElement('div');
  slash.className = 'slash-effect';
  slash.style.left = x + 'px';
  slash.style.top = y + 'px';

  const line = document.createElement('div');
  line.className = 'slash-line';
  const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
  const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 0.8;
  
  line.style.width = Math.max(60, length) + 'px';
  line.style.transform = `rotate(${angle}deg)`;
  
  slash.appendChild(line);
  gameStage.appendChild(slash);

  setTimeout(() => slash.remove(), 600);
}

function updateLivesDisplay() {
  lifeImages.forEach((img, idx) => {
    if (idx < lives) {
      img.src = 'images/x1.png';
    } else {
      img.src = 'images/xx1.png';
    }
  });
}

function updateHighScoreDisplay() {
  highScoreValue.textContent = highScore;
  gameOverHighScore.textContent = highScore;
}

function updateHighScore(newScore) {
  if (newScore > highScore) {
    highScore = newScore;
    localStorage.setItem('fruitNinjaHighScore', String(highScore));
  }
  updateHighScoreDisplay();
}

function loseLife() {
  if (!isGameActive) return;

  lives -= 1;
  updateLivesDisplay();

  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  updateHighScore(score);
  isGameActive = false;
  if (spawnInterval) clearTimeout(spawnInterval);
  spawnInterval = null;

  scorePanel.classList.add('hidden');
  livesPanel.classList.add('hidden');
  gameStage.classList.add('hidden');
  gameOverScore.textContent = score;
  gameOverMenu.classList.remove('hidden');
  backgroundFruits.classList.remove('hidden');
}

retryBtn.addEventListener('click', () => {
  gameOverMenu.classList.add('hidden');
  playFruitSequence();
});

window.addEventListener('load', () => {
  updateHighScoreDisplay();
});

returnToMenuBtn.addEventListener('click', () => {
  gameOverMenu.classList.add('hidden');
  menuCard.classList.remove('hidden');
  backgroundFruits.classList.remove('hidden');
  gameStage.classList.add('hidden');
  gameStage.innerHTML = '';
  isGameActive = false;
  isMouseDown = false;
  bladeTrail.style.opacity = '0';
  playBtn.disabled = false;
  playBtn.textContent = '▶ Play';
});

function sliceFruit(fruit) {
  if (!fruit || fruit.classList.contains('sliced')) return;
  fruit.classList.add('sliced');

  if (fruit.dataset.isBomb === 'true') {
    loseLife();
  } else {
    score += 10;
    scoreValue.textContent = score;
  }

  const rect = fruit.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const leftHalf = document.createElement('img');
  const rightHalf = document.createElement('img');
  leftHalf.src = fruit.src;
  rightHalf.src = fruit.src;
  leftHalf.className = 'fruit-half fruit-half-left';
  rightHalf.className = 'fruit-half fruit-half-right';

  [leftHalf, rightHalf].forEach((half) => {
    half.style.width = `${width}px`;
    half.style.height = `${height}px`;
    half.style.left = `${rect.left}px`;
    half.style.top = `${rect.top}px`;
  });

  gameStage.appendChild(leftHalf);
  gameStage.appendChild(rightHalf);
  fruit.remove();

  requestAnimationFrame(() => {
    leftHalf.classList.add('fruit-half-slice-left');
    rightHalf.classList.add('fruit-half-slice-right');
  });

  leftHalf.addEventListener('animationend', () => leftHalf.remove(), { once: true });
  rightHalf.addEventListener('animationend', () => rightHalf.remove(), { once: true });
}

function checkFruitHit(bladeX, bladeY) {
  const fruits = gameStage.querySelectorAll('.throw-fruit:not(.sliced)');
  const bladeRadius = 30;

  fruits.forEach((fruit) => {
    const rect = fruit.getBoundingClientRect();
    const fruitCenterX = rect.left + rect.width / 2;
    const fruitCenterY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(bladeX - fruitCenterX, 2) + Math.pow(bladeY - fruitCenterY, 2)
    );

    if (distance < bladeRadius + rect.width / 2) {
      sliceFruit(fruit);
    }
  });
}

function updateBladeTrail(x, y) {
  if (!isGameActive || !isMouseDown) return;

  const velocityX = x - lastX;
  const velocityY = y - lastY;
  const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

  if (velocity > 2) {
    bladeTrail.style.left = x + 'px';
    bladeTrail.style.top = y + 'px';
    bladeTrail.style.opacity = Math.min(1, velocity / 20);
    
    if (velocity > 5) {
      bladeTrail.classList.add('active');
      setTimeout(() => bladeTrail.classList.remove('active'), 150);
      createSlashEffect(x, y, velocityX, velocityY);
      checkFruitHit(x, y);
    }
  }

  lastX = x;
  lastY = y;
}

document.addEventListener('mousemove', (e) => {
  updateBladeTrail(e.clientX, e.clientY);
});

document.addEventListener('mousedown', () => {
  if (isGameActive) {
    isMouseDown = true;
  }
});

document.addEventListener('mouseup', () => {
  isMouseDown = false;
  bladeTrail.style.opacity = '0';
});

function spawnFruit() {
  const image = fruitImages[nextFruitIndex % fruitImages.length];
  const fruit = createThrownFruit(image);
  gameStage.appendChild(fruit);

  fruit.addEventListener('animationend', () => {
    if (!fruit.classList.contains('sliced') && fruit.dataset.isBomb !== 'true') {
      loseLife();
    }
    fruit.remove();
  }, { once: true });

  nextFruitIndex += 1;
}

function scheduleNextSpawn() {
  if (!isGameActive) return;

  const elapsedMs = Date.now() - gameStartTime;
  const elapsedSec = elapsedMs / 1000;

  // Start at 1200ms, decrease by 8ms every second, minimum 500ms
  const baseInterval = 1200;
  const acceleration = 8;
  const minInterval = 500;
  const currentInterval = Math.max(minInterval, baseInterval - elapsedSec * acceleration);

  spawnInterval = setTimeout(() => {
    if (isGameActive) {
      spawnFruit();
      scheduleNextSpawn();
    }
  }, currentInterval);
}

function playFruitSequence() {
  score = 0;
  lives = 3;
  scoreValue.textContent = score;
  scorePanel.classList.remove('hidden');
  livesPanel.classList.remove('hidden');
  updateLivesDisplay();

  gameStage.classList.remove('hidden');
  backgroundFruits.classList.add('hidden');
  menuCard.classList.add('hidden');
  playBtn.disabled = true;
  playBtn.textContent = 'Playing...';
  isGameActive = true;
  isMouseDown = false;
  bladeTrail.style.opacity = '0';

  gameStartTime = Date.now();
  spawnFruit();
  scheduleNextSpawn();
}

playBtn.addEventListener('click', () => {
  if (!isGameActive) {
    playFruitSequence();
  }
});
