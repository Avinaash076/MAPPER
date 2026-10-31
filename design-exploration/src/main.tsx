import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  designs,
  readMapAppearance,
  readThemePreference,
  resolveTheme,
  type DesignDirection,
  type MapAppearance,
  type ThemeMode,
  type ThemePreference,
} from './designs';
import { Brand, ThemeSurface } from './components/Controls';
import { Foundation, CardComparison } from './sheets/Foundation';
import { Compositions, CompositionFrame } from './sheets/Compositions';
import { MapSheet } from './sheets/MapSheet';
import './styles.css';
import { ScreenStudies } from './stage4/ScreenStudies';

function readPreference(key: string) {
  try {
    return localStorage.getItem(`mapper-stage3:${key}`);
  } catch {
    return null;
  }
}
function savePreference(key: string, value: string) {
  try {
    localStorage.setItem(`mapper-stage3:${key}`, value);
  } catch {
    /* Preview still works without persistence. */
  }
}
function App() {
  const params = new URLSearchParams(location.search);
  const direction = (
    ['A', 'B', 'C', 'D'].includes(params.get('direction') || '') ? params.get('direction') : 'A'
  ) as DesignDirection;
  const page = params.get('page') || 'index';
  const [preference, setPreference] = useState<ThemePreference>(() =>
    readThemePreference(params.get('mode') ?? readPreference('theme')),
  );
  const [system, setSystem] = useState<ThemeMode>(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const [appearance, setAppearance] = useState<MapAppearance>(() =>
    readMapAppearance(params.get('map') ?? readPreference('map')),
  );
  const [message, setMessage] = useState('');
  const mode = resolveTheme(preference, system);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(''), 6000);
    };
    window.addEventListener('preview-message', show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('preview-message', show);
    };
  }, []);
  function changeMap(value: MapAppearance) {
    setAppearance(value);
    savePreference('map', value);
  }
  const sceneProps = { direction, mode, appearance, onAppearanceChange: changeMap };
  if (page === 'stage4')
    return (
      <ScreenStudies
        mode={mode}
        appearance={appearance}
        onAppearanceChange={changeMap}
        onThemeChange={(value) => {
          setPreference(value);
          savePreference('theme', value);
        }}
      />
    );
  if (page === 'scene') {
    const width =
      Number(params.get('width')) === 1440 ? 1440 : Number(params.get('width')) === 320 ? 320 : 390;
    return (
      <main className={`scene-page ${width === 1440 ? 'pc-scene' : ''}`}>
        <CompositionFrame
          {...sceneProps}
          width={width}
          scene={params.get('scene') === 'discover' ? 'discover' : 'welcome'}
        />
      </main>
    );
  }
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to design sheet
      </a>
      <header className="review-header">
        <a href="/" aria-label="Stage 3 sheet index">
          <Brand />
        </a>
        <span className="review-label">DESIGN EXPLORATION / 03</span>
        <label>
          App appearance
          <select
            value={preference}
            onChange={(event) => {
              const value = event.target.value as ThemePreference;
              setPreference(value);
              savePreference('theme', value);
            }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>
      <nav className="sheet-nav" aria-label="Design sheets">
        <a href="/">Overview</a>
        <a href="/?page=stage4">Stage 4 screen studies</a>
        <a href="/?page=comparison">Card comparison</a>
        {Object.values(designs).map((design) => (
          <a key={design.id} href={`/?page=foundation&direction=${design.id}`}>
            {design.id} / {design.shortName}
          </a>
        ))}
        <a href={`/?page=maps&direction=${direction}`}>Map concepts</a>
      </nav>
      <main id="content" className="review-content">
        {page === 'foundation' ? (
          <>
            <Foundation direction={direction} />
            <a
              className="review-link"
              href={`/?page=compositions&direction=${direction}&mode=${mode}`}
            >
              View {designs[direction].name} on mobile and PC →
            </a>
          </>
        ) : page === 'comparison' ? (
          <CardComparison />
        ) : page === 'compositions' ? (
          <Compositions {...sceneProps} />
        ) : page === 'maps' ? (
          <MapSheet {...sceneProps} />
        ) : (
          <Overview mode={mode} appearance={appearance} onAppearanceChange={changeMap} />
        )}
      </main>
      <footer className="review-footer">
        Stage 3 composition studies · Sample interactions only · No production data changed · Online
        maps; bundled photos, fonts and artwork
      </footer>
      <div className="preview-toast" role="status" aria-live="polite" hidden={!message}>
        {message}
      </div>
    </>
  );
}

function Overview({
  mode,
  appearance,
  onAppearanceChange,
}: {
  mode: ThemeMode;
  appearance: MapAppearance;
  onAppearanceChange: (style: MapAppearance) => void;
}) {
  return (
    <>
      <header className="sheet-heading overview-heading">
        <p className="overline">MAPPER / FOUR DIRECTIONS, ONE PURPOSE</p>
        <h1>
          Find your sense
          <br />
          of <em>discovery.</em>
        </h1>
        <p>
          Four visual systems for the places you haven’t found yet.
          <br />
          Explore the foundations, then compare them at phone and PC sizes.
        </p>
        <div className="overview-note">
          English + Kannada typography · Light + dark themes · Phosphor icons · Real OpenFreeMap
          previews
        </div>
      </header>
      <div className="overview-grid">
        {Object.values(designs).map((design) => (
          <article key={design.id} className="direction-preview">
            <div className="direction-heading">
              <span>{design.id}</span>
              <div>
                <h2>{design.name}</h2>
                <p>{design.headingFont} / Manrope</p>
              </div>
            </div>
            <CompositionFrame
              direction={design.id}
              mode={mode}
              width={390}
              scene="welcome"
              appearance={appearance}
              onAppearanceChange={onAppearanceChange}
            />
            <p>{design.description}</p>
            <div className="overview-links">
              <a href={`/?page=foundation&direction=${design.id}`}>Foundation sheet ↗</a>
              <a href={`/?page=compositions&direction=${design.id}&mode=${mode}`}>Mobile + PC ↗</a>
            </div>
          </article>
        ))}
      </div>
      <ThemeSurface direction="A" mode={mode} className="scope-note">
        <h2>Designed to compare honestly.</h2>
        <p>
          Real destination photographs remain unchanged. Direction A uses a generated landscape
          illustration with fine texture. Maps are genuine OpenFreeMap layers, not artwork. Sample
          seasonal and review statuses do not imply current access or verification.
        </p>
        <a className="review-link" href="/?page=comparison">
          Compare the same destination across all four systems →
        </a>
      </ThemeSurface>
    </>
  );
}

// Keep a visible static marker until the application has mounted.
const loadingMarker = document.getElementById('preview-loading');
flushSync(() => createRoot(document.getElementById('root')!).render(<App />));
loadingMarker?.remove();
