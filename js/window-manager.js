let windowCounter = 0;
const activeWindows = new Map();
let zIndexCounter = 100;

export function createWindow(appId, title, content, options = {}) {
  const windowId = `window-${appId}-${++windowCounter}`;
  const template = document.getElementById('window-template');
  const windowEl = template.content.cloneNode(true).querySelector('.app-window');
  
  windowEl.id = windowId;
  windowEl.dataset.appId = appId;
  windowEl.style.zIndex = ++zIndexCounter;
  
  const titleEl = windowEl.querySelector('.window-title');
  titleEl.textContent = title;
  
  const contentEl = windowEl.querySelector('.window-content');
  if (typeof content === 'string') {
    contentEl.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentEl.appendChild(content);
  }
  
  const width = options.width ?? 600;
  const height = options.height ?? 400;
  windowEl.style.width = `${width}px`;
  windowEl.style.height = `${height}px`;
  
  const desktop = document.getElementById('desktop');
  const centerX = (desktop.clientWidth - width) / 2;
  const centerY = (desktop.clientHeight - height) / 2;
  windowEl.style.left = `${Math.max(0, centerX + (windowCounter * 30) % 100)}px`;
  windowEl.style.top = `${Math.max(0, centerY + (windowCounter * 30) % 100)}px`;
  
  setupWindowControls(windowEl);
  setupWindowDragging(windowEl);
  setupWindowResize(windowEl);
  
  desktop.appendChild(windowEl);
  
  requestAnimationFrame(() => {
    windowEl.classList.add('visible');
  });
  
  const windowData = {
    id: windowId,
    appId,
    element: windowEl,
    isMaximized: false,
    isMinimized: false,
    savedPosition: null
  };
  activeWindows.set(windowId, windowData);
  
  return windowId;
}

function setupWindowControls(windowEl) {
  const closeBtn = windowEl.querySelector('.window-close');
  const minimizeBtn = windowEl.querySelector('.window-minimize');
  const maximizeBtn = windowEl.querySelector('.window-maximize');
  
  closeBtn.addEventListener('click', () => closeWindow(windowEl.id));
  minimizeBtn.addEventListener('click', () => minimizeWindow(windowEl.id));
  maximizeBtn.addEventListener('click', () => toggleMaximizeWindow(windowEl.id));
  
  windowEl.addEventListener('mousedown', () => bringToFront(windowEl));
}

function setupWindowDragging(windowEl) {
  const toolbar = windowEl.querySelector('.window-toolbar');
  let isDragging = false;
  let startX;
  let startY;
  let initialLeft;
  let initialTop;

  const moveHandler = event => {
    if (!isDragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    windowEl.style.left = `${initialLeft + dx}px`;
    windowEl.style.top = `${initialTop + dy}px`;
  };

  const upHandler = () => {
    if (!isDragging) return;

    isDragging = false;
    toolbar.style.cursor = 'move';
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
  };

  toolbar.addEventListener('mousedown', event => {
    if (event.target.closest('.window-actions')) return;

    const windowData = activeWindows.get(windowEl.id);
    if (windowData?.isMaximized) return;

    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    initialLeft = windowEl.offsetLeft;
    initialTop = windowEl.offsetTop;

    toolbar.style.cursor = 'grabbing';
    bringToFront(windowEl);

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  });
}

function setupWindowResize(windowEl) {
  if (typeof ResizeObserver === 'undefined') return;

  const resizeObserver = new ResizeObserver(() => {
    const windowData = activeWindows.get(windowEl.id);
    if (windowData && !windowData.isMaximized) {
      windowData.savedPosition = {
        left: windowEl.style.left,
        top: windowEl.style.top,
        width: windowEl.style.width,
        height: windowEl.style.height
      };
    }
  });
  resizeObserver.observe(windowEl);
}

function bringToFront(windowEl) {
  windowEl.style.zIndex = ++zIndexCounter;
}

export function closeWindow(windowId) {
  const windowData = activeWindows.get(windowId);
  if (!windowData) return;
  
  const windowEl = windowData.element;
  windowEl.classList.remove('visible');
  
  setTimeout(() => {
    windowEl.remove();
    activeWindows.delete(windowId);
  }, 300);
}

export function minimizeWindow(windowId) {
  const windowData = activeWindows.get(windowId);
  if (!windowData) return;
  
  windowData.element.classList.add('minimized');
  windowData.isMinimized = true;
}

export function restoreWindow(windowId) {
  const windowData = activeWindows.get(windowId);
  if (!windowData) return;
  
  windowData.element.classList.remove('minimized');
  windowData.isMinimized = false;
  bringToFront(windowData.element);
}

export function toggleMaximizeWindow(windowId) {
  const windowData = activeWindows.get(windowId);
  if (!windowData) return;
  
  const windowEl = windowData.element;
  
  if (windowData.isMaximized) {
    windowEl.classList.remove('maximized');
    if (windowData.savedPosition) {
      windowEl.style.left = windowData.savedPosition.left;
      windowEl.style.top = windowData.savedPosition.top;
      windowEl.style.width = windowData.savedPosition.width;
      windowEl.style.height = windowData.savedPosition.height;
    }
    windowData.isMaximized = false;
  } else {
    windowData.savedPosition = {
      left: windowEl.style.left,
      top: windowEl.style.top,
      width: windowEl.style.width,
      height: windowEl.style.height
    };
    windowEl.classList.add('maximized');
    windowData.isMaximized = true;
  }
}

export function getActiveWindows() {
  return Array.from(activeWindows.values());
}
