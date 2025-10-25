import { createWindow } from '../window-manager.js';

export const imageViewerApp = {
  id: 'image-viewer',
  name: '画像ビューア',
  icon: '🖼️',
  description: '画像を表示するアプリ',

  launch() {
    const content = createImageViewerContent();
    createWindow(this.id, this.name, content, { width: 700, height: 560 });
  }
};

function createImageViewerContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .image-viewer {
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .image-toolbar {
        display: flex;
        gap: 8px;
        background: rgba(15, 23, 42, 0.4);
        padding: 8px;
        border-radius: 12px;
      }
      .image-toolbar input[type="file"] {
        flex: 1;
        padding: 10px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 10px;
        color: #f8fafc;
        font-size: 14px;
      }
      .image-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.3);
        border-radius: 16px;
        overflow: hidden;
        position: relative;
      }
      .image-container img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
      }
      .image-placeholder {
        text-align: center;
        color: rgba(248, 250, 252, 0.5);
        font-size: 18px;
      }
      .zoom-controls {
        display: flex;
        gap: 8px;
      }
      .zoom-controls button {
        padding: 10px 18px;
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 10px;
        color: #38bdf8;
        cursor: pointer;
        font-size: 14px;
        transition: 0.2s;
      }
      .zoom-controls button:hover {
        background: rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
      }
    </style>
    <div class="image-viewer">
      <div class="image-toolbar">
        <input type="file" accept="image/*" class="file-input">
        <div class="zoom-controls">
          <button class="zoom-out">🔍-</button>
          <button class="zoom-reset">100%</button>
          <button class="zoom-in">🔍+</button>
        </div>
      </div>
      <div class="image-container">
        <div class="image-placeholder">
          📷<br>画像を選択してください
        </div>
      </div>
    </div>
  `;

  const fileInput = container.querySelector('.file-input');
  const imageContainer = container.querySelector('.image-container');
  const zoomInBtn = container.querySelector('.zoom-in');
  const zoomOutBtn = container.querySelector('.zoom-out');
  const zoomResetBtn = container.querySelector('.zoom-reset');

  let currentImage = null;
  let zoom = 1;

  fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      imageContainer.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
      currentImage = imageContainer.querySelector('img');
      zoom = 1;
      updateZoom();
    };
    reader.readAsDataURL(file);
  });

  zoomInBtn.addEventListener('click', () => {
    if (!currentImage) return;
    zoom = Math.min(zoom + 0.25, 3);
    updateZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    if (!currentImage) return;
    zoom = Math.max(zoom - 0.25, 0.25);
    updateZoom();
  });

  zoomResetBtn.addEventListener('click', () => {
    if (!currentImage) return;
    zoom = 1;
    updateZoom();
  });

  function updateZoom() {
    if (!currentImage) return;
    currentImage.style.transform = `scale(${zoom})`;
    zoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
  }

  return container;
}
