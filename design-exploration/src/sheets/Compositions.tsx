import { useState } from 'react';
import { designs, type DesignDirection, type MapAppearance, type ThemeMode } from '../designs';
import { places } from '../data';
import {
  Brand,
  Button,
  Categories,
  Field,
  NavigationPreview,
  Photo,
  PlaceCard,
  ThemeSurface,
  showPreviewMessage,
} from '../components/Controls';
import { Icon } from '../components/Icon';
import { MapPreview } from '../components/MapPreview';

export function Welcome({
  direction,
  appearance,
}: {
  direction: DesignDirection;
  appearance: MapAppearance;
}) {
  const design = designs[direction];
  const next = () => {
    window.location.href = `/?page=maps&direction=${direction}`;
  };
  return (
    <div className={`welcome welcome-${direction}`}>
      <header className="app-header">
        <Brand />
        <span className="pill">Karnataka, India</span>
      </header>
      <div className="welcome-visual">
        {direction === 'A' ? (
          <>
            <img
              src="/assets/woven-landscape.png"
              alt="Illustrated Karnataka-inspired river valley with subtle texture; not a photograph of a named place"
            />
            <span className="art-credit">Generated editorial illustration</span>
          </>
        ) : direction === 'B' ? (
          <MapPreview appearance={appearance} />
        ) : (
          <Photo place={direction === 'C' ? places[0] : places[1]} />
        )}
      </div>
      <div className="welcome-copy">
        <p className="eyebrow">
          {direction === 'D'
            ? 'THE NORTHERN KARNATAKA EDITION'
            : 'NEARBY PLACES. NEW PERSPECTIVES.'}
        </p>
        <h1>
          {design.headline.split('\n').map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </h1>
        <p>
          Hidden corners, familiar towns and places worth slowing down for. Start with a place you
          know.
        </p>
        <div className="welcome-actions">
          <Button icon="arrow" onClick={next}>
            Plan my day
          </Button>
          <Button variant="quiet" onClick={next}>
            Explore map
          </Button>
        </div>
        <span className="muted">No account needed to explore</span>
      </div>
      <footer className="welcome-footer">
        <span>01 / DISCOVER SOMETHING NEARBY</span>
        <span>Made for curious days</span>
      </footer>
    </div>
  );
}

function AppearanceControl({
  appearance,
  onChange,
}: {
  appearance: MapAppearance;
  onChange: (style: MapAppearance) => void;
}) {
  return (
    <details className="layers-menu">
      <summary aria-label="Map appearance">
        <Icon name="layers" />
        <span>Map appearance</span>
      </summary>
      <div>
        <label>
          Map appearance
          <select
            value={appearance}
            onChange={(event) => onChange(event.target.value as MapAppearance)}
          >
            <option value="liberty">Liberty</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <small>Independent of the app’s theme</small>
      </div>
    </details>
  );
}

export function Discovery({
  direction,
  appearance,
  onAppearanceChange,
}: {
  direction: DesignDirection;
  appearance: MapAppearance;
  onAppearanceChange: (style: MapAppearance) => void;
}) {
  const [view, setView] = useState<'map' | 'list'>(direction === 'D' ? 'list' : 'map');
  return (
    <div className={`discovery discovery-${direction}`}>
      <header className="app-header">
        <Brand />
        <Button
          variant="quiet"
          icon="plus"
          onClick={() =>
            showPreviewMessage(
              'Contribution entry point. Private drafts and review states are on the foundation sheet.',
            )
          }
        >
          Add a place
        </Button>
      </header>
      <div className="discovery-layout">
        <div className="desktop-nav">
          <NavigationPreview rail />
        </div>
        <aside className="results-pane">
          <p className="eyebrow">AROUND DHARWAD</p>
          <h2>{direction === 'D' ? 'The nearby journal' : 'A good day starts nearby.'}</h2>
          <Field label="Find a place" placeholder="Lakes, heritage, hidden corners…" />
          <Categories />
          <div className="results-heading">
            <strong>Places to explore</strong>
            <span className="muted">Sample collection</span>
          </div>
          <div className="place-list">
            <PlaceCard place={places[0]} compact={direction === 'B'} />
            <div className="secondary-result">
              <Photo place={places[1]} />
              <div>
                <span className="eyebrow">ANOTHER TOWN</span>
                <h3>Belagavi Fort</h3>
                <p>Keep exploring northern Karnataka.</p>
              </div>
            </div>
          </div>
        </aside>
        <section
          className={`discovery-stage ${view === 'list' ? 'list-visible' : ''}`}
          aria-label="Map and list composition"
        >
          <div className="stage-controls">
            <div className="view-switch" aria-label="Discovery view">
              <button aria-pressed={view === 'map'} onClick={() => setView('map')}>
                <Icon name="pin" size={20} />
                Map
              </button>
              <button aria-pressed={view === 'list'} onClick={() => setView('list')}>
                <Icon name="list" size={20} />
                List
              </button>
            </div>
            <AppearanceControl appearance={appearance} onChange={onAppearanceChange} />
          </div>
          <div className={`map-stage ${view === 'list' ? 'covered' : ''}`}>
            <MapPreview appearance={appearance} />
            <div className="selected-place">
              <span className="eyebrow">SELECTED / NATURE</span>
              <h3>Kelageri Lake</h3>
              <p>Dharwad · sample selection</p>
              <Button
                variant="secondary"
                icon="arrow"
                onClick={() =>
                  showPreviewMessage('Destination detail transition is a Stage 4 screen variant.')
                }
              >
                View place
              </Button>
            </div>
          </div>
          {view === 'list' && (
            <div className="editorial-list">
              <div className="editorial-intro">
                <p className="eyebrow">BEYOND THE FAMILIAR</p>
                <h2>What will you find today?</h2>
                <p>A photograph, a place and a reason to be curious.</p>
              </div>
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="mobile-nav">
        <NavigationPreview />
      </div>
    </div>
  );
}

export function CompositionFrame({
  direction,
  mode,
  width,
  scene,
  appearance,
  onAppearanceChange,
}: {
  direction: DesignDirection;
  mode: ThemeMode;
  width: number;
  scene: 'welcome' | 'discover';
  appearance: MapAppearance;
  onAppearanceChange: (style: MapAppearance) => void;
}) {
  return (
    <div className="frame-overflow">
      <div className="device-frame" style={{ width }}>
        <ThemeSurface
          direction={direction}
          mode={mode}
          className={width < 600 ? 'compact-view' : 'expanded-view'}
        >
          {scene === 'welcome' ? (
            <Welcome direction={direction} appearance={appearance} />
          ) : (
            <Discovery
              direction={direction}
              appearance={appearance}
              onAppearanceChange={onAppearanceChange}
            />
          )}
        </ThemeSurface>
      </div>
    </div>
  );
}

export function Compositions({
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
  return (
    <>
      <header className="sheet-heading">
        <p className="overline">
          DIRECTION {direction} / {mode.toUpperCase()} / COMPOSITION STUDIES
        </p>
        <h1>{designs[direction].name}</h1>
        <p>
          390-unit mobile and 1440-unit PC samples. These are composition studies; complete screen
          alternatives follow in Stage 4.
        </p>
      </header>
      <div className="mobile-compositions">
        {(['welcome', 'discover'] as const).map((scene) => (
          <section key={scene}>
            <h2 className="section-title">Mobile / {scene}</h2>
            <CompositionFrame
              {...{ direction, mode, appearance, onAppearanceChange, scene }}
              width={390}
            />
          </section>
        ))}
      </div>
      {(['welcome', 'discover'] as const).map((scene) => (
        <section key={scene}>
          <h2 className="section-title">PC / {scene} / 1440</h2>
          <CompositionFrame
            {...{ direction, mode, appearance, onAppearanceChange, scene }}
            width={1440}
          />
        </section>
      ))}
    </>
  );
}
