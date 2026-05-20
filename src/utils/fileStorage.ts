// IndexedDB utility for storing large files without exceeding localStorage quota
const DB_NAME = "fsm-admin-files";
const STORE_NAME = "documents";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initFileStorage(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function saveFile(
  fileId: string,
  fileName: string,
  fileData: ArrayBuffer,
  mimeType: string
): Promise<void> {
  const database = await initFileStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const fileRecord = {
      id: fileId,
      name: fileName,
      data: fileData,
      mimeType,
      uploadedAt: new Date().toISOString(),
      size: fileData.byteLength,
    };

    const request = store.put(fileRecord);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getFile(fileId: string): Promise<{
  name: string;
  data: ArrayBuffer;
  mimeType: string;
} | null> {
  const database = await initFileStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(fileId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        resolve({
          name: result.name,
          data: result.data,
          mimeType: result.mimeType,
        });
      } else {
        resolve(null);
      }
    };
  });
}

export async function deleteFile(fileId: string): Promise<void> {
  const database = await initFileStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(fileId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getFileAsDataUrl(fileId: string): Promise<string | null> {
  const file = await getFile(fileId);
  if (!file) return null;

  const blob = new Blob([file.data], { type: file.mimeType });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

export async function downloadFile(fileId: string): Promise<void> {
  const file = await getFile(fileId);
  if (!file) {
    throw new Error(`File not found: ${fileId}`);
  }

  const blob = new Blob([file.data], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function generateFileId(customerId: string, fileName: string): string {
  return `${customerId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
