import { designs, spacing, type DesignDirection, type ThemeMode } from '../designs';
import { places } from '../data';
import {
  Brand,
  Button,
  Categories,
  Field,
  NavigationPreview,
  PlaceCard,
  StatusMessage,
  ThemeSurface,
} from '../components/Controls';
import { Icon, type IconName } from '../components/Icon';

function Palette({ direction, mode }: { direction: DesignDirection; mode: ThemeMode }) {
  return (
    <div className="palette">
      {Object.entries(designs[direction].colors[mode]).map(([name, color]) => (
        <div className="swatch" key={name}>
          <span style={{ backgroundColor: color }} />
          <div>
            <strong>{name}</strong>
            <code>{color}</code>
          </div>
        </div>
      ))}
    </div>
  );
}
export function Foundation({ direction }: { direction: DesignDirection }) {
  const design = designs[direction];
  return (
    <>
      <header className="sheet-heading">
        <p className="overline">FOUNDATION / DIRECTION {direction}</p>
        <h1>{design.name}</h1>
        <p>{design.description}</p>
      </header>
      <div className="foundation-pair">
        {(['light', 'dark'] as const).map((mode) => (
          <ThemeSurface key={mode} direction={direction} mode={mode} className="foundation">
            <div className="foundation-top">
              <Brand />
              <span className="pill">{mode} appearance</span>
            </div>
            <section>
              <p className="eyebrow">01 / TYPOGRAPHY</p>
              <h2 className="type-specimen">
                A little nearby.
                <br />A lot to discover.
              </h2>
              <p>Find a place that makes you curious. Build a day that feels like yours.</p>
              <p className="kannada" lang="kn">
                ನಮ್ಮ ಕರ್ನಾಟಕ · ಹೊಸ ಸ್ಥಳಗಳನ್ನು ಅನ್ವೇಷಿಸಿ
              </p>
              <p className="muted">
                {design.headingFont} 600 / Manrope 400–700 / Noto Sans Kannada 400, 600
              </p>
            </section>
            <section>
              <p className="eyebrow">02 / SEMANTIC COLOURS</p>
              <Palette direction={direction} mode={mode} />
            </section>
            <section>
              <p className="eyebrow">03 / CONTROLS</p>
              <div className="button-row">
                <Button icon="arrow">Explore places</Button>
                <Button variant="secondary" icon="plus">
                  Add a place
                </Button>
              </div>
              <Field
                label="Starting town"
                placeholder="Search Hubballi, Dharwad…"
                help="Choose a town. Location permission is not needed."
              />
              <Categories />
              <div className="icon-specimen">
                {(
                  [
                    'compass',
                    'path',
                    'bookmark',
                    'pin',
                    'layers',
                    'camera',
                    'tree',
                    'waves',
                    'heritage',
                    'spiritual',
                    'activity',
                  ] as IconName[]
                ).map((name) => (
                  <span key={name} title={name}>
                    <Icon name={name} />
                    <small>{name}</small>
                  </span>
                ))}
              </div>
            </section>
            <section>
              <p className="eyebrow">04 / DESTINATION CARD</p>
              <PlaceCard place={places[0]} compact={direction === 'B'} />
              <StatusMessage kind="information" title="Seasonal note · illustrative">
                Show a source and checked date before publishing a seasonal recommendation.
              </StatusMessage>
            </section>
            <section>
              <p className="eyebrow">05 / TRUST & RECOVERY</p>
              <StatusMessage kind="information" title="Private draft">
                Only you can see this draft. Add photos when you are ready.
              </StatusMessage>
              <StatusMessage kind="warning" title="Pending review">
                Submitted for administrator review. Not publicly visible.
              </StatusMessage>
              <StatusMessage kind="success" title="Review approved · sample">
                Approval is a publishing decision, not a current access report.
              </StatusMessage>
              <StatusMessage kind="error" title="Photo upload failed · example">
                Your draft is still saved. Try the upload again.
              </StatusMessage>
              <Button
                variant="secondary"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('preview-message', {
                      detail: 'Retry feedback example. No photograph is uploaded by this sheet.',
                    }),
                  )
                }
              >
                Retry upload
              </Button>
            </section>
            <section>
              <p className="eyebrow">06 / NAVIGATION & EMPTY STATE</p>
              <NavigationPreview />
              <div className="empty-state">
                <Icon name="bookmark" size={32} />
                <h3>Your next discovery belongs here</h3>
                <p>Save a place to find it again.</p>
                <Button variant="secondary">Explore places</Button>
              </div>
            </section>
            <footer className="foundation-footer">
              <span>Spacing {spacing.join(' · ')}</span>
              <span>
                Controls {design.radius}px / sheets {design.sheetRadius}px
              </span>
              <div className="brand-sizes">
                <Brand />
                <img
                  src="/assets/brand.svg"
                  alt="M trail app icon concept"
                  width="48"
                  height="48"
                />
                <img src="/assets/brand.svg" alt="M trail favicon concept" width="16" height="16" />
              </div>
            </footer>
          </ThemeSurface>
        ))}
      </div>
    </>
  );
}

export function CardComparison() {
  return (
    <>
      <header className="sheet-heading">
        <p className="overline">SAME CONTENT / FOUR COMPOSITIONS</p>
        <h1>One place. Four ways to discover.</h1>
        <p>
          Identical destination, photo and copy. Compare the information hierarchy, not different
          content.
        </p>
      </header>
      {(['light', 'dark'] as const).map((mode) => (
        <section key={mode}>
          <h2 className="section-title">{mode} appearance</h2>
          <div className="comparison-grid">
            {Object.values(designs).map((design) => (
              <ThemeSurface
                key={design.id}
                direction={design.id}
                mode={mode}
                className="comparison-cell"
              >
                <p className="eyebrow">
                  {design.id} / {design.shortName}
                </p>
                <PlaceCard place={places[0]} compact={design.id === 'B'} />
                <Button variant="secondary" icon="plus">
                  Add to my plan
                </Button>
              </ThemeSurface>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
