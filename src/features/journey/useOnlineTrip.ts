import { useEffect, useRef, useState } from 'react';
import { requestTravel } from '../../services/travel/client';
import { useServiceSession } from '../../services/travel/useServiceSession';
import type { RouteResult, WeatherResult } from '../../services/travel/types';
import type { Place } from '../places/types';
import { estimateJourney, type JourneyState } from './model';

interface Result<T> {
  data: T | null;
  error: string;
  busy: boolean;
}
const empty = <T>(): Result<T> => ({ data: null, error: '', busy: false });
export function tripRequestKey(journey: JourneyState, places: Place[]) {
  const estimate = estimateJourney(journey, places);
  return JSON.stringify({
    transport: journey.transport,
    date: journey.travelDate,
    points: [
      journey.start?.coordinates,
      ...(estimate?.stops.map((stop) => stop.point.coordinates) ?? []),
    ],
  });
}
export function useOnlineTrip(journey: JourneyState, places: Place[]) {
  const account = useServiceSession();
  const key = `${account}:${tripRequestKey(journey, places)}`;
  const [route, setRoute] = useState<Result<RouteResult>>(empty);
  const [weather, setWeather] = useState<Result<WeatherResult>>(empty);
  const [resultKey, setResultKey] = useState(key);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => pending.current?.abort();
  }, [key]);
  async function refresh() {
    if (pending.current && !pending.current.signal.aborted) return;
    if (!journey.destination || !journey.start) return;
    const controller = new AbortController();
    pending.current = controller;
    setResultKey(key);
    setRoute({ ...empty(), busy: Boolean(journey.transport) });
    setWeather({ ...empty(), busy: true });
    const estimate = estimateJourney(journey, places)!;
    const jobs: Promise<void>[] = [];
    if (journey.transport)
      jobs.push(
        requestTravel(
          'route',
          {
            points: [
              journey.start.coordinates,
              ...estimate.stops.map((stop) => stop.point.coordinates),
            ],
            transport: journey.transport,
          },
          controller.signal,
        )
          .then((data) => {
            if (!controller.signal.aborted) setRoute({ data, busy: false, error: '' });
          })
          .catch((error: unknown) => {
            if (!controller.signal.aborted)
              setRoute({
                data: null,
                busy: false,
                error: error instanceof Error ? error.message : 'Route unavailable. Retry.',
              });
          }),
      );
    jobs.push(
      requestTravel(
        'weather',
        { coordinates: journey.destination.coordinates, date: journey.travelDate },
        controller.signal,
      )
        .then((data) => {
          if (!controller.signal.aborted) setWeather({ data, busy: false, error: '' });
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted)
            setWeather({
              data: null,
              busy: false,
              error: error instanceof Error ? error.message : 'Forecast unavailable. Retry.',
            });
        }),
    );
    await Promise.all(jobs);
    if (pending.current === controller) pending.current = null;
  }
  return {
    account,
    route: resultKey === key ? route : empty<RouteResult>(),
    weather: resultKey === key ? weather : empty<WeatherResult>(),
    refresh,
  };
}
export type OnlineTrip = ReturnType<typeof useOnlineTrip>;
