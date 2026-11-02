import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { randomUUID } from 'expo-crypto';
import { savePhoto } from './photoStorage';
import type { CapturedLocation, DraftPhoto } from './types';
import { requestLocation } from '../../services/locationRequest';

export async function captureCurrentLocation(): Promise<CapturedLocation> {
  const position = await requestLocation({
    requestPermission: () => Location.requestForegroundPermissionsAsync(),
    servicesEnabled: () => Location.hasServicesEnabledAsync(),
    getPosition: () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    capturedAt: new Date(position.timestamp).toISOString(),
    source: 'gps',
  };
}

export async function pickDraftPhotos(camera: boolean, remaining: number): Promise<DraftPhoto[]> {
  if (remaining < 1)
    throw new Error('A place can have up to five photos. Remove one before adding another.');
  if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted)
    throw new Error('Camera permission was not granted. Choose an existing photo instead.');
  const result = camera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, exif: false })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
        exif: false,
      });
  if (result.canceled) return [];
  const photos: DraftPhoto[] = [];
  for (const asset of result.assets.slice(0, remaining)) {
    const scale = Math.min(1, 1600 / Math.max(asset.width, asset.height));
    const image = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: Math.max(1, Math.round(asset.width * scale)) } }],
      { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG },
    );
    const id = randomUUID();
    const localUri = await savePhoto(id, image.uri);
    photos.push({ id, localUri, width: image.width, height: image.height, caption: '' });
  }
  return photos;
}
