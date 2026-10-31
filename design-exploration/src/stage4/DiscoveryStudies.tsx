import { useState } from 'react';
import { Button, Categories, Field, Photo, StatusMessage } from '../components/Controls';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { places } from '../data';
import { MapStylePicker, PlaceIndex, PlaceObservation } from './StudyControls';
import { openStudy, type ScreenProps } from './studyTypes';

export function DiscoveryStudy(props: ScreenProps & { mapOnly?: boolean }) {
  const [place, setPlace] = useState(places[0]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [layers, setLayers] = useState(false);
  const [showList, setShowList] = useState(!props.mapOnly);
  const [collection, setCollection] = useState('Nearby places');
  const nearby = places.filter((item) =>
    ['kelgeri-lake', 'unkal-lake', 'badami'].includes(item.id),
  );
  const collectionPlaces =
    collection === 'Nearby places'
      ? nearby
      : collection === 'Seasonal waterfalls'
        ? places.filter((item) => item.category === 'Waterfalls')
        : places.filter((item) => ['aihole', 'hampi', 'dandeli'].includes(item.id));
  function toggleSaved() {
    setSavedIds((previous) =>
      previous.includes(place.id)
        ? previous.filter((id) => id !== place.id)
        : [...previous, place.id],
    );
  }
  return (
    <section className={`atlas ${props.mapOnly ? 'map-workspace' : ''}`}>
      <div className="atlas-heading">
        <p className="eyebrow">YOUR NORTHERN KARNATAKA FIELD GUIDE</p>
        <h1>
          {props.mapOnly ? (
            'Find your bearings.'
          ) : (
            <>
              Out of the ordinary.
              <br />
              Within reach.
            </>
          )}
        </h1>
        <Field label="Where does your curiosity lead?" placeholder="Find a place or interest" />
        <button
          className="text-link"
          onClick={() => openStudy('Search & filters', props.variant, props.mode)}
        >
          Search & filters <Icon name="arrow" size={20} />
        </button>
      </div>
      <div className="atlas-map">
        <MapPreview
          appearance={props.appearance}
          selectedId={place.id}
          onSelectPlace={(id) => {
            const selected = places.find((item) => item.id === id);
            if (selected) setPlace(selected);
          }}
        />
        <button
          className="layers-trigger"
          aria-expanded={layers}
          onClick={() => setLayers(!layers)}
        >
          <Icon name="layers" />
          Layers
        </button>
        {layers && (
          <MapStylePicker
            appearance={props.appearance}
            onChange={props.onAppearanceChange}
            onDone={() => setLayers(false)}
          />
        )}
        <div className="map-note">
          <Icon name="pin" />
          <div>
            <strong>{place.name}</strong>
            <small>{place.area} · approximate reference pin</small>
          </div>
        </div>
      </div>
      <div className="atlas-notes">
        {!props.mapOnly && (
          <label className="study-label">
            Explore a collection
            <select value={collection} onChange={(event) => setCollection(event.target.value)}>
              {[
                'Nearby places',
                'Hidden gems',
                'Worth visiting this month',
                'Seasonal waterfalls',
                'Sunrise & sunset',
                'Recently approved',
                'Local favourites',
              ].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        )}
        <div className="notebook-heading">
          <h2>{props.mapOnly ? 'Places on this map' : collection}</h2>
          <button
            className="icon-button"
            aria-expanded={showList}
            aria-label="Toggle place list"
            onClick={() => setShowList(!showList)}
          >
            <Icon name="list" />
          </button>
        </div>
        <p className="sample-note">
          Illustrative collection · no live distance, popularity or seasonal verification.
        </p>
        {showList && (
          <PlaceIndex items={collectionPlaces} selectedId={place.id} onSelect={setPlace} />
        )}{' '}
        {props.mapOnly && props.variant === 2 ? (
          <div className="place-filmstrip">
            {nearby.map((item) => (
              <article key={item.id}>
                <Photo place={item} />
                <button aria-pressed={item.id === place.id} onClick={() => setPlace(item)}>
                  <strong>{item.name}</strong>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <PlaceObservation
            place={place}
            saved={savedIds.includes(place.id)}
            onSave={toggleSaved}
            onDetails={() => openStudy('Place details', props.variant, props.mode, place.id)}
          />
        )}
        <button
          className="contribute-invite"
          onClick={() => openStudy('Contribute', props.variant, props.mode)}
        >
          <Icon name="plus" />
          <span>
            Know a place we’ve missed?<small>Add your discovery for review.</small>
          </span>
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  );
}

export function FiltersStudy(props: ScreenProps) {
  const [empty, setEmpty] = useState(false);
  return (
    <section className="search-study">
      <div className="search-intro">
        <p className="eyebrow">LOOK A LITTLE CLOSER</p>
        <h1>
          Find your kind
          <br />
          of somewhere.
        </h1>
        <Field
          label={props.variant === 2 ? 'Describe your kind of day' : 'Search places'}
          placeholder="A quiet lake near Dharwad"
        />
        {props.variant === 2 && (
          <StatusMessage kind="information" title="Natural-language discovery · concept">
            Future answers will cite place sources. No AI request is sent here.
          </StatusMessage>
        )}
      </div>
      <div className="filter-body">
        <h3>Interests</h3>
        <Categories />
        <label className="study-label">
          Starting area
          <select>
            <option>Dharwad</option>
            <option>Hubballi</option>
            <option>Belagavi</option>
          </select>
        </label>
        <fieldset>
          <legend>Search radius · concept</legend>
          <div className="radius-options">
            {[25, 50, 80, 100].map((distance) => (
              <label key={distance}>
                <input
                  type="radio"
                  name={`radius-${props.variant}`}
                  defaultChecked={distance === 50}
                />
                {distance} km
              </label>
            ))}
          </div>
        </fieldset>
        {props.variant === 1 && (
          <div className="map-banner">
            <MapPreview appearance={props.appearance} />
          </div>
        )}
        <Button onClick={() => setEmpty(!empty)}>
          {empty ? 'Reset example' : 'Show empty-state example'}
        </Button>
        {empty ? (
          <StatusMessage kind="information" title="No exact matches">
            Try a wider radius or remove one interest.
          </StatusMessage>
        ) : (
          <PlaceIndex
            items={places.slice(0, 3)}
            selectedId={places[0].id}
            onSelect={(place) => openStudy('Place details', props.variant, props.mode, place.id)}
          />
        )}
      </div>
    </section>
  );
}
