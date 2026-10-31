import { useEffect, useRef } from 'react';
import type { GeoJSONSource, Map as WebMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { getMapStyle, placesToGeoJson, mapMarkerColors } from './model';
import type { PlaceMapProps } from './types';
export function PlaceMap(props: PlaceMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<WebMap | null>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    void import('maplibre-gl')
      .then((library) => {
        if (cancelled || !container.current) return;
        library.setWorkerUrl('/maplibre-worker.mjs');
        const current = latest.current;
        const instance = new library.Map({
          container: container.current,
          style: getMapStyle(current.appearance ?? current.scheme),
          center: [current.center.longitude, current.center.latitude],
          zoom: 10,
          attributionControl: { compact: true },
        });
        map.current = instance;
        instance.addControl(new library.NavigationControl({ showCompass: false }), 'top-right');
        instance.on('style.load', () => {
          if (cancelled) return;
          const state = latest.current;
          instance.addSource('places', { type: 'geojson', data: placesToGeoJson(state.places) });
          instance.addLayer({
            id: 'place-pins',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-radius': ['case', ['==', ['get', 'id'], state.selectedId ?? ''], 12, 9],
              'circle-color': mapMarkerColors.fill,
              'circle-stroke-color': mapMarkerColors.outline,
              'circle-stroke-width': 3,
            },
          });
          state.onStatusChange('ready');
        });
        instance.on('error', () => latest.current.onStatusChange('error'));
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
        observer = new ResizeObserver(() => instance.resize());
        observer.observe(container.current);
      })
      .catch(() => {
        if (!cancelled) latest.current.onStatusChange('error');
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    map.current?.jumpTo({ center: [props.center.longitude, props.center.latitude], zoom: 10 });
  }, [props.center.longitude, props.center.latitude]);
  useEffect(() => {
    if (map.current) map.current.setStyle(getMapStyle(props.appearance ?? props.scheme));
  }, [props.appearance, props.scheme]);
  useEffect(() => {
    const instance = map.current;
    if (!instance?.getSource('places')) return;
    (instance.getSource('places') as GeoJSONSource).setData(placesToGeoJson(props.places));
    instance.setPaintProperty('place-pins', 'circle-radius', [
      'case',
      ['==', ['get', 'id'], props.selectedId ?? ''],
      12,
      9,
    ]);
  }, [props.places, props.selectedId]);
  return (
    <div
      ref={container}
      role="region"
      aria-label="Interactive map of nearby places. The same places are available in list view."
      style={{ width: '100%', height: '100%' }}
    />
  );
}
