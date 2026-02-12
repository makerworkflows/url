const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Methods
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  manualUpload: (filePath) => ipcRenderer.send('manual-upload', filePath),
  
  // Listeners
  onUploadStatus: (callback) => ipcRenderer.on('upload-status', (_event, value) => callback(value))
});
