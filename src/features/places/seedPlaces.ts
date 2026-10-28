import type { Place } from './types';

// Editorial demo data. Coordinates and visit durations are approximate.
export const seedPlaces: Omit<Place, 'photo'>[] = [
  {
    id: 'unkal-lake',
    name: 'Unkal Lake',
    locality: 'Hubballi',
    categories: ['nature', 'activities'],
    coordinates: {
      latitude: 15.3833,
      longitude: 75.1207,
    },
    visitMinutes: 60,
    description: 'Make time for a lakeside pause and a gentle stroll in Hubballi.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/attractions/unkal-lake-hubli/',
      },
    ],
  },
  {
    id: 'chandramouleshwara',
    name: 'Chandramouleshwara Temple',
    locality: 'Unkal, Hubballi',
    categories: ['heritage', 'spiritual'],
    coordinates: {
      latitude: 15.376778,
      longitude: 75.116667,
    },
    visitMinutes: 45,
    description: 'Take a closer look at stone carvings and temple architecture in Unkal.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/tourist-place/chandramouleshwara-temple/',
      },
    ],
  },
  {
    id: 'nrupatunga-betta',
    name: 'Nrupatunga Betta',
    locality: 'Hubballi',
    categories: ['nature', 'activities'],
    coordinates: {
      latitude: 15.3773,
      longitude: 75.1393,
    },
    visitMinutes: 75,
    description: 'Set aside a little time for a hilltop outing above the city.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'siddharoodha',
    name: 'Siddharoodha Math',
    locality: 'Hubballi',
    categories: ['spiritual'],
    coordinates: {
      latitude: 15.3357,
      longitude: 75.1241,
    },
    visitMinutes: 60,
    description: 'Include a quiet stop at this spiritual landmark in your Hubballi day.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'glass-house',
    name: 'Indira Gandhi Glass House',
    locality: 'Hubballi',
    categories: ['nature', 'activities'],
    coordinates: {
      latitude: 15.3589,
      longitude: 75.1322,
    },
    visitMinutes: 45,
    description: 'Break up a city day with a garden visit. Check entry arrangements locally.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'kelgeri-lake',
    name: 'Kelgeri Lake',
    locality: 'Dharwad',
    categories: ['nature'],
    coordinates: {
      latitude: 15.4644,
      longitude: 74.9818,
    },
    visitMinutes: 60,
    description: 'Leave room in your Dharwad itinerary for a slow lakeside visit.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'sadhankeri',
    name: 'Sadhankeri Park',
    locality: 'Dharwad',
    categories: ['nature', 'activities'],
    coordinates: {
      latitude: 15.4712,
      longitude: 74.9958,
    },
    visitMinutes: 60,
    description: 'Plan an unhurried green break around the Sadhankeri neighbourhood.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'karnatak-college',
    name: 'Karnatak College',
    locality: 'Dharwad',
    categories: ['heritage'],
    coordinates: {
      latitude: 15.4584,
      longitude: 75.0079,
    },
    visitMinutes: 30,
    description:
      'Notice Dharwad’s educational heritage from the surrounding public area. Campus access needs local confirmation.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'someshwara',
    name: 'Someshwara Temple',
    locality: 'Dharwad',
    categories: ['spiritual', 'heritage'],
    coordinates: {
      latitude: 15.4354,
      longitude: 74.9925,
    },
    visitMinutes: 45,
    description: 'Add a temple stop to your Dharwad outing, allowing time to explore respectfully.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://dharwad.nic.in/en/places-of-interest/',
      },
    ],
  },
  {
    id: 'belagavi-fort',
    name: 'Belagavi Fort',
    locality: 'Belagavi',
    categories: ['heritage'],
    coordinates: {
      latitude: 15.8581,
      longitude: 74.5231,
    },
    visitMinutes: 90,
    description:
      'Explore the fort precinct at your own pace and look out for its layers of architecture.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://belagavi.nic.in/en/tourist-place/belagavi-fort-belagavi/',
      },
    ],
  },
  {
    id: 'kamal-basadi',
    name: 'Kamal Basadi',
    locality: 'Belagavi Fort',
    categories: ['heritage', 'spiritual'],
    coordinates: {
      latitude: 15.8585,
      longitude: 74.5236,
    },
    visitMinutes: 45,
    description: 'Pair this Jain temple with a visit to the surrounding fort precinct.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/destinations/belagavi/',
      },
    ],
  },
  {
    id: 'gokak-falls',
    name: 'Gokak Falls',
    locality: 'Gokak, Belagavi district',
    categories: ['waterfalls', 'nature'],
    coordinates: {
      latitude: 16.1914,
      longitude: 74.7792,
    },
    visitMinutes: 90,
    description: 'Make the waterfall the centrepiece of an outing beyond Belagavi.',
    access:
      'Expect a final approach on foot. Paths, parking and access are not verified; confirm locally before setting out.',
    seasonalNotes:
      'Water flow and access vary with rainfall. Confirm conditions locally and respect closures and barriers.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/destinations/belagavi/',
      },
    ],
  },
  {
    id: 'godachinmalki',
    name: 'Godachinmalki Falls',
    locality: 'Belagavi district',
    categories: ['waterfalls', 'nature'],
    coordinates: {
      latitude: 16.0486,
      longitude: 74.6772,
    },
    visitMinutes: 90,
    description: 'Allow time for a waterfall outing along the Markandeya River.',
    access:
      'Expect a final approach on foot. Paths, parking and access are not verified; confirm locally before setting out.',
    seasonalNotes:
      'Water flow and access vary with rainfall. Confirm conditions locally and respect closures and barriers.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/destinations/belagavi/',
      },
    ],
  },
  {
    id: 'kittur-fort',
    name: 'Kittur Fort',
    locality: 'Kittur',
    categories: ['heritage'],
    coordinates: {
      latitude: 15.599,
      longitude: 74.785,
    },
    visitMinutes: 75,
    description: 'Build a heritage stop in Kittur into a journey between Dharwad and Belagavi.',
    access:
      'The final approach may require walking. Parking, step free access and current entry conditions are not verified.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/destinations/kittur-fort/',
      },
    ],
  },
  {
    id: 'bhimgad',
    name: 'Bhimgad Wildlife Sanctuary',
    locality: 'Khanapur, Belagavi district',
    categories: ['nature', 'activities'],
    coordinates: {
      latitude: 15.576,
      longitude: 74.375,
    },
    visitMinutes: 180,
    description:
      'Research a forest outing in the Bhimgad landscape. Entry and guided activities must be confirmed before travel.',
    access:
      'Do not assume public entry or vehicle access. Confirm permits, guides and permitted routes with the forest authorities.',
    seasonalNotes:
      'Check local weather and current access before your visit. No live conditions are available in this demo.',
    openingHours: null,
    sources: [
      {
        title: 'Destination background',
        url: 'https://karnatakatourism.org/en/destinations/belagavi/',
      },
    ],
  },
];
