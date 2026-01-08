const { app, BrowserWindow, clipboard, ipcMain, Menu } = require('electron');
const path = require('path');

let watcherInterval;
let lastText = '';

function startClipboardWatcher(win) {
  const readAndSend = () => {
    if (win.isDestroyed()) return;
    const current = clipboard.readText();
    if (!current.trim() || current === lastText) {
      return;
    }
    lastText = current;
    win.webContents.send('clipboard-changed', {
      text: current,
      time: new Date().toLocaleTimeString()
    });
  };

  readAndSend();
  watcherInterval = setInterval(readAndSend, 800);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 1440,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    if (watcherInterval) clearInterval(watcherInterval);
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.once('did-finish-load', () => {
    startClipboardWatcher(mainWindow);
  });
}

ipcMain.handle('copy-text', (_event, text) => {
  clipboard.writeText(text || '');
  lastText = text || '';
  return true;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
