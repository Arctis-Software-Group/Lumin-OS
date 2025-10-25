import { createWindow } from '../window-manager.js';

const STORAGE_KEY = 'lumin-os.spreadsheet.data';
const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = 20;

export const spreadsheetApp = {
  id: 'spreadsheet',
  name: '簡易表計算',
  icon: '📊',
  description: 'セル同士の参照にも対応したライトな表計算',

  launch() {
    const content = createSpreadsheetContent();
    createWindow(this.id, this.name, content, { width: 900, height: 640 });
  }
};

function createSpreadsheetContent() {
  const container = document.createElement('div');
  container.innerHTML = `
    <style>
      .spreadsheet-app {
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .spreadsheet-formula {
        display: flex;
        gap: 8px;
        background: rgba(15, 23, 42, 0.4);
        padding: 8px;
        border-radius: 12px;
      }
      .spreadsheet-formula input {
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(248, 250, 252, 0.1);
        border-radius: 10px;
        padding: 10px 14px;
        color: #f8fafc;
        font-family: "Fira Code", monospace;
      }
      .spreadsheet-formula button {
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        cursor: pointer;
        transition: 0.2s;
      }
      .spreadsheet-formula button:hover {
        background: rgba(56, 189, 248, 0.35);
      }
      .spreadsheet-grid {
        flex: 1;
        overflow: auto;
        border-radius: 12px;
        border: 1px solid rgba(248, 250, 252, 0.08);
      }
      .spreadsheet-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(15, 23, 42, 0.3);
      }
      .spreadsheet-table th,
      .spreadsheet-table td {
        border: 1px solid rgba(148, 163, 184, 0.2);
        min-width: 100px;
        height: 32px;
        padding: 6px 8px;
        font-size: 14px;
        color: rgba(248, 250, 252, 0.88);
      }
      .spreadsheet-table th {
        background: rgba(56, 189, 248, 0.15);
        text-align: center;
        font-weight: 600;
      }
      .spreadsheet-table td {
        background: rgba(15, 23, 42, 0.45);
        cursor: text;
      }
      .spreadsheet-table td.selected {
        background: rgba(56, 189, 248, 0.15);
        outline: 2px solid rgba(56, 189, 248, 0.4);
      }
      .spreadsheet-table td.editing {
        background: rgba(56, 189, 248, 0.2);
        outline: 2px solid rgba(56, 189, 248, 0.6);
      }
      .spreadsheet-status {
        font-size: 13px;
        color: rgba(248, 250, 252, 0.6);
      }
    </style>
    <div class="spreadsheet-app">
      <div class="spreadsheet-formula">
        <input type="text" placeholder="=A1+B2" class="formula-input">
        <button class="save-formula">反映</button>
      </div>
      <div class="spreadsheet-grid">
        <table class="spreadsheet-table"></table>
      </div>
      <div class="spreadsheet-status">セルを選択してください。</div>
    </div>
  `;

  const formulaInput = container.querySelector('.formula-input');
  const saveBtn = container.querySelector('.save-formula');
  const table = container.querySelector('.spreadsheet-table');
  const status = container.querySelector('.spreadsheet-status');

  const data = loadData();
  let selectedCellId = null;

  buildTable(table, data);
  recalculate(table, data);

  table.addEventListener('click', event => {
    const cell = event.target.closest('td');
    if (!cell) return;
    selectCell(cell);
  });

  table.addEventListener('dblclick', event => {
    const cell = event.target.closest('td');
    if (!cell) return;
    startEditing(cell);
  });

  saveBtn.addEventListener('click', () => {
    if (!selectedCellId) return;
    const raw = formulaInput.value.trim();
    data[selectedCellId] = raw;
    persistData(data);
    recalculate(table, data);
    const cell = table.querySelector(`[data-cell-id="${selectedCellId}"]`);
    if (cell) {
      cell.classList.remove('editing');
    }
  });

  formulaInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      saveBtn.click();
    }
  });

  function selectCell(cell) {
    table.querySelectorAll('td.selected').forEach(td => td.classList.remove('selected'));
    cell.classList.add('selected');
    selectedCellId = cell.dataset.cellId;
    status.textContent = `${selectedCellId} を選択中`;
    formulaInput.value = data[selectedCellId] ?? '';
  }

  function startEditing(cell) {
    selectCell(cell);
    cell.classList.add('editing');
    formulaInput.focus();
  }

  return container;
}

function buildTable(table, data) {
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th'));
  COLUMNS.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  for (let row = 1; row <= ROWS; row++) {
    const tr = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);

    COLUMNS.forEach(col => {
      const cellId = `${col}${row}`;
      const td = document.createElement('td');
      td.dataset.cellId = cellId;
      td.textContent = '';
      td.title = cellId;
      td.addEventListener('blur', () => td.classList.remove('editing'));
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
}

function recalculate(table, data) {
  const memo = {};
  const cells = table.querySelectorAll('td');
  cells.forEach(cell => {
    const cellId = cell.dataset.cellId;
    const raw = data[cellId];
    if (!raw) {
      cell.textContent = '';
      cell.dataset.raw = '';
      return;
    }
    cell.dataset.raw = raw;
    cell.textContent = evaluateCell(raw, cellId, data, memo);
  });
}

function evaluateCell(raw, cellId, data, memo, stack = []) {
  if (memo[cellId] !== undefined) return memo[cellId];
  if (stack.includes(cellId)) return 'ERR';

  if (!raw || !raw.startsWith('=')) {
    memo[cellId] = raw ?? '';
    return memo[cellId];
  }

  const expression = raw.slice(1);
  const replaced = expression.replace(/([A-H]\d{1,2})/g, (_, ref) => {
    const value = evaluateCell(data[ref], ref, data, memo, [...stack, cellId]);
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    return numeric;
  });

  if (!/^[0-9+\-*/().\s]*$/.test(replaced)) {
    memo[cellId] = 'ERR';
    return 'ERR';
  }

  try {
    const result = Function(`"use strict"; return (${replaced || 0});`)();
    const normalized = Number.isFinite(result) ? result : 'ERR';
    memo[cellId] = normalized;
    return normalized;
  } catch (error) {
    memo[cellId] = 'ERR';
    return 'ERR';
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
