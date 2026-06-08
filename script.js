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

function playFruitSequence() {
  return new Promise((resolve) => {
    gameStage.classList.remove('hidden');
    backgroundFruits.classList.add('hidden');
    menuCard.classList.add('hidden');
    playBtn.disabled = true;
    playBtn.textContent = 'Launching...';

    const totalFruits = 8;
    let endedCount = 0;

    for (let i = 0; i < totalFruits; i += 1) {
      setTimeout(() => {
        const image = fruitImages[i % fruitImages.length];
        const fruit = createThrownFruit(image, i);
        gameStage.appendChild(fruit);

        fruit.addEventListener('animationend', () => {
          fruit.remove();
          endedCount += 1;

          if (endedCount === totalFruits) {
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
