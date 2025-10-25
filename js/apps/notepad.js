import { createWindow } from '../window-manager.js';
import { saveFile, readFile, createDirectory } from '../file-system.js';

const AUTOSAVE_KEY = 'lumin-os.notepad.autosave';

export const notepadApp = {
  id: 'notepad',
  name: 'メモ帳',
  icon: '📝',
  description: 'Markdown対応のテキストエディタ',

  async launch() {
    await createDirectory('/documents');
    const content = createNotepadContent();
    createWindow(this.id, this.name, content, { width: 820, height: 560 });
  }
};

function createNotepadContent() {
  const container = document.createElement('div');
  container.className = 'notepad-app';
  container.innerHTML = `
    <style>
      .notepad-app {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 12px;
      }
      .notepad-toolbar {
        display: flex;
        gap: 8px;
        padding: 8px;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 12px;
        align-items: center;
      }
      .notepad-toolbar input {
        flex: 1;
        padding: 10px 14px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 10px;
        color: #f8fafc;
        font-size: 14px;
      }
      .notepad-toolbar button {
        padding: 10px 18px;
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 10px;
        color: #38bdf8;
        cursor: pointer;
        font-size: 13px;
        transition: 0.2s ease;
        white-space: nowrap;
      }
      .notepad-toolbar button:hover {
        background: rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
      }
      .notepad-editor {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 12px;
      }
      .notepad-editor textarea {
        width: 100%;
        height: 100%;
        padding: 14px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(248, 250, 252, 0.08);
        border-radius: 12px;
        color: #f8fafc;
        font-size: 15px;
        font-family: "Fira Code", "Consolas", monospace;
        resize: none;
        line-height: 1.6;
      }
      .notepad-preview {
        width: 100%;
        height: 100%;
        padding: 16px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(248, 250, 252, 0.08);
        border-radius: 12px;
        overflow: auto;
      }
      .notepad-preview h1,
      .notepad-preview h2,
      .notepad-preview h3 {
        margin-bottom: 12px;
        font-weight: 600;
      }
      .notepad-preview h1 { font-size: 28px; }
      .notepad-preview h2 { font-size: 22px; }
      .notepad-preview h3 { font-size: 18px; }
      .notepad-preview p {
        margin-bottom: 12px;
        color: rgba(248, 250, 252, 0.85);
      }
      .notepad-preview code {
        background: rgba(15, 23, 42, 0.7);
        padding: 2px 6px;
        border-radius: 6px;
        font-family: "Fira Code", monospace;
      }
      .notepad-preview pre {
        background: rgba(15, 23, 42, 0.7);
        padding: 12px;
        border-radius: 12px;
        overflow-x: auto;
        margin-bottom: 12px;
      }
      .notepad-preview ul,
      .notepad-preview ol {
        padding-left: 20px;
        margin-bottom: 12px;
      }
      .notepad-preview blockquote {
        border-left: 4px solid rgba(56, 189, 248, 0.6);
        padding-left: 12px;
        color: rgba(248, 250, 252, 0.75);
        margin-bottom: 12px;
      }
    </style>
    <div class="notepad-toolbar">
      <input type="text" placeholder="ファイル名（例: note.md）" class="notepad-filename" />
      <button type="button" class="notepad-save">💾 保存</button>
      <button type="button" class="notepad-load">📂 読込</button>
      <button type="button" class="notepad-clear">🧹 クリア</button>
    </div>
    <div class="notepad-editor">
      <textarea class="notepad-input" placeholder="Markdownでメモを取れます。\n例:\n# 見出し\n- 箇条書き\n**強調** や *斜体* もサポート"></textarea>
      <div class="notepad-preview"></div>
    </div>
  `;

  const textarea = container.querySelector('.notepad-input');
  const preview = container.querySelector('.notepad-preview');
  const filenameInput = container.querySelector('.notepad-filename');
  const saveBtn = container.querySelector('.notepad-save');
  const loadBtn = container.querySelector('.notepad-load');
  const clearBtn = container.querySelector('.notepad-clear');

  const autosaved = localStorage.getItem(AUTOSAVE_KEY);
  if (autosaved) {
    textarea.value = autosaved;
    preview.innerHTML = renderMarkdown(autosaved);
  } else {
    preview.innerHTML = '<p>Markdownのプレビューがここに表示されます。</p>';
  }

  textarea.addEventListener('input', () => {
    const text = textarea.value;
    preview.innerHTML = renderMarkdown(text);
    localStorage.setItem(AUTOSAVE_KEY, text);
  });

  saveBtn.addEventListener('click', async () => {
    const filename = (filenameInput.value || '').trim() || 'untitled.md';
    const path = `/documents/${filename}`;
    try {
      await saveFile(path, textarea.value, 'text/markdown');
      showNotification(`${filename} を保存しました`, 'success');
    } catch (error) {
      showNotification('保存に失敗しました: ' + error.message, 'error');
    }
  });

  loadBtn.addEventListener('click', async () => {
    const filename = (filenameInput.value || '').trim();
    if (!filename) {
      showNotification('ファイル名を入力してください', 'error');
      return;
    }
    const path = `/documents/${filename}`;
    try {
      const file = await readFile(path);
      if (!file) {
        showNotification('ファイルが見つかりません', 'error');
        return;
      }
      textarea.value = file.content ?? '';
      preview.innerHTML = renderMarkdown(textarea.value);
      localStorage.setItem(AUTOSAVE_KEY, textarea.value);
      showNotification(`${filename} を読み込みました`, 'success');
    } catch (error) {
      showNotification('読み込みに失敗しました: ' + error.message, 'error');
    }
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('エディタをクリアしますか？')) {
      textarea.value = '';
      filenameInput.value = '';
      preview.innerHTML = '<p>Markdownのプレビューがここに表示されます。</p>';
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  });

  return container;
}

function renderMarkdown(text) {
  if (!text) return '';

  const escapeChars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  const escapeHtml = str => str.replace(/[&<>"']/g, char => escapeChars[char]);

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inCodeBlock = false;
  let listType = null;

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        html.push('<pre><code>');
      } else {
        inCodeBlock = false;
        html.push('</code></pre>');
      }
      return;
    }

    if (inCodeBlock) {
      html.push(escapeHtml(line) + '\n');
      return;
    }

    if (/^\s*-\s+/.test(line)) {
      if (listType !== 'ul') {
        if (listType) html.push(`</${listType}>`);
        listType = 'ul';
        html.push('<ul>');
      }
      const item = line.replace(/^\s*-\s+/, '');
      html.push(`<li>${inlineMarkdown(item)}</li>`);
      return;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        if (listType) html.push(`</${listType}>`);
        listType = 'ol';
        html.push('<ol>');
      }
      const item = line.replace(/^\s*\d+\.\s+/, '');
      html.push(`<li>${inlineMarkdown(item)}</li>`);
      return;
    }

    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }

    if (/^>\s?/.test(line)) {
      html.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`);
      return;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#{1,6}/)[0].length;
      const content = line.replace(/^#{1,6}\s/, '');
      html.push(`<h${level}>${inlineMarkdown(content)}</h${level}>`);
      return;
    }

    if (!line.trim()) {
      html.push('<p></p>');
      return;
    }

    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  if (listType) {
    html.push(`</${listType}>`);
  }

  if (inCodeBlock) {
    html.push('</code></pre>');
  }

  return html.join('\n');
}

function inlineMarkdown(text) {
  if (!text) return '';
  const escaped = text.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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
