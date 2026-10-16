// Prarush Local-First Storage: Persistent IndexedDB File Store
// Stores authentic uploaded binary Files and Blobs across browser reloads without localStorage limits.

const DB_NAME = 'prarush_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Persist a binary File or Blob to IndexedDB
export async function saveFileToIndexedDB(id, file) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        savedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveFile error:', err);
    return false;
  }
}

// Retrieve a persisted File or Blob by docId
export async function getFileFromIndexedDB(id) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getFile error:', err);
    return null;
  }
}

// Delete a persisted File from IndexedDB
export async function deleteFileFromIndexedDB(id) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteFile error:', err);
    return false;
  }
}

// Get realistic local browser origin storage estimate
export async function getBrowserStorageUsage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
      const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
      return { usedMB, quotaMB, isRealEstimate: true };
    } catch {
      return { usedMB: '0.00', quotaMB: 'N/A', isRealEstimate: false };
    }
  }
  return { usedMB: '0.00', quotaMB: 'N/A', isRealEstimate: false };
}
