import { contextBridge, ipcRenderer } from 'electron';

export type SaveResult = {
  ok: boolean;
  canceled: boolean;
  filePath?: string;
};

const api = {
  /** Open the OS-native "Save As" dialog and write the given bytes. */
  saveMediaAs(payload: {
    data: ArrayBuffer;
    defaultName: string;
    filters: { name: string; extensions: string[] }[];
  }): Promise<SaveResult> {
    return ipcRenderer.invoke('media:saveAs', payload);
  },
  getCaptureSources(): Promise<{ id: string; name: string }[]> {
    return ipcRenderer.invoke('capture:getSources');
  },
  platform: process.platform,
  isElectron: true,
};

contextBridge.exposeInMainWorld('desktop', api);

export type DesktopApi = typeof api;
