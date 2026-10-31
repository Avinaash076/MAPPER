import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';
import { Button, Photo } from '../components/Controls';
import { places, type SamplePlace } from '../data';
import type { MapAppearance } from '../designs';

export function PlaceIndex({
  items = places.slice(0, 3),
  selectedId,
  onSelect,
}: {
  items?: SamplePlace[];
  selectedId: string;
  onSelect: (place: SamplePlace) => void;
}) {
  return (
    <div className="atlas-index">
      {items.map((place, index) => (
        <button
          key={place.id}
          className={selectedId === place.id ? 'index-selected' : ''}
          aria-pressed={selectedId === place.id}
          onClick={() => onSelect(place)}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <strong>{place.name}</strong>
            <small>
              {place.area} · {place.category}
            </small>
          </div>
          <Icon name="arrow" size={20} />
        </button>
      ))}
    </div>
  );
}

export function MapStylePicker({
  appearance,
  onChange,
  onDone,
}: {
  appearance: MapAppearance;
  onChange: (value: MapAppearance) => void;
  onDone: () => void;
}) {
  return (
    <section className="study-layers" aria-label="Map layers">
      <p className="eyebrow">YOUR MAP, YOUR PERSPECTIVE</p>
      <h2>Choose your map</h2>
      <div className="style-pair">
        {(['liberty', 'dark'] as const).map((style) => (
          <div key={style}>
            <MapPreview appearance={style} interactive={false} />
            <button aria-pressed={appearance === style} onClick={() => onChange(style)}>
              {style === 'liberty' ? 'Liberty' : 'Dark'}
              {appearance === style && <Icon name="check" />}
            </button>
          </div>
        ))}
      </div>
      <p className="muted">Same Dharwad view and zoom. Independent of app appearance.</p>
      <Button onClick={onDone}>Use this map</Button>
    </section>
  );
}

export function PlaceObservation({
  place,
  saved,
  onSave,
  onDetails,
}: {
  place: SamplePlace;
  saved: boolean;
  onSave: () => void;
  onDetails: () => void;
}) {
  return (
    <article className="field-observation">
      <Photo place={place} />
      <div>
        <p className="eyebrow">A MOMENT WORTH FINDING</p>
        <h2>
          <button className="text-link" onClick={onDetails}>
            {place.name}
          </button>
        </h2>
        <p>{place.description}</p>
        <Button
          variant="secondary"
          onClick={onSave}
          aria-pressed={saved}
          icon={saved ? 'check' : 'bookmark'}
        >
          {saved ? 'Saved in preview' : 'Save this place'}
        </Button>
      </div>
    </article>
  );
}
