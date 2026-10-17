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

// Persist a binary File or Blob to IndexedDB scoped by userId
export async function saveFileToIndexedDB(id, file, userId = 'usr-guest') {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id,
        userId: userId || 'usr-guest',
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
        savedAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('IndexedDB put error:', req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('IndexedDB saveFile error:', err);
    return false;
  }
}

// Retrieve a persisted File or Blob by docId (with optional user scoping)
export async function getFileFromIndexedDB(id, userId = null) {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result;
        if (result && result.blob) {
          // If userId requested, ensure ownership match
          if (userId && result.userId && result.userId !== userId) {
            resolve(null);
            return;
          }
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB getFile error:', err);
    return null;
  }
}

// Delete a persisted File from IndexedDB
export async function deleteFileFromIndexedDB(id, userId = null) {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      if (userId) {
        const checkReq = store.get(id);
        checkReq.onsuccess = () => {
          if (checkReq.result && checkReq.result.userId && checkReq.result.userId !== userId) {
            // Mismatch, do not delete other user's file
            resolve(false);
            return;
          }
          const delReq = store.delete(id);
          delReq.onsuccess = () => resolve(true);
          delReq.onerror = () => resolve(false);
        };
        checkReq.onerror = () => resolve(false);
      } else {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      }
    });
  } catch (err) {
    console.warn('IndexedDB deleteFile error:', err);
    return false;
  }
}

// Retrieve all binary files belonging to a specific local user profile
export async function getAllFilesForUserFromIndexedDB(userId = null) {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const files = [];

      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const val = cursor.value;
          // Strictly isolate: If userId is provided, only include files with exact matching userId.
          // Never include unscoped legacy records (!val.userId) in a profile query.
          const matches = userId ? val.userId === userId : !val.userId;
          if (matches) {
            files.push({
              id: val.id,
              name: val.name,
              type: val.type,
              size: val.size,
              blob: val.blob,
              savedAt: val.savedAt,
              userId: val.userId
            });
          }
          cursor.continue();
        } else {
          resolve({ success: true, files });
        }
      };
      req.onerror = (e) => {
        resolve({ success: false, error: e.target?.error?.message || 'Cursor read error', files: [] });
      };
      tx.onerror = (e) => {
        resolve({ success: false, error: e.target?.error?.message || 'Transaction read error', files: [] });
      };
    });
  } catch (err) {
    console.warn('IndexedDB getAllFilesForUser error:', err);
    return { success: false, error: err.message || 'Database connection error', files: [] };
  }
}

// Retrieve quarantined legacy files that lack a user ID
export async function getQuarantinedLegacyFilesFromIndexedDB() {
  return getAllFilesForUserFromIndexedDB(null);
}

// Clear all files for a specific local user profile
export async function clearUserFilesFromIndexedDB(userId) {
  if (!userId) return false;
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();

      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.userId === userId) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('IndexedDB clearUserFiles error:', err);
    return false;
  }
}

// Clear all persisted files from IndexedDB (Factory Reset)
export async function clearAllFilesFromIndexedDB() {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('IndexedDB clear error:', req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('IndexedDB clearAllFiles error:', err);
    return false;
  }
}

// Get realistic local browser origin storage estimate
export async function getBrowserStorageUsage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || 0;
      const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
      const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
      return { usedMB, quotaMB, usedBytes, quotaBytes, isRealEstimate: true };
    } catch {
      return { usedMB: '0.00', quotaMB: 'N/A', usedBytes: 0, quotaBytes: 0, isRealEstimate: false };
    }
  }
  return { usedMB: '0.00', quotaMB: 'N/A', usedBytes: 0, quotaBytes: 0, isRealEstimate: false };
}
