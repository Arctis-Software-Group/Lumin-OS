import { createWindow } from '../window-manager.js';
import { listFiles, readFile, deleteFile, createDirectory, saveFile } from '../file-system.js';

export const fileManagerApp = {
  id: 'file-manager',
  name: 'ファイルマネージャー',
  icon: '📁',
  description: 'ファイルシステムの管理',

  launch() {
    const content = createFileManagerContent();
    createWindow(this.id, this.name, content, { width: 720, height: 560 });
  }
};

function createFileManagerContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .file-manager {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 12px;
      }
      .file-toolbar {
        display: flex;
        gap: 8px;
        align-items: center;
        background: rgba(15, 23, 42, 0.4);
        padding: 8px;
        border-radius: 12px;
      }
      .file-toolbar input {
        flex: 1;
        padding: 10px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 10px;
        color: #f8fafc;
      }
      .file-toolbar button {
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        cursor: pointer;
        transition: 0.2s;
      }
      .file-toolbar button:hover {
        background: rgba(56, 189, 248, 0.35);
      }
      .file-toolbar button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: rgba(148, 163, 184, 0.2);
        border-color: rgba(148, 163, 184, 0.3);
        color: rgba(148, 163, 184, 0.8);
      }
      .file-list {
        flex: 1;
        overflow: auto;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.3);
        padding: 8px;
      }
      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        margin-bottom: 6px;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 10px;
        border: 1px solid rgba(248, 250, 252, 0.08);
        cursor: pointer;
        transition: 0.2s;
      }
      .file-item:hover {
        background: rgba(56, 189, 248, 0.15);
      }
      .file-item-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .file-item-name {
        font-size: 14px;
        color: #f8fafc;
      }
      .file-item-meta {
        font-size: 12px;
        color: rgba(248, 250, 252, 0.5);
      }
      .file-item-actions button {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid rgba(248, 113, 113, 0.3);
        background: rgba(248, 113, 113, 0.2);
        color: #f87171;
        cursor: pointer;
        transition: 0.2s;
      }
      .file-item-actions button:hover {
        background: rgba(248, 113, 113, 0.35);
      }
      .current-path {
        font-size: 13px;
        color: rgba(248, 250, 252, 0.7);
        padding: 0 4px;
      }
    </style>
    <div class="file-manager">
      <div class="file-toolbar">
        <button class="go-up">⬆️ 上へ</button>
        <span class="current-path">/documents</span>
        <input type="text" placeholder="新しいファイル名" class="new-file-name">
        <button class="create-file">新規ファイル</button>
        <button class="create-folder">新規フォルダ</button>
        <button class="refresh">更新</button>
      </div>
      <div class="file-list"></div>
    </div>
  `;

  const pathEl = container.querySelector('.current-path');
  const newFileNameInput = container.querySelector('.new-file-name');
  const createBtn = container.querySelector('.create-file');
  const createFolderBtn = container.querySelector('.create-folder');
  const refreshBtn = container.querySelector('.refresh');
  const goUpBtn = container.querySelector('.go-up');
  const listEl = container.querySelector('.file-list');

  let currentPath = '/documents';

  async function loadFiles() {
    try {
      await createDirectory(currentPath);
      const files = await listFiles(currentPath);
      renderFiles(files);
      goUpBtn.disabled = currentPath === '/';
    } catch (error) {
      showNotification('ファイルの読み込みに失敗: ' + error.message, 'error');
    }
  }

  function renderFiles(files) {
    pathEl.textContent = currentPath;

    if (!files || files.length === 0) {
      listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: rgba(248,250,252,0.5);">ファイルがありません</div>';
      return;
    }

    const sorted = [...files].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name, 'ja');
      return a.type === 'directory' ? -1 : 1;
    });

    listEl.innerHTML = '';
    sorted.forEach(file => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <div class="file-item-info">
          <div class="file-item-name">${file.type === 'directory' ? '📁' : '📄'} ${file.name}</div>
          <div class="file-item-meta">${file.type} • ${formatSize(file.size)} • ${formatDate(file.modifiedAt)}</div>
        </div>
        <div class="file-item-actions">
          <button class="delete-btn" data-path="${file.path}">削除</button>
        </div>
      `;

      item.querySelector('.delete-btn').addEventListener('click', async event => {
        event.stopPropagation();
        const path = event.target.dataset.path;
        if (confirm(`${file.name} を削除しますか？`)) {
          try {
            await deleteEntry(path, file.type);
            showNotification('削除しました', 'success');
            loadFiles();
          } catch (error) {
            showNotification('削除に失敗: ' + error.message, 'error');
          }
        }
      });

      item.addEventListener('click', async () => {
        if (file.type === 'directory') {
          currentPath = file.path;
          pathEl.textContent = currentPath;
          loadFiles();
        } else {
          try {
            const data = await readFile(file.path);
            alert(`${file.name}\n\n${data.content}`);
          } catch (error) {
            showNotification('読み込みに失敗: ' + error.message, 'error');
          }
        }
      });

      listEl.appendChild(item);
    });
  }

  createBtn.addEventListener('click', async () => {
    const filename = newFileNameInput.value.trim();
    if (!filename) {
      showNotification('ファイル名を入力してください', 'error');
      return;
    }
    const path = `${currentPath}/${filename}`;
    try {
      await saveFile(path, '', 'text/plain');
      newFileNameInput.value = '';
      showNotification('ファイルを作成しました', 'success');
      loadFiles();
    } catch (error) {
      showNotification('作成に失敗: ' + error.message, 'error');
    }
  });

  refreshBtn.addEventListener('click', () => {
    loadFiles();
  });

  goUpBtn.addEventListener('click', () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    currentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
    loadFiles();
  });

  createFolderBtn.addEventListener('click', async () => {
    const foldername = newFileNameInput.value.trim();
    if (!foldername) {
      showNotification('フォルダ名を入力してください', 'error');
      return;
    }
    const path = `${currentPath}/${foldername}`;
    try {
      await createDirectory(path);
      newFileNameInput.value = '';
      showNotification('フォルダを作成しました', 'success');
      loadFiles();
    } catch (error) {
      showNotification('作成に失敗: ' + error.message, 'error');
    }
  });

  function formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
  }

  async function deleteEntry(path, type) {
    if (type === 'directory') {
      const children = await listFiles(path);
      for (const child of children) {
        await deleteEntry(child.path, child.type);
      }
    }
    await deleteFile(path);
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('visible'), 10);
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  loadFiles();

  return container;
}
