import { useEffect, useRef, useState } from 'react';
import type { Map as LibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapStyles, type MapAppearance } from '../designs';
import { places, regions, type Region } from '../data';
import { Button } from './Controls';

interface MapPreviewProps {
  appearance: MapAppearance;
  region?: Region;
  interactive?: boolean;
  selectedId?: string;
  onSelectPlace?: (id: string) => void;
  visiblePlaceIds?: readonly string[];
}
export function MapPreview({
  appearance,
  region = 'Dharwad',
  interactive = true,
  selectedId,
  onSelectPlace,
  visiblePlaceIds,
}: MapPreviewProps) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LibreMap | null>(null);
  const appearanceRef = useRef(appearance);
  const regionRef = useRef(region);
  const markersRef = useRef<Marker[]>([]);
  const selectionRef = useRef({ selectedId, onSelectPlace });
  const visibilityRef = useRef(visiblePlaceIds);
  const [status, setStatus] = useState<'waiting' | 'loading' | 'ready' | 'error'>('waiting');
  const [attempt, setAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const locationLabel = places.find((place) => place.id === selectedId)?.name ?? region;
  appearanceRef.current = appearance;
  regionRef.current = region;
  selectionRef.current = { selectedId, onSelectPlace };
  visibilityRef.current = visiblePlaceIds;

  useEffect(() => {
    const container = element.current;
    if (!container) return;
    let disposed = false;
    let started = false;
    let markers: Marker[] = [];
    let timer: ReturnType<typeof setTimeout>;
    const resize = new ResizeObserver(() => map.current?.resize());
    resize.observe(container);
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        setStatus('loading');
        try {
          const {
            Map,
            Marker: MapMarker,
            NavigationControl,
            setWorkerUrl,
          } = await import('maplibre-gl');
          setWorkerUrl('/map-worker.js');
          if (disposed) return;
          const selectedPlace = places.find(
            (place) => place.id === selectionRef.current.selectedId,
          );
          const viewport = selectedPlace
            ? { center: selectedPlace.coordinates, zoom: 12 }
            : regions[regionRef.current];
          const instance = new Map({
            container,
            style: mapStyles[appearanceRef.current],
            center: viewport.center,
            zoom: viewport.zoom,
            interactive,
            attributionControl: { compact: true },
            renderWorldCopies: false,
            fadeDuration: 0,
          });
          map.current = instance;
          instance.addControl(new NavigationControl({ showCompass: false }), 'top-right');
          instance.on('load', () => {
            if (!disposed) {
              clearTimeout(timer);
              setStatus('ready');
            }
          });
          instance.on('idle', () => {
            if (!disposed && instance.areTilesLoaded()) setStatus('ready');
          });
          timer = setTimeout(() => {
            if (!disposed && !instance.loaded()) {
              setStatus('error');
              setErrorMessage(
                'Map loading is taking longer than expected. You can retry or continue with the place list.',
              );
            }
          }, 30000);
          instance.on('error', (event) => {
            if (!disposed) {
              setErrorMessage(event.error?.message || 'Map resource failed to load.');
              if (!instance.isStyleLoaded()) setStatus('error');
            }
          });
          markers = places.map((place, index) => {
            const marker = document.createElement('button');
            const selected = place.id === (selectionRef.current.selectedId ?? places[0].id);
            marker.className = `destination-marker ${selected ? 'selected-marker' : ''}`;
            marker.style.display =
              visibilityRef.current && !visibilityRef.current.includes(place.id) ? 'none' : '';
            marker.type = 'button';
            marker.textContent = String(index + 1);
            marker.setAttribute('aria-label', `${place.name}, illustrative destination marker`);
            marker.setAttribute('aria-pressed', String(selected));
            marker.onclick = () => {
              for (const other of markers) {
                other.getElement().classList.remove('selected-marker');
                other.getElement().setAttribute('aria-pressed', 'false');
              }
              marker.classList.add('selected-marker');
              marker.setAttribute('aria-pressed', 'true');
              selectionRef.current.onSelectPlace?.(place.id);
            };
            return new MapMarker({ element: marker }).setLngLat(place.coordinates).addTo(instance);
          });
          markersRef.current = markers;
        } catch (error) {
          if (!disposed) {
            setErrorMessage(error instanceof Error ? error.message : String(error));
            setStatus('error');
          }
        }
      },
      { rootMargin: '100px' },
    );
    observer.observe(container);
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      resize.disconnect();
      markers.forEach((marker) => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [attempt, interactive]);

  useEffect(() => {
    if (map.current) {
      setStatus('loading');
      map.current.setStyle(mapStyles[appearance]);
    }
  }, [appearance]);
  useEffect(() => {
    map.current?.jumpTo(regions[region]);
  }, [region]);
  useEffect(() => {
    const place = places.find((item) => item.id === selectedId);
    if (!place) return;
    map.current?.jumpTo({ center: place.coordinates, zoom: 12 });
    markersRef.current.forEach((marker, index) => {
      const selected = places[index].id === selectedId;
      marker.getElement().classList.toggle('selected-marker', selected);
      marker.getElement().setAttribute('aria-pressed', String(selected));
    });
  }, [selectedId]);
  const visibleIdsKey = visiblePlaceIds?.join('|');
  useEffect(() => {
    const visible = visibilityRef.current;
    markersRef.current.forEach((marker, index) => {
      marker.getElement().style.display =
        visible && !visible.includes(places[index].id) ? 'none' : '';
    });
  }, [visibleIdsKey]);
  return (
    <div className="map-preview" data-map-status={status}>
      <div
        ref={element}
        className="map-canvas"
        aria-label={`${appearance === 'liberty' ? 'Liberty' : 'Dark'} OpenFreeMap preview around ${locationLabel}`}
      />
      {status !== 'ready' && (
        <div className="map-status" role="status">
          <strong>
            {status === 'error' ? 'The map is unavailable' : 'Loading the actual map…'}
          </strong>
          <span>
            {status === 'error'
              ? 'Keep browsing the destination list. Internet and WebGL are needed for this preview.'
              : 'OpenFreeMap · geographic preview'}
          </span>
          {status === 'error' && (
            <>
              <small>{errorMessage}</small>
              <Button variant="secondary" onClick={() => setAttempt(attempt + 1)}>
                Retry map
              </Button>
            </>
          )}
        </div>
      )}
      <span className="map-label">
        {appearance === 'liberty' ? 'Liberty' : 'Dark'} · {locationLabel}
      </span>
    </div>
  );
}
