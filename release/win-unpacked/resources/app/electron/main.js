const { app, BrowserWindow } = require('electron');
const path = require('path');

const SERVER_PORT = 3456;
let mainWindow;

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', 'backend');
  }
  return path.join(__dirname, '..', 'backend');
}

function getFrontendDistPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', 'frontend', 'dist');
  }
  return path.join(__dirname, '..', 'frontend', 'dist');
}

async function startBackendServer() {
  const backendPath = getBackendPath();
  const distPath = getFrontendDistPath();

  process.env.SERVER_PORT = SERVER_PORT;
  process.env.FRONTEND_DIST_PATH = distPath;

  const userDataPath = app.getPath('userData');
  process.env.DB_PATH = path.join(userDataPath, 'data.db');

  require(path.join(backendPath, 'server.js'));

  await new Promise(resolve => setTimeout(resolve, 1500));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: '柴油机润滑系统教学辅助系统',
    backgroundColor: '#fafcfb',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startBackendServer();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
