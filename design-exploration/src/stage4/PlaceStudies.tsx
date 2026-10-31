import { useState } from 'react';
import { Button, Photo } from '../components/Controls';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { places } from '../data';
import { openStudy, type ScreenProps } from './studyTypes';

export function DetailsStudy(props: ScreenProps) {
  const place =
    places.find((item) => item.id === new URLSearchParams(location.search).get('place')) ??
    places[0];
  const [saved, setSaved] = useState(false);
  const [planned, setPlanned] = useState(false);
  return (
    <section className="detail-study">
      <Photo place={place} />
      <div className="detail-heading">
        <p className="eyebrow">
          {place.category} / {place.area}
        </p>
        <h1>{place.name}</h1>
        <p>A little space to pause.</p>
        <button
          className="icon-button"
          aria-pressed={saved}
          aria-label={saved ? 'Unsave place' : 'Save place'}
          onClick={() => setSaved(!saved)}
        >
          <Icon name="bookmark" filled={saved} />
        </button>
      </div>
      <div className="detail-body">
        <p>{place.description}</p>
        <div className="field-facts">
          <span>
            VISIT TIME<strong>Not verified</strong>
          </span>
          <span>
            OPENING HOURS<strong>Unknown</strong>
          </span>
        </div>
        <h3>Before you go</h3>
        <p>
          Confirm current access locally. A seasonal photograph does not establish today’s
          conditions.
        </p>
        <div className="map-banner">
          <MapPreview appearance={props.appearance} selectedId={place.id} />
        </div>
        <details>
          <summary>Sources & photo credits</summary>
          <p>
            Image credit appears beneath the photograph. The introduction is illustrative editorial
            copy.
          </p>
          {place.sourceUrl && (
            <a href={place.sourceUrl} target="_blank" rel="noreferrer">
              Place reference
            </a>
          )}
        </details>
        <Button icon="plus" onClick={() => setPlanned(true)}>
          {planned ? 'Added in preview' : 'Add to my plan'}
        </Button>
      </div>
    </section>
  );
}

const collections = [
  {
    name: 'Water & the seasons',
    ids: ['unkal-lake', 'gokak-falls'],
    note: 'Seasonal collection concept. Conditions need checking.',
  },
  {
    name: 'Stories in stone',
    ids: ['badami', 'aihole', 'pattadakal', 'hampi'],
    note: 'Heritage collection. No current opening claims.',
  },
  {
    name: 'A different horizon',
    ids: ['gokarna', 'dandeli'],
    note: 'Local favourites concept. Popularity is illustrative.',
  },
] as const;

export function HiddenPlacesStudy(props: ScreenProps) {
  const [collection, setCollection] = useState(1);
  const active = collections[collection];
  const stories = places.filter((place) => (active.ids as readonly string[]).includes(place.id));
  return (
    <section className="hidden-study">
      <div className="hidden-heading">
        <p className="eyebrow">BEYOND THE FAMILIAR / COLLECTION CONCEPTS</p>
        <h1>
          Some places
          <br />
          stay with you.
        </h1>
        <p>Follow an interest, a season, or a story shared by someone nearby.</p>
        <div className="step-tabs">
          {collections.map((item, index) => (
            <button
              key={item.name}
              aria-pressed={collection === index}
              onClick={() => setCollection(index)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="sample-note">
          {active.note} Familiar destinations illustrate the layout; this is not a verified list of
          hidden places.
        </p>
        <p className="research-note">
          Kappat Gudda is on the research list. Photography and a suitable public access point are
          still to be verified.
        </p>
      </div>
      {stories.map((place, index) => (
        <article key={place.id} className="discovery-story">
          <Photo place={place} />
          <div>
            <span className="story-number">0{index + 1}</span>
            <p className="eyebrow">
              {place.area} / {place.category}
            </p>
            <h2>{place.name}</h2>
            <p>{place.description}</p>
            <Button
              variant="quiet"
              onClick={() => openStudy('Place details', props.variant, props.mode, place.id)}
            >
              Explore the place <Icon name="arrow" />
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
}
