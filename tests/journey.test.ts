import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialJourney,
  searchDestinations,
  townPoints,
  rememberDestination,
  destinationSuggestions,
  estimateJourney,
  arrivalLabel,
  validClock,
  validTravelDate,
  placePoint,
  type JourneyState,
} from '../src/features/journey/model';
import { createJourneyWriter, decodeJourney } from '../src/features/journey/persistence';
import { placeRepository } from '../src/features/places/repository';
import { defaultFilters } from '../src/features/places/types';
import { filterPlaces } from '../src/features/places/discovery';
import { placesToGeoJson, pointBounds } from '../src/features/map/model';
import { requestLocation } from '../src/services/locationRequest';
const places = placeRepository.list();
const lake = places.find((place) => place.id === 'unkal-lake')!;
const temple = places.find((place) => place.id === 'chandramouleshwara')!;
const base: JourneyState = {
  ...initialJourney,
  start: townPoints()[0],
  destination: placePoint(lake),
  transport: 'car',
};

test('catalog autocomplete uses actual towns/places, supports multiple words and returns no invented destination', () => {
  assert.equal(searchDestinations('dharwad', places)[0].id, 'town:dharwad');
  assert.ok(searchDestinations('unkal lake', places).some((point) => point.placeId === lake.id));
  assert.deepEqual(searchDestinations('nowhere-unknown', places), []);
  assert.deepEqual(searchDestinations(' ', places), []);
});
test('recent selections deduplicate and retain the newest five', () => {
  let recent = places.slice(0, 7).map(placePoint);
  recent = rememberDestination(recent, placePoint(lake));
  assert.equal(recent.length, 5);
  assert.equal(recent[0].id, lake.id);
  assert.equal(recent.filter((point) => point.id === lake.id).length, 1);
});
test('destination radius is independent of the route corridor; missing route data never produces along-route suggestions', () => {
  assert.deepEqual(destinationSuggestions(places, { ...base, experience: 'along-route' }, []), []);
  const nearby = destinationSuggestions(places, { ...base, destinationRadiusKm: 10 }, []);
  assert.ok(nearby.length > 0);
  assert.ok(!nearby.some((place) => place.id === lake.id));
  assert.deepEqual(destinationSuggestions(places, { ...base, corridorRadiusKm: 10 }, []), nearby);
  assert.deepEqual(destinationSuggestions(places, { ...base, experience: 'direct' }, []), []);
  assert.deepEqual(destinationSuggestions(places, { ...base, experience: 'both' }, []), nearby);
});
test('changing stops recalculates open-trip travel, visit totals and illustrative arrivals without duplicating the destination', () => {
  const direct = estimateJourney(base, places)!;
  const withStop = estimateJourney({ ...base, stopIds: [temple.id, temple.id, lake.id] }, places)!;
  assert.equal(withStop.stops.length, 2);
  assert.equal(withStop.visitMinutes, lake.visitMinutes + temple.visitMinutes);
  assert.ok(
    withStop.stops[1].arrivalMinutes! >= withStop.stops[0].arrivalMinutes! + temple.visitMinutes,
  );
  assert.ok(withStop.totalMinutes! >= direct.totalMinutes!);
  assert.equal(direct.totalMinutes, direct.travelMinutes! + lake.visitMinutes);
});
test('without transport, travel and arrivals stay unknown while visit times remain available', () => {
  const estimate = estimateJourney({ ...base, transport: null }, places)!;
  assert.equal(estimate.travelMinutes, null);
  assert.equal(estimate.totalMinutes, null);
  assert.equal(estimate.stops[0].arrivalMinutes, null);
  assert.equal(estimate.visitMinutes, lake.visitMinutes);
  assert.equal(estimateJourney(initialJourney, places), null);
});
test('already-at-destination has zero travel; town destinations do not invent visit times', () => {
  assert.equal(estimateJourney({ ...base, start: base.destination }, places)!.travelMinutes, 0);
  assert.equal(estimateJourney({ ...base, destination: townPoints()[1] }, places)!.visitMinutes, 0);
});
test('arrival labels roll across midnight, and invalid calendar dates and clocks are rejected', () => {
  assert.equal(arrivalLabel('23:30', 90), '01:00 (+1 day)');
  assert.equal(arrivalLabel('09:00', 30), '09:30');
  assert.equal(validClock('24:00'), false);
  assert.equal(validTravelDate('2026-02-30'), false);
  assert.equal(validTravelDate('2028-02-29'), true);
  assert.equal(validTravelDate(''), true);
});
test('saved journey restores coordinates, independent radii and recents; corrupt storage is rejected', () => {
  const saved = {
    ...base,
    exploreOrigin: base.start,
    recent: [base.destination!],
    stopIds: [temple.id, temple.id],
  };
  const loaded = decodeJourney(JSON.stringify({ version: 1, state: saved }));
  assert.deepEqual(loaded.stopIds, [temple.id]);
  assert.deepEqual(loaded.exploreOrigin, base.start);
  assert.throws(() => decodeJourney('{broken'));
  assert.throws(() =>
    decodeJourney(JSON.stringify({ version: 1, state: { ...saved, corridorRadiusKm: 100 } })),
  );
  assert.throws(() =>
    decodeJourney(JSON.stringify({ version: 1, state: { ...saved, travelDate: null } })),
  );
});
test('journey writes remain ordered and recover after a failed write', async () => {
  const values: string[] = [];
  let failed = false;
  const write = createJourneyWriter({
    getItem: async () => null,
    setItem: async (_key, value) => {
      if (!failed) {
        failed = true;
        throw new Error('disk');
      }
      values.push(value);
    },
  });
  await assert.rejects(write(base));
  await Promise.all([
    write({ ...base, destinationRadiusKm: 25 }),
    write({ ...base, destinationRadiusKm: 50 }),
  ]);
  assert.equal(decodeJourney(values[1]).destinationRadiusKm, 50);
});
test('current-position discovery uses the explicit origin rather than silently falling back to a town', () => {
  const filters = { ...defaultFilters, radiusKm: 5 };
  assert.deepEqual(filterPlaces(places, filters, { latitude: 0, longitude: 0 }), []);
  assert.ok(filterPlaces(places, filters, lake.coordinates).some((place) => place.id === lake.id));
});
test('map endpoint geometry preserves real coordinates and bounds include both endpoints', () => {
  const points = [
    { ...base.start!, id: 'journey:start' },
    { ...base.destination!, id: 'journey:destination' },
  ];
  const data = placesToGeoJson([], undefined, points);
  assert.equal(data.features.length, 2);
  assert.deepEqual(data.features[0].geometry?.coordinates, [
    base.start!.coordinates.longitude,
    base.start!.coordinates.latitude,
  ]);
  const bounds = pointBounds(points)!;
  assert.ok(
    bounds[0] <= base.start!.coordinates.longitude &&
      bounds[2] >= base.destination!.coordinates.longitude,
  );
});
test('denied permission and disabled services never request a GPS position', async () => {
  let calls = 0;
  const port = {
    requestPermission: async () => ({ granted: false }),
    servicesEnabled: async () => true,
    getPosition: async () => {
      calls++;
      return { latitude: 1 };
    },
  };
  await assert.rejects(requestLocation(port), /permission/);
  await assert.rejects(
    requestLocation({
      ...port,
      requestPermission: async () => ({ granted: true }),
      servicesEnabled: async () => false,
    }),
    /services/,
  );
  assert.equal(calls, 0);
});
test('GPS timeout has an actionable fallback and successful capture returns provider coordinates', async () => {
  const port = {
    requestPermission: async () => ({ granted: true }),
    servicesEnabled: async () => true,
    getPosition: async () => ({ latitude: 15, longitude: 75 }),
  };
  assert.deepEqual(await requestLocation(port), { latitude: 15, longitude: 75 });
  await assert.rejects(
    requestLocation({ ...port, getPosition: () => new Promise<never>(() => {}) }, 5),
    /manually/,
  );
});
