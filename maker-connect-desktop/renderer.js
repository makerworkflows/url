const dropZone = document.getElementById('drop-zone');
const browseBtn = document.getElementById('browse-btn');
const activityList = document.getElementById('activity-list');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop zone
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('highlight');
}

function unhighlight(e) {
  dropZone.classList.remove('highlight');
}

// Handle Drop
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  handleFiles(files);
}

// Handle Browse
browseBtn.addEventListener('click', async () => {
    // In a real app we'd use dialog.showOpenDialog but for now let's just use the drop zone
    // or simulate a file selection via input element if we wanted fully web-standard
    // But since we have Electron, we can use the main process dialog
    // actually, let's just trigger the main process folder selection for now as a placeholder
    // or better, create a hidden input
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        handleFiles(e.target.files);
    }
    input.click();
});


function handleFiles(files) {
  ([...files]).forEach(file => {
      // Send to main process
      // Check if it's a file object from web or electron path
      // Electron exposes 'path' on File object in renderer if nodeIntegration is false BUT contextIsolation is true?
      // Wait, with contextIsolation: true, we might not get the full path directly on all platforms easily 
      // without webUtils.getpath (Electron 30+).
      // Let's assume standard File object has the path property in Electron 
      // (it usually does for local files in Electron renderer).
      if (file.path) {
          console.log('File path:', file.path);
          window.electronAPI.manualUpload(file.path);
          addActivityItem(file.name, 'Queued');
      } else {
          console.error('File path missing');
      }
  });
}

// Status Updates from Main
window.electronAPI.onUploadStatus((data) => {
    // console.log('Status update:', data);
    updateActivityItem(data.filename, data.status);
});

function addActivityItem(filename, status) {
    const li = document.createElement('li');
    li.id = `item-${filename.replace(/\s+/g, '-')}`;
    li.innerHTML = `
        <span class="filename">${filename}</span>
        <span class="status-badge status-uploading">${status}</span>
    `;
    activityList.insertBefore(li, activityList.firstChild);
}

function updateActivityItem(filename, status) {
    const id = `item-${filename.replace(/\s+/g, '-')}`;
    let li = document.getElementById(id);
    
    // If not found (maybe auto-upload), create it
    if (!li) {
        addActivityItem(filename, status);
        li = document.getElementById(id);
    }

    const badge = li.querySelector('.status-badge');
    badge.textContent = status;
    badge.className = 'status-badge'; // reset
    
    if (status === 'Success') badge.classList.add('status-success');
    else if (status === 'Failed') badge.classList.add('status-failed');
    else badge.classList.add('status-uploading');
}
