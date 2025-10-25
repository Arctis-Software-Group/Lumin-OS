import { createWindow } from '../window-manager.js';

export const breakoutApp = {
  id: 'breakout',
  name: 'ブロック崩し',
  icon: '🎮',
  description: 'クラシックなブロック崩しゲーム',

  launch() {
    const content = createBreakoutContent();
    createWindow(this.id, this.name, content, { width: 640, height: 560 });
  }
};

function createBreakoutContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .breakout-game {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
        align-items: center;
      }
      .game-canvas {
        border: 2px solid rgba(56, 189, 248, 0.3);
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.6);
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
      }
      .game-info {
        display: flex;
        gap: 24px;
        justify-content: center;
        font-size: 16px;
      }
      .game-info span {
        color: #38bdf8;
        font-weight: 600;
      }
      .game-controls {
        display: flex;
        gap: 12px;
      }
      .game-controls button {
        padding: 10px 20px;
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 10px;
        color: #38bdf8;
        cursor: pointer;
        font-size: 14px;
        transition: 0.2s;
      }
      .game-controls button:hover {
        background: rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
      }
    </style>
    <div class="breakout-game">
      <canvas class="game-canvas" width="600" height="400"></canvas>
      <div class="game-info">
        <div>スコア: <span class="score">0</span></div>
        <div>ライフ: <span class="lives">3</span></div>
      </div>
      <div class="game-controls">
        <button class="start-btn">スタート</button>
        <button class="pause-btn">一時停止</button>
        <button class="restart-btn">リスタート</button>
      </div>
    </div>
  `;

  const canvas = container.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('.score');
  const livesEl = container.querySelector('.lives');
  const startBtn = container.querySelector('.start-btn');
  const pauseBtn = container.querySelector('.pause-btn');
  const restartBtn = container.querySelector('.restart-btn');

  let gameState = {
    ball: { x: 300, y: 350, dx: 3, dy: -3, radius: 8 },
    paddle: { x: 250, y: 370, width: 100, height: 12, speed: 7 },
    bricks: [],
    score: 0,
    lives: 3,
    running: false,
    paused: false
  };

  function initBricks() {
    gameState.bricks = [];
    const rows = 5;
    const cols = 8;
    const brickWidth = 70;
    const brickHeight = 20;
    const padding = 5;
    const offsetX = 10;
    const offsetY = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        gameState.bricks.push({
          x: c * (brickWidth + padding) + offsetX,
          y: r * (brickHeight + padding) + offsetY,
          width: brickWidth,
          height: brickHeight,
          visible: true,
          color: `hsl(${(r * cols + c) * 10 + 180}, 70%, 60%)`
        });
      }
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#38bdf8';

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height);

    gameState.bricks.forEach(brick => {
      if (!brick.visible) return;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });
  }

  function update() {
    if (gameState.paused || !gameState.running) return;
    if (!document.body.contains(container)) {
      gameState.running = false;
      return;
    }

    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;

    if (gameState.ball.x + gameState.ball.radius > canvas.width || gameState.ball.x - gameState.ball.radius < 0) {
      gameState.ball.dx = -gameState.ball.dx;
    }

    if (gameState.ball.y - gameState.ball.radius < 0) {
      gameState.ball.dy = -gameState.ball.dy;
    }

    if (
      gameState.ball.y + gameState.ball.radius > gameState.paddle.y &&
      gameState.ball.x > gameState.paddle.x &&
      gameState.ball.x < gameState.paddle.x + gameState.paddle.width
    ) {
      gameState.ball.dy = -gameState.ball.dy;
    }

    if (gameState.ball.y + gameState.ball.radius > canvas.height) {
      gameState.lives--;
      livesEl.textContent = gameState.lives;
      if (gameState.lives <= 0) {
        gameState.running = false;
        alert('ゲームオーバー！');
      } else {
        gameState.ball.x = 300;
        gameState.ball.y = 350;
        gameState.ball.dx = 3;
        gameState.ball.dy = -3;
      }
    }

    gameState.bricks.forEach(brick => {
      if (!brick.visible) return;

      if (
        gameState.ball.x > brick.x &&
        gameState.ball.x < brick.x + brick.width &&
        gameState.ball.y > brick.y &&
        gameState.ball.y < brick.y + brick.height
      ) {
        gameState.ball.dy = -gameState.ball.dy;
        brick.visible = false;
        gameState.score += 10;
        scoreEl.textContent = gameState.score;

        if (gameState.bricks.every(b => !b.visible)) {
          gameState.running = false;
          alert('クリア！おめでとうございます！');
        }
      }
    });
  }

  function loop() {
    update();
    draw();
    if (gameState.running) {
      requestAnimationFrame(loop);
    }
  }

  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', e => {
    keys[e.key] = false;
  });

  function movePaddle() {
    if (keys['ArrowLeft'] && gameState.paddle.x > 0) {
      gameState.paddle.x -= gameState.paddle.speed;
    }
    if (keys['ArrowRight'] && gameState.paddle.x + gameState.paddle.width < canvas.width) {
      gameState.paddle.x += gameState.paddle.speed;
    }
    requestAnimationFrame(movePaddle);
  }
  movePaddle();

  startBtn.addEventListener('click', () => {
    if (!gameState.running) {
      gameState.running = true;
      gameState.paused = false;
      loop();
    }
  });

  pauseBtn.addEventListener('click', () => {
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? '再開' : '一時停止';
    if (!gameState.paused && gameState.running) {
      loop();
    }
  });

  restartBtn.addEventListener('click', () => {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.ball = { x: 300, y: 350, dx: 3, dy: -3, radius: 8 };
    gameState.paddle.x = 250;
    gameState.running = false;
    gameState.paused = false;
    initBricks();
    scoreEl.textContent = '0';
    livesEl.textContent = '3';
    pauseBtn.textContent = '一時停止';
    draw();
  });

  initBricks();
  draw();

  return container;
}
