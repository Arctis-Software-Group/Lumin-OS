const appRegistry = new Map();

export function registerApp(app) {
  if (!app || !app.id) {
    throw new Error('アプリにはidが必要です');
  }
  if (appRegistry.has(app.id)) {
    throw new Error(`アプリID "${app.id}" は既に登録されています`);
  }
  appRegistry.set(app.id, Object.freeze({ ...app }));
}

export function getRegisteredApps() {
  return Array.from(appRegistry.values());
}

export function getAppById(id) {
  return appRegistry.get(id) ?? null;
}

export function bootApps(appList) {
  appList.forEach(registerApp);
}
