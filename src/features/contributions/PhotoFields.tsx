import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { Button, Field, Label, layout, Panel } from '../../components/ui';
import { radii } from '../../theme/tokens';
import { getPhotoUri } from './photoStorage';
import type { DraftPhoto } from './types';
import { CheckRow } from '../../components/ui/CheckRow';

function DraftPhotoCard({
  photo,
  onCaption,
  onRemove,
}: {
  photo: DraftPhoto;
  onCaption: (caption: string) => void;
  onRemove: () => void;
}) {
  const [uri, setUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void getPhotoUri(photo.localUri)
      .then((value) => {
        if (active) setUri(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [photo.localUri]);
  return (
    <View style={layout.section}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={{ height: 180, borderRadius: radii.medium }}
          contentFit="cover"
          accessibilityLabel={photo.caption || 'Your place photo'}
          onError={() => setFailed(true)}
        />
      ) : (
        <Label size="small">
          {failed ? 'Photo unavailable. Remove and attach it again.' : 'Opening photo…'}
        </Label>
      )}
      <Label size="small">Photo caption · optional</Label>
      <Field
        accessibilityLabel="Photo caption"
        placeholder="What does this photo show? · optional"
        value={photo.caption}
        onChangeText={onCaption}
        maxLength={240}
      />
      <Button label="Remove this photo" secondary onPress={onRemove} />
    </View>
  );
}
export function PhotoFields({
  photos,
  addPhotos,
  onChange,
  rightsConfirmed,
  onRightsChange,
}: {
  photos: DraftPhoto[];
  addPhotos: (camera: boolean) => void;
  onChange: (photos: DraftPhoto[]) => void;
  rightsConfirmed: boolean;
  onRightsChange: (confirmed: boolean) => void;
}) {
  return (
    <Panel style={layout.section}>
      <Label size="heading">2 · Add your photos ({photos.length}/5)</Label>
      <Label size="small" tone="textMuted">
        Up to five photos. A wide view and the approach help others understand a hidden place.
      </Label>
      <Button
        label="Choose photos"
        secondary
        disabled={photos.length >= 5}
        onPress={() => addPhotos(false)}
      />
      <Button
        label="Take a photo"
        secondary
        disabled={photos.length >= 5}
        onPress={() => addPhotos(true)}
      />
      {photos.map((photo) => (
        <DraftPhotoCard
          key={photo.id}
          photo={photo}
          onCaption={(caption) =>
            onChange(photos.map((item) => (item.id === photo.id ? { ...item, caption } : item)))
          }
          onRemove={() => onChange(photos.filter((item) => item.id !== photo.id))}
        />
      ))}
      {photos.length > 0 && (
        <CheckRow
          label="I took these photos or have permission to share them"
          checked={rightsConfirmed}
          onChange={onRightsChange}
        />
      )}
    </Panel>
  );
}
