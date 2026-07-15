const CLOUD_NAME = 'your_cloud_name_here';
const UPLOAD_PRESET = 'your_unsigned_preset_here';

const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const clearButton = document.getElementById('clearButton');
const status = document.getElementById('status');

let selectedFiles = [];

function setStatus(message, type = 'info', details = '') {
  status.className = `status ${type}`.trim();
  status.innerHTML = `<h2>${type === 'success' ? 'Success' : type === 'error' ? 'Upload issue' : 'Ready to share'}</h2><p>${message}</p>`;
  if (details) {
    status.innerHTML += `<div class="meta">${details}</div>`;
  }
}

function updateSelectionSummary() {
  if (!selectedFiles.length) {
    setStatus('Select files to begin uploading.', 'info');
    return;
  }

  const count = selectedFiles.length;
  const label = count === 1 ? 'file' : 'files';
  setStatus(`Selected ${count} ${label} for upload.`, 'info', 'Large images will be resized before upload to save bandwidth.');
}

fileInput.addEventListener('change', (event) => {
  selectedFiles = Array.from(event.target.files || []);
  updateSelectionSummary();
});

clearButton.addEventListener('click', () => {
  selectedFiles = [];
  fileInput.value = '';
  setStatus('Selection cleared. Choose another set of memories.', 'info');
});

uploadButton.addEventListener('click', async () => {
  if (!selectedFiles.length) {
    setStatus('Please choose at least one photo or video to upload.', 'error');
    return;
  }

  if (CLOUD_NAME.includes('your_cloud_name_here') || UPLOAD_PRESET.includes('your_unsigned_preset_here')) {
    setStatus('Cloudinary is not configured yet. Update the placeholders in the script before uploading.', 'error');
    return;
  }

  uploadButton.disabled = true;
  clearButton.disabled = true;
  setStatus('Uploading your memories...', 'info');

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-wrap';
  progressBar.innerHTML = '<progress id="uploadProgress" value="0" max="100"></progress>';
  status.appendChild(progressBar);
  const uploadProgress = document.getElementById('uploadProgress');

  const results = [];
  let completeCount = 0;

  for (let index = 0; index < selectedFiles.length; index += 1) {
    const file = selectedFiles[index];
    try {
      const uploadFile = file.type.startsWith('image/') ? await resizeImage(file) : file;
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.text();
        throw new Error(errorPayload || `Upload failed with status ${response.status}`);
      }

      const payload = await response.json();
      results.push({ name: file.name, url: payload.secure_url || payload.url });
    } catch (error) {
      results.push({ name: file.name, error: error.message || 'Unknown upload error' });
    }

    completeCount += 1;
    const percent = Math.round((completeCount / selectedFiles.length) * 100);
    if (uploadProgress) {
      uploadProgress.value = percent;
    }
  }

  const failureCount = results.filter((item) => item.error).length;
  if (failureCount === 0) {
    setStatus(`All ${results.length} memories uploaded successfully.`, 'success', 'Your uploads are now available in Cloudinary.');
  } else {
    const errorList = results
      .filter((item) => item.error)
      .map((item) => `<li>${item.name}: ${item.error}</li>`)
      .join('');
    setStatus(`Uploaded ${results.length - failureCount} of ${results.length} files.`, 'error', `<ul class="list">${errorList}</ul>`);
  }

  uploadButton.disabled = false;
  clearButton.disabled = false;
});

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const maxDimension = 1920;
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not resize image.'));
              return;
            }
            resolve(new File([blob], file.name, { type: blob.type || file.type }));
          },
          file.type || 'image/jpeg',
          0.9,
        );
      };
      img.onerror = () => reject(new Error('Image could not be read.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Image file could not be read.'));
    reader.readAsDataURL(file);
  });
}
