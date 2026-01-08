const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipboardAPI', {
  onChange: callback => {
    ipcRenderer.on('clipboard-changed', (_event, payload) => {
      callback(payload);
    });
  },
  writeText: text => ipcRenderer.invoke('copy-text', text)
});
