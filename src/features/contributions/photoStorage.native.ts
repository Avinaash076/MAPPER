import * as FileSystem from 'expo-file-system/legacy';
import { isOwnedPhotoUri } from './photoPolicy';

function requireOwnedPhoto(uri: string) {
  const folder = FileSystem.documentDirectory + 'place-drafts/';
  if (!FileSystem.documentDirectory || !isOwnedPhotoUri(uri, folder))
    throw new Error('This photo is not in the app draft folder. Please attach it again.');
}

export async function savePhoto(id: string, uri: string) {
  if (!FileSystem.documentDirectory) throw new Error('App photo storage is unavailable.');
  const folder = FileSystem.documentDirectory + 'place-drafts/';
  await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  const destination = folder + id + '.jpg';
  requireOwnedPhoto(destination);
  await FileSystem.copyAsync({ from: uri, to: destination });
  const info = await FileSystem.getInfoAsync(destination);
  if (info.exists && info.size > 5 * 1024 * 1024) {
    await FileSystem.deleteAsync(destination, { idempotent: true });
    throw new Error('Choose a smaller photo, under 5 MB.');
  }
  return destination;
}
export async function getPhotoUri(uri: string) {
  requireOwnedPhoto(uri);
  return uri;
}
export async function readPhotoBytes(uri: string): Promise<ArrayBuffer> {
  requireOwnedPhoto(uri);
  const encoded = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}
export async function removePhoto(uri: string) {
  requireOwnedPhoto(uri);
  await FileSystem.deleteAsync(uri, { idempotent: true });
}
