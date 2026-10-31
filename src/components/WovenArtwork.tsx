import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

export function WovenArtwork({ style }: { style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={require('../../assets/artwork/woven-field-guide.png')}
      style={style}
      contentFit="cover"
      contentPosition="center"
      accessible={false}
    />
  );
}
