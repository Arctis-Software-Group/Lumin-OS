const DB_NAME = 'LuminOSFileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let db = null;

export async function initFileSystem() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    
    request.onupgradeneeded = event => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'path' });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('parent', 'parent', { unique: false });
      }
    };
  });
}

export async function saveFile(path, content, type = 'text/plain') {
  if (!db) throw new Error('ファイルシステムが初期化されていません');
  if (path === '/') throw new Error('ルートにファイルを保存することはできません');

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const parent = normalizeParent(path);
    const name = extractName(path);

    const file = {
      path,
      name,
      parent,
      content,
      type,
      size: content ? new Blob([content]).size : 0,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };

    const request = store.put(file);
    request.onsuccess = () => resolve(file);
    request.onerror = () => reject(request.error);
  });
}

export async function readFile(path) {
  if (!db) throw new Error('ファイルシステムが初期化されていません');
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(path);
    
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function createDirectory(path) {
  if (!db) throw new Error('ファイルシステムが初期化されていません');
  if (path === '/') return;

  const existing = await readFile(path);
  if (existing) return existing;

  return saveFile(path, null, 'directory');
}

export async function deleteFile(path) {
  if (!db) throw new Error('ファイルシステムが初期化されていません');
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(path);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function listFiles(parentPath = '/') {
  if (!db) throw new Error('ファイルシステムが初期化されていません');
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('parent');
    const request = index.getAll(parentPath);
    
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function fileExists(path) {
  const file = await readFile(path);
  return file !== null;
}

function normalizeParent(path) {
  if (!path || path === '/') return '/';
  const lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.substring(0, lastSlash) : '/';
}

function extractName(path) {
  if (!path || path === '/') return '';
  const lastSlash = path.lastIndexOf('/');
  return path.substring(lastSlash + 1);
}
