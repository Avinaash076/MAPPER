import { useState } from 'react';
import { Button, Categories } from '../components/Controls';
import { MapPreview } from '../components/MapPreview';
import { regions } from '../data';
import { MapStylePicker } from './StudyControls';
import { openStudy, type ScreenProps } from './studyTypes';
import { BlueWelcome } from './BlueWelcome';

export function WelcomeStudy({ variant, mode }: ScreenProps) {
  if (variant === 1) return <BlueWelcome variant={variant} mode={mode} />;
  return (
    <section className="study-welcome">
      <div className="welcome-art">
        <img
          src="/assets/woven-landscape.png"
          alt="Karnataka-inspired river landscape illustration with subtle woven texture"
        />
        <span>ILLUSTRATED FIELD GUIDE</span>
      </div>
      <div className="welcome-letter">
        <p className="eyebrow">NORTHERN KARNATAKA / VOLUME 01</p>
        <h1>
          Take the
          <br />
          curious way.
        </h1>
        <p>Water, stone, forest. Discover a different side of the places around you.</p>
        <div className="welcome-coordinates">
          15.468° N / 74.987° E <span>DHARWAD</span>
        </div>
        <Button icon="arrow" onClick={() => openStudy('Map appearance', variant, mode)}>
          Plan my day
        </Button>
        <Button variant="quiet" onClick={() => openStudy('Map', variant, mode)}>
          Explore map
        </Button>
        {variant === 2 && (
          <p className="editorial-caption">
            A field guide for the roads you know, and the places you don’t.
          </p>
        )}
      </div>
    </section>
  );
}

export function MapAppearanceStudy(props: ScreenProps) {
  const preview = (
    <div className="map-banner">
      <MapPreview appearance={props.appearance} />
    </div>
  );
  return (
    <section className="onboarding-map">
      <span className="step-number">01 / MAKE IT YOURS</span>
      {props.variant !== 1 && preview}
      <MapStylePicker
        appearance={props.appearance}
        onChange={props.onAppearanceChange}
        onDone={() => openStudy('Preferences', props.variant, props.mode)}
      />
      {props.variant === 1 && preview}
    </section>
  );
}

export function PreferencesStudy(props: ScreenProps) {
  const [step, setStep] = useState(0);
  const [town, setTown] = useState('Dharwad');
  const [transport, setTransport] = useState('');
  const [time, setTime] = useState('Half a day');
  const stepped = props.variant === 1;
  return (
    <section className="preference-study">
      <div className="preference-intro">
        <span className="step-number">02 / YOUR STARTING POINT</span>
        <h1>
          What does a<br />
          good day look like?
        </h1>
        <p>A few choices. Plenty to discover.</p>
        {props.variant !== 0 && (
          <div className="map-banner">
            <MapPreview appearance={props.appearance} />
          </div>
        )}
      </div>
      <div className="preference-form">
        {stepped && (
          <div className="step-tabs">
            {['Where', 'Interests', 'Getting around'].map((label, index) => (
              <button key={label} aria-pressed={step === index} onClick={() => setStep(index)}>
                {index + 1}. {label}
              </button>
            ))}
          </div>
        )}
        <div hidden={stepped && step !== 0}>
          <label className="study-label">
            Starting town · required
            <select value={town} onChange={(event) => setTown(event.target.value)}>
              {Object.keys(regions).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <p>No location permission is needed to choose a town.</p>
        </div>
        <div hidden={stepped && step !== 1}>
          <h3>Follow your curiosity</h3>
          <Categories />
        </div>
        <div hidden={stepped && step !== 2}>
          <label className="study-label">
            Transport · optional
            <select value={transport} onChange={(event) => setTransport(event.target.value)}>
              <option value="">Decide later</option>
              {['Walking', 'Bicycle', 'Motorbike', 'Car'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="study-label">
            Time available
            <select value={time} onChange={(event) => setTime(event.target.value)}>
              {['A few hours', 'Half a day', 'One day'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <p className="muted">
            Without transport, show visit durations only. Estimates are not calculated in this
            design study.
          </p>
        </div>
        <Button
          icon="arrow"
          onClick={() =>
            stepped && step < 2
              ? setStep(step + 1)
              : openStudy('Discover', props.variant, props.mode)
          }
        >
          {stepped && step < 2 ? 'Next' : 'Find places'}
        </Button>
      </div>
    </section>
  );
}
