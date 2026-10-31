import { useEffect, useMemo, useRef } from 'react';
import { Camera, GeoJSONSource, Layer, Map, type CameraRef } from '@maplibre/maplibre-react-native';
import { getMapStyle, placesToGeoJson, mapMarkerColors } from './model';
import type { PlaceMapProps } from './types';
export function PlaceMap({
  places,
  center,
  selectedId,
  scheme,
  appearance,
  onSelect,
  onStatusChange,
}: PlaceMapProps) {
  const camera = useRef<CameraRef>(null);
  const data = useMemo(() => placesToGeoJson(places), [places]);
  useEffect(() => {
    camera.current?.jumpTo({ center: [center.longitude, center.latitude], zoom: 10 });
  }, [center.longitude, center.latitude]);
  return (
    <Map
      style={{ flex: 1 }}
      mapStyle={getMapStyle(appearance ?? scheme)}
      onDidFinishLoadingMap={() => onStatusChange('ready')}
      onDidFailLoadingMap={() => onStatusChange('error')}
    >
      <Camera
        ref={camera}
        initialViewState={{ center: [center.longitude, center.latitude], zoom: 10 }}
      />
      <GeoJSONSource
        id="places"
        data={data}
        onPress={(event) => {
          const id = event.nativeEvent.features[0]?.properties?.id;
          if (typeof id === 'string') onSelect(id);
        }}
      >
        <Layer
          id="place-pins"
          type="circle"
          paint={{
            'circle-radius': ['case', ['==', ['get', 'id'], selectedId ?? ''], 12, 9],
            'circle-color': mapMarkerColors.fill,
            'circle-stroke-color': mapMarkerColors.outline,
            'circle-stroke-width': 3,
          }}
        />
      </GeoJSONSource>
    </Map>
  );
}
