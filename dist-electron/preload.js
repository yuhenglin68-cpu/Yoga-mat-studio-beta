"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    /** Open the OS-native "Save As" dialog and write the given bytes. */
    saveMediaAs(payload) {
        return electron_1.ipcRenderer.invoke('media:saveAs', payload);
    },
    getCaptureSources() {
        return electron_1.ipcRenderer.invoke('capture:getSources');
    },
    platform: process.platform,
    isElectron: true,
};
electron_1.contextBridge.exposeInMainWorld('desktop', api);
