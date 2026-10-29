export async function savePhoto(_id: string, _uri: string): Promise<string> {
  throw new Error('Photo storage is not supported on this platform.');
}
export async function getPhotoUri(uri: string): Promise<string> {
  return uri;
}
export async function readPhotoBytes(_uri: string): Promise<ArrayBuffer> {
  throw new Error('Photo storage is not supported on this platform.');
}
export async function removePhoto(_uri: string): Promise<void> {}
