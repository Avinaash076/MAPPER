const previewUrls = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('northern-trails-photos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('photos');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Browser photo storage is unavailable.'));
  });
}

async function transaction<Result>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<Result>,
): Promise<Result> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const operation = database.transaction('photos', mode);
    const request = action(operation.objectStore('photos'));
    operation.oncomplete = () => {
      database.close();
      resolve(request.result);
    };
    operation.onerror = operation.onabort = () => {
      database.close();
      reject(new Error('Could not save or read a photo. Check available browser storage.'));
    };
  });
}

async function getBlob(uri: string): Promise<Blob> {
  const blob = await transaction<Blob | undefined>('readonly', (store) => store.get(uri));
  if (!blob) throw new Error('This draft photo could not be found. Please attach it again.');
  return blob;
}
export async function savePhoto(id: string, uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size > 5 * 1024 * 1024) throw new Error('Choose a smaller photo, under 5 MB.');
  const key = 'photo:' + id;
  await transaction('readwrite', (store) => store.put(blob, key));
  return key;
}
export async function getPhotoUri(uri: string) {
  const existing = previewUrls.get(uri);
  if (existing) return existing;
  const url = URL.createObjectURL(await getBlob(uri));
  previewUrls.set(uri, url);
  return url;
}
export async function readPhotoBytes(uri: string) {
  return (await getBlob(uri)).arrayBuffer();
}
export async function removePhoto(uri: string) {
  await transaction('readwrite', (store) => store.delete(uri));
  const url = previewUrls.get(uri);
  if (url) URL.revokeObjectURL(url);
  previewUrls.delete(uri);
}
