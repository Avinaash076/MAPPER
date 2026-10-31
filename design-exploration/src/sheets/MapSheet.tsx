import { useState } from 'react';
import { type MapAppearance, type DesignDirection, type ThemeMode } from '../designs';
import { regions, type Region } from '../data';
import { Button, ThemeSurface } from '../components/Controls';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';

function MapChoice({
  style,
  selected,
  onSelect,
  region,
  preview = true,
}: {
  style: MapAppearance;
  selected: boolean;
  onSelect: () => void;
  region: Region;
  preview?: boolean;
}) {
  return (
    <div className={`map-choice ${selected ? 'chosen' : ''}`}>
      {preview && <MapPreview appearance={style} region={region} interactive={false} />}
      <button aria-pressed={selected} onClick={onSelect}>
        <span>
          <strong>{style === 'liberty' ? 'Liberty' : 'Dark'}</strong>
          <small>
            {style === 'liberty'
              ? 'Clean, detailed and easy to explore.'
              : 'A darker, more subdued map experience.'}
          </small>
        </span>
        <Icon name={selected ? 'check' : 'layers'} />
      </button>
    </div>
  );
}
export function MapSheet({
  direction,
  mode,
  appearance,
  onAppearanceChange,
}: {
  direction: DesignDirection;
  mode: ThemeMode;
  appearance: MapAppearance;
  onAppearanceChange: (style: MapAppearance) => void;
}) {
  const [region, setRegion] = useState<Region>('Dharwad');
  const [concept, setConcept] = useState<'paired' | 'segmented' | 'stacked'>('paired');
  return (
    <>
      <header className="sheet-heading">
        <p className="overline">MAP APPEARANCE / THREE SELECTOR CONCEPTS</p>
        <h1>Same place. A different perspective.</h1>
        <p>
          Actual OpenFreeMap rendering. The map appearance stays independent of the app’s light/dark
          theme.
        </p>
      </header>
      <ThemeSurface direction={direction} mode={mode} className="map-sheet">
        <div className="map-tools">
          <label>
            Comparison area
            <select value={region} onChange={(event) => setRegion(event.target.value as Region)}>
              {Object.keys(regions).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Selector concept
            <select
              value={concept}
              onChange={(event) => setConcept(event.target.value as typeof concept)}
            >
              <option value="paired">01 — Paired cards</option>
              <option value="segmented">02 — One large preview</option>
              <option value="stacked">03 — Stacked cards</option>
            </select>
          </label>
        </div>
        <p className="eyebrow">WELCOME → MAP APPEARANCE → PREFERENCES → DISCOVER</p>
        <h2>How would you like your map to look?</h2>
        <p className="muted">You can change this later using the layers control.</p>
        <div className={`map-choices ${concept}`}>
          {(['liberty', 'dark'] as const).map((style) => (
            <MapChoice
              key={style}
              style={style}
              selected={appearance === style}
              onSelect={() => onAppearanceChange(style)}
              region={region}
              preview={concept !== 'segmented'}
            />
          ))}
        </div>
        {concept === 'segmented' && (
          <div className="large-map">
            <MapPreview appearance={appearance} region={region} />
          </div>
        )}
        <div className="map-next">
          <span>Selected: {appearance === 'liberty' ? 'Liberty' : 'Dark'}</span>
          <Button
            icon="arrow"
            onClick={() =>
              (window.location.href = `/?page=compositions&direction=${direction}&mode=${mode}`)
            }
          >
            Continue to composition
          </Button>
        </div>
        <p className="muted">
          Preview locations are approximate. This is a style comparison, not a route or access
          assessment. Only the three sample destination markers are included; expanded map coverage
          does not mean expanded place data.
        </p>
      </ThemeSurface>
    </>
  );
}
