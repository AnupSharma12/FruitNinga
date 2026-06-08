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

let isGameActive = false;
let lastX = 0;
let lastY = 0;
let isMouseDown = false;

function createThrownFruit(imageSrc, index) {
  const fruit = document.createElement('img');
  fruit.src = imageSrc;
  fruit.className = 'throw-fruit';
  fruit.style.setProperty('--start-x', `${10 + index * 10}%`);
  fruit.style.setProperty('--throw-offset', `${((index % 5) - 2) * 45}px`);
  fruit.style.setProperty('--spin-start', `${index * 76}deg`);
  fruit.style.setProperty('--spin-end', `${720 + index * 90}deg`);
  fruit.style.setProperty('--delay', `${index * 140}ms`);
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
      fruit.classList.add('sliced');
      setTimeout(() => fruit.remove(), 400);
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

function playFruitSequence() {
  return new Promise((resolve) => {
    gameStage.classList.remove('hidden');
    backgroundFruits.classList.add('hidden');
    menuCard.classList.add('hidden');
    playBtn.disabled = true;
    playBtn.textContent = 'Launching...';
    isGameActive = true;
    isMouseDown = false;
    bladeTrail.style.opacity = '0';

    const totalFruits = 8;
    let endedCount = 0;

    for (let i = 0; i < totalFruits; i += 1) {
      setTimeout(() => {
        const image = fruitImages[i % fruitImages.length];
        const fruit = createThrownFruit(image, i);
        gameStage.appendChild(fruit);

        fruit.addEventListener('animationend', () => {
          if (!fruit.classList.contains('sliced')) {
            fruit.remove();
          }
          endedCount += 1;

          if (endedCount === totalFruits) {
            isGameActive = false;
            isMouseDown = false;
            bladeTrail.style.opacity = '0';
            playBtn.disabled = false;
            playBtn.textContent = 'Play Again';
            menuCard.classList.remove('hidden');
            backgroundFruits.classList.remove('hidden');
            gameStage.classList.add('hidden');
            resolve();
          }
        }, { once: true });
      }, i * 220);
    }
  });
}

playBtn.addEventListener('click', () => {
  playFruitSequence();
});
