# FruitNinja
A browser fruit-slicing game with bombs, score streaks, and a game over menu.

![FruitNinja gameplay screenshot](images/game-over.png)

## Screenshots
![Screenshot 1](screenshot/1.png)
![Screenshot 2](screenshot/2.png)
![Screenshot 3](screenshot/3.png)

## Try it
Open `index.html` in your browser. That's it.

## Quick Start
1. Clone or download the repo.
2. Open `index.html` in a browser.

Or run a local server:
```bash
cd FruitNinja
python -m http.server 8000
```
Then go to `http://localhost:8000`.

## Features
- Swipe to slice flying fruit with your mouse.
- Bombs show up randomly — miss one and you take a penalty.
- Score counter with a high score saved in `localStorage`.
- Lives system: miss a fruit, lose a life.
- Game over overlay with `Retry` and `Return to Menu`.
- Fruit spawns faster the longer you survive.

## Running locally
No build tools needed — it's just HTML, CSS, and JS.

**Option 1: Open directly**  
Open `index.html` in Chrome, Firefox, or any modern browser.

**Option 2: Local server**  
Run `python -m http.server 8000`, then open `http://localhost:8000`.

## How it works
Each fruit is a plain DOM element thrown across the screen with a CSS animation. Mouse movement is tracked in `script.js` to detect slices. When a fruit's animation ends without a slice, a life is deducted. The best score is written to `localStorage` so it sticks between sessions.

## Credits
Built with vanilla HTML, CSS, and JavaScript. Art and fruit assets are in the `images/` folder.