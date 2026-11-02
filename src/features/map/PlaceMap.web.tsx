import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Notice } from '../../components/ui';
import { mapFailureMessage } from './errors';
import { space } from '../../theme/tokens';
import type { GeoJSONSource, Map as WebMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { getMapStyle, placesToGeoJson, mapMarkerColors, pointBounds } from './model';
import type { PlaceMapProps } from './types';
export function PlaceMap(props: PlaceMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<WebMap | null>(null);
  const latest = useRef(props);
  const [failure, setFailure] = useState<string | null>(null);
  const styleUrl = getMapStyle(props.appearance ?? props.scheme);
  useEffect(() => {
    latest.current = props;
  });
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setFailure(
          'The map is taking longer than expected. Check your connection, retry or use the place list.',
        );
        latest.current.onStatusChange('error');
      }
    }, 30000);
    function fail(problem: unknown) {
      if (cancelled) return;
      clearTimeout(timeout);
      setFailure(mapFailureMessage(problem));
      latest.current.onStatusChange('error');
    }
    void import('maplibre-gl')
      .then((library) => {
        if (cancelled || !container.current) return;
        library.setWorkerUrl('/maplibre-worker.mjs');
        const current = latest.current;
        const instance = new library.Map({
          container: container.current,
          style: getMapStyle(current.appearance ?? current.scheme),
          center: [current.center.longitude, current.center.latitude],
          zoom: current.zoom ?? 10,
          interactive: !current.preview,
          attributionControl: { compact: true },
        });
        map.current = instance;
        const bounds = pointBounds(
          current.extraPoints ? [...current.extraPoints, ...current.places] : [],
        );
        if (bounds)
          instance.fitBounds(
            [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]],
            ],
            { padding: 48, duration: 0, maxZoom: 14 },
          );
        if (!current.preview)
          instance.addControl(new library.NavigationControl({ showCompass: false }), 'top-right');
        instance.on('style.load', () => {
          if (cancelled) return;
          const state = latest.current;
          instance.addSource('places', {
            type: 'geojson',
            data: placesToGeoJson(state.places, state.locationPin, state.extraPoints),
          });
          instance.addLayer({
            id: 'place-pins',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-radius': ['case', ['==', ['get', 'id'], state.selectedId ?? ''], 12, 9],
              'circle-color': [
                'match',
                ['get', 'id'],
                'journey:start',
                mapMarkerColors.start,
                'journey:destination',
                mapMarkerColors.destination,
                mapMarkerColors.fill,
              ],
              'circle-stroke-color': mapMarkerColors.outline,
              'circle-stroke-width': 3,
            },
          });
        });
        // A downloaded style is not yet a rendered map: wait for the first load.
        instance.on('load', () => {
          if (cancelled) return;
          clearTimeout(timeout);
          setFailure(null);
          latest.current.onStatusChange('ready');
        });
        instance.on('error', (event) => fail(event.error));
        instance.on('click', 'place-pins', (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === 'string') latest.current.onSelect(id);
        });
        instance.on('mouseenter', 'place-pins', () => {
          instance.getCanvas().style.cursor = 'pointer';
        });
        instance.on('mouseleave', 'place-pins', () => {
          instance.getCanvas().style.cursor = '';
        });
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => instance.resize());
          observer.observe(container.current);
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    map.current?.jumpTo({
      center: [props.center.longitude, props.center.latitude],
      zoom: props.zoom ?? 10,
    });
  }, [props.center.longitude, props.center.latitude, props.zoom]);
  useEffect(() => {
    const bounds = pointBounds(props.extraPoints ? [...props.extraPoints, ...props.places] : []);
    if (bounds)
      map.current?.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 48, duration: 0, maxZoom: 14 },
      );
  }, [props.extraPoints, props.places]);
  useEffect(() => {
    if (map.current) map.current.setStyle(styleUrl);
  }, [styleUrl]);
  useEffect(() => {
    const instance = map.current;
    if (!instance?.getSource('places')) return;
    (instance.getSource('places') as GeoJSONSource).setData(
      placesToGeoJson(props.places, props.locationPin, props.extraPoints),
    );
  }, [props.places, props.locationPin, props.extraPoints]);
  useEffect(() => {
    const instance = map.current;
    if (!instance?.getLayer('place-pins')) return;
    instance.setPaintProperty('place-pins', 'circle-radius', [
      'case',
      ['==', ['get', 'id'], props.selectedId ?? ''],
      12,
      9,
    ]);
  }, [props.selectedId]);
  return (
    <div
      role="region"
      aria-label="Interactive map of nearby places. The same places are available in list view."
      aria-description={
        props.locationPin
          ? 'Private captured location preview. Panning does not move the pin.'
          : undefined
      }
      style={{ width: '100%', height: '100%', position: 'relative', minHeight: 1 }}
    >
      <div ref={container} style={{ width: '100%', height: '100%' }} />
      {failure ? (
        <View style={{ position: 'absolute', left: space.sm, right: space.sm, bottom: space.xxxl }}>
          <Notice warning>{failure}</Notice>
        </View>
      ) : null}
    </div>
  );
}
