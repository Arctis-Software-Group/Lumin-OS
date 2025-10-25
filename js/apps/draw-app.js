import { createWindow } from '../window-manager.js';

export const drawApp = {
  id: 'draw',
  name: 'ドローアプリ',
  icon: '🎨',
  description: 'シンプルなお絵描きアプリ',

  launch() {
    const content = createDrawContent();
    createWindow(this.id, this.name, content, { width: 800, height: 640 });
  }
};

function createDrawContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .draw-app {
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .draw-toolbar {
        display: flex;
        gap: 8px;
        background: rgba(15, 23, 42, 0.4);
        padding: 8px;
        border-radius: 12px;
        align-items: center;
      }
      .draw-toolbar label {
        font-size: 13px;
        color: rgba(248, 250, 252, 0.8);
      }
      .draw-toolbar input[type="color"] {
        width: 48px;
        height: 32px;
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }
      .draw-toolbar input[type="range"] {
        width: 120px;
      }
      .draw-toolbar button {
        padding: 8px 16px;
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 8px;
        color: #38bdf8;
        cursor: pointer;
        font-size: 13px;
        transition: 0.2s;
      }
      .draw-toolbar button:hover {
        background: rgba(56, 189, 248, 0.35);
      }
      .draw-canvas {
        flex: 1;
        background: #ffffff;
        border-radius: 12px;
        cursor: crosshair;
      }
    </style>
    <div class="draw-app">
      <div class="draw-toolbar">
        <label>色:</label>
        <input type="color" value="#38bdf8" class="color-picker">
        <label>太さ:</label>
        <input type="range" min="1" max="20" value="3" class="line-width">
        <button class="clear-canvas">クリア</button>
        <button class="save-image">保存</button>
      </div>
      <canvas class="draw-canvas"></canvas>
    </div>
  `;

  const canvas = container.querySelector('.draw-canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = container.querySelector('.color-picker');
  const lineWidthInput = container.querySelector('.line-width');
  const clearBtn = container.querySelector('.clear-canvas');
  const saveBtn = container.querySelector('.save-image');

  canvas.width = 760;
  canvas.height = 500;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener('mousedown', event => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = event.clientX - rect.left;
    lastY = event.clientY - rect.top;
  });

  canvas.addEventListener('mousemove', event => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidthInput.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('キャンバスをクリアしますか？')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  });

  saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });

  return container;
}
