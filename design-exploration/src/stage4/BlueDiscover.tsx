import { useId, useState, type FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { places } from '../data';
import { CollectionAndTrip } from './CollectionAndTrip';
import { findDiscoveryPlaces, type CollectionName } from './blueDiscoveryData';
import { MapStylePicker } from './StudyControls';
import { openStudy, type ScreenProps } from './studyTypes';
import './blue-discover.css';

export function BlueDiscover(props: ScreenProps) {
  const inputId = useId();
  const resultsId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [collection, setCollection] = useState<CollectionName>('All places');
  const [selectedId, setSelectedId] = useState(places[0].id);
  const [showResults, setShowResults] = useState(false);
  const [layers, setLayers] = useState(false);
  const matches = findDiscoveryPlaces(places, query, category, collection);
  const selected = matches.find((place) => place.id === selectedId) ?? matches[0];

  function showMatches(event?: FormEvent) {
    event?.preventDefault();
    setShowResults(true);
  }
  function resetSearch() {
    setQuery('');
    setCategory('');
    setCollection('All places');
  }

  return (
    <section className="blue-discover" aria-label="Discover places">
      <header className="blue-search">
        <h1>Discover</h1>
        <form onSubmit={showMatches} role="search">
          <label htmlFor={inputId}>Search the map</label>
          <div className="blue-search-row">
            <div className="blue-search-input">
              <Icon name="search" />
              <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Place or town"
              />
            </div>
            <button className="blue-secondary" type="submit">
              Search
            </button>
          </div>
        </form>
        <div className="blue-search-tools">
          <details className="blue-filter">
            <summary>Filters{category ? ' · 1' : ''}</summary>
            <label>
              Place type
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All types</option>
                {['Nature', 'Heritage', 'Waterfalls', 'Spiritual', 'Activities'].map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <button className="blue-secondary" onClick={() => setCategory('')}>
              Reset filters
            </button>
          </details>
          <button
            className="blue-text-action"
            aria-controls={resultsId}
            aria-expanded={showResults}
            onClick={() => setShowResults(!showResults)}
          >
            <Icon name="list" size={20} />
            {showResults ? 'Hide list' : `View places (${matches.length})`}
          </button>
        </div>
        {showResults && (
          <div id={resultsId} className="blue-results">
            <p role="status">
              {matches.length ? `${matches.length} sample places` : 'No matching sample places.'}
            </p>
            {matches.length ? (
              matches.map((place) => (
                <button
                  key={place.id}
                  aria-pressed={place.id === selected?.id}
                  onClick={() => {
                    setSelectedId(place.id);
                  }}
                >
                  <span>
                    <strong>{place.name}</strong>
                    <small>
                      {place.area} · {place.category}
                    </small>
                  </span>
                  <Icon name={place.id === selected?.id ? 'check' : 'pin'} size={20} />
                </button>
              ))
            ) : (
              <button className="blue-secondary" onClick={resetSearch}>
                Clear search & filters
              </button>
            )}
          </div>
        )}
      </header>
      <div className="blue-map-column">
        <div className="blue-map">
          <MapPreview
            appearance={props.appearance}
            selectedId={selected?.id}
            onSelectPlace={setSelectedId}
            visiblePlaceIds={matches.map((place) => place.id)}
          />
          <button
            className="blue-layers"
            aria-expanded={layers}
            aria-label="Choose map layers"
            onClick={() => setLayers(!layers)}
          >
            <Icon name="layers" size={20} />
            Layers
          </button>
          {layers && (
            <MapStylePicker
              appearance={props.appearance}
              onChange={props.onAppearanceChange}
              onDone={() => setLayers(false)}
            />
          )}
          {selected && !layers && (
            <button
              className="blue-selected-place"
              onClick={() => openStudy('Place details', props.variant, props.mode, selected.id)}
            >
              <span>
                <strong>{selected.name}</strong>
                <small>{selected.area} · View details</small>
              </span>
              <Icon name="arrow" size={20} />
            </button>
          )}
        </div>
        <button
          className="blue-contribute"
          onClick={() => openStudy('Contribute', props.variant, props.mode)}
        >
          <Icon name="plus" />
          <span>
            <strong>Know a place we’ve missed?</strong>
            <small>Add its location, photos and story.</small>
          </span>
          <Icon name="arrow" />
        </button>
        <p className="blue-privacy">Your submission stays private until reviewed.</p>
      </div>
      <CollectionAndTrip
        screenProps={props}
        collection={collection}
        onCollectionChange={setCollection}
        onShowPlaces={() => {
          setShowResults(true);
          document.getElementById(inputId)?.focus();
        }}
      />
      <p className="blue-preview-note">Sample places · online map · no live travel estimates</p>
    </section>
  );
}
