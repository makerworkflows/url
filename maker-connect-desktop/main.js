const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const FormData = require('form-data');
// const axios = require('axios'); // Mocking for now

let mainWindow;
let watcher;
const WATCH_DIR = path.join(app.getPath('userData'), 'watch_folder');

// Ensure watch dir exists
if (!fs.existsSync(WATCH_DIR)) {
    fs.mkdirSync(WATCH_DIR, { recursive: true });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    
    startWatcher();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
});

ipcMain.on('manual-upload', async (event, filePath) => {
    console.log('Manual upload requested:', filePath);
    await uploadFile(filePath, 'Manual Drop');
});

// Watcher Logic
function startWatcher() {
    console.log('Starting watcher on:', WATCH_DIR);
    if(watcher) watcher.close();

    watcher = chokidar.watch(WATCH_DIR, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    watcher.on('add', (filePath) => {
        console.log('New file detected:', filePath);
        uploadFile(filePath, 'Auto Watch');
    });
}

// Upload Logic (Simulated)
async function uploadFile(filePath, source) {
    const filename = path.basename(filePath);
    try {
        mainWindow.webContents.send('upload-status', { filename, status: 'Uploading...', source });
        
        // Simulating network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        mainWindow.webContents.send('upload-status', { filename, status: 'Success', source });
        console.log(`Uploaded ${filename} from ${source}`);

    } catch (error) {
        mainWindow.webContents.send('upload-status', { filename, status: 'Failed', source });
        console.error('Upload failed:', error);
    }
}
