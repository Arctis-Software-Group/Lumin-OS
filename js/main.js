import { bootApps, getRegisteredApps } from './os-core.js';
import { initFileSystem, createDirectory } from './file-system.js';

import { notepadApp } from './apps/notepad.js';
import { imageViewerApp } from './apps/image-viewer.js';
import { musicPlayerApp } from './apps/music-player.js';
import { drawApp } from './apps/draw-app.js';
import { spreadsheetApp } from './apps/spreadsheet.js';
import { clockApp } from './apps/clock.js';
import { breakoutApp } from './apps/breakout.js';
import { fileManagerApp } from './apps/file-manager.js';

let deferredPrompt;

async function init() {
  try {
    await initFileSystem();
    await createDirectory('/documents');
    await createDirectory('/images');
    await createDirectory('/music');
    console.log('✅ ファイルシステム初期化完了');
  } catch (error) {
    console.error('❌ ファイルシステム初期化失敗:', error);
  }

  bootApps([
    notepadApp,
    clockApp,
    breakoutApp,
    imageViewerApp,
    musicPlayerApp,
    drawApp,
    spreadsheetApp,
    fileManagerApp
  ]);

  renderDock();
  updateClock();
  setupPWAInstall();

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service Worker 登録成功:', registration.scope);
    } catch (error) {
      console.error('❌ Service Worker 登録失敗:', error);
    }
  }

  console.log('✅ Lumin OS 起動完了');
}

function renderDock() {
  const dock = document.querySelector('.dock');
  const apps = getRegisteredApps();
  const template = document.getElementById('app-icon-template');

  apps.forEach(app => {
    const iconEl = template.content.cloneNode(true).querySelector('.app-icon');
    iconEl.querySelector('.icon').textContent = app.icon;
    iconEl.querySelector('.label').textContent = app.name;
    iconEl.title = app.description;
    iconEl.addEventListener('click', () => {
      if (typeof app.launch === 'function') {
        app.launch();
      } else {
        console.warn(`アプリ "${app.name}" には launch 関数がありません`);
      }
    });
    dock.appendChild(iconEl);
  });
}

function updateClock() {
  const clockEl = document.getElementById('status-clock');
  function tick() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
  tick();
  setInterval(tick, 1000);
}

function setupPWAInstall() {
  const banner = document.getElementById('pwa-install-banner');
  const installBtn = document.getElementById('install-button');
  const dismissBtn = document.getElementById('dismiss-install');

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    banner.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log('PWAインストール結果:', result.outcome);
    deferredPrompt = null;
    banner.classList.add('hidden');
  });

  dismissBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWAインストール完了');
    deferredPrompt = null;
    banner.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', init);
