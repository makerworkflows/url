require('dotenv').config();
const chokidar = require('chokidar');
// const axios = require('axios'); // Not using axios yet in mock
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const WATCH_DIR = process.env.WATCH_DIR || './watch_folder';
const API_URL = process.env.API_URL || 'https://api.makerworkflows.com/upload';
const API_KEY = process.env.API_KEY || 'test-key';

console.log(`Starting Maker Connect Agent...`);
console.log(`Watching directory: ${path.resolve(WATCH_DIR)}`);
console.log(`Upload Target: ${API_URL}`);

// Ensure watch directory exists
if (!fs.existsSync(WATCH_DIR)){
    fs.mkdirSync(WATCH_DIR, { recursive: true });
}

const watcher = chokidar.watch(WATCH_DIR, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
  }
});

async function uploadFile(filepath) {
    const filename = path.basename(filepath);
    console.log(`File detected: ${filename}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(filepath));
    form.append('agent_key', API_KEY);

    try {
        // Mocking the request for now since no real endpoint exists
        // const response = await axios.post(API_URL, form, { headers: form.getHeaders() });
        console.log(`[SIMULATED] Uploading ${filename} to ${API_URL}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        console.log(`[SUCCESS] Uploaded ${filename}`);
        
        // Optional: Move file to 'processed' folder
        const processedDir = path.join(WATCH_DIR, '.processed');
        if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);
        
        const destination = path.join(processedDir, `${Date.now()}_${filename}`);
        fs.rename(filepath, destination, (err) => {
            if (err) console.error(`Error moving file: ${err}`);
            else console.log(`Moved ${filename} to .processed`);
        });

    } catch (error) {
        console.error(`[ERROR] Failed to upload ${filename}:`, error.message);
    }
}

watcher
  .on('add', path => uploadFile(path))
  .on('error', error => console.error(`Watcher error: ${error}`));

console.log('Agent is active. Press Ctrl+C to stop.');
