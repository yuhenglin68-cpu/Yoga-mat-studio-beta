import { app, BrowserWindow, ipcMain, dialog, desktopCapturer, session } from 'electron';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1180,
    minHeight: 720,
    backgroundColor: '#0d0f13',
    titleBarStyle: 'hiddenInset',
    title: 'Yoga Mat Studio',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Enables desktopCapturer-based screen recording of our own window.
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

/**
 * Native "Save As" for exported media. Receives raw bytes from the renderer,
 * opens the OS-native save dialog, and writes the file with NO watermark.
 */
ipcMain.handle(
  'media:saveAs',
  async (
    _evt,
    payload: { data: ArrayBuffer; defaultName: string; filters: Electron.FileFilter[] }
  ) => {
    if (!mainWindow) return { ok: false, canceled: true };
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '另存为',
      defaultPath: payload.defaultName,
      filters: payload.filters,
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    await writeFile(filePath, Buffer.from(payload.data));
    return { ok: true, canceled: false, filePath };
  }
);

// Provide the desktop source id for the current window so the renderer can
// record the 3D viewport through getUserMedia (desktopCapturer path).
ipcMain.handle('capture:getSources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 0, height: 0 },
  });
  return sources.map((s) => ({ id: s.id, name: s.name }));
});

app.whenReady().then(() => {
  // Auto-grant display capture permission for our recorder flow.
  session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
    desktopCapturer
      .getSources({ types: ['window', 'screen'] })
      .then((sources) => callback({ video: sources[0], audio: 'loopback' }))
      .catch(() => callback({}));
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
