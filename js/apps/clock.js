import { createWindow } from '../window-manager.js';

export const clockApp = {
  id: 'clock',
  name: '時計＆タイマー',
  icon: '⏰',
  description: 'デジタル時計、タイマー、ストップウォッチ',

  launch() {
    const content = createClockContent();
    createWindow(this.id, this.name, content, { width: 520, height: 480 });
  }
};

function createClockContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .clock-app {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
      }
      .clock-tabs {
        display: flex;
        gap: 8px;
        background: rgba(15, 23, 42, 0.4);
        padding: 6px;
        border-radius: 12px;
      }
      .clock-tabs button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: rgba(248, 250, 252, 0.6);
        cursor: pointer;
        font-size: 14px;
        transition: 0.2s;
      }
      .clock-tabs button.active {
        background: rgba(56, 189, 248, 0.25);
        color: #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
      }
      .clock-panel {
        display: none;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
        padding: 20px;
        background: rgba(15, 23, 42, 0.3);
        border-radius: 16px;
      }
      .clock-panel.active {
        display: flex;
      }
      .clock-display {
        font-size: 64px;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        color: #38bdf8;
        text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
        letter-spacing: 4px;
      }
      .clock-date {
        font-size: 18px;
        color: rgba(248, 250, 252, 0.7);
      }
      .timer-input {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .timer-input input {
        width: 80px;
        padding: 12px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 10px;
        color: #f8fafc;
        font-size: 20px;
        text-align: center;
      }
      .timer-controls,
      .stopwatch-controls {
        display: flex;
        gap: 12px;
      }
      .timer-controls button,
      .stopwatch-controls button {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #38bdf8;
        cursor: pointer;
        font-size: 14px;
        transition: 0.2s;
      }
      .timer-controls button:hover,
      .stopwatch-controls button:hover {
        background: rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
      }
      .timer-controls button.stop,
      .stopwatch-controls button.stop {
        background: rgba(248, 113, 113, 0.2);
        border-color: rgba(248, 113, 113, 0.3);
        color: #f87171;
      }
      .timer-controls button.stop:hover,
      .stopwatch-controls button.stop:hover {
        background: rgba(248, 113, 113, 0.35);
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.3);
      }
    </style>
    <div class="clock-app">
      <div class="clock-tabs">
        <button class="clock-tab active" data-tab="clock">⏰ 時計</button>
        <button class="clock-tab" data-tab="timer">⏲️ タイマー</button>
        <button class="clock-tab" data-tab="stopwatch">⏱️ ストップウォッチ</button>
      </div>
      <div class="clock-panel active" data-panel="clock">
        <div class="clock-display"></div>
        <div class="clock-date"></div>
      </div>
      <div class="clock-panel" data-panel="timer">
        <div class="clock-display">00:00:00</div>
        <div class="timer-input">
          <input type="number" min="0" max="23" value="0" class="timer-hours" placeholder="時">
          <span>:</span>
          <input type="number" min="0" max="59" value="1" class="timer-minutes" placeholder="分">
          <span>:</span>
          <input type="number" min="0" max="59" value="0" class="timer-seconds" placeholder="秒">
        </div>
        <div class="timer-controls">
          <button class="timer-start">開始</button>
          <button class="timer-stop stop">停止</button>
          <button class="timer-reset">リセット</button>
        </div>
      </div>
      <div class="clock-panel" data-panel="stopwatch">
        <div class="clock-display">00:00:00</div>
        <div class="stopwatch-controls">
          <button class="stopwatch-start">開始</button>
          <button class="stopwatch-stop stop">停止</button>
          <button class="stopwatch-reset">リセット</button>
        </div>
      </div>
    </div>
  `;

  setupTabs(container);
  setupClock(container);
  setupTimer(container);
  setupStopwatch(container);

  return container;
}

function setupTabs(container) {
  const tabs = container.querySelectorAll('.clock-tab');
  const panels = container.querySelectorAll('.clock-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`[data-panel="${target}"]`).classList.add('active');
    });
  });
}

function setupClock(container) {
  const display = container.querySelector('[data-panel="clock"] .clock-display');
  const dateDisplay = container.querySelector('.clock-date');

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    display.textContent = `${hours}:${minutes}:${seconds}`;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const day = dayNames[now.getDay()];
    dateDisplay.textContent = `${year}年${month}月${date}日（${day}）`;
  }

  update();
  setInterval(update, 1000);
}

function setupTimer(container) {
  const display = container.querySelector('[data-panel="timer"] .clock-display');
  const hoursInput = container.querySelector('.timer-hours');
  const minutesInput = container.querySelector('.timer-minutes');
  const secondsInput = container.querySelector('.timer-seconds');
  const startBtn = container.querySelector('.timer-start');
  const stopBtn = container.querySelector('.timer-stop');
  const resetBtn = container.querySelector('.timer-reset');

  let intervalId = null;
  let totalSeconds = 0;

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', () => {
    if (intervalId) return;

    if (totalSeconds === 0) {
      const h = parseInt(hoursInput.value, 10) || 0;
      const m = parseInt(minutesInput.value, 10) || 0;
      const s = parseInt(secondsInput.value, 10) || 0;
      totalSeconds = h * 3600 + m * 60 + s;
    }

    if (totalSeconds <= 0) return;

    intervalId = setInterval(() => {
      totalSeconds--;
      display.textContent = formatTime(totalSeconds);

      if (totalSeconds <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        alert('タイマー終了！');
      }
    }, 1000);
  });

  stopBtn.addEventListener('click', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  resetBtn.addEventListener('click', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    totalSeconds = 0;
    display.textContent = '00:00:00';
  });
}

function setupStopwatch(container) {
  const display = container.querySelector('[data-panel="stopwatch"] .clock-display');
  const startBtn = container.querySelector('.stopwatch-start');
  const stopBtn = container.querySelector('.stopwatch-stop');
  const resetBtn = container.querySelector('.stopwatch-reset');

  let intervalId = null;
  let elapsed = 0;

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  startBtn.addEventListener('click', () => {
    if (intervalId) return;

    const startTime = Date.now() - elapsed;
    intervalId = setInterval(() => {
      elapsed = Date.now() - startTime;
      display.textContent = formatTime(elapsed);
    }, 100);
  });

  stopBtn.addEventListener('click', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  resetBtn.addEventListener('click', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    elapsed = 0;
    display.textContent = '00:00:00';
  });
}
