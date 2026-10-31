import { useState } from 'react';
import { ThemeSurface, Brand, NavigationPreview } from '../components/Controls';
import { Icon } from '../components/Icon';
import { WelcomeStudy, MapAppearanceStudy, PreferencesStudy } from './OnboardingStudies';
import { DiscoveryStudy, FiltersStudy } from './DiscoveryStudies';
import { DetailsStudy, HiddenPlacesStudy } from './PlaceStudies';
import { ContributionStudy, ReviewStudy } from './ContributionStudies';
import { BlueDiscover } from './BlueDiscover';
import { AssistantStudy } from './AssistantStudy';
import {
  concepts,
  layoutNotes,
  readVariant,
  screenNames,
  type StudyScreenName,
  type ScreenProps,
  type StudyProps,
} from './studyTypes';
import './stage4.css';
import './refinements.css';

function ScreenContent(props: ScreenProps & { screen: StudyScreenName }) {
  switch (props.screen) {
    case 'AI assistant':
      return <AssistantStudy {...props} />;
    case 'Welcome':
      return <WelcomeStudy {...props} />;
    case 'Map appearance':
      return <MapAppearanceStudy {...props} />;
    case 'Preferences':
      return <PreferencesStudy {...props} />;
    case 'Discover':
      return props.variant === 1 ? <BlueDiscover {...props} /> : <DiscoveryStudy {...props} />;
    case 'Map':
      return <DiscoveryStudy {...props} mapOnly />;
    case 'Search & filters':
      return <FiltersStudy {...props} />;
    case 'Place details':
      return <DetailsStudy {...props} />;
    case 'Hidden places':
      return <HiddenPlacesStudy {...props} />;
    case 'Contribute':
      return <ContributionStudy {...props} />;
    case 'Drafts & review':
      return <ReviewStudy {...props} />;
  }
}

export function ScreenStudies(props: StudyProps) {
  const query = new URLSearchParams(location.search);
  const [screen, setScreen] = useState<StudyScreenName>(
    screenNames.find((name) => name === query.get('screen')) ?? 'Discover',
  );
  const [desktop, setDesktop] = useState(query.get('desktop') === '1');
  const [selected, setSelected] = useState(readVariant(query.get('variant')));
  const [compare, setCompare] = useState(query.get('compare') !== '0');
  const standalone = query.get('frame') === '1';
  const enlarged = query.get('text') === 'large';
  const width = query.get('width') === '320' ? 'narrow-study' : '';
  const variants = compare && !standalone ? ([0, 1, 2] as const) : [selected];
  function toggleTheme() {
    props.onThemeChange(props.mode === 'light' ? 'dark' : 'light');
  }
  return (
    <main className={`studies ${standalone ? 'standalone-study' : ''}`}>
      <a className="skip-link" href="#studies">
        Skip to screens
      </a>
      {!standalone && (
        <>
          <header className="study-toolbar">
            <Brand />
            <a href="/">Stage 3 foundations</a>
            <label>
              Screen
              <select
                value={screen}
                onChange={(event) => setScreen(event.target.value as StudyScreenName)}
              >
                {screenNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label>
              Layout
              <select
                value={selected}
                onChange={(event) => setSelected(readVariant(event.target.value))}
              >
                {concepts.map((concept, index) => (
                  <option key={concept.name} value={index}>
                    {concept.name}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={toggleTheme}>
              {props.mode === 'light' ? 'Dark' : 'Light'} appearance
            </button>
            <button aria-pressed={desktop} onClick={() => setDesktop(!desktop)}>
              {desktop ? 'PC 1440' : 'Phone 390'}
            </button>
            <button aria-pressed={compare} onClick={() => setCompare(!compare)}>
              Compare layouts
            </button>
          </header>
          <header className="study-intro">
            <p className="overline">MAPPER / SCREEN STUDIES / 04</p>
            <h1>
              {screen}
              <span>Exploration with a sense of place.</span>
            </h1>
            <p>
              Same content, three spatial arrangements. Earthy field-guide character meets
              geographic discovery.
            </p>
            <p className="study-disclosure">
              Design prototype · illustrative collections and review statuses · no live AI, uploads
              or location capture
            </p>
          </header>
        </>
      )}
      <div id="studies" className={`studies-grid ${desktop ? 'desktop-studies' : ''}`}>
        {variants.map((variant) => (
          <article key={variant} className="study">
            {!standalone && (
              <header>
                <span className="study-number">0{variant + 1}</span>
                <h2>{concepts[variant].name}</h2>
                <p>{layoutNotes[screen][variant]}</p>
              </header>
            )}
            <div className="study-scroll">
              <ThemeSurface
                direction={variant === 2 ? 'D' : variant === 1 ? 'B' : 'A'}
                mode={props.mode}
                className={`screen-study layout-${variant} ${desktop ? 'study-wide' : ''} ${width} ${enlarged ? 'enlarged-text' : ''}`}
              >
                <header className="study-app-header">
                  <Brand />
                  <span className="edition">FIELD NOTES / KA</span>
                  <button
                    className="icon-button"
                    aria-label="Switch app appearance"
                    onClick={toggleTheme}
                  >
                    <Icon name={props.mode === 'light' ? 'moon' : 'sun'} />
                  </button>
                </header>
                <ScreenContent key={screen} {...props} screen={screen} variant={variant} />
                {!['Welcome', 'Map appearance', 'Preferences'].includes(screen) && (
                  <NavigationPreview />
                )}
              </ThemeSurface>
            </div>
            {!standalone && (
              <footer>
                <strong>Why this works</strong>
                <p>{concepts[variant].strength}</p>
                <strong>Trade-off</strong>
                <p>{concepts[variant].tradeoff}</p>
                <p>{concepts[variant].reference}</p>
              </footer>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
