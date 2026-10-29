const photoName = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i;
export function isOwnedPhotoUri(uri: string, folder: string): boolean {
  return uri.startsWith(folder) && photoName.test(uri.slice(folder.length));
}
