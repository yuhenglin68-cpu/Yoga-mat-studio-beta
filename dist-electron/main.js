"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = require("node:path");
const promises_1 = require("node:fs/promises");
const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1600,
        height: 1000,
        minWidth: 1180,
        minHeight: 720,
        backgroundColor: '#0d0f13',
        titleBarStyle: 'hiddenInset',
        title: 'Yoga Mat Studio',
        webPreferences: {
            preload: (0, node_path_1.join)(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            // Enables desktopCapturer-based screen recording of our own window.
        },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        mainWindow.loadFile((0, node_path_1.join)(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => (mainWindow = null));
}
/**
 * Native "Save As" for exported media. Receives raw bytes from the renderer,
 * opens the OS-native save dialog, and writes the file with NO watermark.
 */
electron_1.ipcMain.handle('media:saveAs', async (_evt, payload) => {
    if (!mainWindow)
        return { ok: false, canceled: true };
    const { canceled, filePath } = await electron_1.dialog.showSaveDialog(mainWindow, {
        title: '另存为',
        defaultPath: payload.defaultName,
        filters: payload.filters,
    });
    if (canceled || !filePath)
        return { ok: false, canceled: true };
    await (0, promises_1.writeFile)(filePath, Buffer.from(payload.data));
    return { ok: true, canceled: false, filePath };
});
// Provide the desktop source id for the current window so the renderer can
// record the 3D viewport through getUserMedia (desktopCapturer path).
electron_1.ipcMain.handle('capture:getSources', async () => {
    const sources = await electron_1.desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 0, height: 0 },
    });
    return sources.map((s) => ({ id: s.id, name: s.name }));
});
electron_1.app.whenReady().then(() => {
    // Auto-grant display capture permission for our recorder flow.
    electron_1.session.defaultSession.setDisplayMediaRequestHandler((_request, callback) => {
        electron_1.desktopCapturer
            .getSources({ types: ['window', 'screen'] })
            .then((sources) => callback({ video: sources[0], audio: 'loopback' }))
            .catch(() => callback({}));
    });
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
