import { useState } from 'react';
import { collectionNames, type CollectionName } from './blueDiscoveryData';
import { openStudy, type ScreenProps } from './studyTypes';

interface Props {
  screenProps: ScreenProps;
  collection: CollectionName;
  onCollectionChange: (value: CollectionName) => void;
  onShowPlaces: () => void;
}

export function CollectionAndTrip({
  collection,
  onCollectionChange,
  onShowPlaces,
  screenProps,
}: Props) {
  const [days, setDays] = useState('1');
  return (
    <aside className="blue-extras" aria-label="Optional discovery tools">
      <details className="blue-disclosure">
        <summary>Explore a collection</summary>
        <div className="blue-disclosure-body">
          <label>
            Collection
            <select
              value={collection}
              onChange={(event) => onCollectionChange(event.target.value as CollectionName)}
            >
              {collectionNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <p>Browse places by interest. Check current access before visiting.</p>
          <button className="blue-secondary" onClick={onShowPlaces}>
            Show collection places
          </button>
        </div>
      </details>
      <details className="blue-disclosure">
        <summary>How to plan your visit</summary>
        <div className="blue-disclosure-body">
          <label>
            Number of days · concept
            <select value={days} onChange={(event) => setDays(event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </label>
          <ol>
            <li>Choose a place on the map or from the list.</li>
            <li>Open its details and use “Add to my plan.”</li>
            <li>
              In My plan, order the stops and choose transport before checking travel estimates.
            </li>
          </ol>
          <p role="status">
            {days === '1'
              ? 'The current app supports one local day plan.'
              : `${days}-day planning is a future feature. This selector is a design preview and does not create an itinerary.`}
          </p>
        </div>
      </details>
      <button
        className="lens-assistant-entry"
        onClick={() => openStudy('AI assistant', screenProps.variant, screenProps.mode)}
      >
        <span>
          Ask about these places<small>AI interface preview</small>
        </span>
        <span aria-hidden="true">↗</span>
      </button>
    </aside>
  );
}
